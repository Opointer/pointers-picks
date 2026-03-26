import { getPlayerPropsData } from "@/lib/services/player-props";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";
import { type PlayerPropStatus } from "@/types/nba";

export interface PlayerPropsMarketCardViewModel {
  id: string;
  marketType: string;
  line: string;
  odds: string;
  source: string;
  freshness: string;
  matchQuality: string;
  confidence: string;
  confidenceTone: "medium" | "low" | "reduced";
  rationale: string;
  passReason?: string;
  status: "watch" | "pass" | "unavailable";
  sportsbook?: string;
  identityQuality: string;
  traceId: string;
  detail: string;
  alternateCount: number;
}

export interface PlayerPropsAvailabilityRowViewModel {
  id: string;
  market: string;
  status: string;
  detail: string;
}

export interface PlayerPropsPageViewModel {
  notFound: boolean;
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  trustChips: PlatformStatusChipViewModel[];
  marketGroups: PlayerPropsMarketCardViewModel[];
  availabilityRows: PlayerPropsAvailabilityRowViewModel[];
  warnings: string[];
  emptyState?: {
    title: string;
    description: string;
  };
}

function formatTimestamp(value: string | undefined): string {
  if (!value) {
    return "No recent refresh";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "No recent refresh";
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

function mapMarketLabel(value: string): string {
  if (value === "player_points") {
    return "Points";
  }

  if (value === "player_rebounds") {
    return "Rebounds";
  }

  if (value === "player_assists") {
    return "Assists";
  }

  return "PRA";
}

function formatOdds(over: number | undefined, under: number | undefined): string {
  if (over !== undefined && under !== undefined) {
    const overLabel = over > 0 ? `+${over}` : `${over}`;
    const underLabel = under > 0 ? `+${under}` : `${under}`;
    return `O ${overLabel} • U ${underLabel}`;
  }

  if (over !== undefined) {
    return `Over ${over > 0 ? `+${over}` : over}`;
  }

  if (under !== undefined) {
    return `Under ${under > 0 ? `+${under}` : under}`;
  }

  return "Odds unavailable";
}

function toStatusLabel(value: PlayerPropStatus) {
  if (value === "qualified" || value === "watch") {
    return "Watch";
  }

  if (value === "pass") {
    return "Pass";
  }

  return "Unavailable";
}

function toDisplayStatus(value: PlayerPropStatus): PlayerPropsMarketCardViewModel["status"] {
  return value === "qualified" ? "watch" : value;
}

function toConfidenceTone(value: PlayerPropStatus): PlayerPropsMarketCardViewModel["confidenceTone"] {
  if (value === "watch" || value === "qualified") {
    return "medium";
  }

  if (value === "pass") {
    return "reduced";
  }

  return "low";
}

function buildUnavailableViewModel(message: string): PlayerPropsPageViewModel {
  return {
    notFound: false,
    header: {
      eyebrow: "Props",
      title: "Props feed unavailable",
      description: "Player markets could not be loaded for this page.",
    },
    trustChips: [
      { label: "Unavailable", tone: "danger" },
      { label: "Feed refresh missing", tone: "warning" },
    ],
    marketGroups: [],
    availabilityRows: [
      {
        id: "service-unavailable",
        market: "Props feed",
        status: "Unavailable",
        detail: message,
      },
    ],
    warnings: [message],
    emptyState: {
      title: "Props board unavailable",
      description: "The live props feed did not return a usable response for this page.",
    },
  };
}

export async function getPlayerPropsPageViewModel({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}): Promise<PlayerPropsPageViewModel> {
  try {
    const result = await getPlayerPropsData({ gameId, playerId });

    if (result.notFound || !result.header) {
      return {
        notFound: true,
        header: {
          eyebrow: "Props",
          title: "Player not found",
          description: "The requested player or game is not on the current slate.",
        },
        trustChips: [],
        marketGroups: [],
        availabilityRows: [],
        warnings: [],
      };
    }

    const liveFeedAvailable = result.marketGroups.length > 0;
    const trustChips: PlatformStatusChipViewModel[] = [
      {
        label: liveFeedAvailable ? "Live feed" : "Unavailable",
        tone: liveFeedAvailable ? "success" : "danger",
      },
      {
        label: result.provider.fetchedAt ? `Updated ${formatTimestamp(result.provider.fetchedAt)}` : "Feed refresh missing",
        tone: result.provider.fetchedAt ? "neutral" : "warning",
      },
      {
        label: result.availabilityLog.length > 0 ? "Partial market coverage" : "Full market coverage",
        tone: result.availabilityLog.length > 0 ? "warning" : "success",
      },
    ];

    const marketGroups = result.marketGroups
      .filter((group) => group.primary)
      .map((group) => {
        const primary = group.primary!;

        return {
          id: primary.traceId,
          marketType: mapMarketLabel(group.marketType),
          line: `${primary.line.toFixed(1)}`,
          odds: formatOdds(primary.odds.over, primary.odds.under),
          source: primary.sportsbook ?? "Sportsbook unavailable",
          freshness:
            primary.freshness === "fresh"
              ? "Fresh"
              : primary.freshness === "aging"
                ? "Aging"
                : primary.freshness === "stale"
                  ? "Stale"
                  : "Unknown",
          matchQuality:
            primary.matchQuality === "high"
              ? "High"
              : primary.matchQuality === "medium"
                ? "Medium"
                : primary.matchQuality === "low"
                  ? "Low"
                  : "Unavailable",
          confidence: primary.status === "watch" || primary.status === "qualified" ? "Medium" : "Low",
          confidenceTone: toConfidenceTone(primary.status),
          rationale: primary.rationale,
          passReason: primary.passReason,
          status: toDisplayStatus(primary.status),
          sportsbook: primary.sportsbook,
          identityQuality:
            primary.identityQuality === "high"
              ? "High"
              : primary.identityQuality === "medium"
                ? "Medium"
                : primary.identityQuality === "low"
                  ? "Low"
                  : "Unavailable",
          traceId: primary.traceId,
          detail:
            primary.projection !== undefined && primary.projectionDelta !== undefined
              ? `Projection ${primary.projection.toFixed(1)} • Delta ${primary.projectionDelta.toFixed(1)}`
              : "Player production data is unavailable from the live roster feed.",
          alternateCount: group.alternates.length,
        };
      });

    const availabilityRows = result.availabilityLog.map((row) => ({
      id: row.id,
      market: row.marketType,
      status: toStatusLabel(row.status),
      detail: row.detail,
    }));

    const hasFeedFailure = result.availabilityLog.some((row) => row.reason === "service_unavailable");
    const hasMatchedGameWarning = result.warnings.some((warning) =>
      warning.includes("No live props event matched this game"),
    );
    const hasOnlyStaleOrPartial =
      result.availabilityLog.length > 0 &&
      result.availabilityLog.every((row) =>
        ["stale_data", "one_sided_offer", "partial_data"].includes(row.reason),
      );
    const hasNoPostedMarkets =
      result.availabilityLog.length > 0 &&
      result.availabilityLog.every((row) => row.reason === "market_not_offered");

    return {
      notFound: false,
      header: {
        eyebrow: "Props",
        title: `${result.header.player.firstName} ${result.header.player.lastName}`,
        description: `${result.header.team.abbreviation} vs ${result.header.opponent.abbreviation} • ${result.header.gameTime}`,
      },
      trustChips,
      marketGroups,
      availabilityRows,
      warnings: result.warnings,
      emptyState:
        marketGroups.length === 0
          ? {
              title: hasFeedFailure
                ? "Props feed unavailable"
                : hasMatchedGameWarning || hasNoPostedMarkets
                  ? "No player markets posted"
                  : hasOnlyStaleOrPartial
                    ? "No usable markets available"
                    : "No verified props available",
              description: hasFeedFailure
                ? "The live props feed failed before a trusted player market page could be built."
                : hasMatchedGameWarning
                  ? "This game does not have a matched props event from the current books."
                  : hasNoPostedMarkets
                    ? "No player markets are posted for this player."
                    : hasOnlyStaleOrPartial
                      ? "Only stale or incomplete offers were returned for this player."
                      : "No market cleared the current match and freshness rules for this player.",
            }
          : undefined,
    };
  } catch (error) {
    return buildUnavailableViewModel(
      error instanceof Error
        ? error.message
        : "The player props page could not load live data.",
    );
  }
}
