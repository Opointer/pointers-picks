import { NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data/provider-factory";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ homeTeamId: string; awayTeamId: string }> },
) {
  const provider = getDataProvider();
  const { homeTeamId, awayTeamId } = await params;

  try {
    return NextResponse.json(await provider.getMatchupAnalysis(homeTeamId, awayTeamId));
  } catch {
    return NextResponse.json({ error: "Matchup not found." }, { status: 404 });
  }
}
