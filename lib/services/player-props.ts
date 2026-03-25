import { getDataProvider } from "@/lib/data/provider-factory";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import { buildCanonicalPlayerRegistry } from "@/lib/props/identity/registry";
import { matchPlayerPropOffers } from "@/lib/props/matching/offers";
import { normalizePlayerPropOffers } from "@/lib/props/normalize/offers";
import { scoreReadOnlyPlayerProp } from "@/lib/props/scoring/read-only";
import {
  type CanonicalPlayer,
  type MatchupAnalysisResponse,
  type Player,
  type PlayerPropMatchResult,
  type PlayerPropPassReason,
  type PlayerPropStatus,
  type Team,
} from "@/types/nba";

export interface PlayerPropServiceMarket {
  traceId: string;
  marketType: "player_points" | "player_rebounds" | "player_assists" | "player_pra";
  line: number;
  sportsbook?: string;
  odds: {
    over?: number;
    under?: number;
  };
  freshness: PlayerPropMatchResult["freshnessState"];
  matchQuality: PlayerPropMatchResult["matchQuality"];
  identityQuality: PlayerPropMatchResult["identityQuality"];
  status: PlayerPropStatus;
  rationale: string;
  passReason?: PlayerPropPassReason;
  projection?: number;
  projectionDelta?: number;
  lineRelationship: PlayerPropMatchResult["lineRelationship"];
  selected: boolean;
  integrityFlags: string[];
}

export interface PlayerPropsServiceResult {
  notFound: boolean;
  header?: {
    player: Player;
    canonicalPlayer: CanonicalPlayer;
    gameId: string;
    gameTime: string;
    team: Team;
    opponent: Team;
  };
  provider: {
    source: "mock" | "live";
    fallbackUsed: boolean;
    fetchedAt?: string;
  };
  marketGroups: Array<{
    marketType: PlayerPropServiceMarket["marketType"];
    primary?: PlayerPropServiceMarket;
    alternates: PlayerPropServiceMarket[];
  }>;
  availabilityLog: Array<{
    id: string;
    marketType: string;
    status: PlayerPropStatus;
    reason: PlayerPropPassReason;
    detail: string;
  }>;
  warnings: string[];
  debugLogs: Array<{
    event: string;
    traceId: string;
    reason?: string;
  }>;
}

const supportedMarketTypes: PlayerPropServiceMarket["marketType"][] = [
  "player_points",
  "player_rebounds",
  "player_assists",
  "player_pra",
];

function formatGameTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  }).format(date);
}

function getOpponent(game: { homeTeamId: string; awayTeamId: string }, playerTeamId: string) {
  return game.homeTeamId === playerTeamId ? game.awayTeamId : game.homeTeamId;
}

function getMarketAvailabilityDetail(reason: PlayerPropPassReason): string {
  if (reason === "market_not_offered") {
    return "No safe offer was available for this market from the current books.";
  }

  if (reason === "one_sided_offer") {
    return "Only one side of the offer was available, so the market stayed off the board.";
  }

  if (reason === "stale_data") {
    return "The offer existed but the timestamp was stale enough to keep it out of the board.";
  }

  if (reason === "low_match_confidence") {
    return "The player or offer matched with too much ambiguity to display as a trusted market.";
  }

  if (reason === "player_unresolved") {
    return "The feed label did not resolve cleanly to the requested player.";
  }

  if (reason === "partial_data") {
    return "The provider returned partial offer data for this market.";
  }

  return "This market did not clear the current trust rules.";
}

function mapMarketTypeLabel(value: PlayerPropsServiceResult["marketGroups"][number]["marketType"]) {
  if (value === "player_points") {
    return "Points";
  }

  if (value === "player_rebounds") {
    return "Rebounds";
  }

  if (value === "player_assists") {
    return "Assists";
  }

  return "PRA";
}

