import { describe, expect, it } from "vitest";
import { getBettorWeight } from "@/lib/bettors/scorer";
import { trackedBettors } from "@/lib/bettors/mock-bettors";

describe("bettor scorer", () => {
  it("returns a bounded reliability weight", () => {
    const weight = getBettorWeight(trackedBettors[0], "spread");
    expect(weight).toBeGreaterThan(0);
    expect(weight).toBeLessThanOrEqual(1);
  });
});
