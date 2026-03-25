export const BETTOR_SCORING = {
  longTermWeight: 0.35,
  recentWeight: 0.3,
  roiWeight: 0.2,
  sampleWeight: 0.15,
  specialtyBonus: 0.05,
  roiFloor: -0.1,
  roiCeiling: 0.1,
  reliableSampleSize: 250,
} as const;
