import { NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data/provider-factory";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const provider = getDataProvider();
  const { teamId } = await params;

  try {
    return NextResponse.json(await provider.getTeamDetail(teamId));
  } catch {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }
}
