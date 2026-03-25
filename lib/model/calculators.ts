import { MODEL_CONFIG, MODEL_WEIGHTS, WEIGHTED_SCORE_SCALE } from "@/lib/model/constants";
import {
  type MatchupContext,
  type ModelFactorContribution,
  type TeamComparisonRow,
  type TeamStats,
} from "@/types/nba";

interface NormalizedPair {
  home: number;
  away: number;
}

interface FactorValues {
  recentForm: number;
  offensiveAverage: number;
  defensiveAverage: number;
  homeAwaySplit: number;
  pace: number;
  trendDelta: number;
  consistency: number;
  homeWinRate: number;
  awayWinRate: number;
}

export interface CalculatedMatchup {
  finalHomeScore: number;
  finalAwayScore: number;
  edge: number;
  factors: ModelFactorContribution[];
  teamComparisons: TeamComparisonRow[];
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function variance(values: number[]): number {
  const mean = average(values);
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(values.length, 1);
}

function normalizePair(homeValue: number, awayValue: number, smoothing = 0): NormalizedPair {
  const adjustedHome = Math.max(homeValue + smoothing, 0);
  const adjustedAway = Math.max(awayValue + smoothing, 0);
  const denominator = adjustedHome + adjustedAway;

  if (denominator <= 0.001) {
    return { home: 0.5, away: 0.5 };
  }

  return { home: adjustedHome / denominator, away: adjustedAway / denominator };
}

function normalizeTrendPair(homeTrend: number, awayTrend: number): NormalizedPair {
  const shift = Math.abs(Math.min(homeTrend, awayTrend, 0));
  return normalizePair(homeTrend + shift + 1, awayTrend + shift + 1);
}

function getAdvantage(homeValue: number, awayValue: number): "home" | "away" | "tie" {
  if (Math.abs(homeValue - awayValue) < 0.0001) {
    return "tie";
  }

  return homeValue > awayValue ? "home" : "away";
}

function getLowerWins(homeValue: number, awayValue: number): "home" | "away" | "tie" {
  if (Math.abs(homeValue - awayValue) < 0.0001) {
    return "tie";
  }

  return homeValue < awayValue ? "home" : "away";
}

function getRecentMargins(stats: TeamStats, lastNGames: number): number[] {
  return stats.lastFiveGameMargins.slice(-lastNGames);
}

function buildFactorValues(stats: TeamStats, isHomeTeam: boolean, lastNGames: number): FactorValues {
  const recentMargins = getRecentMargins(stats, lastNGames);
  const homeWinRate = stats.homeWins / Math.max(stats.homeWins + stats.homeLosses, 1);
  const awayWinRate = stats.awayWins / Math.max(stats.awayWins + stats.awayLosses, 1);

  return {
    recentForm: average(recentMargins),
    offensiveAverage: stats.pointsPerGame,
    defensiveAverage: 120 - stats.pointsAllowedPerGame,
    homeAwaySplit: isHomeTeam ? homeWinRate : awayWinRate,
    pace: stats.pace,
    trendDelta:
      recentMargins.length > 1 ? recentMargins[recentMargins.length - 1] - recentMargins[0] : 0,
    consistency: Math.max(0.4, Math.min(1, 1 / (1 + variance(recentMargins)))),
    homeWinRate,
    awayWinRate,
  };
}

export function calculateMatchup(
  context: MatchupContext,
  lastNGames: number = MODEL_CONFIG.lastNGamesDefault,
): CalculatedMatchup {
  const homeValues = buildFactorValues(context.homeTeamStats, true, lastNGames);
  const awayValues = buildFactorValues(context.awayTeamStats, false, lastNGames);

  const recentForm = normalizePair(homeValues.recentForm, awayValues.recentForm);
  const offense = normalizePair(homeValues.offensiveAverage, awayValues.offensiveAverage);
  const defense = normalizePair(homeValues.defensiveAverage, awayValues.defensiveAverage);
  const split = normalizePair(homeValues.homeAwaySplit, awayValues.homeAwaySplit, 0.05);
  const pace = normalizePair(homeValues.pace, awayValues.pace);
  const trend = normalizeTrendPair(homeValues.trendDelta, awayValues.trendDelta);
  const consistency = normalizePair(homeValues.consistency, awayValues.consistency, 0.05);

  const weightedHomeScore =
    MODEL_WEIGHTS.recentForm * recentForm.home +
    MODEL_WEIGHTS.offensiveAverage * offense.home +
    MODEL_WEIGHTS.defensiveAverage * defense.home +
    MODEL_WEIGHTS.homeAwaySplit * split.home +
    MODEL_WEIGHTS.pace * pace.home +
    MODEL_WEIGHTS.trendDelta * trend.home +
    MODEL_WEIGHTS.consistency * consistency.home;

  const weightedAwayScore =
    MODEL_WEIGHTS.recentForm * recentForm.away +
    MODEL_WEIGHTS.offensiveAverage * offense.away +
    MODEL_WEIGHTS.defensiveAverage * defense.away +
    MODEL_WEIGHTS.homeAwaySplit * split.away +
    MODEL_WEIGHTS.pace * pace.away +
    MODEL_WEIGHTS.trendDelta * trend.away +
    MODEL_WEIGHTS.consistency * consistency.away;

  const finalHomeScore =
    weightedHomeScore * WEIGHTED_SCORE_SCALE + MODEL_CONFIG.homeCourtPoints;
  const finalAwayScore = weightedAwayScore * WEIGHTED_SCORE_SCALE;
  const edge = finalHomeScore - finalAwayScore;

  const factors: ModelFactorContribution[] = [
    { key: "recentForm", label: "Recent Form", homeValue: homeValues.recentForm, awayValue: awayValues.recentForm, homeContribution: MODEL_WEIGHTS.recentForm * recentForm.home * WEIGHTED_SCORE_SCALE, awayContribution: MODEL_WEIGHTS.recentForm * recentForm.away * WEIGHTED_SCORE_SCALE, advantage: getAdvantage(homeValues.recentForm, awayValues.recentForm) },
    { key: "offensiveAverage", label: "Offensive Average", homeValue: homeValues.offensiveAverage, awayValue: awayValues.offensiveAverage, homeContribution: MODEL_WEIGHTS.offensiveAverage * offense.home * WEIGHTED_SCORE_SCALE, awayContribution: MODEL_WEIGHTS.offensiveAverage * offense.away * WEIGHTED_SCORE_SCALE, advantage: getAdvantage(homeValues.offensiveAverage, awayValues.offensiveAverage) },
    { key: "defensiveAverage", label: "Defensive Average", homeValue: homeValues.defensiveAverage, awayValue: awayValues.defensiveAverage, homeContribution: MODEL_WEIGHTS.defensiveAverage * defense.home * WEIGHTED_SCORE_SCALE, awayContribution: MODEL_WEIGHTS.defensiveAverage * defense.away * WEIGHTED_SCORE_SCALE, advantage: getAdvantage(homeValues.defensiveAverage, awayValues.defensiveAverage) },
    { key: "homeAwaySplit", label: "Home/Away Split", homeValue: homeValues.homeAwaySplit, awayValue: awayValues.homeAwaySplit, homeContribution: MODEL_WEIGHTS.homeAwaySplit * split.home * WEIGHTED_SCORE_SCALE, awayContribution: MODEL_WEIGHTS.homeAwaySplit * split.away * WEIGHTED_SCORE_SCALE, advantage: getAdvantage(homeValues.homeAwaySplit, awayValues.homeAwaySplit) },
    { key: "pace", label: "Pace", homeValue: homeValues.pace, awayValue: awayValues.pace, homeContribution: MODEL_WEIGHTS.pace * pace.home * WEIGHTED_SCORE_SCALE, awayContribution: MODEL_WEIGHTS.pace * pace.away * WEIGHTED_SCORE_SCALE, advantage: getAdvantage(homeValues.pace, awayValues.pace) },
    { key: "trendDelta", label: "Trend Delta", homeValue: homeValues.trendDelta, awayValue: awayValues.trendDelta, homeContribution: MODEL_WEIGHTS.trendDelta * trend.home * WEIGHTED_SCORE_SCALE, awayContribution: MODEL_WEIGHTS.trendDelta * trend.away * WEIGHTED_SCORE_SCALE, advantage: getAdvantage(homeValues.trendDelta, awayValues.trendDelta) },
    { key: "consistency", label: "Consistency", homeValue: homeValues.consistency, awayValue: awayValues.consistency, homeContribution: MODEL_WEIGHTS.consistency * consistency.home * WEIGHTED_SCORE_SCALE, awayContribution: MODEL_WEIGHTS.consistency * consistency.away * WEIGHTED_SCORE_SCALE, advantage: getAdvantage(homeValues.consistency, awayValues.consistency) },
    { key: "homeCourt", label: "Home Court", homeValue: MODEL_CONFIG.homeCourtPoints, awayValue: 0, homeContribution: MODEL_CONFIG.homeCourtPoints, awayContribution: 0, advantage: "home" },
  ];

  const teamComparisons: TeamComparisonRow[] = [
    { key: "recentForm", label: "Recent Form Margin", homeValue: homeValues.recentForm, awayValue: awayValues.recentForm, winner: getAdvantage(homeValues.recentForm, awayValues.recentForm) },
    { key: "pointsPerGame", label: "Points Per Game", homeValue: context.homeTeamStats.pointsPerGame, awayValue: context.awayTeamStats.pointsPerGame, winner: getAdvantage(context.homeTeamStats.pointsPerGame, context.awayTeamStats.pointsPerGame) },
    { key: "pointsAllowedPerGame", label: "Points Allowed Per Game", homeValue: context.homeTeamStats.pointsAllowedPerGame, awayValue: context.awayTeamStats.pointsAllowedPerGame, winner: getLowerWins(context.homeTeamStats.pointsAllowedPerGame, context.awayTeamStats.pointsAllowedPerGame) },
    { key: "offensiveRating", label: "Offensive Rating", homeValue: context.homeTeamStats.offensiveRating, awayValue: context.awayTeamStats.offensiveRating, winner: getAdvantage(context.homeTeamStats.offensiveRating, context.awayTeamStats.offensiveRating) },
    { key: "defensiveRating", label: "Defensive Rating", homeValue: context.homeTeamStats.defensiveRating, awayValue: context.awayTeamStats.defensiveRating, winner: getLowerWins(context.homeTeamStats.defensiveRating, context.awayTeamStats.defensiveRating) },
    { key: "pace", label: "Pace", homeValue: context.homeTeamStats.pace, awayValue: context.awayTeamStats.pace, winner: getAdvantage(context.homeTeamStats.pace, context.awayTeamStats.pace) },
    { key: "trendDelta", label: "Trend Delta", homeValue: homeValues.trendDelta, awayValue: awayValues.trendDelta, winner: getAdvantage(homeValues.trendDelta, awayValues.trendDelta) },
    { key: "homeWinRate", label: "Home Win Rate", homeValue: homeValues.homeWinRate, awayValue: awayValues.homeWinRate, winner: getAdvantage(homeValues.homeWinRate, awayValues.homeWinRate) },
    { key: "awayWinRate", label: "Away Win Rate", homeValue: homeValues.awayWinRate, awayValue: awayValues.awayWinRate, winner: getAdvantage(homeValues.awayWinRate, awayValues.awayWinRate) },
    { key: "consistencyScore", label: "Consistency Score", homeValue: homeValues.consistency, awayValue: awayValues.consistency, winner: getAdvantage(homeValues.consistency, awayValues.consistency) },
  ];

  return { finalHomeScore, finalAwayScore, edge, factors, teamComparisons };
}
