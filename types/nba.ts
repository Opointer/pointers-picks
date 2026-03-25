export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  conference: "East" | "West";
}

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  position: "G" | "F" | "C" | "G/F" | "F/C";
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
}

export interface CanonicalPlayer {
  canonicalPlayerId: string;
  internalPlayerId: string;
  fullName: string;
  normalizedFullName: string;
  teamId: string;
  aliases: string[];
  normalizedAliases: string[];
  externalIds?: Record<string, string>;
  seasonRosterEntries: Array<{
    teamId: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  gameDate: string;
  status: "upcoming" | "final";
  homeScore: number | null;
  awayScore: number | null;
}

export interface HistoricalGame extends Game {
  modeledWinnerTeamId?: string | null;
}

export interface TeamStats {
  teamId: string;
  wins: number;
  losses: number;
  pointsPerGame: number;
  pointsAllowedPerGame: number;
  offensiveRating: number;
  defensiveRating: number;
  pace: number;
  homeWins: number;
  homeLosses: number;
  awayWins: number;
  awayLosses: number;
  homePointsPerGame: number;
  awayPointsPerGame: number;
  homePointsAllowedPerGame: number;
  awayPointsAllowedPerGame: number;
  lastFiveGameMargins: [number, number, number, number, number];
}

export interface MatchupContext {
  homeTeam: Team;
  awayTeam: Team;
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
}

export type ConfidenceLevel = "Low" | "Medium" | "High";

export interface ModelFactorContribution {
  key:
    | "recentForm"
    | "offensiveAverage"
    | "defensiveAverage"
    | "homeCourt"
    | "homeAwaySplit"
    | "pace"
    | "trendDelta"
    | "consistency";
  label: string;
  homeValue: number;
  awayValue: number;
  homeContribution: number;
  awayContribution: number;
  advantage: "home" | "away" | "tie";
}

export interface TeamComparisonRow {
  key:
    | "recentForm"
    | "pointsPerGame"
    | "pointsAllowedPerGame"
    | "offensiveRating"
    | "defensiveRating"
    | "pace"
    | "trendDelta"
    | "homeWinRate"
    | "awayWinRate"
    | "consistencyScore";
  label: string;
  homeValue: number;
  awayValue: number;
  winner: "home" | "away" | "tie";
}

export interface ModelResponse {
  winner: Team;
  projectedScoreRange: {
    home: [number, number];
    away: [number, number];
  };
  confidence: {
    level: ConfidenceLevel;
    score: number;
  };
  summary: string;
  factors: ModelFactorContribution[];
  teamComparisons: TeamComparisonRow[];
  meta?: {
    lastNGames: number;
    modelVersion: string;
    inputsUsed: string[];
  };
}

export interface TeamTrendSnapshot {
  teamId: string;
  recentFormAverage: number;
  trendDelta: number;
  consistencyScore: number;
  homeWinRate: number;
  awayWinRate: number;
  lastNGames: number;
}

export interface TeamDetailResponse {
  team: Team;
  stats: TeamStats;
  trend: TeamTrendSnapshot;
  recentGames: Game[];
  recentPlayers: Player[];
}

export interface MatchupTeamProfile {
  team: Team;
  stats: TeamStats;
  trend: TeamTrendSnapshot;
}

export interface MatchupAnalysisResponse {
  matchup: {
    homeTeam: MatchupTeamProfile;
    awayTeam: MatchupTeamProfile;
  };
  model: ModelResponse;
  recentGames: {
    homeTeam: Game[];
    awayTeam: Game[];
  };
}

export interface BacktestGameResult {
  gameId: string;
  actualWinnerTeamId: string;
  predictedWinnerTeamId: string;
  winnerCorrect: boolean;
  homeScoreError: number;
  awayScoreError: number;
}

export interface BacktestSummary {
  gamesEvaluated: number;
  accuracy: number;
  averageAbsoluteError: number;
  results: BacktestGameResult[];
}

export type MarketType =
  | "spread"
  | "moneyline"
  | "total"
  | "player_points"
  | "player_rebounds"
  | "player_assists"
  | "player_pra";

export type PickDirection = "home" | "away" | "over" | "under";
export type PickClassification = "Strong Lean" | "Lean" | "Pass";

export interface BettorPerformance {
  longTermWinRate: number;
  recentWinRate: number;
  roi: number;
  totalTrackedPicks: number;
  marketSpecialties?: MarketType[];
}

export interface TrackedBettor {
  id: string;
  displayName: string;
  isActive: boolean;
  performance: BettorPerformance;
}

export interface BettorPick {
  id: string;
  bettorId: string;
  marketType: MarketType;
  gameId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  playerId?: string;
  direction: PickDirection;
  line: number;
  displayLean: string;
  confidenceUnits?: number;
  createdAt: string;
}

export interface ConsensusMarket {
  id: string;
  marketType: MarketType;
  gameId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  playerId?: string;
  line: number;
  picks: BettorPick[];
  consensusDirection: PickDirection;
  consensusScore: number;
  supportingBettors: number;
  totalConsensusWeight: number;
  minimumQualityPassed: boolean;
}

export type SportsbookId = string;

export type MatchQuality = "exact" | "near" | "none";
export type PlayerIdentityQuality = "high" | "medium" | "low" | "none";
export type PlayerPropFreshnessState = "fresh" | "aging" | "stale" | "unknown";
export type PlayerPropStatus = "qualified" | "watch" | "pass" | "unavailable";
export type PlayerPropMatchQuality = "high" | "medium" | "low" | "none";
export type PlayerPropLineRelationship = "primary" | "exact" | "near" | "alternate" | "none";
export type PlayerPropIntegrityFlag =
  | "missing_over_price"
  | "missing_under_price"
  | "one_sided_offer"
  | "ambiguous_identity"
  | "unresolved_identity"
  | "unmatched_game"
  | "missing_market_type"
  | "missing_line";
export type PlayerPropPassReason =
  | "player_unresolved"
  | "market_not_offered"
  | "line_not_matched"
  | "one_sided_offer"
  | "stale_data"
  | "low_match_confidence"
  | "weak_projection_edge"
  | "partial_data"
  | "service_unavailable";

export interface OddsFetchMeta {
  source: "mock" | "live";
  fetchedAt: string;
  fallbackUsed: boolean;
  warnings?: string[];
}

export interface RawOddsOutcome {
  name?: string;
  description?: string;
  price?: number;
  point?: number;
}

export interface RawOddsMarket {
  key?: string;
  last_update?: string;
  outcomes?: RawOddsOutcome[];
}

export interface RawOddsBookmaker {
  key?: string;
  title?: string;
  last_update?: string;
  markets?: RawOddsMarket[];
}

export interface RawOddsEvent {
  id?: string;
  commence_time?: string;
  home_team?: string;
  away_team?: string;
  bookmakers?: RawOddsBookmaker[];
}

export interface MatchedLiveEvent {
  externalEventId: string;
  gameId: string;
}

export interface PlayerPropFeed {
  fetchMeta: OddsFetchMeta;
  events: RawOddsEvent[];
  matchedEvents: MatchedLiveEvent[];
  warnings: string[];
}

export interface MatchResolution {
  quality: MatchQuality;
  requestedLine: number;
  matchedLine?: number;
  delta?: number;
  penaltyApplied?: number;
}

export interface MoneylineValueResult {
  modelWinProbability: number;
  impliedProbability: number;
  moneylineEdge: number;
  expectedValue: number;
  valueFlag: boolean;
}

export interface MarketLine {
  marketType: MarketType;
  line: number;
  direction?: PickDirection;
  sportsbook?: SportsbookId;
  timestamp: string;
  openLine?: number;
}

export interface GameOdds {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  fetchMeta?: OddsFetchMeta;
  spread: {
    home: MarketLine;
    away: MarketLine;
  };
  moneyline: {
    home: MarketLine;
    away: MarketLine;
  };
  total: {
    over: MarketLine;
    under: MarketLine;
  };
}

export interface PlayerPropOdds {
  gameId: string;
  playerId: string;
  marketType: "player_points" | "player_rebounds" | "player_assists" | "player_pra";
  fetchMeta?: OddsFetchMeta;
  over: MarketLine;
  under: MarketLine;
}

export interface PlayerIdentityResolution {
  rawPlayerLabel: string;
  canonicalPlayerId?: string;
  internalPlayerId?: string;
  resolvedTeamId?: string;
  quality: PlayerIdentityQuality;
  matchedBy: "exact_name" | "alias" | "normalized_name" | "none";
  reason?: string;
  ambiguousCandidates?: string[];
}

export interface PlayerPropOffer {
  offerId: string;
  traceId: string;
  gameId?: string;
  externalEventId?: string;
  canonicalPlayerId?: string;
  internalPlayerId?: string;
  rawPlayerLabel: string;
  sportsbook?: SportsbookId;
  marketType?: "player_points" | "player_rebounds" | "player_assists" | "player_pra";
  line?: number;
  isAlternateLine: boolean;
  overPriceAmerican?: number;
  underPriceAmerican?: number;
  sourceTimestamp?: string;
  fetchMeta: OddsFetchMeta;
  rawSourceRef: {
    bookmakerKey?: string;
    marketKey?: string;
    eventId?: string;
  };
  identityResolution: PlayerIdentityResolution;
  integrityFlags: PlayerPropIntegrityFlag[];
}

export interface PlayerPropMatchResult {
  traceId: string;
  canonicalPlayerId?: string;
  internalPlayerId?: string;
  gameId?: string;
  marketType?: "player_points" | "player_rebounds" | "player_assists" | "player_pra";
  line?: number;
  sportsbook?: SportsbookId;
  offer: PlayerPropOffer;
  matchQuality: PlayerPropMatchQuality;
  identityQuality: PlayerIdentityQuality;
  lineRelationship: PlayerPropLineRelationship;
  freshnessState: PlayerPropFreshnessState;
  selected: boolean;
  reason?: PlayerPropPassReason;
}

export type EdgeTier = "Strong" | "Moderate" | "Weak" | "None";

export interface EdgeResult {
  marketType: MarketType | "player_pra";
  modelEdge: number;
  consensusEdge: number;
  combinedEdge: number;
  edgeScore: number;
  edgeTier: EdgeTier;
  staleValuePenaltyApplied: boolean;
  matchResolution?: MatchResolution;
  moneylineValue?: MoneylineValueResult;
}

export interface PointersPick {
  id: string;
  marketType: MarketType;
  section: "Game Bets" | "Player Props";
  gameId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  playerId?: string;
  line: number;
  modelLean: string;
  bettorConsensusLean: string;
  finalPick: PickClassification;
  confidenceLevel: "Low" | "Medium" | "High";
  rationale: string;
  modelScore: number;
  consensusScore: number;
  researchScore: number;
  combinedScore: number;
  currentMarketLine?: number;
  marketTimestamp?: string;
  openLine?: number;
  modelProjection?: number;
  modelEdge?: number;
  consensusEdge?: number;
  combinedEdge?: number;
  edgeScore?: number;
  edgeTier?: EdgeTier;
  staleLineDetected?: boolean;
  matchQuality?: MatchQuality;
  nearMatchPenalty?: number;
  moneylineEdge?: number;
  modelWinProbability?: number;
  impliedProbability?: number;
  expectedValue?: number;
  valueFlag?: boolean;
  oddsSource?: "mock" | "live";
  safeguards: {
    minConsensusRuleTriggered: boolean;
    lowConsensusWeightCapped: boolean;
    conflictSuppressed: boolean;
    limitedPropInputs: boolean;
  };
}

export interface PointersPicksPageData {
  gameBets: PointersPick[];
  playerProps: PointersPick[];
  trackedBettors: TrackedBettor[];
  consensusMarkets: ConsensusMarket[];
}

export interface MarketHealthSummary {
  providerSource: "mock" | "live";
  fallbackUsed: boolean;
  lastUpdated?: string;
  warningCount: number;
  warnings: string[];
  upcomingGames: number;
  matchedGames: number;
  gameOddsCount: number;
  propMarketsCount: number;
  playersWithProps: number;
}
