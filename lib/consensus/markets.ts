import { type BettorPick } from "@/types/nba";

export function getMarketKey(pick: BettorPick): string {
  if (pick.playerId) {
    return `${pick.marketType}:${pick.playerId}:${pick.line}`;
  }

  return `${pick.marketType}:${pick.homeTeamId}:${pick.awayTeamId}:${pick.line}`;
}

export function groupPicksByMarket(picks: BettorPick[]): Map<string, BettorPick[]> {
  const grouped = new Map<string, BettorPick[]>();

  for (const pick of picks) {
    const key = getMarketKey(pick);
    const existing = grouped.get(key) ?? [];
    existing.push(pick);
    grouped.set(key, existing);
  }

  return grouped;
}
