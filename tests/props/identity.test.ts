import { describe, expect, it } from "vitest";
import { players } from "@/lib/data/mock/mock-data";
import { buildCanonicalPlayerRegistry } from "@/lib/props/identity/registry";
import { resolvePlayerIdentity } from "@/lib/props/identity/resolver";

describe("player prop identity resolution", () => {
  it("resolves alias names against the active game roster", () => {
    const registry = buildCanonicalPlayerRegistry(players);

    const resolution = resolvePlayerIdentity({
      rawPlayerLabel: "Luka Dončić",
      registry,
      teamIds: ["den", "dal"],
    });

    expect(resolution.quality).toBe("high");
    expect(resolution.matchedBy).toBe("exact_name");
    expect(resolution.internalPlayerId).toBe("dal-1");
    expect(resolution.canonicalPlayerId).toBe("nba:luka-doncic");
  });

  it("marks duplicate-name candidates as unresolved when team context cannot break the tie", () => {
    const registry = buildCanonicalPlayerRegistry([
      ...players,
      {
        id: "mia-jimmy",
        teamId: "mia",
        firstName: "Jimmy",
        lastName: "Butler",
        position: "F",
        pointsPerGame: 21,
        reboundsPerGame: 5,
        assistsPerGame: 5,
      },
      {
        id: "phi-jimmy",
        teamId: "phi",
        firstName: "Jimmy",
        lastName: "Butler",
        position: "F",
        pointsPerGame: 9,
        reboundsPerGame: 4,
        assistsPerGame: 2,
      },
    ]);

    const resolution = resolvePlayerIdentity({
      rawPlayerLabel: "Jimmy Butler",
      registry,
      teamIds: ["mia", "phi"],
    });

    expect(resolution.quality).toBe("none");
    expect(resolution.reason).toContain("Multiple active roster candidates");
    expect(resolution.ambiguousCandidates).toHaveLength(2);
  });
});
