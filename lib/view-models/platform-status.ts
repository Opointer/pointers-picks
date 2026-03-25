import { getDataProvider } from "@/lib/data/provider-factory";
import { getMarketHealthSummary } from "@/lib/selectors/system-status";

export interface PlatformStatusChipViewModel {
  label: string;
  tone: "neutral" | "accent" | "success" | "warning" | "danger";
}

export interface PlatformStatusViewModel {
  headline: string;
  summary: string;
  providerChip: PlatformStatusChipViewModel;
  freshnessChip: PlatformStatusChipViewModel;
  fallbackChip: PlatformStatusChipViewModel;
  warnings: string[];
  lastUpdatedLabel: string;
  detailCards: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
}

function formatTimestamp(value: string | undefined): string {
  if (!value) {
    return "No recent refresh";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Timestamp unavailable";
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

function buildUnavailableViewModel(message: string): PlatformStatusViewModel {
  return {
    headline: "Data unavailable",
    summary: "Live provider status is unavailable right now.",
    providerChip: { label: "Unavailable", tone: "danger" },
    freshnessChip: { label: "No recent refresh", tone: "warning" },
    fallbackChip: { label: "Live only", tone: "neutral" },
    warnings: [message],
    lastUpdatedLabel: "No successful refresh is available right now.",
    detailCards: [
      {
        label: "Domain data",
        value: "Unavailable",
        detail: "The live NBA data source did not return a usable response.",
      },
      {
        label: "Game odds",
        value: "Unavailable",
        detail: "No real-time odds overlay is available right now.",
      },
      {
        label: "Props feed",
        value: "Unavailable",
        detail: "The player props feed is not returning a trusted payload.",
      },
      {
        label: "Warnings",
        value: "1",
        detail: "The product stays online without substituting backup fixtures.",
      },
    ],
  };
}

export async function getPlatformStatusViewModel(): Promise<PlatformStatusViewModel> {
  try {
    const dataProvider = getDataProvider();
    const [teams, games, summary] = await Promise.all([
      dataProvider.getTeams(),
      dataProvider.getGames(),
      getMarketHealthSummary(),
    ]);
    const hasDomainCoverage = teams.length > 0 && games.length > 0;
    const hasGameOdds = summary.gameOddsCount > 0;
    const hasProps = summary.propMarketsCount > 0;
    const isDelayed = summary.warningCount > 0 || !summary.lastUpdated;

    return {
      headline: hasDomainCoverage ? (isDelayed ? "Live feeds delayed" : "Live feeds healthy") : "Domain data unavailable",
      summary: hasDomainCoverage
        ? `${summary.upcomingGames} upcoming games tracked • ${formatTimestamp(summary.lastUpdated)}`
        : "The live NBA schedule and team feed is unavailable.",
      providerChip: {
        label: hasDomainCoverage ? "Live" : "Unavailable",
        tone: hasDomainCoverage ? "success" : "danger",
      },
      freshnessChip: {
        label: summary.lastUpdated ? `Updated ${formatTimestamp(summary.lastUpdated)}` : "Data delayed",
        tone: summary.lastUpdated ? "neutral" : "warning",
      },
      fallbackChip: {
        label:
          hasGameOdds && hasProps
            ? "Full coverage"
            : hasGameOdds || hasProps
              ? "Partial coverage"
              : "Unavailable",
        tone:
          hasGameOdds && hasProps
            ? "success"
            : hasGameOdds || hasProps
              ? "warning"
              : "danger",
      },
      warnings:
        summary.warnings.length > 0
          ? summary.warnings
          : ["No active feed warnings."],
      lastUpdatedLabel: summary.lastUpdated
        ? `Last successful refresh ${formatTimestamp(summary.lastUpdated)}`
        : "No recent successful refresh is available.",
      detailCards: [
        {
          label: "Teams",
          value: `${teams.length}`,
          detail: hasDomainCoverage
            ? "Live team identities are available."
            : "The live NBA teams feed is unavailable.",
        },
        {
          label: "Upcoming games",
          value: `${summary.upcomingGames}`,
          detail: hasGameOdds
            ? `${summary.gameOddsCount} games currently have odds overlays.`
            : "Schedule data is live, but odds overlays are unavailable.",
        },
        {
          label: "Props markets",
          value: `${summary.propMarketsCount}`,
          detail: hasProps
            ? `${summary.playersWithProps} players currently have tracked props.`
            : "Player props are unavailable or unmatched for the current slate.",
        },
        {
          label: "Warnings",
          value: `${summary.warningCount}`,
          detail:
            summary.warningCount > 0
              ? "Warnings stay explicit instead of being hidden behind softer fallback messaging."
              : "No feed warnings are affecting the active product.",
        },
      ],
    };
  } catch (error) {
    return buildUnavailableViewModel(
      error instanceof Error
        ? error.message
        : "The system status view could not load live provider health.",
    );
  }
}
