import { describe, expect, it } from "vitest";
import { buildEdgeResult, buildMoneylineEdgeResult } from "@/lib/edge/engine";

describe("edge engine", () => {
  it("computes positive edge for a supported spread side", () => {
    const edge = buildEdgeResult({
      marketType: "spread",
      direction: "home",
      modelEdge: 2,
      consensusScore: 60,
      consensusMatchesPick: true,
      currentLine: -4.5,
      openLine: -3.5,
    });

    expect(edge.modelEdge).toBe(2);
    expect(edge.consensusEdge).toBeGreaterThan(0);
    expect(edge.combinedEdge).toBeGreaterThan(0);
    expect(edge.edgeTier).not.toBe("None");
  });

  it("computes moneyline edge from probability value", () => {
    const edge = buildMoneylineEdgeResult({
      direction: "home",
      gameModelEdge: 3,
      consensusScore: 55,
      consensusMatchesPick: true,
      americanOdds: 130,
      matchResolution: {
        quality: "exact",
        requestedLine: 130,
        matchedLine: 130,
        delta: 0,
        penaltyApplied: 0,
      },
    });

    expect(edge.moneylineValue?.valueFlag).toBe(true);
    expect(edge.combinedEdge).toBeGreaterThan(0);
    expect(edge.edgeTier).not.toBe("None");
  });
});
