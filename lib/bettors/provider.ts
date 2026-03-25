import { type BettorPick, type TrackedBettor } from "@/types/nba";

export interface BettorSignalsProvider {
  getTrackedBettors(): Promise<TrackedBettor[]>;
  getBettorPicks(): Promise<BettorPick[]>;
}
