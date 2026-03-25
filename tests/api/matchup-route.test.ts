import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/matchup/[homeTeamId]/[awayTeamId]/route";

describe("GET /api/matchup/:home/:away", () => {
  it("returns matchup analysis", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ homeTeamId: "bos", awayTeamId: "nyk" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveProperty("matchup");
    expect(payload).toHaveProperty("model");
    expect(payload).toHaveProperty("recentGames");
  });
});
