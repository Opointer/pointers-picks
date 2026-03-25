import {
  type Game,
  type GameOdds,
  type MarketLine,
  type MatchedLiveEvent,
  type OddsFetchMeta,
  type RawOddsBookmaker,
  type RawOddsEvent,
  type RawOddsMarket,
  type Team,
} from "@/types/nba";

interface FeaturedNormalizationContext {
  teams: Team[];
  games: Game[];
  fetchMeta: OddsFetchMeta;
  preferredBookmakers?: string[];
}

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

function selectBookmaker(
  bookmakers: RawOddsBookmaker[] | undefined,
  preferredBookmakers: string[],
): RawOddsBookmaker | undefined {
  if (!bookmakers?.length) {
    return undefined;
  }

  for (const key of preferredBookmakers) {
    const match = bookmakers.find((bookmaker) => bookmaker.key === key);

    if (match) {
      return match;
    }
  }

  return bookmakers[0];
}

function getMarket(bookmaker: RawOddsBookmaker | undefined, key: string): RawOddsMarket | undefined {
  return bookmaker?.markets?.find((market) => market.key === key);
}

function createMarketLine({
  marketType,
  direction,
  value,
  sportsbook,
  timestamp,
}: {
  marketType: MarketLine["marketType"];
  direction: MarketLine["direction"];
  value: number;
  sportsbook?: string;
  timestamp: string;
}): MarketLine {
  return {
    marketType,
    direction,
    line: value,
    sportsbook,
    timestamp,
  };
}

export function normalizeFeaturedGameOdds(
  events: RawOddsEvent[],
  { teams, games, fetchMeta, preferredBookmakers = [] }: FeaturedNormalizationContext,
): { gameOdds: GameOdds[]; matchedEvents: MatchedLiveEvent[] } {
  const teamNameMap = buildTeamNameMap(teams);
  const gameOdds: GameOdds[] = [];
  const matchedEvents: MatchedLiveEvent[] = [];

  for (const event of events) {
    const homeTeamId = event.home_team ? teamNameMap.get(event.home_team.toLowerCase()) : undefined;
    const awayTeamId = event.away_team ? teamNameMap.get(event.away_team.toLowerCase()) : undefined;

    if (!event.id || !homeTeamId || !awayTeamId) {
      continue;
    }

    const internalGame = findInternalGame(games, homeTeamId, awayTeamId);

    if (!internalGame) {
      continue;
    }

    const bookmaker = selectBookmaker(event.bookmakers, preferredBookmakers);
    const spreads = getMarket(bookmaker, "spreads");
    const totals = getMarket(bookmaker, "totals");
    const moneyline = getMarket(bookmaker, "h2h");

    const homeSpread = spreads?.outcomes?.find((outcome) => outcome.name === event.home_team);
    const awaySpread = spreads?.outcomes?.find((outcome) => outcome.name === event.away_team);
    const over = totals?.outcomes?.find((outcome) => outcome.name === "Over");
    const under = totals?.outcomes?.find((outcome) => outcome.name === "Under");
    const homeMoneyline = moneyline?.outcomes?.find((outcome) => outcome.name === event.home_team);
    const awayMoneyline = moneyline?.outcomes?.find((outcome) => outcome.name === event.away_team);

    if (
      homeSpread?.point === undefined ||
      awaySpread?.point === undefined ||
      over?.point === undefined ||
      under?.point === undefined ||
      homeMoneyline?.price === undefined ||
      awayMoneyline?.price === undefined
    ) {
      continue;
    }

    const spreadTimestamp = spreads?.last_update ?? bookmaker?.last_update ?? new Date().toISOString();
    const totalTimestamp = totals?.last_update ?? bookmaker?.last_update ?? new Date().toISOString();
    const moneylineTimestamp =
      moneyline?.last_update ?? bookmaker?.last_update ?? new Date().toISOString();

    gameOdds.push({
      gameId: internalGame.id,
      homeTeamId,
      awayTeamId,
      fetchMeta,
      spread: {
        home: createMarketLine({
          marketType: "spread",
          direction: "home",
          value: homeSpread.point,
          sportsbook: bookmaker?.key,
          timestamp: spreadTimestamp,
        }),
        away: createMarketLine({
          marketType: "spread",
          direction: "away",
          value: awaySpread.point,
          sportsbook: bookmaker?.key,
          timestamp: spreadTimestamp,
        }),
      },
      moneyline: {
        home: createMarketLine({
          marketType: "moneyline",
          direction: "home",
          value: homeMoneyline.price,
          sportsbook: bookmaker?.key,
          timestamp: moneylineTimestamp,
        }),
        away: createMarketLine({
          marketType: "moneyline",
          direction: "away",
          value: awayMoneyline.price,
          sportsbook: bookmaker?.key,
          timestamp: moneylineTimestamp,
        }),
      },
      total: {
        over: createMarketLine({
          marketType: "total",
          direction: "over",
          value: over.point,
          sportsbook: bookmaker?.key,
          timestamp: totalTimestamp,
        }),
        under: createMarketLine({
          marketType: "total",
          direction: "under",
          value: under.point,
          sportsbook: bookmaker?.key,
          timestamp: totalTimestamp,
        }),
      },
    });

    matchedEvents.push({
      externalEventId: event.id,
      gameId: internalGame.id,
    });
  }

  return { gameOdds, matchedEvents };
}
