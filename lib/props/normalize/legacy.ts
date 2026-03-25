import { type PlayerPropOffer, type PlayerPropOdds } from "@/types/nba";

function toMarketLine({
  marketType,
  direction,
  line,
  sportsbook,
  timestamp,
}: {
  marketType: PlayerPropOdds["marketType"];
  direction: "over" | "under";
  line: number;
  sportsbook?: string;
  timestamp: string;
}) {
  return {
    marketType,
    direction,
    line,
    sportsbook,
    timestamp,
  } as const;
}

export function toLegacyPlayerPropOdds(offers: PlayerPropOffer[]): PlayerPropOdds[] {
  return offers
    .filter(
      (offer): offer is PlayerPropOffer & {
        gameId: string;
        internalPlayerId: string;
        marketType: PlayerPropOdds["marketType"];
        line: number;
        sourceTimestamp: string;
      } =>
        Boolean(
          offer.gameId &&
            offer.internalPlayerId &&
            offer.marketType &&
            offer.line !== undefined &&
            offer.sourceTimestamp,
        ),
    )
    .map((offer) => ({
      gameId: offer.gameId,
      playerId: offer.internalPlayerId,
      marketType: offer.marketType,
      fetchMeta: offer.fetchMeta,
      over: toMarketLine({
        marketType: offer.marketType,
        direction: "over",
        line: offer.line,
        sportsbook: offer.sportsbook,
        timestamp: offer.sourceTimestamp,
      }),
      under: toMarketLine({
        marketType: offer.marketType,
        direction: "under",
        line: offer.line,
        sportsbook: offer.sportsbook,
        timestamp: offer.sourceTimestamp,
      }),
    }));
}
