import { EDGE_CONFIG } from "@/lib/edge/constants";
import { type MarketType, type PickDirection } from "@/types/nba";

function isPropMarket(marketType: MarketType): boolean {
  return marketType.startsWith("player_");
}

export function getMovementAgainstPick({
  marketType,
  direction,
  openLine,
  currentLine,
}: {
  marketType: MarketType;
  direction: PickDirection;
  openLine?: number;
  currentLine: number;
}): number {
  if (openLine === undefined) {
    return 0;
  }

  if (marketType === "total" || isPropMarket(marketType)) {
    if (direction === "over") {
      return currentLine - openLine;
    }

    return openLine - currentLine;
  }

  if (marketType === "spread") {
    if (direction === "home") {
      return Math.abs(currentLine) - Math.abs(openLine);
    }

    return openLine - currentLine;
  }

  return 0;
}

export function applyStalePenalty({
  marketType,
  direction,
  openLine,
  currentLine,
  combinedEdge,
}: {
  marketType: MarketType;
  direction: PickDirection;
  openLine?: number;
  currentLine: number;
  combinedEdge: number;
}): { adjustedCombinedEdge: number; staleLineDetected: boolean; penaltyApplied: boolean } {
  const movementAgainstPick = getMovementAgainstPick({
    marketType,
    direction,
    openLine,
    currentLine,
  });

  const threshold = isPropMarket(marketType)
    ? EDGE_CONFIG.significantPropMove
    : EDGE_CONFIG.significantSpreadOrTotalMove;

  if (movementAgainstPick < threshold) {
    return {
      adjustedCombinedEdge: combinedEdge,
      staleLineDetected: false,
      penaltyApplied: false,
    };
  }

  return {
    adjustedCombinedEdge: combinedEdge - EDGE_CONFIG.stalePenalty,
    staleLineDetected: true,
    penaltyApplied: true,
  };
}
