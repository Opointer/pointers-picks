export const MODEL_CONFIG = {
  lastNGamesDefault: 5,
  scoreScale: 100,
  scoreRangeBand: 6,
  homeCourtPoints: 3,
} as const;

export const MODEL_WEIGHTS = {
  recentForm: 0.24,
  offensiveAverage: 0.2,
  defensiveAverage: 0.2,
  homeAwaySplit: 0.1,
  pace: 0.08,
  trendDelta: 0.08,
  consistency: 0.1,
  homeCourtPoints: MODEL_CONFIG.homeCourtPoints,
} as const;

export const CONFIDENCE_THRESHOLDS = {
  lowMaxEdge: 3,
  mediumMaxEdge: 7,
  maxScore: 75,
} as const;

export const SCORE_RANGE_BAND = MODEL_CONFIG.scoreRangeBand;
export const WEIGHTED_SCORE_SCALE = MODEL_CONFIG.scoreScale;
