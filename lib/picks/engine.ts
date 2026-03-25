import { CONSENSUS_RULES } from "@/lib/consensus/constants";
import { PICKS_RULES } from "@/lib/picks/constants";
import { type ConsensusMarket, type EdgeResult, type PickClassification, type PointersPick } from "@/types/nba";

function sign(value: number): number {
  if (value === 0) {
    return 0;
  }

  return value > 0 ? 1 : -1;
}

function toClassification(score: number): PickClassification {
  if (Math.abs(score) >= PICKS_RULES.strongLeanThreshold) {
    return "Strong Lean";
  }

  if (Math.abs(score) >= PICKS_RULES.leanThreshold) {
    return "Lean";
  }

  return "Pass";
}

function capLean(classification: PickClassification): PickClassification {
  return classification === "Strong Lean" ? "Lean" : classification;
}

export function buildPointersPick({
  id,
  section,
  market,
  line,
  modelLean,
  bettorConsensusLean,
  modelScore,
  consensusScore,
  researchScore,
  limitedPropInputs,
  edge,
  modelProjection,
  currentMarketLine,
  marketTimestamp,
  openLine,
  oddsSource,
}: {
  id: string;
  section: "Game Bets" | "Player Props";
  market: ConsensusMarket;
  line: number;
  modelLean: string;
  bettorConsensusLean: string;
  modelScore: number;
  consensusScore: number;
  researchScore: number;
  limitedPropInputs: boolean;
  edge?: (EdgeResult & { staleLineDetected: boolean }) | null;
  modelProjection?: number;
  currentMarketLine?: number;
  marketTimestamp?: string;
  openLine?: number;
  oddsSource?: "mock" | "live";
}): PointersPick {
  const combinedScore =
    section === "Game Bets"
      ? 0.45 * modelScore + 0.3 * consensusScore + 0.25 * researchScore
      : 0.2 * modelScore + 0.35 * consensusScore + 0.45 * researchScore;

  let finalPick = toClassification(combinedScore);

  const minConsensusRuleTriggered =
    market.supportingBettors < CONSENSUS_RULES.minimumSupportingBettors;
  const lowConsensusWeightCapped =
    market.totalConsensusWeight < CONSENSUS_RULES.safeConsensusWeight;

  const strongModel = Math.abs(modelScore) >= PICKS_RULES.conflictThreshold;
  const strongConsensus = Math.abs(consensusScore) >= PICKS_RULES.conflictThreshold;
  const oppositeDirections = sign(modelScore) !== sign(consensusScore);
  let conflictSuppressed = false;

  if (minConsensusRuleTriggered) {
    finalPick = "Pass";
  }

  if (strongModel && strongConsensus && oppositeDirections) {
    const researchResolvesConflict =
      Math.abs(researchScore) >= PICKS_RULES.conflictResearchResolutionThreshold &&
      (sign(researchScore) === sign(modelScore) || sign(researchScore) === sign(consensusScore));

    if (!researchResolvesConflict) {
      finalPick = "Pass";
      conflictSuppressed = true;
    } else {
      finalPick = capLean(finalPick);
      conflictSuppressed = true;
    }
  }

  if (lowConsensusWeightCapped) {
    finalPick = capLean(finalPick);
  }

  if (section === "Player Props") {
    if (limitedPropInputs && Math.abs(combinedScore) < PICKS_RULES.limitedPropPassThreshold) {
      finalPick = "Pass";
    } else if (limitedPropInputs) {
      finalPick = capLean(finalPick);
    }
  }

  if (!edge || edge.combinedEdge <= 0 || edge.edgeTier === "None") {
    finalPick = "Pass";
  } else if (edge.matchResolution?.quality === "near") {
    finalPick = capLean(finalPick);
  } else if (edge.edgeTier === "Weak") {
    finalPick = capLean(finalPick);
  }

  if (edge?.staleLineDetected && edge.combinedEdge <= 0) {
    finalPick = "Pass";
  }

  if (market.marketType === "moneyline") {
    if (!edge?.moneylineValue?.valueFlag) {
      finalPick = "Pass";
    } else {
      finalPick = capLean(finalPick);
    }
  }

  if (
    edge?.staleLineDetected &&
    edge.matchResolution?.quality === "near" &&
    edge.combinedEdge <= 0.75
  ) {
    finalPick = "Pass";
  }

  const confidenceLevel =
    finalPick === "Pass"
      ? "Low"
      : edge?.matchResolution?.quality === "near"
        ? "Medium"
      : section === "Player Props" &&
          (limitedPropInputs ||
            market.supportingBettors < 3 ||
            market.totalConsensusWeight < CONSENSUS_RULES.safeConsensusWeight ||
            conflictSuppressed)
        ? "Medium"
        : edge?.edgeTier === "Strong" &&
            Math.abs(combinedScore) >= PICKS_RULES.highConfidenceThreshold &&
            !lowConsensusWeightCapped &&
            !conflictSuppressed
          ? "High"
          : "Medium";

  const rationaleParts = [
    `Model lean: ${modelLean}.`,
    `Consensus lean: ${bettorConsensusLean}.`,
  ];

  if (!edge) {
    rationaleParts.push("No supported market line match was found, so this market stays a Pass.");
  } else if (edge.combinedEdge <= 0) {
    rationaleParts.push("The current market has removed the edge on this side, so the market stays a Pass.");
  } else if (market.marketType === "moneyline" && !edge.moneylineValue?.valueFlag) {
    rationaleParts.push("The moneyline price does not clear a positive expected-value threshold, so this market stays a Pass.");
  } else if (edge.staleLineDetected) {
    rationaleParts.push("The market moved against the evaluated side, so the value was reduced before classification.");
  } else if (edge.matchResolution?.quality === "near") {
    rationaleParts.push("A nearby market line was used instead of an exact match, so the edge and confidence were reduced.");
  } else if (minConsensusRuleTriggered) {
    rationaleParts.push("Tracked bettor support is too thin, so this market stays a Pass.");
  } else if (conflictSuppressed) {
    rationaleParts.push("Model and consensus disagree strongly, and the available research is not decisive enough to elevate the market.");
  } else if (limitedPropInputs && section === "Player Props") {
    rationaleParts.push("Player-prop inputs are limited, so the classification stays conservative.");
  } else {
    rationaleParts.push("Signals and market value remain aligned enough to justify a cautious lean.");
  }

  return {
    id,
    marketType: market.marketType,
    section,
    gameId: market.gameId,
    homeTeamId: market.homeTeamId,
    awayTeamId: market.awayTeamId,
    playerId: market.playerId,
    line,
    modelLean,
    bettorConsensusLean,
    finalPick,
    confidenceLevel,
    rationale: rationaleParts.join(" "),
    modelScore,
    consensusScore,
    researchScore,
    combinedScore,
    currentMarketLine,
    marketTimestamp,
    openLine,
    modelProjection,
    modelEdge: edge?.modelEdge,
    consensusEdge: edge?.consensusEdge,
    combinedEdge: edge?.combinedEdge,
    edgeScore: edge?.edgeScore,
    edgeTier: edge?.edgeTier,
    staleLineDetected: edge?.staleLineDetected,
    matchQuality: edge?.matchResolution?.quality ?? "none",
    nearMatchPenalty: edge?.matchResolution?.penaltyApplied,
    moneylineEdge: edge?.moneylineValue?.moneylineEdge,
    modelWinProbability: edge?.moneylineValue?.modelWinProbability,
    impliedProbability: edge?.moneylineValue?.impliedProbability,
    expectedValue: edge?.moneylineValue?.expectedValue,
    valueFlag: edge?.moneylineValue?.valueFlag,
    oddsSource,
    safeguards: {
      minConsensusRuleTriggered,
      lowConsensusWeightCapped,
      conflictSuppressed,
      limitedPropInputs,
    },
  };
}
