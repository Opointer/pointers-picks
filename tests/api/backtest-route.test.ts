import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/backtest/route";

describe("GET /api/backtest", () => {
  it("returns accuracy and average error", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.gamesEvaluated).toBeGreaterThan(0);
    expect(payload.accuracy).toBeGreaterThanOrEqual(0);
    expect(payload.averageAbsoluteError).toBeGreaterThan(0);
  });
});
