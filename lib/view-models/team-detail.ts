import { getDataProvider } from "@/lib/data/provider-factory";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";
import { type Game, type GameOdds, type Team } from "@/types/nba";

export interface TeamDetailStatCardViewModel {
  eyebrow: string;
  title: string;
  description: string;
}

export interface TeamDetailMarketOverlayViewModel {
  title: string;
  description: string;
  chips: PlatformStatusChipViewModel[];
  items: TeamDetailStatCardViewModel[];
  note: string;
}

export interface TeamDetailTableRowViewModel {
  id: string;
  primary: string;
  secondary: string;
  tertiary: string;
}

export interface TeamDetailViewModel {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  summaryCards: TeamDetailStatCardViewModel[];
  trendCards: TeamDetailStatCardViewModel[];
  marketOverlay: TeamDetailMarketOverlayViewModel;
  recentGames: TeamDetailTableRowViewModel[];
  playerRows: TeamDetailTableRowViewModel[];
}

function formatNumber(value: number, digits = 1): string {
  return value.toFixed(digits);
}

function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
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

function getOpponent(game: Game, team: Team, teams: Team[]): Team | undefined {
  const opponentId = game.homeTeamId === team.id ? game.awayTeamId : game.homeTeamId;
  return teams.find((entry) => entry.id === opponentId);
}

function buildUnavailableOverlay(team: Team): TeamDetailMarketOverlayViewModel {
  return {
    title: "Next market context",
    description: `${team.name} does not have a verified live odds overlay available right now.`,
    chips: [
      { label: "Unavailable", tone: "danger" },
      { label: "Live only", tone: "neutral" },
    ],
    items: [
      { eyebrow: "Spread", title: "Unavailable", description: "No verified spread is available." },
      { eyebrow: "Total", title: "Unavailable", description: "No verified total is available." },
      { eyebrow: "Moneyline", title: "Unavailable", description: "No verified moneyline is available." },
    ],
    note: "This team page stays online without substituting unverified market data.",
  };
}

function buildMarketOverlay({
  game,
  team,
  opponent,
  odds,
}: {
  game: Game | undefined;
  team: Team;
  opponent?: Team;
  odds?: GameOdds;
}): TeamDetailMarketOverlayViewModel {
  if (!game || !opponent || !odds?.fetchMeta) {
    return buildUnavailableOverlay(team);
  }

  const isHome = game.homeTeamId === team.id;
  const spreadLine = isHome ? odds.spread.home : odds.spread.away;
  const moneyline = isHome ? odds.moneyline.home : odds.moneyline.away;

  return {
    title: "Next market context",
    description: `${opponent.name} is next on the schedule. These are the current verified market numbers for that matchup.`,
    chips: [
      { label: "Live", tone: "success" },
      {
        label: `Updated ${formatTimestamp(spreadLine.timestamp ?? odds.fetchMeta.fetchedAt)}`,
        tone: "neutral",
      },
    ],
    items: [
      {
        eyebrow: "Spread",
        title: `${team.abbreviation} ${spreadLine.line > 0 ? "+" : ""}${spreadLine.line}`,
        description: `${spreadLine.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(spreadLine.timestamp)}`,
      },
      {
        eyebrow: "Total",
        title: `${odds.total.over.line}`,
        description: `${odds.total.over.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(odds.total.over.timestamp)}`,
      },
      {
        eyebrow: "Moneyline",
        title: `${team.abbreviation} ${moneyline.line > 0 ? "+" : ""}${moneyline.line}`,
        description: `${moneyline.sportsbook ?? "Sportsbook unavailable"} • ${formatTimestamp(moneyline.timestamp)}`,
      },
    ],
    note:
      odds.fetchMeta.warnings?.[0] ??
      "Market context is informational here and links naturally into the full matchup page.",
  };
}

