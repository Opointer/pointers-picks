import { mockGameOdds, mockPlayerPropFeed, mockPlayerPropOdds } from "@/lib/odds/mock/mock-odds";
import {
  createOddsFetchMeta,
  withGameOddsMeta,
  withPlayerPropOddsMeta,
} from "@/lib/odds/health";
import { type OddsProvider } from "@/lib/odds/provider";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MockOddsProvider implements OddsProvider {
  async getGameOdds() {
    return withGameOddsMeta(
      clone(mockGameOdds),
      createOddsFetchMeta({ source: "mock", fallbackUsed: false }),
    );
  }

  async getPlayerPropOdds() {
    return withPlayerPropOddsMeta(
      clone(mockPlayerPropOdds),
      createOddsFetchMeta({ source: "mock", fallbackUsed: false }),
    );
  }

  async getPlayerPropFeed() {
    return clone(mockPlayerPropFeed);
  }
}
