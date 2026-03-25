import {
  type Game,
  type HistoricalGame,
  type Player,
  type Team,
  type TeamDetailResponse,
  type TeamStats,
  type TeamTrendSnapshot,
} from "@/types/nba";
import { MODEL_CONFIG } from "@/lib/model/constants";

function takeRecentMargins(teamId: string, historicalGames: HistoricalGame[], limit: number): number[] {
  return historicalGames
    .filter((game) => game.homeTeamId === teamId || game.awayTeamId === teamId)
    .sort((left, right) => right.gameDate.localeCompare(left.gameDate))
    .slice(0, limit)
    .map((game) => {
      const homeScore = game.homeScore ?? 0;
      const awayScore = game.awayScore ?? 0;
      return game.homeTeamId === teamId ? homeScore - awayScore : awayScore - homeScore;
    });
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

export function buildTeamTrendSnapshot(
  stats: TeamStats,
  historicalGames: HistoricalGame[],
  lastNGames: number = MODEL_CONFIG.lastNGamesDefault,
): TeamTrendSnapshot {
  const recentMargins = takeRecentMargins(stats.teamId, historicalGames, lastNGames);
  const recentFormAverage =
    recentMargins.reduce((sum, value) => sum + value, 0) / Math.max(recentMargins.length, 1);
  const trendDelta =
    recentMargins.length > 1 ? recentMargins[0] - recentMargins[recentMargins.length - 1] : 0;
  const variance = calculateVariance(recentMargins);
  const consistencyScore = Math.max(0.4, Math.min(1, 1 / (1 + variance)));
  const homeWinRate = stats.homeWins / Math.max(stats.homeWins + stats.homeLosses, 1);
  const awayWinRate = stats.awayWins / Math.max(stats.awayWins + stats.awayLosses, 1);

  return {
    teamId: stats.teamId,
    recentFormAverage,
    trendDelta,
    consistencyScore,
    homeWinRate,
    awayWinRate,
    lastNGames,
  };
}

export function buildTeamDetail(
  team: Team,
  stats: TeamStats,
  players: Player[],
  historicalGames: HistoricalGame[],
  lastNGames: number = MODEL_CONFIG.lastNGamesDefault,
): TeamDetailResponse {
  const recentGames: Game[] = historicalGames
    .filter((game) => game.homeTeamId === team.id || game.awayTeamId === team.id)
    .sort((left, right) => right.gameDate.localeCompare(left.gameDate))
    .slice(0, lastNGames);

  return {
    team,
    stats,
    trend: buildTeamTrendSnapshot(stats, historicalGames, lastNGames),
    recentGames,
    recentPlayers: players.filter((player) => player.teamId === team.id),
  };
}
