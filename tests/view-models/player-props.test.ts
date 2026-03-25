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
    expect(result.emptyState?.title).toContain("No props available");
    expect(result.availabilityRows[0]?.detail).toContain("Props service down");
    expect(result.trustChips.some((chip) => chip.label === "Unavailable")).toBe(true);
  });
});
