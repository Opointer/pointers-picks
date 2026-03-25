import { getDataProvider } from "@/lib/data/provider-factory";

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
    const [players, teams, games] = await Promise.all([
      dataProvider.getPlayers(),
      dataProvider.getTeams(),
      dataProvider.getGames(),
    ]);
    const nextGameByTeamId = new Map<string, (typeof games)[number]>();

    for (const game of games
      .filter((entry) => entry.status === "upcoming")
      .sort((left, right) => left.gameDate.localeCompare(right.gameDate))) {
      if (!nextGameByTeamId.has(game.homeTeamId)) {
        nextGameByTeamId.set(game.homeTeamId, game);
      }

      if (!nextGameByTeamId.has(game.awayTeamId)) {
        nextGameByTeamId.set(game.awayTeamId, game);
      }
    }

    return {
      rows: players.map((player) => {
        const team = teams.find((entry) => entry.id === player.teamId);
        const nextGame = nextGameByTeamId.get(player.teamId);

        return {
          id: player.id,
          title: `${player.firstName} ${player.lastName}`,
          href: nextGame ? `/props/${nextGame.id}/${player.id}` : undefined,
          profile: `${team?.abbreviation ?? "TEAM"} • ${player.position}`,
          detail: nextGame
            ? "Open the player props page for the next scheduled game."
            : "No upcoming game is currently attached to this player’s team.",
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
