import { getCombinedEdge, getConsensusEdge, getEdgeScore, getEdgeTier } from "@/lib/edge/calculators";
import { EDGE_CONFIG } from "@/lib/edge/constants";
import { buildMoneylineValueResult } from "@/lib/edge/moneyline";
import { applyStalePenalty } from "@/lib/edge/stale";
import {
  type EdgeResult,
  type MarketType,
  type MatchResolution,
  type PickDirection,
} from "@/types/nba";

export function buildEdgeResult({
  marketType,
  direction,
  modelEdge,
  consensusScore,
  consensusMatchesPick,
  currentLine,
  openLine,
  matchResolution,
}: {
  marketType: MarketType;
  direction: PickDirection;
  modelEdge: number;
  consensusScore: number;
  consensusMatchesPick: boolean;
  currentLine: number;
  openLine?: number;
  matchResolution?: MatchResolution;
}): EdgeResult & { staleLineDetected: boolean } {
  const consensusEdge = getConsensusEdge({
    consensusScore,
    consensusMatchesPick,
  });
  const initialCombinedEdge = getCombinedEdge(modelEdge, consensusEdge);
  const nearMatchPenalty = matchResolution?.penaltyApplied ?? 0;
  const stale = applyStalePenalty({
    marketType,
    direction,
    openLine,
    currentLine,
    combinedEdge: initialCombinedEdge - nearMatchPenalty,
  });
  const edgeScore = getEdgeScore(stale.adjustedCombinedEdge);

  return {
    marketType,
    modelEdge,
    consensusEdge,
    combinedEdge: stale.adjustedCombinedEdge,
    edgeScore,
    edgeTier: getEdgeTier(edgeScore),
    staleValuePenaltyApplied: stale.penaltyApplied,
    matchResolution,
    staleLineDetected: stale.staleLineDetected,
  };
}

export function buildMoneylineEdgeResult({
  gameModelEdge,
  consensusScore,
  consensusMatchesPick,
  americanOdds,
  matchResolution,
}: {
  gameModelEdge: number;
  consensusScore: number;
  consensusMatchesPick: boolean;
  americanOdds: number;
  matchResolution?: MatchResolution;
}): EdgeResult & { staleLineDetected: boolean } {
  const moneylineValue = buildMoneylineValueResult({
    americanOdds,
    gameModelEdge,
  });
  const consensusEdge = getConsensusEdge({
    consensusScore,
    consensusMatchesPick,
    isMoneyline: true,
  });
  const nearMatchPenalty = matchResolution?.penaltyApplied ?? 0;
  const combinedEdge = getCombinedEdge(moneylineValue.moneylineEdge, consensusEdge) - nearMatchPenalty;
  const edgeScore = getEdgeScore(combinedEdge, EDGE_CONFIG.maxMoneylineEdgeForScore);

  return {
    marketType: "moneyline",
    modelEdge: moneylineValue.moneylineEdge,
    consensusEdge,
    combinedEdge,
    edgeScore,
    edgeTier: getEdgeTier(edgeScore),
    staleValuePenaltyApplied: false,
    matchResolution,
    moneylineValue,
    staleLineDetected: false,
  };
}
