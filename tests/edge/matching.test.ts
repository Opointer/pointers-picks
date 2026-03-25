import { describe, expect, it } from "vitest";
import { resolveGameOddsMatch, resolvePropOddsMatch } from "@/lib/edge/matching";
import { mockGameOdds, mockPlayerPropOdds } from "@/lib/odds/mock/mock-odds";
import { type ConsensusMarket } from "@/types/nba";

describe("market matching", () => {
  it("returns an exact match when the requested line exists", () => {
    const market: ConsensusMarket = {
      id: "spread-exact",
      marketType: "spread",
      gameId: "game-1",
      homeTeamId: "bos",
      awayTeamId: "nyk",
      line: -4.5,
      picks: [],
      consensusDirection: "home",
      consensusScore: 60,
      supportingBettors: 2,
      totalConsensusWeight: 1.2,
      minimumQualityPassed: true,
    };

    const result = resolveGameOddsMatch(market, mockGameOdds);

    expect(result.matchResolution.quality).toBe("exact");
    expect(result.line?.line).toBe(-4.5);
  });

  it("returns the closest safe near match and applies a penalty", () => {
    const market: ConsensusMarket = {
      id: "spread-near",
      marketType: "spread",
      gameId: "game-1",
      homeTeamId: "bos",
      awayTeamId: "nyk",
      line: -5,
      picks: [],
      consensusDirection: "home",
      consensusScore: 55,
      supportingBettors: 2,
      totalConsensusWeight: 1.2,
      minimumQualityPassed: true,
    };

    const result = resolveGameOddsMatch(market, mockGameOdds);

    expect(result.matchResolution.quality).toBe("near");
    expect(result.matchResolution.delta).toBe(0.5);
    expect(result.matchResolution.penaltyApplied).toBeGreaterThan(0);
    expect(result.line?.line).toBe(-4.5);
  });

  it("returns none when a prop is outside the safe tolerance", () => {
    const market: ConsensusMarket = {
      id: "prop-none",
      marketType: "player_assists",
      gameId: "game-2",
      playerId: "dal-1",
      line: 10,
      picks: [],
      consensusDirection: "over",
      consensusScore: 70,
      supportingBettors: 2,
      totalConsensusWeight: 1.4,
      minimumQualityPassed: true,
    };

    const result = resolvePropOddsMatch(market, mockPlayerPropOdds);

    expect(result.matchResolution.quality).toBe("none");
    expect(result.line).toBeUndefined();
  });
});
