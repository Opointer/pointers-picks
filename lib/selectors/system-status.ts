import { getDataProvider } from "@/lib/data/provider-factory";
import { getLiveOddsConfig } from "@/lib/odds/health";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import { type MarketHealthSummary } from "@/types/nba";

function getLatestTimestamp(values: Array<string | undefined>): string | undefined {
  const filtered = values.filter((value): value is string => Boolean(value));

  if (!filtered.length) {
    return undefined;
  }

  return filtered.sort((left, right) => Date.parse(right) - Date.parse(left))[0];
}

export async function getMarketHealthSummary(): Promise<MarketHealthSummary> {
  const dataProvider = getDataProvider();
  const oddsProvider = getOddsProvider();
  const oddsConfig = getLiveOddsConfig();
  const [games, gameOdds, playerPropOdds] = await Promise.all([
    dataProvider.getGames(),
    oddsProvider.getGameOdds(),
    oddsProvider.getPlayerPropOdds(),
  ]);

  const upcomingGames = games.filter((game) => game.status === "upcoming");
  const warnings = [
    ...new Set(
      [
        ...oddsConfig.warnings,
        ...[...gameOdds, ...playerPropOdds].flatMap((entry) => entry.fetchMeta?.warnings ?? []),
      ],
    ),
  ];
  const lastUpdated = getLatestTimestamp([
    ...gameOdds.flatMap((odds) => [
      odds.spread.home.timestamp,
      odds.total.over.timestamp,
      odds.moneyline.home.timestamp,
    ]),
    ...playerPropOdds.flatMap((prop) => [prop.over.timestamp, prop.under.timestamp]),
  ]);
  const providerSource =
    gameOdds[0]?.fetchMeta?.source ??
    playerPropOdds[0]?.fetchMeta?.source ??
    (process.env.NODE_ENV === "test" || process.env.NBA_ODDS_PROVIDER === "mock"
      ? "mock"
      : "live");
  const fallbackUsed =
    [...gameOdds, ...playerPropOdds].some((entry) => entry.fetchMeta?.fallbackUsed) ?? false;

  return {
    providerSource,
    fallbackUsed,
    lastUpdated,
    warningCount: warnings.length,
    warnings,
    upcomingGames: upcomingGames.length,
    matchedGames: gameOdds.length,
    gameOddsCount: gameOdds.length,
    propMarketsCount: playerPropOdds.length,
    playersWithProps: new Set(playerPropOdds.map((prop) => prop.playerId)).size,
  };
}
