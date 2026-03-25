import { buildCanonicalPlayerRegistry } from "@/lib/props/identity/registry";
import { resolvePlayerIdentity } from "@/lib/props/identity/resolver";
import { createPropLogger, type PlayerPropLogEntry } from "@/lib/props/observability";
import {
  type Game,
  type Player,
  type PlayerPropFeed,
  type PlayerPropIntegrityFlag,
  type PlayerPropOffer,
  type RawOddsEvent,
  type Team,
} from "@/types/nba";

const supportedMarketMap = {
  player_points: "player_points",
  player_rebounds: "player_rebounds",
  player_assists: "player_assists",
  player_points_rebounds_assists: "player_pra",
} as const;

function buildTeamNameMap(teams: Team[]): Map<string, string> {
  const nameMap = new Map<string, string>();

  for (const team of teams) {
    nameMap.set(`${team.city} ${team.name}`.toLowerCase(), team.id);
  }

  return nameMap;
}

function findInternalGame(games: Game[], homeTeamId: string, awayTeamId: string): Game | undefined {
  return games.find(
    (game) => game.homeTeamId === homeTeamId && game.awayTeamId === awayTeamId,
  );
}

function resolveGameId({
  event,
  matchedEventMap,
  teamNameMap,
  games,
}: {
  event: RawOddsEvent;
  matchedEventMap: Map<string, string>;
  teamNameMap: Map<string, string>;
  games: Game[];
}): string | undefined {
  if (event.id && matchedEventMap.has(event.id)) {
    return matchedEventMap.get(event.id);
  }

  const homeTeamId = event.home_team ? teamNameMap.get(event.home_team.toLowerCase()) : undefined;
  const awayTeamId = event.away_team ? teamNameMap.get(event.away_team.toLowerCase()) : undefined;

  if (!homeTeamId || !awayTeamId) {
    return undefined;
  }

  return findInternalGame(games, homeTeamId, awayTeamId)?.id;
}

function getTeamIdsForEvent(event: RawOddsEvent, teamNameMap: Map<string, string>): string[] {
  const teamIds = [
    event.home_team ? teamNameMap.get(event.home_team.toLowerCase()) : undefined,
    event.away_team ? teamNameMap.get(event.away_team.toLowerCase()) : undefined,
  ].filter((value): value is string => Boolean(value));

  return [...new Set(teamIds)];
}

function buildTraceId({
  gameId,
  canonicalPlayerId,
  rawName,
  marketType,
  sportsbook,
  line,
}: {
  gameId?: string;
  canonicalPlayerId?: string;
  rawName: string;
  marketType?: string;
  sportsbook?: string;
  line?: number;
}): string {
  return `${gameId ?? "unknown-game"}:${canonicalPlayerId ?? rawName.toLowerCase()}:${marketType ?? "unknown-market"}:${sportsbook ?? "unknown-book"}:${line ?? "unknown-line"}`;
}

function getIntegrityFlags({
  marketType,
  line,
  resolutionQuality,
  hasOver,
  hasUnder,
  gameId,
}: {
  marketType?: PlayerPropOffer["marketType"];
  line?: number;
  resolutionQuality: PlayerPropOffer["identityResolution"]["quality"];
  hasOver: boolean;
  hasUnder: boolean;
  gameId?: string;
}): PlayerPropIntegrityFlag[] {
  const flags: PlayerPropIntegrityFlag[] = [];

  if (!marketType) {
    flags.push("missing_market_type");
  }

  if (line === undefined) {
    flags.push("missing_line");
  }

  if (!gameId) {
    flags.push("unmatched_game");
  }

  if (!hasOver) {
    flags.push("missing_over_price");
  }

  if (!hasUnder) {
    flags.push("missing_under_price");
  }

  if (!hasOver || !hasUnder) {
    flags.push("one_sided_offer");
  }

  if (resolutionQuality === "none") {
    flags.push("unresolved_identity");
  } else if (resolutionQuality === "low") {
    flags.push("ambiguous_identity");
  }

  return flags;
}

