import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/odds/route";

describe("GET /api/odds", () => {
  it("returns normalized game and prop odds", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveProperty("gameOdds");
    expect(payload).toHaveProperty("playerPropOdds");
    expect(Array.isArray(payload.gameOdds)).toBe(true);
    expect(Array.isArray(payload.playerPropOdds)).toBe(true);
    expect(payload.gameOdds[0]).toHaveProperty("fetchMeta");
  });
});
