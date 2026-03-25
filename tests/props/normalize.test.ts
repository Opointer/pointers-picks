import { describe, expect, it } from "vitest";
import { games, players, teams } from "@/lib/data/mock/mock-data";
import { mockPlayerPropFeed } from "@/lib/odds/mock/mock-odds";
import { normalizePlayerPropOffers } from "@/lib/props/normalize/offers";

describe("player prop normalization", () => {
  it("preserves distinct sportsbooks and alternate lines instead of collapsing them", () => {
    const { offers } = normalizePlayerPropOffers({
      feed: mockPlayerPropFeed,
      teams,
      games,
      players,
    });

    const tatumPoints = offers.filter(
      (offer) =>
        offer.internalPlayerId === "bos-1" &&
        offer.marketType === "player_points",
    );

    expect(tatumPoints).toHaveLength(2);
    expect(tatumPoints.map((offer) => offer.sportsbook).sort()).toEqual(["altbook", "mockbook"]);
    expect(tatumPoints.map((offer) => offer.line).sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([28.5, 29]);
    expect(new Set(tatumPoints.map((offer) => `${offer.sportsbook}:${offer.line}`)).size).toBe(2);
  });

  it("flags one-sided offers without dropping them from the pipeline", () => {
    const { offers } = normalizePlayerPropOffers({
      feed: mockPlayerPropFeed,
      teams,
      games,
      players,
    });

    const tatumAssists = offers.find(
      (offer) =>
        offer.internalPlayerId === "bos-1" &&
        offer.marketType === "player_assists",
    );

    expect(tatumAssists).toBeDefined();
    expect(tatumAssists?.overPriceAmerican).toBeDefined();
    expect(tatumAssists?.underPriceAmerican).toBeUndefined();
    expect(tatumAssists?.integrityFlags).toContain("one_sided_offer");
    expect(tatumAssists?.integrityFlags).toContain("missing_under_price");
  });
});
