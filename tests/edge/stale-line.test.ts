import { describe, expect, it } from "vitest";
import { applyStalePenalty, getMovementAgainstPick } from "@/lib/edge/stale";

describe("stale movement", () => {
  it("penalizes movement against an over pick", () => {
    expect(
      getMovementAgainstPick({
        marketType: "total",
        direction: "over",
        openLine: 229.5,
        currentLine: 231.5,
      }),
    ).toBe(2);
  });

  it("does not penalize favorable movement", () => {
    const result = applyStalePenalty({
      marketType: "spread",
      direction: "away",
      openLine: 4.5,
      currentLine: 5.5,
      combinedEdge: 1.4,
    });

    expect(result.penaltyApplied).toBe(false);
    expect(result.adjustedCombinedEdge).toBe(1.4);
  });
});
