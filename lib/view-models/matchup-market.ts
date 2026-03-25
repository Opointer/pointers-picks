import { notFound } from "next/navigation";
import { getDataProvider } from "@/lib/data/provider-factory";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";
import { type GameOdds, type Team } from "@/types/nba";

export interface MatchupMarketItemViewModel {
  label: string;
  value: string;
  detail: string;
}

export interface MatchupMarketViewModel {
  sectionTitle: string;
  sectionDescription: string;
  chips: PlatformStatusChipViewModel[];
  items: MatchupMarketItemViewModel[];
  note: string;
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

function buildFallbackItems(homeTeam: Team): MatchupMarketItemViewModel[] {
  return [
    { label: "Spread", value: "Unavailable", detail: `No verified ${homeTeam.abbreviation} spread is available.` },
    { label: "Total", value: "Unavailable", detail: "No verified total is available." },
    { label: "Moneyline", value: "Unavailable", detail: `No verified ${homeTeam.abbreviation} moneyline is available.` },
  ];
}

function buildItems(gameOdds: GameOdds | undefined, homeTeam: Team): MatchupMarketItemViewModel[] {
  if (!gameOdds) {
    return buildFallbackItems(homeTeam);
  }

  return [
    {
      label: "Spread",
      value: `${homeTeam.abbreviation} ${gameOdds.spread.home.line > 0 ? "+" : ""}${gameOdds.spread.home.line}`,
      detail: `${gameOdds.spread.home.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(gameOdds.spread.home.timestamp)}`,
    },
    {
      label: "Total",
      value: `${gameOdds.total.over.line}`,
      detail: `${gameOdds.total.over.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(gameOdds.total.over.timestamp)}`,
    },
    {
      label: "Moneyline",
      value: `${homeTeam.abbreviation} ${gameOdds.moneyline.home.line > 0 ? "+" : ""}${gameOdds.moneyline.home.line}`,
      detail: `${gameOdds.moneyline.home.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(gameOdds.moneyline.home.timestamp)}`,
    },
  ];
}

export async function getMatchupMarketViewModel(
  homeTeamId: string,
  awayTeamId: string,
): Promise<MatchupMarketViewModel> {
  const dataProvider = getDataProvider();
  const [games, teams] = await Promise.all([dataProvider.getGames(), dataProvider.getTeams()]);
  const game = games.find(
    (entry) =>
      entry.homeTeamId === homeTeamId &&
      entry.awayTeamId === awayTeamId &&
      entry.status === "upcoming",
  );
  const homeTeam = teams.find((team) => team.id === homeTeamId);

  if (!homeTeam) {
    notFound();
  }

  if (!game) {
    return {
      sectionTitle: "Market context",
      sectionDescription: "This matchup does not have an upcoming game on the live schedule.",
      chips: [
        { label: "Unavailable", tone: "danger" },
        { label: "Live only", tone: "neutral" },
      ],
      items: buildFallbackItems(homeTeam),
      note: "Matchup context is available, but no upcoming live market exists for this team pairing.",
    };
  }

  try {
    const oddsProvider = getOddsProvider();
    const gameOdds = (await oddsProvider.getGameOdds()).find((entry) => entry.gameId === game.id);

    if (!gameOdds?.fetchMeta) {
      return {
        sectionTitle: "Market context",
        sectionDescription: "The matchup is on the schedule, but live odds are unavailable right now.",
        chips: [
          { label: "Unavailable", tone: "danger" },
          { label: "Live only", tone: "neutral" },
        ],
        items: buildFallbackItems(homeTeam),
      note: "The page stays online without substituting unverified market lines.",
      };
    }

    return {
      sectionTitle: "Market context",
      sectionDescription:
        "Spread, total, and moneyline stay visible here without overwhelming the rest of the matchup page.",
      chips: [
        { label: "Live", tone: "success" },
        {
          label: `Updated ${formatTimestamp(gameOdds.spread.home.timestamp ?? gameOdds.fetchMeta.fetchedAt)}`,
          tone: "neutral",
        },
      ],
      items: buildItems(gameOdds, homeTeam),
      note: gameOdds.fetchMeta.warnings?.[0] ?? "These are the current verified lines for the scheduled game.",
    };
  } catch (error) {
    return {
      sectionTitle: "Market context",
      sectionDescription: "Live odds are unavailable right now.",
      chips: [
        { label: "Unavailable", tone: "danger" },
        { label: "Live only", tone: "neutral" },
      ],
      items: buildFallbackItems(homeTeam),
      note:
        error instanceof Error
          ? error.message
          : "The live market overlay could not be loaded for this matchup.",
    };
  }
}
