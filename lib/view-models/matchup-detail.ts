import { notFound } from "next/navigation";
import { getDataProvider } from "@/lib/data/provider-factory";
import { getAvailablePlayerPropPages } from "@/lib/services/player-props";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";

export interface MatchupAnalysisCardViewModel {
  title: string;
  subtitle?: string;
  description: string;
  badge?: {
    label: string;
    tone: PlatformStatusChipViewModel["tone"];
  };
}

export interface MatchupComparisonRowViewModel {
  id: string;
  metric: string;
  homeValue: string;
  awayValue: string;
  edge: string;
}

export interface MatchupRelatedPropViewModel {
  id: string;
  market: string;
  title: string;
  subtitle: string;
  rationale: string;
  line: string;
  matchQuality: string;
  href: string;
}

export interface MatchupDetailViewModel {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  summaryCard: {
    title: string;
    description: string;
    confidenceLabel: string;
    confidenceTone: "high" | "medium" | "low";
    projectedRange: string;
    outlook: string;
  };
  trendCards: MatchupAnalysisCardViewModel[];
  comparisonRows: MatchupComparisonRowViewModel[];
  factorCards: MatchupAnalysisCardViewModel[];
  relatedProps: MatchupRelatedPropViewModel[];
}

function formatNumber(value: number, digits = 1): string {
  return value.toFixed(digits);
}

function formatSigned(value: number, digits = 1): string {
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}` : formatted;
}

function getConfidenceTone(level: "High" | "Medium" | "Low"): "high" | "medium" | "low" {
  return level === "High" ? "high" : level === "Medium" ? "medium" : "low";
}

export async function getMatchupDetailViewModel(
  homeTeamId: string,
  awayTeamId: string,
): Promise<MatchupDetailViewModel> {
  try {
    const dataProvider = getDataProvider();
    const [analysis, games, availableProps] = await Promise.all([
      dataProvider.getMatchupAnalysis(homeTeamId, awayTeamId),
      dataProvider.getGames(),
      getAvailablePlayerPropPages(),
    ]);
    const homeName = `${analysis.matchup.homeTeam.team.city} ${analysis.matchup.homeTeam.team.name}`;
    const awayName = `${analysis.matchup.awayTeam.team.city} ${analysis.matchup.awayTeam.team.name}`;
    const matchupGame = games.find(
      (game) =>
        game.homeTeamId === homeTeamId &&
        game.awayTeamId === awayTeamId &&
        game.status === "upcoming",
    );

    if (!analysis.matchup.homeTeam.team || !analysis.matchup.awayTeam.team) {
      notFound();
    }

    const relatedProps = matchupGame
      ? availableProps.pages
          .filter((page) => page.gameId === matchupGame.id)
          .slice(0, 4)
          .map((page) => ({
            id: page.id,
            market: "Player props",
            title: page.title,
            subtitle: page.subtitle,
            rationale: page.detail,
            line: "Posted market",
            matchQuality: "Verified page",
            href: page.href,
          }))
      : [];

    return {
      header: {
        eyebrow: "Matchup",
        title: `${awayName} at ${homeName}`,
        description: "Team context, market view, and model read in one place.",
      },
      summaryCard: {
        title: analysis.model.summary,
        description: `${analysis.model.winner.abbreviation} is the current model lean in this matchup.`,
        confidenceLabel: analysis.model.confidence.level,
        confidenceTone: getConfidenceTone(analysis.model.confidence.level),
        projectedRange: `${analysis.matchup.homeTeam.team.abbreviation} ${analysis.model.projectedScoreRange.home[0]}-${analysis.model.projectedScoreRange.home[1]} • ${analysis.matchup.awayTeam.team.abbreviation} ${analysis.model.projectedScoreRange.away[0]}-${analysis.model.projectedScoreRange.away[1]}`,
        outlook: `Model score ${analysis.model.confidence.score}/75 • Last ${analysis.model.meta?.lastNGames ?? 5} games`,
      },
      trendCards: [
        {
          title: `${analysis.matchup.homeTeam.team.abbreviation} recent profile`,
          subtitle: "Home side",
          description: `Avg margin ${formatSigned(analysis.matchup.homeTeam.trend.recentFormAverage)} • Trend ${formatSigned(analysis.matchup.homeTeam.trend.trendDelta)} • Consistency ${formatNumber(analysis.matchup.homeTeam.trend.consistencyScore, 2)}`,
          badge: { label: "Team context", tone: "accent" },
        },
        {
          title: `${analysis.matchup.awayTeam.team.abbreviation} recent profile`,
          subtitle: "Away side",
          description: `Avg margin ${formatSigned(analysis.matchup.awayTeam.trend.recentFormAverage)} • Trend ${formatSigned(analysis.matchup.awayTeam.trend.trendDelta)} • Consistency ${formatNumber(analysis.matchup.awayTeam.trend.consistencyScore, 2)}`,
          badge: { label: "Team context", tone: "accent" },
        },
      ],
      comparisonRows: analysis.model.teamComparisons.map((row) => ({
        id: row.key,
        metric: row.label,
        homeValue: formatNumber(row.homeValue),
        awayValue: formatNumber(row.awayValue),
        edge:
          row.winner === "home"
            ? analysis.matchup.homeTeam.team.abbreviation
            : row.winner === "away"
              ? analysis.matchup.awayTeam.team.abbreviation
              : "Even",
      })),
      factorCards: analysis.model.factors.slice(0, 4).map((factor) => ({
        title: factor.label,
        description:
          `${analysis.matchup.homeTeam.team.abbreviation} ${formatNumber(factor.homeValue)} vs ${analysis.matchup.awayTeam.team.abbreviation} ${formatNumber(factor.awayValue)} • Contribution edge ${formatSigned(factor.homeContribution - factor.awayContribution, 1)}`,
        badge: {
          label:
            factor.advantage === "home"
              ? analysis.matchup.homeTeam.team.abbreviation
              : factor.advantage === "away"
                ? analysis.matchup.awayTeam.team.abbreviation
                : "Even",
          tone: factor.advantage === "tie" ? "neutral" : "accent",
        },
      })),
      relatedProps,
    };
  } catch (error) {
    return {
      header: {
        eyebrow: "Matchup",
        title: `${awayTeamId.toUpperCase()} at ${homeTeamId.toUpperCase()}`,
        description: "Live matchup analysis could not be loaded for this game.",
      },
      summaryCard: {
        title: "Analysis unavailable",
        description:
          error instanceof Error
            ? error.message
            : "The live matchup analysis could not be loaded.",
        confidenceLabel: "Low",
        confidenceTone: "low",
        projectedRange: "No projection available",
        outlook: "No verified matchup analysis is available for this game.",
      },
      trendCards: [],
      comparisonRows: [],
      factorCards: [],
      relatedProps: [],
    };
  }
}
