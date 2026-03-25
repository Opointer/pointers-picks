export interface ModelRequest {
  homeTeamId: string;
  awayTeamId: string;
}

export function validateModelRequest(payload: unknown):
  | { success: true; data: ModelRequest }
  | { success: false; message: string } {
  if (!payload || typeof payload !== "object") {
    return { success: false, message: "Request body must be a JSON object." };
  }

  const candidate = payload as Partial<ModelRequest>;

  if (!candidate.homeTeamId || !candidate.awayTeamId) {
    return { success: false, message: "Both homeTeamId and awayTeamId are required." };
  }

  if (candidate.homeTeamId === candidate.awayTeamId) {
    return { success: false, message: "Please choose two different teams." };
  }

  return {
    success: true,
    data: {
      homeTeamId: candidate.homeTeamId,
      awayTeamId: candidate.awayTeamId,
    },
  };
}
