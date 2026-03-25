import { type DataProvider } from "@/lib/data/provider";
import { games, historicalGames, players, teams, teamStats } from "@/lib/data/mock/mock-data";
import { buildBacktestSummary } from "@/lib/model/backtest";
import { MODEL_CONFIG } from "@/lib/model/constants";
import { buildMatchupAnalysis } from "@/lib/selectors/matchup-details";
import { buildTeamDetail, buildTeamTrendSnapshot } from "@/lib/selectors/team-details";
import {
  type BacktestSummary,
  type HistoricalGame,
  type MatchupAnalysisResponse,
  type MatchupContext,
  type TeamDetailResponse,
  type TeamStats,
  type TeamTrendSnapshot,
} from "@/types/nba";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function findTeamStats(teamId: string): TeamStats {
  const stats = teamStats.find((entry) => entry.teamId === teamId);

  if (!stats) {
    throw new Error(`Missing team stats for ${teamId}.`);
  }

  return stats;
}

function ensureTeam(teamId: string) {
  const team = teams.find((entry) => entry.id === teamId);

  if (!team) {
    throw new Error(`Missing team for ${teamId}.`);
  }

  return team;
}

export class MockDataProvider implements DataProvider {
  async getTeams() {
    return clone(teams);
  }

  async getPlayers() {
    return clone(players);
  }

  async getGames() {
    return clone(games);
  }

  async getHistoricalGames(): Promise<HistoricalGame[]> {
    return clone(historicalGames);
  }

  async getRecentGamesForTeam(teamId: string, limit: number) {
    return clone(
      historicalGames
        .filter((game) => game.homeTeamId === teamId || game.awayTeamId === teamId)
        .sort((left, right) => right.gameDate.localeCompare(left.gameDate))
        .slice(0, limit),
    );
  }

  async getTeamStats(teamId: string) {
    return clone(findTeamStats(teamId));
  }

  async getAllTeamStats() {
    return clone(teamStats);
  }

  async getTeamTrend(
    teamId: string,
    lastNGames = MODEL_CONFIG.lastNGamesDefault,
  ): Promise<TeamTrendSnapshot> {
    return clone(buildTeamTrendSnapshot(findTeamStats(teamId), historicalGames, lastNGames));
  }

  async getTeamDetail(
    teamId: string,
    lastNGames = MODEL_CONFIG.lastNGamesDefault,
  ): Promise<TeamDetailResponse> {
    return clone(
      buildTeamDetail(ensureTeam(teamId), findTeamStats(teamId), players, historicalGames, lastNGames),
    );
  }

  async getMatchupContext(homeTeamId: string, awayTeamId: string): Promise<MatchupContext> {
    return {
      homeTeam: clone(ensureTeam(homeTeamId)),
      awayTeam: clone(ensureTeam(awayTeamId)),
      homeTeamStats: clone(findTeamStats(homeTeamId)),
      awayTeamStats: clone(findTeamStats(awayTeamId)),
    };
  }

  async getMatchupAnalysis(
    homeTeamId: string,
    awayTeamId: string,
    lastNGames = MODEL_CONFIG.lastNGamesDefault,
  ): Promise<MatchupAnalysisResponse> {
    const context = await this.getMatchupContext(homeTeamId, awayTeamId);
    return clone(buildMatchupAnalysis(context, teams, teamStats, players, historicalGames, lastNGames));
  }

  async runBacktest(lastNGames = MODEL_CONFIG.lastNGamesDefault): Promise<BacktestSummary> {
    return clone(
      buildBacktestSummary(historicalGames, (game) => ({
        homeTeam: ensureTeam(game.homeTeamId),
        awayTeam: ensureTeam(game.awayTeamId),
        homeTeamStats: findTeamStats(game.homeTeamId),
        awayTeamStats: findTeamStats(game.awayTeamId),
      }), lastNGames),
    );
  }
}
