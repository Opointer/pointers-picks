import { getDataProvider } from "@/lib/data/provider-factory";

export interface TeamsPageRowViewModel {
  id: string;
  title: string;
  href: string;
  summary: string;
  anchors: string;
}

export interface TeamsPageViewModel {
  rows: TeamsPageRowViewModel[];
  emptyState?: {
    title: string;
    description: string;
  };
}

function formatNumber(value: number, digits = 1): string {
  return value.toFixed(digits);
}

export async function getTeamsPageViewModel(): Promise<TeamsPageViewModel> {
  try {
    const dataProvider = getDataProvider();
    const [teams, stats] = await Promise.all([
      dataProvider.getTeams(),
      dataProvider.getAllTeamStats(),
    ]);

    return {
      rows: teams
        .map((team) => {
          const teamStats = stats.find((entry) => entry.teamId === team.id);

          return {
            id: team.id,
            title: `${team.city} ${team.name}`,
            href: `/teams/${team.id}`,
            summary: teamStats
              ? `${team.conference} • ${teamStats.wins}-${teamStats.losses}`
              : `${team.conference} • Stats unavailable`,
            anchors: teamStats
              ? `${formatNumber(teamStats.pointsPerGame)} PPG • ${formatNumber(teamStats.pointsAllowedPerGame)} allowed • ${formatNumber(teamStats.pace)} pace`
              : "Live team statistics unavailable",
          };
        })
        .sort((left, right) => left.title.localeCompare(right.title)),
    };
  } catch (error) {
    return {
      rows: [],
      emptyState: {
        title: "Teams unavailable",
        description:
          error instanceof Error
            ? error.message
            : "The live teams table could not be loaded.",
      },
    };
  }
}
