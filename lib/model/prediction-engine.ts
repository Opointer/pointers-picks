import { calculateMatchup } from "@/lib/model/calculators";
import { CONFIDENCE_THRESHOLDS, MODEL_CONFIG, SCORE_RANGE_BAND } from "@/lib/model/constants";
import { buildPredictionSummary } from "@/lib/model/explanation";
import { type ConfidenceLevel, type MatchupContext, type ModelResponse } from "@/types/nba";

function getConfidenceLevel(edge: number): ConfidenceLevel {
  const absoluteEdge = Math.abs(edge);

  if (absoluteEdge < CONFIDENCE_THRESHOLDS.lowMaxEdge) {
    return "Low";
  }

  if (absoluteEdge <= CONFIDENCE_THRESHOLDS.mediumMaxEdge) {
    return "Medium";
  }

  return "High";
}

export function buildModelResponse(
  context: MatchupContext,
  lastNGames: number = MODEL_CONFIG.lastNGamesDefault,
): ModelResponse {
  const calculated = calculateMatchup(context, lastNGames);

  const winner =
    calculated.edge === 0
      ? context.homeTeam
      : calculated.edge > 0
        ? context.homeTeam
        : context.awayTeam;

  const confidenceScore = Math.min(
    Math.abs(calculated.edge) * 5 + 40,
    CONFIDENCE_THRESHOLDS.maxScore,
  );

  const homeExpected =
    (context.homeTeamStats.pointsPerGame + context.awayTeamStats.pointsAllowedPerGame) / 2 + 1.5;
  const awayExpected =
    (context.awayTeamStats.pointsPerGame + context.homeTeamStats.pointsAllowedPerGame) / 2 - 1.5;
  const projectedAdjustment = Math.max(-8, Math.min(8, calculated.edge / 20));
  const homeProjected = homeExpected + projectedAdjustment;
  const awayProjected = awayExpected - projectedAdjustment;

  return {
    winner,
    projectedScoreRange: {
      home: [
        Math.round(homeProjected - SCORE_RANGE_BAND),
        Math.round(homeProjected + SCORE_RANGE_BAND),
      ],
      away: [
        Math.round(awayProjected - SCORE_RANGE_BAND),
        Math.round(awayProjected + SCORE_RANGE_BAND),
      ],
    },
    confidence: {
      level: getConfidenceLevel(calculated.edge),
      score: Math.round(confidenceScore),
    },
    summary: buildPredictionSummary(winner, context, calculated.factors),
    factors: calculated.factors,
    teamComparisons: calculated.teamComparisons,
    meta: {
      lastNGames,
      modelVersion: "2.0.0",
      inputsUsed: [
        "recentForm",
        "offensiveAverage",
        "defensiveAverage",
        "homeAwaySplit",
        "pace",
        "trendDelta",
        "consistency",
        "homeCourt",
      ],
    },
  };
}
