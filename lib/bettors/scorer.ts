import { BETTOR_SCORING } from "@/lib/bettors/constants";
import { type MarketType, type TrackedBettor } from "@/types/nba";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getBettorWeight(bettor: TrackedBettor, marketType: MarketType): number {
  const normalizedRoi = clamp(
    (bettor.performance.roi - BETTOR_SCORING.roiFloor) /
      (BETTOR_SCORING.roiCeiling - BETTOR_SCORING.roiFloor),
    0,
    1,
  );

  const sampleReliability = clamp(
    bettor.performance.totalTrackedPicks / BETTOR_SCORING.reliableSampleSize,
    0,
    1,
  );

  const baseScore =
    BETTOR_SCORING.longTermWeight * bettor.performance.longTermWinRate +
    BETTOR_SCORING.recentWeight * bettor.performance.recentWinRate +
    BETTOR_SCORING.roiWeight * normalizedRoi +
    BETTOR_SCORING.sampleWeight * sampleReliability;

  const specialtyBonus =
    bettor.performance.marketSpecialties?.includes(marketType)
      ? BETTOR_SCORING.specialtyBonus
      : 0;

  return clamp(baseScore + specialtyBonus, 0, 1);
}
