import { getDataProvider } from "@/lib/data/provider-factory";
import { getAvailablePlayerPropPages } from "@/lib/services/player-props";

export interface PlayersPageRowViewModel {
  id: string;
  title: string;
  href?: string;
  profile: string;
  detail: string;
}

export interface PlayersPageViewModel {
  rows: PlayersPageRowViewModel[];
  emptyState?: {
    title: string;
    description: string;
  };
}

export async function getPlayersPageViewModel(): Promise<PlayersPageViewModel> {
  try {
    const dataProvider = getDataProvider();
    const [players, teams, availableProps] = await Promise.all([
      dataProvider.getPlayers(),
      dataProvider.getTeams(),
      getAvailablePlayerPropPages(),
    ]);
    const nextPropPageByPlayerId = new Map(
      availableProps.pages.map((page) => [page.playerId, page]),
    );

    return {
      rows: players.map((player) => {
        const team = teams.find((entry) => entry.id === player.teamId);
        const nextPropPage = nextPropPageByPlayerId.get(player.id);

        return {
          id: player.id,
          title: `${player.firstName} ${player.lastName}`,
          href: nextPropPage?.href,
          profile: `${team?.abbreviation ?? "TEAM"} • ${player.position}`,
          detail: nextPropPage
            ? "Verified live markets are available on the player page."
            : "No verified player market is posted for this player right now.",
        };
      }),
      emptyState: undefined,
    };
  } catch (error) {
    return {
      rows: [],
      emptyState: {
        title: "Players unavailable",
        description:
          error instanceof Error
            ? error.message
            : "The live players table could not be loaded.",
      },
    };
  }
}
