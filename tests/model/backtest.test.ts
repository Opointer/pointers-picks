import { describe, expect, it } from "vitest";
import { MockDataProvider } from "@/lib/data/mock/mock-provider";

describe("backtest summary", () => {
  it("evaluates historical mock games", async () => {
    const provider = new MockDataProvider();
    const summary = await provider.runBacktest();

    expect(summary.gamesEvaluated).toBeGreaterThan(20);
    expect(summary.results).toHaveLength(summary.gamesEvaluated);
  });
});
