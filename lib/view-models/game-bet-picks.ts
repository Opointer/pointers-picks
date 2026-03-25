import { platformStatus } from "@/lib/ui/mock-content";
import { getGameBetPicksData } from "@/lib/services/game-bet-picks";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";
import { type PickClassification, type PointersPick } from "@/types/nba";

export interface GameBetPickCardViewModel {
  id: string;
  title: string;
  subtitle: string;
  market: string;
  line: string;
  source: string;
  freshness: string;
  fallback: string;
  matchQuality: string;
  confidence: string;
  confidenceTone: "high" | "medium" | "low" | "capped";
  classification: PickClassification;
  rationale: string;
  href: string;
  modelLean: string;
  bettorConsensusLean: string;
  edgeSummary: string;
  marketStatus: string;
}

export interface GameBetPicksPageViewModel {
  summaryCards: Array<{
    eyebrow: string;
    title: string;
    description: string;
  }>;
  systemState: {
    title: string;
    description: string;
    chips: PlatformStatusChipViewModel[];
    warnings: string[];
  };
  gameBets: {
    active: GameBetPickCardViewModel[];
    passed: GameBetPickCardViewModel[];
  };
  propsPlaceholder: {
    title: string;
    description: string;
    chips: PlatformStatusChipViewModel[];
  };
}

