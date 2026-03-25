import { type MoneylineValueResult } from "@/types/nba";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function americanOddsToImpliedProbability(odds: number): number {
  if (odds < 0) {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }

  return 100 / (odds + 100);
}

export function americanOddsToProfitMultiplier(odds: number): number {
  if (odds < 0) {
    return 100 / Math.abs(odds);
  }

  return odds / 100;
}

export function getModelWinProbability(gameModelEdge: number): number {
  return clamp(0.5 + gameModelEdge / 20, 0.05, 0.95);
}

export function buildMoneylineValueResult({
  americanOdds,
  gameModelEdge,
}: {
  americanOdds: number;
  gameModelEdge: number;
}): MoneylineValueResult {
  const impliedProbability = americanOddsToImpliedProbability(americanOdds);
  const modelWinProbability = getModelWinProbability(gameModelEdge);
  const moneylineEdge = modelWinProbability - impliedProbability;
  const expectedValue =
    modelWinProbability * americanOddsToProfitMultiplier(americanOdds) -
    (1 - modelWinProbability);

  return {
    modelWinProbability,
    impliedProbability,
    moneylineEdge,
    expectedValue,
    valueFlag: moneylineEdge > 0 && expectedValue > 0,
  };
}
