import { EDGE_CONFIG } from "@/lib/edge/constants";
import { type EdgeTier } from "@/types/nba";

export function getConsensusEdge({
  consensusScore,
  consensusMatchesPick,
  isMoneyline = false,
}: {
  consensusScore: number;
  consensusMatchesPick: boolean;
  isMoneyline?: boolean;
}): number {
  const impliedConsensusDelta =
    (Math.abs(consensusScore) / 100) *
    (isMoneyline ? EDGE_CONFIG.maxMoneylineConsensusDelta : EDGE_CONFIG.maxConsensusDelta);

  return consensusMatchesPick ? impliedConsensusDelta : -impliedConsensusDelta;
}

export function getCombinedEdge(modelEdge: number, consensusEdge: number): number {
  return (
    EDGE_CONFIG.combinedModelWeight * modelEdge +
    EDGE_CONFIG.combinedConsensusWeight * consensusEdge
  );
}

export function getEdgeScore(
  combinedEdge: number,
  maxEdgeForScore: number = EDGE_CONFIG.maxEdgeForScore,
): number {
  const positiveEdge = Math.max(combinedEdge, 0);
  const cappedEdge = Math.min(positiveEdge, maxEdgeForScore);
  return (cappedEdge / maxEdgeForScore) * 100;
}

export function getEdgeTier(edgeScore: number): EdgeTier {
  if (edgeScore >= 70) {
    return "Strong";
  }

  if (edgeScore >= 40) {
    return "Moderate";
  }

  if (edgeScore > 0) {
    return "Weak";
  }

  return "None";
}
