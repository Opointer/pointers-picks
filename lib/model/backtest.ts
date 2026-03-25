import { buildModelResponse } from "@/lib/model/prediction-engine";
import { type BacktestGameResult, type BacktestSummary, type HistoricalGame, type MatchupContext } from "@/types/nba";

export function buildBacktestSummary(
  historicalGames: HistoricalGame[],
  contextBuilder: (game: HistoricalGame) => MatchupContext,
  lastNGames: number,
): BacktestSummary {
  const results: BacktestGameResult[] = historicalGames.map((game) => {
    const context = contextBuilder(game);
    const prediction = buildModelResponse(context, lastNGames);
    const actualWinnerTeamId =
      (game.homeScore ?? 0) >= (game.awayScore ?? 0) ? game.homeTeamId : game.awayTeamId;
    const homeMid =
      (prediction.projectedScoreRange.home[0] + prediction.projectedScoreRange.home[1]) / 2;
    const awayMid =
      (prediction.projectedScoreRange.away[0] + prediction.projectedScoreRange.away[1]) / 2;

    return {
      gameId: game.id,
      actualWinnerTeamId,
      predictedWinnerTeamId: prediction.winner.id,
      winnerCorrect: actualWinnerTeamId === prediction.winner.id,
      homeScoreError: Math.abs((game.homeScore ?? 0) - homeMid),
      awayScoreError: Math.abs((game.awayScore ?? 0) - awayMid),
    };
  });

  const gamesEvaluated = results.length;
  const correct = results.filter((result) => result.winnerCorrect).length;
  const averageAbsoluteError =
    results.reduce(
      (sum, result) => sum + (result.homeScoreError + result.awayScoreError) / 2,
      0,
    ) / Math.max(gamesEvaluated, 1);

  return {
    gamesEvaluated,
    accuracy: correct / Math.max(gamesEvaluated, 1),
    averageAbsoluteError,
    results,
  };
}
