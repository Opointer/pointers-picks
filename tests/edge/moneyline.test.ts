import { describe, expect, it } from "vitest";
import {
  americanOddsToImpliedProbability,
  buildMoneylineValueResult,
  getModelWinProbability,
} from "@/lib/edge/moneyline";

describe("moneyline helper", () => {
  it("converts american odds into implied probability", () => {
    expect(americanOddsToImpliedProbability(-150)).toBeCloseTo(0.6, 5);
    expect(americanOddsToImpliedProbability(130)).toBeCloseTo(100 / 230, 5);
  });

  it("maps model edge to a bounded win probability", () => {
    expect(getModelWinProbability(3)).toBeCloseTo(0.65, 5);
    expect(getModelWinProbability(20)).toBe(0.95);
  });

  it("flags positive EV when model win probability beats the market price", () => {
    const result = buildMoneylineValueResult({
      americanOdds: 130,
      gameModelEdge: 3,
    });

    expect(result.moneylineEdge).toBeGreaterThan(0);
    expect(result.expectedValue).toBeGreaterThan(0);
    expect(result.valueFlag).toBe(true);
  });
});
