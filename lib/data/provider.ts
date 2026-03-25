import {
  type BacktestSummary,
  type Game,
  type HistoricalGame,
  type MatchupAnalysisResponse,
  type MatchupContext,
  type Player,
  type Team,
  type TeamDetailResponse,
  type TeamStats,
  type TeamTrendSnapshot,
} from "@/types/nba";

export interface DataProvider {
  getTeams(): Promise<Team[]>;
  getPlayers(): Promise<Player[]>;
  getGames(): Promise<Game[]>;
  getHistoricalGames(): Promise<HistoricalGame[]>;
  getRecentGamesForTeam(teamId: string, limit: number): Promise<Game[]>;
  getTeamStats(teamId: string): Promise<TeamStats>;
  getAllTeamStats(): Promise<TeamStats[]>;
  getTeamTrend(teamId: string, lastNGames?: number): Promise<TeamTrendSnapshot>;
  getTeamDetail(teamId: string, lastNGames?: number): Promise<TeamDetailResponse>;
  getMatchupContext(homeTeamId: string, awayTeamId: string): Promise<MatchupContext>;
  getMatchupAnalysis(
    homeTeamId: string,
    awayTeamId: string,
    lastNGames?: number,
  ): Promise<MatchupAnalysisResponse>;
  runBacktest(lastNGames?: number): Promise<BacktestSummary>;
}
