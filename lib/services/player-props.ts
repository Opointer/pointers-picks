import { getDataProvider } from "@/lib/data/provider-factory";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import { buildCanonicalPlayerRegistry } from "@/lib/props/identity/registry";
import { matchPlayerPropOffers } from "@/lib/props/matching/offers";
import { normalizePlayerPropOffers } from "@/lib/props/normalize/offers";
import { scoreReadOnlyPlayerProp } from "@/lib/props/scoring/read-only";
import {
  type CanonicalPlayer,
  type Game,
  type MatchupAnalysisResponse,
  type Player,
  type PlayerPropMatchResult,
  type PlayerPropPassReason,
  type PlayerPropStatus,
  type Team,
} from "@/types/nba";
import { toCentralDateKey } from "@/lib/view-models/date-controls";

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

export interface AvailablePlayerPropPage {
  id: string;
  gameId: string;
  playerId: string;
  title: string;
  subtitle: string;
  detail: string;
  href: string;
  gameDate: string;
  teamId: string;
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
    return "No posted market was available from the current books.";
  }

  if (reason === "one_sided_offer") {
    return "Only one side of the offer was available, so the market stayed off the board.";
  }

  if (reason === "stale_data") {
    return "The market was posted, but the timestamp was too stale to trust.";
  }

  if (reason === "low_match_confidence") {
    return "The player or market match was too ambiguous to trust.";
  }

  if (reason === "player_unresolved") {
    return "The feed label did not resolve cleanly to the requested player.";
  }

  if (reason === "partial_data") {
    return "The provider returned incomplete market data.";
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

function buildAvailablePageDetail(validMarketCount: number): string {
  return `${validMarketCount} verified market${validMarketCount === 1 ? "" : "s"} available on the player page.`;
}

function buildAvailablePlayerPropPages({
  matches,
  games,
  players,
  teams,
  selectedDate,
}: {
  matches: PlayerPropMatchResult[];
  games: Game[];
  players: Player[];
  teams: Team[];
  selectedDate?: string;
}): AvailablePlayerPropPage[] {
  const pageEntries = new Map<
    string,
    {
      game: Game;
      player: Player;
      team: Team;
      opponent: Team;
      validMarketCount: number;
    }
  >();

  for (const match of matches) {
    if (
      !match.selected ||
      !match.gameId ||
      !match.internalPlayerId ||
      !match.marketType ||
      match.matchQuality === "none" ||
      match.reason === "stale_data" ||
      match.reason === "one_sided_offer" ||
      match.reason === "player_unresolved"
    ) {
      continue;
    }

    const game = games.find((entry) => entry.id === match.gameId);
    const player = players.find((entry) => entry.id === match.internalPlayerId);

    if (!game || !player) {
      continue;
    }

    if (selectedDate && toCentralDateKey(game.gameDate) !== selectedDate) {
      continue;
    }

    const team = teams.find((entry) => entry.id === player.teamId);
    const opponent = teams.find((entry) => entry.id === getOpponent(game, player.teamId));

    if (!team || !opponent) {
      continue;
    }

    const key = `${game.id}:${player.id}`;
    const existing = pageEntries.get(key);

    if (existing) {
      existing.validMarketCount += 1;
      continue;
    }

    pageEntries.set(key, {
      game,
      player,
      team,
      opponent,
      validMarketCount: 1,
    });
  }

  return [...pageEntries.values()]
    .sort((left, right) => {
      const gameSort = left.game.gameDate.localeCompare(right.game.gameDate);

      if (gameSort !== 0) {
        return gameSort;
      }

      return `${left.player.lastName}${left.player.firstName}`.localeCompare(
        `${right.player.lastName}${right.player.firstName}`,
      );
    })
    .map((entry) => ({
      id: `${entry.game.id}:${entry.player.id}`,
      gameId: entry.game.id,
      playerId: entry.player.id,
      title: `${entry.player.firstName} ${entry.player.lastName}`,
      subtitle: `${entry.team.abbreviation} vs ${entry.opponent.abbreviation} • ${formatGameTime(entry.game.gameDate)}`,
      detail: buildAvailablePageDetail(entry.validMarketCount),
      href: `/props/${entry.game.id}/${entry.player.id}`,
      gameDate: entry.game.gameDate,
      teamId: entry.team.id,
    }));
}

export async function getAvailablePlayerPropPages({
  selectedDate,
}: {
  selectedDate?: string;
} = {}): Promise<{
  pages: AvailablePlayerPropPage[];
  warnings: string[];
  fetchedAt?: string;
  feedAvailable: boolean;
}> {
  const dataProvider = getDataProvider();
  const [games, players, teams] = await Promise.all([
    dataProvider.getGames(),
    dataProvider.getPlayers(),
    dataProvider.getTeams(),
  ]);
  const oddsProvider = getOddsProvider();
  const feed = await oddsProvider.getPlayerPropFeed();

  if (feed.events.length === 0) {
    return {
      pages: [],
      warnings: feed.warnings,
      fetchedAt: feed.fetchMeta.fetchedAt,
      feedAvailable: false,
    };
  }

  const { offers } = normalizePlayerPropOffers({
    feed,
    teams,
    games,
    players,
  });

  const nowIso = new Date().toISOString();
  const distinctPairs = new Map<string, { gameId: string; canonicalPlayerId: string }>();

  for (const offer of offers) {
    if (!offer.gameId || !offer.canonicalPlayerId || !offer.internalPlayerId) {
      continue;
    }

    const game = games.find((entry) => entry.id === offer.gameId);

    if (!game || game.status !== "upcoming") {
      continue;
    }

    if (selectedDate && toCentralDateKey(game.gameDate) !== selectedDate) {
      continue;
    }

    distinctPairs.set(`${offer.gameId}:${offer.canonicalPlayerId}`, {
      gameId: offer.gameId,
      canonicalPlayerId: offer.canonicalPlayerId,
    });
  }

  const matches = [...distinctPairs.values()].flatMap(({ gameId, canonicalPlayerId }) =>
    matchPlayerPropOffers({
      offers,
      gameId,
      canonicalPlayerId,
      nowIso,
    }).matches,
  );

  return {
    pages: buildAvailablePlayerPropPages({
      matches,
      games,
      players,
      teams,
      selectedDate,
    }),
    warnings: feed.warnings,
    fetchedAt: feed.fetchMeta.fetchedAt,
    feedAvailable: true,
  };
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

    const matchedLiveEvent = feed.matchedEvents.some((entry) => entry.gameId === gameId);
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
      warnings: matchedLiveEvent
        ? warnings
        : ["No live props event matched this game from the current books.", ...warnings].slice(0, 8),
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
              : "The player props service failed before a trusted page could be built.",
        },
      ],
      warnings: [
        error instanceof Error
          ? error.message
          : "The player props service failed before a trusted page could be built.",
      ],
      debugLogs: [],
    };
  }
}
