import { type GameOdds, type OddsFetchMeta, type PlayerPropOdds } from "@/types/nba";

export interface LiveOddsConfig {
  apiKey: string;
  baseUrl: string;
  sportKey: string;
  regions: string;
  bookmakers?: string;
  featuredMarkets: string;
  propMarkets: string[];
}

export function getLiveOddsConfig(): { valid: boolean; config: LiveOddsConfig; warnings: string[] } {
  const warnings: string[] = [];
  const apiKey = process.env.THE_ODDS_API_KEY ?? process.env.ODDS_API_KEY ?? "";
  const baseUrl = process.env.THE_ODDS_API_BASE_URL ?? "https://api.the-odds-api.com/v4";
  const sportKey = process.env.THE_ODDS_API_SPORT ?? "basketball_nba";
  const regions = process.env.THE_ODDS_API_REGIONS ?? "us";
  const bookmakers = process.env.THE_ODDS_API_BOOKMAKERS;
  const propMarkets = (process.env.THE_ODDS_API_PROP_MARKETS ??
    "player_points,player_rebounds,player_assists,player_points_rebounds_assists")
    .split(",")
    .map((market) => market.trim())
    .filter(Boolean);

  if (!apiKey) {
    warnings.push("Missing THE_ODDS_API_KEY. Live odds are unavailable.");
  }

  return {
    valid: Boolean(apiKey),
    config: {
      apiKey,
      baseUrl,
      sportKey,
      regions,
      bookmakers,
      featuredMarkets: "h2h,spreads,totals",
      propMarkets,
    },
    warnings,
  };
}

export function createOddsFetchMeta({
  source,
  fallbackUsed,
  warnings,
}: {
  source: "mock" | "live";
  fallbackUsed: boolean;
  warnings?: string[];
}): OddsFetchMeta {
  return {
    source,
    fetchedAt: new Date().toISOString(),
    fallbackUsed,
    warnings: warnings?.length ? warnings : undefined,
  };
}

export function withGameOddsMeta(gameOdds: GameOdds[], fetchMeta: OddsFetchMeta): GameOdds[] {
  return gameOdds.map((game) => ({ ...game, fetchMeta }));
}

export function withPlayerPropOddsMeta(
  playerProps: PlayerPropOdds[],
  fetchMeta: OddsFetchMeta,
): PlayerPropOdds[] {
  return playerProps.map((prop) => ({ ...prop, fetchMeta }));
}
