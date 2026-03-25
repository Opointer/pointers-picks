import { type MatchupContext, type ModelFactorContribution, type Team } from "@/types/nba";

function getLabel(label: string): string {
  switch (label) {
    case "Recent Form":
      return "stronger recent form";
    case "Defensive Average":
      return "better defensive profile";
    case "Home/Away Split":
      return "stronger home/away split";
    case "Consistency":
      return "more consistent recent performance";
    default:
      return label.toLowerCase();
  }
}

export function buildPredictionSummary(
  winner: Team,
  context: MatchupContext,
  factors: ModelFactorContribution[],
): string {
  const winnerIsHome = winner.id === context.homeTeam.id;
  const topReasons = factors
    .map((factor) => ({
      label: getLabel(factor.label),
      edge: winnerIsHome
        ? factor.homeContribution - factor.awayContribution
        : factor.awayContribution - factor.homeContribution,
    }))
    .filter((factor) => factor.edge > 0)
    .sort((left, right) => right.edge - left.edge)
    .slice(0, 3)
    .map((factor) => factor.label);

  if (topReasons.length === 0) {
    return `${winner.city} projects slightly ahead in a near-even matchup.`;
  }

  if (topReasons.length === 1) {
    return `${winner.city} projects ahead because of ${topReasons[0]}.`;
  }

  return `${winner.city} projects ahead because of ${topReasons
    .slice(0, -1)
    .join(", ")} and ${topReasons.at(-1)}.`;
}
