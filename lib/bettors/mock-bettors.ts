import { type BettorPick, type TrackedBettor } from "@/types/nba";

export const trackedBettors: TrackedBettor[] = [
  {
    id: "bettor-1",
    displayName: "Tracked Bettor A",
    isActive: true,
    performance: {
      longTermWinRate: 0.56,
      recentWinRate: 0.6,
      roi: 0.08,
      totalTrackedPicks: 320,
      marketSpecialties: ["spread", "moneyline"],
    },
  },
  {
    id: "bettor-2",
    displayName: "Tracked Bettor B",
    isActive: true,
    performance: {
      longTermWinRate: 0.54,
      recentWinRate: 0.55,
      roi: 0.05,
      totalTrackedPicks: 270,
      marketSpecialties: ["total", "player_points"],
    },
  },
  {
    id: "bettor-3",
    displayName: "Tracked Bettor C",
    isActive: true,
    performance: {
      longTermWinRate: 0.53,
      recentWinRate: 0.58,
      roi: 0.03,
      totalTrackedPicks: 190,
      marketSpecialties: ["player_rebounds", "player_assists"],
    },
  },
];

export const bettorPicks: BettorPick[] = [
  { id: "pick-1", bettorId: "bettor-1", marketType: "spread", gameId: "game-1", homeTeamId: "bos", awayTeamId: "nyk", direction: "home", line: -5, displayLean: "BOS -5.0", createdAt: "2026-03-25T08:00:00.000Z" },
  { id: "pick-2", bettorId: "bettor-2", marketType: "spread", gameId: "game-1", homeTeamId: "bos", awayTeamId: "nyk", direction: "home", line: -5, displayLean: "BOS -5.0", createdAt: "2026-03-25T08:10:00.000Z" },
  { id: "pick-3", bettorId: "bettor-1", marketType: "moneyline", gameId: "game-2", homeTeamId: "den", awayTeamId: "dal", direction: "home", line: -150, displayLean: "DEN ML", createdAt: "2026-03-25T08:20:00.000Z" },
  { id: "pick-4", bettorId: "bettor-2", marketType: "moneyline", gameId: "game-2", homeTeamId: "den", awayTeamId: "dal", direction: "home", line: -150, displayLean: "DEN ML", createdAt: "2026-03-25T08:25:00.000Z" },
  { id: "pick-5", bettorId: "bettor-3", marketType: "total", gameId: "game-3", homeTeamId: "okc", awayTeamId: "lal", direction: "over", line: 230, displayLean: "Over 230.0", createdAt: "2026-03-25T08:30:00.000Z" },
  { id: "pick-6", bettorId: "bettor-2", marketType: "total", gameId: "game-3", homeTeamId: "okc", awayTeamId: "lal", direction: "over", line: 230, displayLean: "Over 230.0", createdAt: "2026-03-25T08:40:00.000Z" },
  { id: "pick-7", bettorId: "bettor-2", marketType: "player_points", gameId: "game-1", playerId: "bos-1", direction: "over", line: 28.5, displayLean: "Tatum Over 28.5", createdAt: "2026-03-25T09:00:00.000Z" },
  { id: "pick-8", bettorId: "bettor-3", marketType: "player_points", gameId: "game-1", playerId: "bos-1", direction: "under", line: 28.5, displayLean: "Tatum Under 28.5", createdAt: "2026-03-25T09:05:00.000Z" },
  { id: "pick-9", bettorId: "bettor-2", marketType: "player_assists", gameId: "game-2", playerId: "dal-1", direction: "over", line: 9, displayLean: "Doncic Over 9.0 AST", createdAt: "2026-03-25T09:10:00.000Z" },
  { id: "pick-10", bettorId: "bettor-3", marketType: "player_assists", gameId: "game-2", playerId: "dal-1", direction: "over", line: 9, displayLean: "Doncic Over 9.0 AST", createdAt: "2026-03-25T09:15:00.000Z" },
];
