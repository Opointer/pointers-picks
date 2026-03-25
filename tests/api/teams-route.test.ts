import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/teams/route";

describe("GET /api/teams", () => {
  it("returns normalized teams", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(12);
    expect(payload[0]).toHaveProperty("conference");
  });
});
