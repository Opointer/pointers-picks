import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/games/route";

describe("GET /api/games", () => {
  it("returns final and upcoming games", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(Array.isArray(payload)).toBe(true);
    expect(payload.some((game: { status: string }) => game.status === "upcoming")).toBe(true);
    expect(payload.some((game: { status: string }) => game.status === "final")).toBe(true);
  });
});
