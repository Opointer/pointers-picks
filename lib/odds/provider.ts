import { type GameOdds, type PlayerPropFeed, type PlayerPropOdds } from "@/types/nba";

export interface OddsProvider {
  getGameOdds(): Promise<GameOdds[]>;
  getPlayerPropOdds(): Promise<PlayerPropOdds[]>;
  getPlayerPropFeed(): Promise<PlayerPropFeed>;
}
