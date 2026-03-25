import { NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data/provider-factory";

export async function GET() {
  const provider = getDataProvider();
  return NextResponse.json(await provider.getHistoricalGames());
}
