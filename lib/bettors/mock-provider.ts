import { type BettorSignalsProvider } from "@/lib/bettors/provider";
import { bettorPicks, trackedBettors } from "@/lib/bettors/mock-bettors";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MockBettorSignalsProvider implements BettorSignalsProvider {
  async getTrackedBettors() {
    return clone(trackedBettors);
  }

  async getBettorPicks() {
    return clone(bettorPicks);
  }
}
