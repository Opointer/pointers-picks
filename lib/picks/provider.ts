import { MockBettorSignalsProvider } from "@/lib/bettors/mock-provider";
import { type BettorSignalsProvider } from "@/lib/bettors/provider";

export function getBettorSignalsProvider(): BettorSignalsProvider {
  return new MockBettorSignalsProvider();
}