export async function getTeamDetailViewModel(teamId: string): Promise<TeamDetailViewModel> {
  try {
    const dataProvider = getDataProvider();

    const [detail, teams, games, players] = await Promise.all([
      dataProvider.getTeamDetail(teamId),
      dataProvider.getTeams(),
      dataProvider.getGames(),
      dataProvider.getPlayers(),
    ]);
    const oddsProvider = getOddsProvider();
    let teamOdds: GameOdds | undefined;

    try {
      const gameOdds = await oddsProvider.getGameOdds();
      teamOdds = gameOdds.find(
        (entry) => entry.homeTeamId === teamId || entry.awayTeamId === teamId,
      );
    } catch {
      teamOdds = undefined;
    }

    const nextGame = games
      .filter((game) => game.status === "upcoming")
      .find((game) => game.homeTeamId === teamId || game.awayTeamId === teamId);
    const opponent = nextGame ? getOpponent(nextGame, detail.team, teams) : undefined;

    return {
      header: {
        eyebrow: "Team profile",
        title: `${detail.team.city} ${detail.team.name}`,
        description:
          "Record, recent form, roster context, and the next verified market all live on the same page.",
      },
      summaryCards: [
        {
          eyebrow: "Record",
          title: `${detail.stats.wins}-${detail.stats.losses}`,
          description: `${detail.team.conference} Conference`,
        },
        {
          eyebrow: "Scoring",
          title: `${formatNumber(detail.stats.pointsPerGame)} PPG`,
          description: `${formatNumber(detail.stats.pointsAllowedPerGame)} allowed`,
        },
        {
          eyebrow: "Efficiency",
          title: `${formatNumber(detail.stats.offensiveRating)} ORTG`,
          description: `${formatNumber(detail.stats.defensiveRating)} DRTG`,
        },
        {
          eyebrow: "Pace",
          title: formatNumber(detail.stats.pace),
          description: `${formatPct(detail.trend.homeWinRate)} home win rate`,
        },
      ],
      trendCards: [
        {
          eyebrow: "Recent form",
          title: `${formatNumber(detail.trend.recentFormAverage)} avg margin`,
          description: `Built from the last ${detail.trend.lastNGames} completed games.`,
        },
        {
          eyebrow: "Trend delta",
          title: `${detail.trend.trendDelta > 0 ? "+" : ""}${formatNumber(detail.trend.trendDelta)}`,
          description: "Positive numbers point to an improving recent sample.",
        },
        {
          eyebrow: "Consistency",
          title: formatNumber(detail.trend.consistencyScore, 2),
          description: "Higher scores point to a steadier recent profile.",
        },
        {
          eyebrow: "Home / road",
          title: `${detail.stats.homeWins}-${detail.stats.homeLosses} home • ${detail.stats.awayWins}-${detail.stats.awayLosses} road`,
          description: "Split record across home and road games.",
        },
      ],
      marketOverlay: buildMarketOverlay({
        game: nextGame,
        team: detail.team,
        opponent,
        odds: teamOdds,
      }),
      recentGames: detail.recentGames.map((game) => {
        const opponentTeam = getOpponent(game, detail.team, teams);
        const teamScore = game.homeTeamId === detail.team.id ? game.homeScore : game.awayScore;
        const opponentScore = game.homeTeamId === detail.team.id ? game.awayScore : game.homeScore;
        const margin = (teamScore ?? 0) - (opponentScore ?? 0);

        return {
          id: game.id,
          primary: `${formatDate(game.gameDate)} vs ${opponentTeam?.abbreviation ?? "OPP"}`,
          secondary: `${teamScore ?? "-"}-${opponentScore ?? "-"} • ${margin >= 0 ? "Won" : "Lost"} by ${Math.abs(margin)}`,
          tertiary: game.homeTeamId === detail.team.id ? "Home game" : "Road game",
        };
      }),
      playerRows: players
        .filter((player) => player.teamId === teamId)
        .slice(0, 12)
        .map((player) => ({
          id: `${teamId}:${player.id}`,
          primary: `${player.firstName} ${player.lastName}`,
          secondary: `${player.position} • ${detail.team.abbreviation}`,
          tertiary: "Season production data is not available from the live roster feed.",
        })),
    };
  } catch (error) {
    return {
      header: {
        eyebrow: "Team profile",
        title: teamId.toUpperCase(),
        description: "Live team data is unavailable right now.",
      },
      summaryCards: [
        {
          eyebrow: "Status",
          title: "Unavailable",
          description:
            error instanceof Error
              ? error.message
              : "The live team profile could not be loaded.",
        },
      ],
      trendCards: [],
      marketOverlay: {
        title: "Next market context",
        description: "No verified live market is available for this team.",
        chips: [
          { label: "Unavailable", tone: "danger" },
          { label: "Live only", tone: "neutral" },
        ],
        items: [
          { eyebrow: "Spread", title: "Unavailable", description: "No verified line is available." },
          { eyebrow: "Total", title: "Unavailable", description: "No verified line is available." },
          { eyebrow: "Moneyline", title: "Unavailable", description: "No verified line is available." },
        ],
        note: "The page stayed online without substituting unverified data.",
      },
      recentGames: [],
      playerRows: [],
    };
  }
}
