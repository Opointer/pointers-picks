import { NextResponse } from "next/server";
import { getOddsProvider } from "@/lib/odds/provider-factory";

export async function GET() {
  const provider = getOddsProvider();
  const [gameOdds, playerPropOdds] = await Promise.all([
    provider.getGameOdds(),
    provider.getPlayerPropOdds(),
  ]);

  return NextResponse.json({
    gameOdds,
    playerPropOdds,
  });
}