function formatTimestamp(value: string | undefined): string {
  if (!value) {
    return "Timestamp unavailable";
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

function toMarketLabel(value: PointersPick["marketType"]): string {
  if (value === "spread") {
    return "Spread";
  }

  if (value === "total") {
    return "Total";
  }

  return "Moneyline";
}

function toClassificationTone(value: PointersPick["confidenceLevel"]): GameBetPickCardViewModel["confidenceTone"] {
  return value === "High" ? "high" : value === "Medium" ? "medium" : "low";
}

function toSideLabel(pick: PointersPick): "home" | "away" | "over" | "under" {
  if (pick.marketType === "total") {
    return pick.bettorConsensusLean.startsWith("Over") ? "over" : "under";
  }

  return pick.bettorConsensusLean.startsWith("Home") ? "home" : "away";
}

function formatSignedLine(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function buildTitle({
  pick,
  homeTeamName,
  awayTeamName,
}: {
  pick: PointersPick;
  homeTeamName: string;
  awayTeamName: string;
}): string {
  const side = toSideLabel(pick);

  if (pick.marketType === "spread") {
    return `${side === "home" ? homeTeamName : awayTeamName} spread`;
  }

  if (pick.marketType === "moneyline") {
    return `${side === "home" ? homeTeamName : awayTeamName} moneyline`;
  }

  return `${awayTeamName} at ${homeTeamName} total`;
}

function buildLineLabel({
  pick,
  homeAbbreviation,
  awayAbbreviation,
}: {
  pick: PointersPick;
  homeAbbreviation: string;
  awayAbbreviation: string;
}): string {
  const currentLine = pick.currentMarketLine ?? pick.line;
  const side = toSideLabel(pick);

  if (pick.marketType === "spread") {
    return `${side === "home" ? homeAbbreviation : awayAbbreviation} ${formatSignedLine(currentLine)}`;
  }

  if (pick.marketType === "moneyline") {
    return `${side === "home" ? homeAbbreviation : awayAbbreviation} ${formatSignedLine(currentLine)}`;
  }

  return `${side === "over" ? "Over" : "Under"} ${currentLine}`;
}

function buildEdgeSummary(pick: PointersPick): string {
  if (pick.marketType === "moneyline") {
    if (pick.expectedValue === undefined || pick.moneylineEdge === undefined) {
      return "Moneyline value unavailable";
    }

    return `EV ${pick.expectedValue.toFixed(3)} • Probability edge ${(pick.moneylineEdge * 100).toFixed(1)} pts`;
  }

  if (pick.edgeScore === undefined || pick.edgeTier === undefined) {
    return "Market edge unavailable";
  }

  return `Edge ${pick.edgeScore.toFixed(0)} • ${pick.edgeTier}`;
}

function buildMarketStatus(pick: PointersPick): string {
  if (pick.finalPick === "Pass") {
    return "No qualified play";
  }

  if (pick.matchQuality === "near") {
    return "Qualified with reduced confidence";
  }

  return "Qualified game bet";
}

function getProviderChip(source: "mock" | "live" | "unavailable"): PlatformStatusChipViewModel {
  if (source === "live") {
    return { label: "Live", tone: "success" };
  }

  if (source === "mock") {
    return { label: "Mock", tone: "accent" };
  }

  return { label: "Unavailable", tone: "danger" };
}

function mapPickToCardViewModel({
  pick,
  context,
  fallbackUsed,
}: {
  pick: PointersPick;
  context: {
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName: string;
    awayTeamName: string;
    homeAbbreviation: string;
    awayAbbreviation: string;
  };
  fallbackUsed: boolean;
}): GameBetPickCardViewModel {
  return {
    id: pick.id,
    title: buildTitle({
      pick,
      homeTeamName: context.homeTeamName,
      awayTeamName: context.awayTeamName,
    }),
    subtitle: `${context.awayTeamName} at ${context.homeTeamName}`,
    market: toMarketLabel(pick.marketType),
    line: buildLineLabel({
      pick,
      homeAbbreviation: context.homeAbbreviation,
      awayAbbreviation: context.awayAbbreviation,
    }),
    source:
      pick.oddsSource === "live" ? "Live odds" : pick.oddsSource === "mock" ? "Mock odds" : "Market unavailable",
    freshness: pick.marketTimestamp ? `Updated ${formatTimestamp(pick.marketTimestamp)}` : "Timestamp unavailable",
    fallback: fallbackUsed ? "Fallback in use" : "Primary feed",
    matchQuality:
      pick.matchQuality === "exact"
        ? "Exact match"
        : pick.matchQuality === "near"
          ? "Near match"
          : "No match",
    confidence: pick.confidenceLevel,
    confidenceTone:
      pick.marketType === "moneyline" && pick.confidenceLevel !== "Low"
        ? "capped"
        : toClassificationTone(pick.confidenceLevel),
    classification: pick.finalPick,
    rationale: pick.rationale,
    href: `/matchup/${context.homeTeamId}/${context.awayTeamId}`,
    modelLean: pick.modelLean,
    bettorConsensusLean: pick.bettorConsensusLean,
    edgeSummary: buildEdgeSummary(pick),
    marketStatus: buildMarketStatus(pick),
  };
}

function buildFallbackViewModel(message: string): GameBetPicksPageViewModel {
  return {
    summaryCards: [
      {
        eyebrow: "Qualified game bets",
        title: "0",
        description: "No game-bet recommendations are available while the scoring path is offline.",
      },
      {
        eyebrow: "Passed markets",
        title: "0",
        description: "The page stays rendered even when no safe picks can be produced.",
      },
      {
        eyebrow: "Tracked bettors",
        title: "0",
        description: "Consensus inputs are currently unavailable.",
      },
      {
        eyebrow: "Feed state",
        title: "Unavailable",
        description: "The picks board is falling back to a safe UI state.",
      },
    ],
    systemState: {
      title: "Game-bet path unavailable",
      description: "The page is still rendering safely, but the current game-bet board could not be built from the available feeds.",
      chips: [
        { label: "Unavailable", tone: "danger" },
        { label: platformStatus.freshness, tone: "neutral" },
        { label: "Mock fallback", tone: "warning" },
      ],
      warnings: [message, ...platformStatus.warnings],
    },
    gameBets: {
      active: [],
      passed: [],
    },
    propsPlaceholder: {
      title: "Player props stay isolated",
      description: "Player props live on their own pages until prop trust states are ready for the main board.",
      chips: [
        { label: "Isolated", tone: "warning" },
        { label: "No live props", tone: "neutral" },
      ],
    },
  };
}

export async function getGameBetPicksPageViewModel(): Promise<GameBetPicksPageViewModel> {
  try {
    const result = await getGameBetPicksData();
    const mapped = result.picks
      .map((pick) => {
        if (!pick.gameId) {
          return null;
        }

        const context = result.contexts[pick.gameId];

        if (!context) {
          return null;
        }

        return mapPickToCardViewModel({
          pick,
          context,
          fallbackUsed: result.fallbackUsed,
        });
      })
      .filter((pick): pick is GameBetPickCardViewModel => Boolean(pick));

    const active = mapped.filter((pick) => pick.classification !== "Pass");
    const passed = mapped.filter((pick) => pick.classification === "Pass");
    const providerChip = getProviderChip(result.providerSource);
    const freshnessChip: PlatformStatusChipViewModel = {
      label: result.lastUpdated ? `Updated ${formatTimestamp(result.lastUpdated)}` : "Data delayed",
      tone: result.lastUpdated ? "neutral" : "warning",
    };
    const fallbackChip: PlatformStatusChipViewModel = {
      label:
        result.providerSource === "unavailable"
          ? "Status unavailable"
          : result.fallbackUsed
            ? "Fallback in use"
            : "Primary feed",
      tone:
        result.providerSource === "unavailable"
          ? "danger"
          : result.fallbackUsed
            ? "warning"
            : "success",
    };

    return {
      summaryCards: [
        {
          eyebrow: "Qualified game bets",
          title: `${active.length}`,
          description:
            active.length > 0
              ? "These markets cleared the current game-bet rules and still show live or mock market context."
              : "No game bets qualified. The board is staying selective instead of forcing action.",
        },
        {
          eyebrow: "Passed markets",
          title: `${passed.length}`,
          description: "Passed markets stay visible below so the page explains why they were filtered out.",
        },
        {
          eyebrow: "Tracked bettors",
          title: `${result.trackedBettorCount}`,
          description: "Consensus context comes from the tracked bettor set already attached to the app.",
        },
        {
          eyebrow: "Feed state",
          title: providerChip.label,
          description:
            result.lastUpdated
              ? `Market overlay ${result.fallbackUsed ? "is using fallback data" : "is current"} as of ${formatTimestamp(result.lastUpdated)}.`
              : "Market overlay is delayed or unavailable, so picks stay conservative.",
        },
      ],
      systemState: {
        title: "Game-bet trust state",
        description:
          "Odds source, freshness, fallback status, and pass reasons stay visible on every game market.",
        chips: [providerChip, freshnessChip, fallbackChip],
        warnings:
          result.warnings.length > 0
            ? result.warnings
            : ["No active service warnings. The game-bet board is stable right now."],
      },
      gameBets: {
        active,
        passed,
      },
      propsPlaceholder: {
        title: "Player props stay isolated",
        description:
          "Player props stay off this board until their matching and trust states are fully stable.",
        chips: [
          { label: "Isolated", tone: "warning" },
          { label: "No props rendered", tone: "neutral" },
        ],
      },
    };
  } catch (error) {
    return buildFallbackViewModel(
      error instanceof Error
        ? error.message
        : "The game-bet board could not be built. Showing a safe fallback state.",
    );
  }
}
