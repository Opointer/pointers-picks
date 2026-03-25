import { NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data/provider-factory";
import { buildModelResponse } from "@/lib/model/prediction-engine";
import { validateModelRequest } from "@/lib/validation/model-request";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateModelRequest(payload);

  if (!validation.success) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const provider = getDataProvider();
  const teams = await provider.getTeams();
  const homeTeamExists = teams.some((team) => team.id === validation.data.homeTeamId);
  const awayTeamExists = teams.some((team) => team.id === validation.data.awayTeamId);

  if (!homeTeamExists || !awayTeamExists) {
    return NextResponse.json({ error: "One or both teams could not be found." }, { status: 404 });
  }

  const context = await provider.getMatchupContext(
    validation.data.homeTeamId,
    validation.data.awayTeamId,
  );

  return NextResponse.json(buildModelResponse(context));
}
