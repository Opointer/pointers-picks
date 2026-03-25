import { getDataProvider } from "@/lib/data/provider-factory";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import {
  formatCentralDateLabel,
  sanitizeDateKey,
  shiftDateKey,
  toCentralDateKey,
} from "@/lib/view-models/date-controls";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";
import { type GameOdds, type Team } from "@/types/nba";

export interface GameMarketRowViewModel {
  label: string;
  value: string;
  detail: string;
}

export interface GamesPageCardViewModel {
  id: string;
  title: string;
  time: string;
  description: string;
  href: string;
  statusChip: PlatformStatusChipViewModel;
  statusSummary: string;
  markets: GameMarketRowViewModel[];
}

export interface GamesPageViewModel {
  selectedDate: string;
  selectedDateLabel: string;
  todayHref: string;
  previousHref: string;
  nextHref: string;
  slateSummary: string;
  sectionTitle: string;
  sectionDescription: string;
  cards: GamesPageCardViewModel[];
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

function formatTimestamp(value: string | undefined): string {
  if (!value) {
    return "No timestamp";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "No timestamp";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  }).format(date);
}

function getStatusChip(gameOdds: GameOdds | undefined): PlatformStatusChipViewModel {
  if (!gameOdds?.fetchMeta) {
    return { label: "Unavailable", tone: "danger" };
  }

  if (gameOdds.fetchMeta.warnings?.length) {
    return { label: "Delayed", tone: "warning" };
  }

  return { label: "Live", tone: "success" };
}

function getStatusSummary(gameOdds: GameOdds | undefined): string {
  if (!gameOdds?.fetchMeta) {
    return "Live market odds are unavailable for this game.";
  }

  const lineTimestamp = gameOdds.spread.home.timestamp ?? gameOdds.fetchMeta.fetchedAt;
  return `Updated ${formatTimestamp(lineTimestamp)}`;
}

function formatSpread(gameOdds: GameOdds | undefined, homeTeam: Team): GameMarketRowViewModel {
  if (!gameOdds) {
    return {
      label: "Spread",
      value: "Unavailable",
      detail: "No verified line is available for this matchup.",
    };
  }

  return {
    label: "Spread",
    value: `${homeTeam.abbreviation} ${gameOdds.spread.home.line > 0 ? "+" : ""}${gameOdds.spread.home.line}`,
    detail: `${gameOdds.spread.home.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(gameOdds.spread.home.timestamp)}`,
  };
}

function formatTotal(gameOdds: GameOdds | undefined): GameMarketRowViewModel {
  if (!gameOdds) {
    return {
      label: "Total",
      value: "Unavailable",
      detail: "No verified total is available for this matchup.",
    };
  }

  return {
    label: "Total",
    value: `${gameOdds.total.over.line}`,
    detail: `${gameOdds.total.over.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(gameOdds.total.over.timestamp)}`,
  };
}

function formatMoneyline(gameOdds: GameOdds | undefined, homeTeam: Team): GameMarketRowViewModel {
  if (!gameOdds) {
    return {
      label: "Moneyline",
      value: "Unavailable",
      detail: "No verified moneyline is available for this matchup.",
    };
  }

  return {
    label: "Moneyline",
    value: `${homeTeam.abbreviation} ${gameOdds.moneyline.home.line > 0 ? "+" : ""}${gameOdds.moneyline.home.line}`,
    detail: `${gameOdds.moneyline.home.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(gameOdds.moneyline.home.timestamp)}`,
  };
}

function buildCardDescription({
  gameOdds,
  awayTeam,
  homeTeam,
}: {
  gameOdds?: GameOdds;
  awayTeam: Team;
  homeTeam: Team;
}): string {
  if (!gameOdds?.fetchMeta) {
    return `${awayTeam.abbreviation} at ${homeTeam.abbreviation} is on the slate, but live market data is unavailable right now.`;
  }

  return `${awayTeam.abbreviation} at ${homeTeam.abbreviation} with live spread, total, and moneyline context in one card.`;
}

export async function getGamesPageViewModel(selectedDateParam?: string): Promise<GamesPageViewModel> {
  const dataProvider = getDataProvider();
  const selectedDate = sanitizeDateKey(selectedDateParam) ?? toCentralDateKey(new Date());

  try {
    const oddsProvider = getOddsProvider();
    const [games, teams, gameOdds] = await Promise.all([
      dataProvider.getGames(),
      dataProvider.getTeams(),
      oddsProvider.getGameOdds(),
    ]);
    const upcomingGames = games
      .filter((game) => game.status === "upcoming")
      .filter((game) => toCentralDateKey(game.gameDate) === selectedDate)
      .sort((left, right) => left.gameDate.localeCompare(right.gameDate));
    const oddsByGameId = new Map(gameOdds.map((entry) => [entry.gameId, entry]));
    const cards = upcomingGames
      .map((game) => {
        const homeTeam = teams.find((team) => team.id === game.homeTeamId);
        const awayTeam = teams.find((team) => team.id === game.awayTeamId);

        if (!homeTeam || !awayTeam) {
          return null;
        }

        const overlay = oddsByGameId.get(game.id);

        return {
          id: game.id,
          title: `${awayTeam.name} at ${homeTeam.name}`,
          time: formatGameTime(game.gameDate),
          description: buildCardDescription({
            gameOdds: overlay,
            awayTeam,
            homeTeam,
          }),
          href: `/matchup/${homeTeam.id}/${awayTeam.id}`,
          statusChip: getStatusChip(overlay),
          statusSummary: getStatusSummary(overlay),
          markets: [
            formatSpread(overlay, homeTeam),
            formatTotal(overlay),
            formatMoneyline(overlay, homeTeam),
          ],
        } satisfies GamesPageCardViewModel;
      })
      .filter((entry): entry is GamesPageCardViewModel => Boolean(entry));

    return {
      selectedDate,
      selectedDateLabel: formatCentralDateLabel(selectedDate),
      todayHref: `/games?date=${toCentralDateKey(new Date())}`,
      previousHref: `/games?date=${shiftDateKey(selectedDate, -1)}`,
      nextHref: `/games?date=${shiftDateKey(selectedDate, 1)}`,
      slateSummary:
        cards.length > 0
          ? `${cards.length} game${cards.length > 1 ? "s" : ""} scheduled for ${formatCentralDateLabel(selectedDate)}.`
          : `No NBA games are scheduled for ${formatCentralDateLabel(selectedDate)}.`,
      sectionTitle: cards.length > 0 ? "Daily slate" : "No games scheduled",
      sectionDescription:
        "Browse the board by date. Each card keeps tip time, live market context, and route access in one place.",
      cards,
      emptyState:
        cards.length === 0
          ? {
              title: "No games scheduled",
              description:
                "The selected date does not have any NBA games on the live schedule.",
            }
          : undefined,
    };
  } catch (error) {
    return {
      selectedDate,
      selectedDateLabel: formatCentralDateLabel(selectedDate),
      todayHref: `/games?date=${toCentralDateKey(new Date())}`,
      previousHref: `/games?date=${shiftDateKey(selectedDate, -1)}`,
      nextHref: `/games?date=${shiftDateKey(selectedDate, 1)}`,
      slateSummary: "Live slate data is unavailable right now.",
      sectionTitle: "Slate unavailable",
      sectionDescription:
        "The live schedule could not be loaded for this date.",
      cards: [],
      emptyState: {
        title: "Slate unavailable",
        description:
          error instanceof Error
            ? error.message
            : "The live schedule provider failed while loading this date.",
      },
    };
  }
}
