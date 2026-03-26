import { beforeEach, describe, expect, it, vi } from "vitest";

const getPlayerPropsDataMock = vi.fn();

vi.mock("@/lib/services/player-props", () => ({
  getPlayerPropsData: getPlayerPropsDataMock,
}));

describe("player props page view-model", () => {
  beforeEach(() => {
    getPlayerPropsDataMock.mockReset();
  });

  it("returns a safe fallback view-model when the props service throws", async () => {
    getPlayerPropsDataMock.mockRejectedValue(new Error("Props service down"));
    const { getPlayerPropsPageViewModel } = await import("@/lib/view-models/player-props");

    const result = await getPlayerPropsPageViewModel({
      gameId: "game-1",
      playerId: "bos-1",
    });

    expect(result.notFound).toBe(false);
    expect(result.marketGroups).toHaveLength(0);
    expect(result.emptyState?.title).toContain("Props board unavailable");
    expect(result.availabilityRows[0]?.detail).toContain("Props service down");
    expect(result.trustChips.some((chip) => chip.label === "Unavailable")).toBe(true);
  });

  it("surfaces a no-markets-posted state when the player page has no verified markets", async () => {
    getPlayerPropsDataMock.mockResolvedValue({
      notFound: false,
      header: {
        player: { firstName: "Jayson", lastName: "Tatum" },
        team: { abbreviation: "BOS" },
        opponent: { abbreviation: "NYK" },
        gameTime: "Wed 7:00 PM",
      },
      provider: {
        source: "live",
        fallbackUsed: false,
        fetchedAt: "2026-03-25T18:00:00.000Z",
      },
      marketGroups: [],
      availabilityLog: [
        {
          id: "player_points:missing",
          marketType: "Points",
          status: "unavailable",
          reason: "market_not_offered",
          detail: "No posted market was available from the current books.",
        },
      ],
      warnings: [],
      debugLogs: [],
    });
    const { getPlayerPropsPageViewModel } = await import("@/lib/view-models/player-props");

    const result = await getPlayerPropsPageViewModel({
      gameId: "game-1",
      playerId: "bos-1",
    });

    expect(result.emptyState?.title).toBe("No player markets posted");
    expect(result.trustChips.some((chip) => chip.label === "Partial market coverage")).toBe(true);
  });

  it("surfaces a feed-unavailable state when the props service returns a service failure", async () => {
    getPlayerPropsDataMock.mockResolvedValue({
      notFound: false,
      header: {
        player: { firstName: "Jayson", lastName: "Tatum" },
        team: { abbreviation: "BOS" },
        opponent: { abbreviation: "NYK" },
        gameTime: "Wed 7:00 PM",
      },
      provider: {
        source: "live",
        fallbackUsed: false,
      },
      marketGroups: [],
      availabilityLog: [
        {
          id: "service-unavailable",
          marketType: "Props feed",
          status: "unavailable",
          reason: "service_unavailable",
          detail: "Props service down",
        },
      ],
      warnings: ["Props service down"],
      debugLogs: [],
    });
    const { getPlayerPropsPageViewModel } = await import("@/lib/view-models/player-props");

    const result = await getPlayerPropsPageViewModel({
      gameId: "game-1",
      playerId: "bos-1",
    });

    expect(result.emptyState?.title).toBe("Props feed unavailable");
    expect(result.availabilityRows[0]?.detail).toContain("Props service down");
  });
});