export async function getPlayerPropsData({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}): Promise<PlayerPropsServiceResult> {
  const dataProvider = getDataProvider();

  try {
    const [games, players, teams] = await Promise.all([
      dataProvider.getGames(),
      dataProvider.getPlayers(),
      dataProvider.getTeams(),
    ]);

    const game = games.find((entry) => entry.id === gameId);
    const player = players.find((entry) => entry.id === playerId);

    if (!game || !player) {
      return {
        notFound: true,
        provider: {
          source: "live",
          fallbackUsed: false,
        },
        marketGroups: [],
        availabilityLog: [],
        warnings: [],
        debugLogs: [],
      };
    }

    const team = teams.find((entry) => entry.id === player.teamId);
    const opponent = teams.find((entry) => entry.id === getOpponent(game, player.teamId));

    if (!team || !opponent) {
      return {
        notFound: true,
        provider: {
          source: "live",
          fallbackUsed: false,
        },
        marketGroups: [],
        availabilityLog: [],
        warnings: [],
        debugLogs: [],
      };
    }

    const registry = buildCanonicalPlayerRegistry(players);
    const canonicalPlayer = registry.find((entry) => entry.internalPlayerId === playerId);

    if (!canonicalPlayer) {
      return {
        notFound: true,
        provider: {
          source: "live",
          fallbackUsed: false,
        },
        marketGroups: [],
        availabilityLog: [],
        warnings: [],
        debugLogs: [],
      };
    }

    const oddsProvider = getOddsProvider();
    const feed = await oddsProvider.getPlayerPropFeed();
    const { offers, logs: normalizationLogs } = normalizePlayerPropOffers({
      feed,
      teams,
      games,
      players,
    });
    const { matches, logs: matchingLogs } = matchPlayerPropOffers({
      offers,
      gameId,
      canonicalPlayerId: canonicalPlayer.canonicalPlayerId,
      nowIso: new Date().toISOString(),
    });

    let matchup: MatchupAnalysisResponse | undefined;

    try {
      matchup = await dataProvider.getMatchupAnalysis(game.homeTeamId, game.awayTeamId);
    } catch {
      matchup = undefined;
    }

    const scoredMarkets = matches.map((match) => {
      const { score, logs } = scoreReadOnlyPlayerProp({
        match,
        player,
        matchup,
      });

      return {
        market: {
          traceId: match.traceId,
          marketType: match.marketType ?? "player_points",
          line: match.line ?? 0,
          sportsbook: match.sportsbook,
          odds: {
            over: match.offer.overPriceAmerican,
            under: match.offer.underPriceAmerican,
          },
          freshness: match.freshnessState,
          matchQuality: match.matchQuality,
          identityQuality: match.identityQuality,
          status: score.status,
          rationale: score.rationale,
          passReason: score.passReason,
          projection: score.projection,
          projectionDelta: score.projectionDelta,
          lineRelationship: match.lineRelationship,
          selected: match.selected,
          integrityFlags: match.offer.integrityFlags,
        } satisfies PlayerPropServiceMarket,
        logs,
      };
    });

    const availabilityLog: PlayerPropsServiceResult["availabilityLog"] = [];
    const marketGroups = supportedMarketTypes.map((marketType) => {
      const entries = scoredMarkets
        .map((entry) => entry.market)
        .filter((entry) => entry.marketType === marketType)
        .sort((left, right) => Number(right.selected) - Number(left.selected));
      const primary = entries.find((entry) => entry.selected);
      const alternates = entries.filter((entry) => !entry.selected);

      if (!primary) {
        availabilityLog.push({
          id: `${marketType}:missing`,
          marketType: mapMarketTypeLabel(marketType),
          status: "unavailable",
          reason: "market_not_offered",
          detail: getMarketAvailabilityDetail("market_not_offered"),
        });
      } else if (primary.status !== "watch") {
        availabilityLog.push({
          id: `${marketType}:${primary.traceId}`,
          marketType: mapMarketTypeLabel(marketType),
          status: primary.status,
          reason: primary.passReason ?? "partial_data",
          detail: getMarketAvailabilityDetail(primary.passReason ?? "partial_data"),
        });
      }

      for (const alternate of alternates) {
        if (alternate.lineRelationship === "alternate") {
          availabilityLog.push({
            id: `${marketType}:${alternate.traceId}`,
            marketType: `${mapMarketTypeLabel(marketType)} alternate`,
            status: alternate.status,
            reason: alternate.passReason ?? "line_not_matched",
            detail: `Alternate line ${alternate.line.toFixed(1)} from ${alternate.sportsbook ?? "unknown book"} stayed off the primary board.`,
          });
        }
      }

      return {
        marketType,
        primary,
        alternates,
      };
    });

    const warnings = [
      ...feed.warnings,
      ...new Set(
        [
          ...normalizationLogs,
          ...matchingLogs,
          ...scoredMarkets.flatMap((entry) => entry.logs),
        ]
          .filter((entry) => entry.reason)
          .map((entry) => entry.reason as string),
      ),
    ].slice(0, 8);

    return {
      notFound: false,
      header: {
        player,
        canonicalPlayer,
        gameId,
        gameTime: formatGameTime(game.gameDate),
        team,
        opponent,
      },
      provider: {
        source: feed.fetchMeta.source,
        fallbackUsed: feed.fetchMeta.fallbackUsed,
        fetchedAt: feed.fetchMeta.fetchedAt,
      },
      marketGroups,
      availabilityLog,
      warnings,
      debugLogs: [...normalizationLogs, ...matchingLogs, ...scoredMarkets.flatMap((entry) => entry.logs)].map((entry) => ({
        event: entry.event,
        traceId: entry.traceId,
        reason: entry.reason,
      })),
    };
  } catch (error) {
    return {
      notFound: false,
      provider: {
        source: "live",
        fallbackUsed: false,
      },
      marketGroups: [],
      availabilityLog: [
        {
          id: "service_unavailable",
          marketType: "Player props",
          status: "unavailable",
          reason: "service_unavailable",
          detail:
            error instanceof Error
              ? error.message
              : "The player props service failed and the page stayed in an unavailable state.",
        },
      ],
      warnings: [
        error instanceof Error
          ? error.message
          : "The player props service failed and the page stayed in an unavailable state.",
      ],
      debugLogs: [],
    };
  }
}
