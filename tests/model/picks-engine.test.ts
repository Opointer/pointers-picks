import { describe, expect, it } from "vitest";
import { buildPointersPick } from "@/lib/picks/engine";
import { type ConsensusMarket, type EdgeResult } from "@/types/nba";

const market: ConsensusMarket = {
  id: "market-1",
  marketType: "spread",
  gameId: "game-1",
  homeTeamId: "bos",
  awayTeamId: "nyk",
  line: -4.5,
  picks: [],
  consensusDirection: "home",
  consensusScore: 62,
  supportingBettors: 2,
  totalConsensusWeight: 1.3,
  minimumQualityPassed: true,
};

const positiveEdge: EdgeResult & { staleLineDetected: boolean } = {
  marketType: "spread",
  modelEdge: 1.8,
  consensusEdge: 1.2,
  combinedEdge: 1.59,
  edgeScore: 39.75,
  edgeTier: "Weak",
  staleValuePenaltyApplied: false,
  staleLineDetected: false,
};

describe("picks engine", () => {
  it("forces pass when strong model-consensus conflict is unresolved", () => {
    const pick = buildPointersPick({
      id: "market-1",
      section: "Game Bets",
      market,
      line: -4.5,
      modelLean: "Away lean",
      bettorConsensusLean: "Home -4.5",
      modelScore: -50,
      consensusScore: 60,
      researchScore: 10,
      limitedPropInputs: false,
      edge: positiveEdge,
    });

    expect(pick.finalPick).toBe("Pass");
    expect(pick.safeguards.conflictSuppressed).toBe(true);
  });

  it("forces pass when edge is gone", () => {
    const pick = buildPointersPick({
      id: "market-2",
      section: "Game Bets",
      market,
      line: -4.5,
      modelLean: "Home lean",
      bettorConsensusLean: "Home -4.5",
      modelScore: 55,
      consensusScore: 48,
      researchScore: 40,
      limitedPropInputs: false,
      edge: {
        ...positiveEdge,
        combinedEdge: 0,
        edgeScore: 0,
        edgeTier: "None",
      },
    });

    expect(pick.finalPick).toBe("Pass");
  });

  it("caps a near match at lean even when signals are strong", () => {
    const pick = buildPointersPick({
      id: "market-3",
      section: "Game Bets",
      market,
      line: -4.5,
      modelLean: "Home lean",
      bettorConsensusLean: "Home -4.5",
      modelScore: 70,
      consensusScore: 55,
      researchScore: 45,
      limitedPropInputs: false,
      edge: {
        ...positiveEdge,
        edgeTier: "Strong",
        matchResolution: {
          quality: "near",
          requestedLine: -5,
          matchedLine: -4.5,
          delta: 0.5,
          penaltyApplied: 0.35,
        },
      },
    });

    expect(pick.finalPick).toBe("Lean");
    expect(pick.confidenceLevel).toBe("Medium");
  });

  it("forces pass when a moneyline does not have positive expected value", () => {
    const pick = buildPointersPick({
      id: "market-4",
      section: "Game Bets",
      market: {
        ...market,
        marketType: "moneyline",
        consensusDirection: "home",
        line: -180,
      },
      line: -180,
      modelLean: "Home moneyline",
      bettorConsensusLean: "Home ML -180",
      modelScore: 50,
      consensusScore: 45,
      researchScore: 25,
      limitedPropInputs: false,
      edge: {
        ...positiveEdge,
        marketType: "moneyline",
        moneylineValue: {
          modelWinProbability: 0.58,
          impliedProbability: 0.64,
          moneylineEdge: -0.06,
          expectedValue: -0.09,
          valueFlag: false,
        },
      },
    });

    expect(pick.finalPick).toBe("Pass");
  });
});
