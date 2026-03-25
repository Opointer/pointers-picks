import { getDataProvider } from "@/lib/data/provider-factory";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import {
  formatCentralDateLabel,
  sanitizeDateKey,
  shiftDateKey,
  toCentralDateKey,
} from "@/lib/view-models/date-controls";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";

export interface PropsIndexPlayerCardViewModel {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  href: string;
}

export interface PropsIndexViewModel {
  selectedDate: string;
  selectedDateLabel: string;
  todayHref: string;
  previousHref: string;
  nextHref: string;
  summary: string;
  trustChips: PlatformStatusChipViewModel[];
  warnings: string[];
  players: PropsIndexPlayerCardViewModel[];
  emptyState?: {
    title: string;
    description: string;
  };
}

function formatGameTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  }).format(date);
}

export async function getPropsIndexViewModel(selectedDateParam?: string): Promise<PropsIndexViewModel> {
  const dataProvider = getDataProvider();
  const selectedDate = sanitizeDateKey(selectedDateParam) ?? toCentralDateKey(new Date());

  try {
    const [games, players, teams, feed] = await Promise.all([
      dataProvider.getGames(),
      dataProvider.getPlayers(),
      dataProvider.getTeams(),
      getOddsProvider().getPlayerPropFeed(),
    ]);

    const slateGames = games
      .filter((game) => game.status === "upcoming")
      .filter((game) => toCentralDateKey(game.gameDate) === selectedDate)
      .sort((left, right) => left.gameDate.localeCompare(right.gameDate));

    const slatePlayers = slateGames.flatMap((game) => {
      const gamePlayers = players
        .filter((player) => player.teamId === game.homeTeamId || player.teamId === game.awayTeamId)
        .slice(0, 6);

      return gamePlayers.map((player) => {
        const team = teams.find((entry) => entry.id === player.teamId);
        const opponentId = game.homeTeamId === player.teamId ? game.awayTeamId : game.homeTeamId;
        const opponent = teams.find((entry) => entry.id === opponentId);

        return {
          id: `${game.id}:${player.id}`,
          title: `${player.firstName} ${player.lastName}`,
          subtitle: `${team?.abbreviation ?? "TEAM"} vs ${opponent?.abbreviation ?? "OPP"} • ${formatGameTime(game.gameDate)}`,
          detail: `${player.position} • Open the player page for live props availability, freshness, and trust details.`,
          href: `/props/${game.id}/${player.id}`,
        } satisfies PropsIndexPlayerCardViewModel;
      });
    });

    const liveFeedAvailable = feed.events.length > 0;

    return {
      selectedDate,
      selectedDateLabel: formatCentralDateLabel(selectedDate),
      todayHref: `/props?date=${toCentralDateKey(new Date())}`,
      previousHref: `/props?date=${shiftDateKey(selectedDate, -1)}`,
      nextHref: `/props?date=${shiftDateKey(selectedDate, 1)}`,
      summary:
        slatePlayers.length > 0
          ? `${slatePlayers.length} player pages are available for ${formatCentralDateLabel(selectedDate)}.`
          : `No player props pages are available for ${formatCentralDateLabel(selectedDate)}.`,
      trustChips: [
        {
          label: liveFeedAvailable ? "Live feed" : "Unavailable",
          tone: liveFeedAvailable ? "success" : "danger",
        },
        {
          label: feed.fetchMeta.fetchedAt ? "Updated recently" : "Data delayed",
          tone: feed.fetchMeta.fetchedAt ? "neutral" : "warning",
        },
        {
          label: slatePlayers.length > 0 ? "Player pages available" : "No slate players",
          tone: slatePlayers.length > 0 ? "neutral" : "warning",
        },
      ],
      warnings: feed.warnings,
      players: slatePlayers,
      emptyState:
        slatePlayers.length === 0
          ? {
              title: "No player pages on this date",
              description:
                "The selected date does not currently have any scheduled NBA players to browse.",
            }
          : undefined,
    };
  } catch (error) {
    return {
      selectedDate,
      selectedDateLabel: formatCentralDateLabel(selectedDate),
      todayHref: `/props?date=${toCentralDateKey(new Date())}`,
      previousHref: `/props?date=${shiftDateKey(selectedDate, -1)}`,
      nextHref: `/props?date=${shiftDateKey(selectedDate, 1)}`,
      summary: "Live player props pages are unavailable right now.",
      trustChips: [
        { label: "Unavailable", tone: "danger" },
        { label: "Live only", tone: "neutral" },
      ],
      warnings: [
        error instanceof Error
          ? error.message
          : "The live props index could not be built.",
      ],
      players: [],
      emptyState: {
        title: "Props unavailable",
        description:
          "The live props directory could not be loaded for the selected date.",
      },
    };
  }
}
