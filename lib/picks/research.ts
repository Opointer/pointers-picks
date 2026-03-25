import { type ConsensusMarket, type MatchupAnalysisResponse, type Player } from "@/types/nba";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getGameResearchScore(analysis: MatchupAnalysisResponse): number {
  const home = analysis.matchup.homeTeam;
  const away = analysis.matchup.awayTeam;
  const recentFormSupport = home.trend.recentFormAverage - away.trend.recentFormAverage;
  const offenseDefenseSupport =
    (home.stats.offensiveRating - away.stats.defensiveRating) -
    (away.stats.offensiveRating - home.stats.defensiveRating);
  const splitSupport = home.trend.homeWinRate - away.trend.awayWinRate;
  const consistencySupport = home.trend.consistencyScore - away.trend.consistencyScore;

  return clamp(
    recentFormSupport * 6 +
      offenseDefenseSupport * 2.5 +
      splitSupport * 45 +
      consistencySupport * 60,
    -100,
    100,
  );
}

export function getPropResearchScore(
  player: Player | undefined,
  market: ConsensusMarket,
): { score: number; limitedInputs: boolean } {
  if (!player) {
    return { score: 0, limitedInputs: true };
  }

  const baseAverage =
    market.marketType === "player_points"
      ? player.pointsPerGame
      : market.marketType === "player_rebounds"
        ? player.reboundsPerGame
        : player.assistsPerGame;

  const diff = baseAverage - market.line;
  const score = Math.max(-100, Math.min(100, diff * 12));
  const limitedInputs = true;

  return { score, limitedInputs };
}
