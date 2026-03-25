import { LiveOddsProvider } from "@/lib/odds/adapters/live-odds-provider";
import { MockOddsProvider } from "@/lib/odds/mock/mock-provider";
import { type OddsProvider } from "@/lib/odds/provider";

export function getOddsProvider(): OddsProvider {
  if (process.env.NODE_ENV === "test" || process.env.NBA_ODDS_PROVIDER === "mock") {
    return new MockOddsProvider();
  }

  return new LiveOddsProvider();
}