function dedupeOffers({
  offers,
  logger,
}: {
  offers: PlayerPropOffer[];
  logger: ReturnType<typeof createPropLogger>;
}): PlayerPropOffer[] {
  const deduped = new Map<string, PlayerPropOffer>();

  for (const offer of offers) {
    const key = `${offer.gameId ?? "unknown"}:${offer.canonicalPlayerId ?? offer.rawPlayerLabel}:${offer.sportsbook ?? "unknown"}:${offer.marketType ?? "unknown"}:${offer.line ?? "unknown"}`;
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, offer);
      continue;
    }

    const existingCompleteness = Number(existing.overPriceAmerican !== undefined) + Number(existing.underPriceAmerican !== undefined);
    const nextCompleteness = Number(offer.overPriceAmerican !== undefined) + Number(offer.underPriceAmerican !== undefined);
    const existingTime = existing.sourceTimestamp ? Date.parse(existing.sourceTimestamp) : 0;
    const nextTime = offer.sourceTimestamp ? Date.parse(offer.sourceTimestamp) : 0;

    if (
      nextCompleteness > existingCompleteness ||
      (nextCompleteness === existingCompleteness && nextTime >= existingTime)
    ) {
      deduped.set(key, offer);
      logger.record({
        event: "prop_offer_deduped",
        traceId: offer.traceId,
        gameId: offer.gameId,
        canonicalPlayerId: offer.canonicalPlayerId,
        rawPlayerLabel: offer.rawPlayerLabel,
        sportsbook: offer.sportsbook,
        marketType: offer.marketType,
        line: offer.line,
        reason: "Replaced an older or less complete duplicate offer.",
      });
    }
  }

  return [...deduped.values()];
}

function markAlternateLines(offers: PlayerPropOffer[]): PlayerPropOffer[] {
  const lineGroupCounts = new Map<string, Set<number>>();

  for (const offer of offers) {
    const key = `${offer.gameId ?? "unknown"}:${offer.canonicalPlayerId ?? offer.rawPlayerLabel}:${offer.sportsbook ?? "unknown"}:${offer.marketType ?? "unknown"}`;
    const lines = lineGroupCounts.get(key) ?? new Set<number>();

    if (offer.line !== undefined) {
      lines.add(offer.line);
    }

    lineGroupCounts.set(key, lines);
  }

  return offers.map((offer) => {
    const key = `${offer.gameId ?? "unknown"}:${offer.canonicalPlayerId ?? offer.rawPlayerLabel}:${offer.sportsbook ?? "unknown"}:${offer.marketType ?? "unknown"}`;
    const uniqueLineCount = lineGroupCounts.get(key)?.size ?? 0;

    return {
      ...offer,
      isAlternateLine: uniqueLineCount > 1,
    };
  });
}

