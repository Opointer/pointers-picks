import { buildModelResponse } from "@/lib/model/prediction-engine";
import { buildTeamDetail, buildTeamTrendSnapshot } from "@/lib/selectors/team-details";
import {
  type HistoricalGame,
  type MatchupAnalysisResponse,
  type MatchupContext,
  type Player,
  type Team,
  type TeamStats,
} from "@/types/nba";
import { MODEL_CONFIG } from "@/lib/model/constants";

export function buildMatchupAnalysis(
  context: MatchupContext,
  teams: Team[],
  stats: TeamStats[],
  players: Player[],
  historicalGames: HistoricalGame[],
  lastNGames: number = MODEL_CONFIG.lastNGamesDefault,
): MatchupAnalysisResponse {
  const homeDetail = buildTeamDetail(
    context.homeTeam,
    context.homeTeamStats,
    players,
    historicalGames,
    lastNGames,
  );
  const awayDetail = buildTeamDetail(
    context.awayTeam,
    context.awayTeamStats,
    players,
    historicalGames,
    lastNGames,
  );

  return {
    matchup: {
      homeTeam: {
        team: homeDetail.team,
        stats: homeDetail.stats,
        trend: buildTeamTrendSnapshot(context.homeTeamStats, historicalGames, lastNGames),
      },
      awayTeam: {
        team: awayDetail.team,
        stats: awayDetail.stats,
        trend: buildTeamTrendSnapshot(context.awayTeamStats, historicalGames, lastNGames),
      },
    },
    model: buildModelResponse(context, lastNGames),
    recentGames: {
      homeTeam: homeDetail.recentGames,
      awayTeam: awayDetail.recentGames,
    },
  };
}
