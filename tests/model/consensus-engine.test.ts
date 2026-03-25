import { describe, expect, it } from "vitest";
import { bettorPicks, trackedBettors } from "@/lib/bettors/mock-bettors";
import { buildConsensusMarkets } from "@/lib/consensus/engine";

describe("consensus engine", () => {
  it("groups bettor picks into weighted markets", () => {
    const markets = buildConsensusMarkets(bettorPicks, trackedBettors);
    expect(markets.length).toBeGreaterThan(0);
    expect(markets[0]).toHaveProperty("totalConsensusWeight");
  });
});
