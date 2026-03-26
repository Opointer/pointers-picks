import { beforeEach, describe, expect, it, vi } from "vitest";

const getAvailablePlayerPropPagesMock = vi.fn();

vi.mock("@/lib/services/player-props", () => ({
  getAvailablePlayerPropPages: getAvailablePlayerPropPagesMock,
}));

describe("props index view-model", () => {
  beforeEach(() => {
    getAvailablePlayerPropPagesMock.mockReset();
  });

  it("shows only verified player market pages", async () => {
    getAvailablePlayerPropPagesMock.mockResolvedValue({
      pages: [
        {
          id: "game-1:bos-1",
          gameId: "game-1",
          playerId: "bos-1",
          title: "Jayson Tatum",
          subtitle: "BOS vs NYK • Wed 7:00 PM",
          detail: "2 verified markets available on the player page.",
          href: "/props/game-1/bos-1",
          gameDate: "2026-03-25T00:00:00.000Z",
          teamId: "bos",
        },
      ],
      warnings: [],
      fetchedAt: "2026-03-25T18:00:00.000Z",
      feedAvailable: true,
    });

    const { getPropsIndexViewModel } = await import("@/lib/view-models/props-index");
    const result = await getPropsIndexViewModel("2026-03-25");

    expect(result.players).toHaveLength(1);
    expect(result.players[0]?.title).toBe("Jayson Tatum");
    expect(result.summary).toContain("1 player market page");
    expect(result.emptyState).toBeUndefined();
  });

  it("shows a no-markets-posted state when the feed is live but no verified pages exist", async () => {
    getAvailablePlayerPropPagesMock.mockResolvedValue({
      pages: [],
      warnings: [],
      fetchedAt: "2026-03-25T18:00:00.000Z",
      feedAvailable: true,
    });

    const { getPropsIndexViewModel } = await import("@/lib/view-models/props-index");
    const result = await getPropsIndexViewModel("2026-03-25");

    expect(result.players).toHaveLength(0);
    expect(result.emptyState?.title).toBe("No player markets posted");
    expect(result.trustChips.some((chip) => chip.label === "Props not posted")).toBe(true);
  });
});
