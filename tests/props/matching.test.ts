import { describe, expect, it } from "vitest";
import { games, players, teams } from "@/lib/data/mock/mock-data";
import { mockPlayerPropFeed } from "@/lib/odds/mock/mock-odds";
import { buildCanonicalPlayerRegistry } from "@/lib/props/identity/registry";
import { matchPlayerPropOffers } from "@/lib/props/matching/offers";
import { normalizePlayerPropOffers } from "@/lib/props/normalize/offers";

describe("player prop matching", () => {
  it("selects the freshest complete primary offer and grades safe near lines separately", () => {
    const { offers } = normalizePlayerPropOffers({
      feed: mockPlayerPropFeed,
      teams,
      games,
      players,
    });
    const registry = buildCanonicalPlayerRegistry(players);
    const tatum = registry.find((player) => player.internalPlayerId === "bos-1");

    expect(tatum).toBeDefined();

    const { matches } = matchPlayerPropOffers({
      offers,
      gameId: "game-1",
      canonicalPlayerId: tatum!.canonicalPlayerId,
      nowIso: mockPlayerPropFeed.fetchMeta.fetchedAt,
    });

    const primaryPoints = matches.find(
      (match) => match.marketType === "player_points" && match.selected,
    );
    const nearAlternate = matches.find(
      (match) =>
        match.marketType === "player_points" &&
        !match.selected &&
        match.lineRelationship === "near",
    );

    expect(primaryPoints?.sportsbook).toBe("mockbook");
    expect(primaryPoints?.line).toBe(28.5);
    expect(primaryPoints?.matchQuality).toBe("high");

    expect(nearAlternate?.sportsbook).toBe("altbook");
    expect(nearAlternate?.line).toBe(29);
    expect(nearAlternate?.matchQuality).toBe("medium");
  });

  it("downgrades stale offers to unavailable match quality", () => {
    const { offers } = normalizePlayerPropOffers({
      feed: mockPlayerPropFeed,
      teams,
      games,
      players,
    });
    const registry = buildCanonicalPlayerRegistry(players);
    const luka = registry.find((player) => player.internalPlayerId === "dal-1");

    expect(luka).toBeDefined();

    const { matches } = matchPlayerPropOffers({
      offers,
      gameId: "game-2",
      canonicalPlayerId: luka!.canonicalPlayerId,
      nowIso: "2026-03-26T10:00:00.000Z",
    });

    expect(matches.every((match) => match.freshnessState === "stale")).toBe(true);
    expect(matches.every((match) => match.matchQuality === "none")).toBe(true);
  });
});
