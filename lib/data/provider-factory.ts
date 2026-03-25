import { NbaLiveProvider } from "@/lib/data/adapters/nba-live-provider";
import { type DataProvider } from "@/lib/data/provider";
import { MockDataProvider } from "@/lib/data/mock/mock-provider";

export function getDataProvider(): DataProvider {
  if (process.env.NODE_ENV === "test" || process.env.NBA_DATA_PROVIDER === "mock") {
    return new MockDataProvider();
  }

  return new NbaLiveProvider();
}