export function normalizePlayerPropOffers({
  feed,
  teams,
  games,
  players,
}: {
  feed: PlayerPropFeed;
  teams: Team[];
  games: Game[];
  players: Player[];
}): { offers: PlayerPropOffer[]; logs: PlayerPropLogEntry[] } {
  const logger = createPropLogger();
  const registry = buildCanonicalPlayerRegistry(players);
  const teamNameMap = buildTeamNameMap(teams);
  const matchedEventMap = new Map(feed.matchedEvents.map((entry) => [entry.externalEventId, entry.gameId]));
  const offers: PlayerPropOffer[] = [];

  for (const event of feed.events) {
    const gameId = resolveGameId({
      event,
      matchedEventMap,
      teamNameMap,
      games,
    });
    const teamIds = getTeamIdsForEvent(event, teamNameMap);

    for (const bookmaker of event.bookmakers ?? []) {
      for (const market of bookmaker.markets ?? []) {
        const marketType = market.key ? supportedMarketMap[market.key as keyof typeof supportedMarketMap] : undefined;
        const groupedByPlayerAndLine = new Map<
          string,
          {
            rawPlayerLabel: string;
            line?: number;
            overPriceAmerican?: number;
            underPriceAmerican?: number;
          }
        >();

        for (const outcome of market.outcomes ?? []) {
          const rawPlayerLabel = outcome.description;

          if (!rawPlayerLabel) {
            continue;
          }

          const key = `${rawPlayerLabel}:${outcome.point ?? "unknown"}`;
          const existing = groupedByPlayerAndLine.get(key) ?? {
            rawPlayerLabel,
            line: outcome.point,
          };

          if (outcome.name === "Over") {
            existing.overPriceAmerican = outcome.price;
          } else if (outcome.name === "Under") {
            existing.underPriceAmerican = outcome.price;
          }

          groupedByPlayerAndLine.set(key, existing);
        }

        for (const candidate of groupedByPlayerAndLine.values()) {
          const identityResolution = resolvePlayerIdentity({
            rawPlayerLabel: candidate.rawPlayerLabel,
            registry,
            teamIds,
          });
          const traceId = buildTraceId({
            gameId,
            canonicalPlayerId: identityResolution.canonicalPlayerId,
            rawName: candidate.rawPlayerLabel,
            marketType,
            sportsbook: bookmaker.key,
            line: candidate.line,
          });
          const integrityFlags = getIntegrityFlags({
            marketType,
            line: candidate.line,
            resolutionQuality: identityResolution.quality,
            hasOver: candidate.overPriceAmerican !== undefined,
            hasUnder: candidate.underPriceAmerican !== undefined,
            gameId,
          });

          const offer: PlayerPropOffer = {
            offerId: traceId,
            traceId,
            gameId,
            externalEventId: event.id,
            canonicalPlayerId: identityResolution.canonicalPlayerId,
            internalPlayerId: identityResolution.internalPlayerId,
            rawPlayerLabel: candidate.rawPlayerLabel,
            sportsbook: bookmaker.key,
            marketType,
            line: candidate.line,
            isAlternateLine: false,
            overPriceAmerican: candidate.overPriceAmerican,
            underPriceAmerican: candidate.underPriceAmerican,
            sourceTimestamp:
              market.last_update ?? bookmaker.last_update ?? feed.fetchMeta.fetchedAt,
            fetchMeta: feed.fetchMeta,
            rawSourceRef: {
              bookmakerKey: bookmaker.key,
              marketKey: market.key,
              eventId: event.id,
            },
            identityResolution,
            integrityFlags,
          };

          logger.record({
            event:
              identityResolution.quality === "none"
                ? "prop_identity_unresolved"
                : identityResolution.ambiguousCandidates?.length
                  ? "prop_identity_ambiguous"
                  : "prop_identity_resolved",
            traceId,
            gameId,
            canonicalPlayerId: identityResolution.canonicalPlayerId,
            rawPlayerLabel: candidate.rawPlayerLabel,
            sportsbook: bookmaker.key,
            marketType,
            line: candidate.line,
            identityQuality: identityResolution.quality,
            reason: identityResolution.reason,
          });

          logger.record({
            event: "prop_offer_normalized",
            traceId,
            gameId,
            canonicalPlayerId: identityResolution.canonicalPlayerId,
            rawPlayerLabel: candidate.rawPlayerLabel,
            sportsbook: bookmaker.key,
            marketType,
            line: candidate.line,
            identityQuality: identityResolution.quality,
            reason: integrityFlags.length > 0 ? integrityFlags.join(", ") : "Offer normalized cleanly.",
          });

          offers.push(offer);
        }
      }
    }
  }

  const deduped = dedupeOffers({ offers, logger });
  const withAlternateLines = markAlternateLines(deduped);

  return {
    offers: withAlternateLines,
    logs: logger.flush(),
  };
}
