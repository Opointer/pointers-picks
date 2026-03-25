import { buildConsensusMarkets } from "@/lib/consensus/engine";
import { MockDataProvider } from "@/lib/data/mock/mock-provider";
import { buildEdgeResult, buildMoneylineEdgeResult } from "@/lib/edge/engine";
import { resolveGameOddsMatch } from "@/lib/edge/matching";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import { getBettorSignalsProvider } from "@/lib/picks/provider";
import { buildPointersPick } from "@/lib/picks/engine";
import { getGameResearchScore } from "@/lib/picks/research";
import {
  type BettorPick,
  type ConsensusMarket,
  type GameOdds,
  type MatchupAnalysisResponse,
  type PointersPick,
  type Team,
} from "@/types/nba";

export interface GameBetPickContext {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeAbbreviation: string;
  awayAbbreviation: string;
}

export interface GameBetPicksServiceResult {
  picks: PointersPick[];
  contexts: Record<string, GameBetPickContext>;
  trackedBettorCount: number;
  providerSource: "mock" | "live" | "unavailable";
  fallbackUsed: boolean;
  lastUpdated?: string;
  warnings: string[];
}

interface GameBetOddsMeta {
  providerSource: "mock" | "live" | "unavailable";
  fallbackUsed: boolean;
  lastUpdated?: string;
  warnings: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isGameBetPick(pick: BettorPick): boolean {
  return !pick.playerId && !pick.marketType.startsWith("player_");
}

function getDisplayLean(consensusMarket: ConsensusMarket): string {
  if (consensusMarket.marketType === "spread") {
    return `${consensusMarket.consensusDirection === "home" ? "Home" : "Away"} ${consensusMarket.line > 0 ? "+" : ""}${consensusMarket.line}`;
  }

  if (consensusMarket.marketType === "moneyline") {
    return `${consensusMarket.consensusDirection === "home" ? "Home" : "Away"} ML ${consensusMarket.line > 0 ? "+" : ""}${consensusMarket.line}`;
  }

  return `${consensusMarket.consensusDirection === "over" ? "Over" : "Under"} ${consensusMarket.line}`;
}

function getProjectedGameMetrics(analysis: MatchupAnalysisResponse) {
  const homeMid =
    (analysis.model.projectedScoreRange.home[0] + analysis.model.projectedScoreRange.home[1]) / 2;
  const awayMid =
    (analysis.model.projectedScoreRange.away[0] + analysis.model.projectedScoreRange.away[1]) / 2;

  return {
    homeMid,
    awayMid,
    projectedTotal: homeMid + awayMid,
    projectedHomeMargin: homeMid - awayMid,
  };
}

function getGameSideMargin(
  market: ConsensusMarket,
  metrics: ReturnType<typeof getProjectedGameMetrics>,
): number {
  return market.consensusDirection === "home"
    ? metrics.projectedHomeMargin
    : -metrics.projectedHomeMargin;
}

function getGameModelScore(
  market: ConsensusMarket,
  metrics: ReturnType<typeof getProjectedGameMetrics>,
): number {
  if (market.marketType === "spread" || market.marketType === "moneyline") {
    return clamp(getGameSideMargin(market, metrics) * 12, -100, 100);
  }

  const totalDiff = metrics.projectedTotal - market.line;
  return clamp(
    (market.consensusDirection === "over" ? totalDiff : -totalDiff) * 12,
    -100,
    100,
  );
}

function getGameResearchScoreForMarket(
  analysis: MatchupAnalysisResponse,
  market: ConsensusMarket,
  metrics: ReturnType<typeof getProjectedGameMetrics>,
): number {
  if (market.marketType === "spread" || market.marketType === "moneyline") {
    const base = getGameResearchScore(analysis);
    return market.consensusDirection === "home" ? base : -base;
  }

  const totalSupport = (metrics.projectedTotal - market.line) * 10;
  return clamp(
    market.consensusDirection === "over" ? totalSupport : -totalSupport,
    -100,
    100,
  );
}

function getProjectedValue(
  market: ConsensusMarket,
  metrics: ReturnType<typeof getProjectedGameMetrics>,
): number {
  if (market.marketType === "spread") {
    return market.consensusDirection === "home"
      ? -metrics.projectedHomeMargin
      : metrics.projectedHomeMargin;
  }

  return metrics.projectedTotal;
}

function getModelEdgeForLineMarket({
  market,
  projectedValue,
  marketLine,
}: {
  market: ConsensusMarket;
  projectedValue: number;
  marketLine: number;
}): number {
  if (market.marketType === "spread") {
    return marketLine - projectedValue;
  }

  if (market.consensusDirection === "over") {
    return projectedValue - marketLine;
  }

  return marketLine - projectedValue;
}

function getTeamMap(teams: Team[]): Map<string, Team> {
  return new Map(teams.map((team) => [team.id, team]));
}

function buildContextMap(
  markets: ConsensusMarket[],
  teams: Team[],
): Record<string, GameBetPickContext> {
  const teamMap = getTeamMap(teams);
  const contexts: Record<string, GameBetPickContext> = {};

  for (const market of markets) {
    if (!market.gameId || !market.homeTeamId || !market.awayTeamId || contexts[market.gameId]) {
      continue;
    }

    const homeTeam = teamMap.get(market.homeTeamId);
    const awayTeam = teamMap.get(market.awayTeamId);

    if (!homeTeam || !awayTeam) {
      continue;
    }

    contexts[market.gameId] = {
      gameId: market.gameId,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamName: `${homeTeam.city} ${homeTeam.name}`,
      awayTeamName: `${awayTeam.city} ${awayTeam.name}`,
      homeAbbreviation: homeTeam.abbreviation,
      awayAbbreviation: awayTeam.abbreviation,
    };
  }

  return contexts;
}

function getOddsMeta(gameOdds: GameOdds[]): GameBetOddsMeta {
  if (gameOdds.length === 0) {
    return {
      providerSource: "mock",
      fallbackUsed: true,
      warnings: ["No game-market odds were returned. Markets will render as unavailable."],
    };
  }

  const providerSource = gameOdds.some((entry) => entry.fetchMeta?.source === "live") ? "live" : "mock";
  const fallbackUsed = gameOdds.some((entry) => entry.fetchMeta?.fallbackUsed);
  const timestamps = gameOdds.flatMap((entry) =>
    [
      entry.spread.home.timestamp,
      entry.spread.away.timestamp,
      entry.total.over.timestamp,
      entry.total.under.timestamp,
      entry.moneyline.home.timestamp,
      entry.moneyline.away.timestamp,
      entry.fetchMeta?.fetchedAt,
    ].filter((value): value is string => Boolean(value)),
  );
  const lastUpdated = timestamps
    .slice()
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];
  const warnings = [...new Set(gameOdds.flatMap((entry) => entry.fetchMeta?.warnings ?? []))];

  return {
    providerSource,
    fallbackUsed,
    lastUpdated,
    warnings,
  };
}

function buildFallbackPick(
  market: ConsensusMarket,
  context: GameBetPickContext | undefined,
  message: string,
  providerSource: "mock" | "live" | "unavailable",
  lastUpdated?: string,
): PointersPick {
  return {
    id: market.id,
    marketType: market.marketType,
    section: "Game Bets",
    gameId: market.gameId,
    homeTeamId: market.homeTeamId,
    awayTeamId: market.awayTeamId,
    line: market.line,
    modelLean:
      context && (market.marketType === "spread" || market.marketType === "moneyline")
        ? `${market.consensusDirection === "home" ? context.homeAbbreviation : context.awayAbbreviation} unavailable`
        : "Model unavailable",
    bettorConsensusLean: getDisplayLean(market),
    finalPick: "Pass",
    confidenceLevel: "Low",
    rationale: message,
    modelScore: 0,
    consensusScore: market.consensusScore,
    researchScore: 0,
    combinedScore: 0,
    marketTimestamp: lastUpdated,
    oddsSource: providerSource === "unavailable" ? undefined : providerSource,
    safeguards: {
      minConsensusRuleTriggered: !market.minimumQualityPassed,
      lowConsensusWeightCapped: false,
      conflictSuppressed: false,
      limitedPropInputs: false,
    },
    matchQuality: "none",
  };
}

function getModelLean(
  market: ConsensusMarket,
  context: GameBetPickContext,
  analysis: MatchupAnalysisResponse,
): string {
  if (market.marketType === "total") {
    return `${analysis.model.projectedScoreRange.home[0] + analysis.model.projectedScoreRange.away[0]}-${analysis.model.projectedScoreRange.home[1] + analysis.model.projectedScoreRange.away[1]} total range`;
  }

  return analysis.model.winner.id === analysis.matchup.homeTeam.team.id
    ? `${context.homeAbbreviation} lean`
    : `${context.awayAbbreviation} lean`;
}

export async function getGameBetPicksData(): Promise<GameBetPicksServiceResult> {
  const dataProvider = new MockDataProvider();
  const bettorProvider = getBettorSignalsProvider();

  try {
    const [teams, trackedBettors, bettorPicks] = await Promise.all([
      dataProvider.getTeams(),
      bettorProvider.getTrackedBettors(),
      bettorProvider.getBettorPicks(),
    ]);

    const gameBetConsensusMarkets = buildConsensusMarkets(
      bettorPicks.filter(isGameBetPick),
      trackedBettors,
    ).filter((market) => market.gameId && market.homeTeamId && market.awayTeamId);

    const contexts = buildContextMap(gameBetConsensusMarkets, teams);
    const warnings: string[] = [];

    let gameOdds: GameOdds[] = [];
    let oddsMeta: GameBetOddsMeta = {
      providerSource: "mock",
      fallbackUsed: true,
      warnings: ["Market data is unavailable. Picks will stay conservative."],
    };

    try {
      gameOdds = await getOddsProvider().getGameOdds();
      oddsMeta = getOddsMeta(gameOdds);
      warnings.push(...oddsMeta.warnings);
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Game-market overlay failed. ${error.message}`
          : "Game-market overlay failed. Picks are rendering without market lines.",
      );
      oddsMeta = {
        providerSource: "unavailable",
        fallbackUsed: true,
        warnings: [],
      };
    }

    const picks = await Promise.all(
      gameBetConsensusMarkets.map(async (market) => {
        const context = market.gameId ? contexts[market.gameId] : undefined;

        if (!context) {
          warnings.push(`Missing team context for ${market.id}. This market was forced to Pass.`);
          return buildFallbackPick(
            market,
            undefined,
            "Team context was unavailable for this market, so it stays a Pass.",
            oddsMeta.providerSource,
            oddsMeta.lastUpdated,
          );
        }

        try {
          const analysis = await dataProvider.getMatchupAnalysis(context.homeTeamId, context.awayTeamId);
          const metrics = getProjectedGameMetrics(analysis);
          const oddsMatch = resolveGameOddsMatch(market, gameOdds);
          const modelScore = getGameModelScore(market, metrics);
          const researchScore = getGameResearchScoreForMarket(analysis, market, metrics);
          const modelProjection =
            market.marketType === "moneyline"
              ? getGameSideMargin(market, metrics)
              : getProjectedValue(market, metrics);
          const edge =
            oddsMatch.line && market.marketType !== "moneyline"
              ? buildEdgeResult({
                  marketType: market.marketType,
                  direction: market.consensusDirection,
                  modelEdge: getModelEdgeForLineMarket({
                    market,
                    projectedValue: getProjectedValue(market, metrics),
                    marketLine: oddsMatch.line.line,
                  }),
                  consensusScore: market.consensusScore,
                  consensusMatchesPick: true,
                  currentLine: oddsMatch.line.line,
                  openLine: oddsMatch.line.openLine,
                  matchResolution: oddsMatch.matchResolution,
                })
              : oddsMatch.line && market.marketType === "moneyline"
                ? buildMoneylineEdgeResult({
                    gameModelEdge: getGameSideMargin(market, metrics),
                    consensusScore: market.consensusScore,
                    consensusMatchesPick: true,
                    americanOdds: oddsMatch.line.line,
                    matchResolution: oddsMatch.matchResolution,
                  })
                : null;

          return buildPointersPick({
            id: market.id,
            section: "Game Bets",
            market,
            line: market.line,
            modelLean: getModelLean(market, context, analysis),
            bettorConsensusLean: getDisplayLean(market),
            modelScore,
            consensusScore: market.consensusScore,
            researchScore,
            limitedPropInputs: false,
            edge,
            modelProjection,
            currentMarketLine: oddsMatch.line?.line,
            marketTimestamp: oddsMatch.line?.timestamp ?? oddsMeta.lastUpdated,
            openLine: oddsMatch.line?.openLine,
            oddsSource: oddsMatch.source?.fetchMeta?.source ?? (oddsMeta.providerSource === "unavailable" ? undefined : oddsMeta.providerSource),
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? `Read-only game analysis failed for ${context.awayAbbreviation} at ${context.homeAbbreviation}. ${error.message}`
              : `Read-only game analysis failed for ${context.awayAbbreviation} at ${context.homeAbbreviation}.`;
          warnings.push(message);

          return buildFallbackPick(
            market,
            context,
            `${context.awayTeamName} at ${context.homeTeamName} could not be scored safely, so this market stays a Pass.`,
            oddsMeta.providerSource,
            oddsMeta.lastUpdated,
          );
        }
      }),
    );

    return {
      picks: picks.sort((left, right) => Math.abs(right.edgeScore ?? 0) - Math.abs(left.edgeScore ?? 0)),
      contexts,
      trackedBettorCount: trackedBettors.length,
      providerSource: oddsMeta.providerSource,
      fallbackUsed: oddsMeta.fallbackUsed,
      lastUpdated: oddsMeta.lastUpdated,
      warnings: [...new Set(warnings)],
    };
  } catch (error) {
    return {
      picks: [],
      contexts: {},
      trackedBettorCount: 0,
      providerSource: "unavailable",
      fallbackUsed: true,
      warnings: [
        error instanceof Error
          ? `Game-bet picks are unavailable. ${error.message}`
          : "Game-bet picks are unavailable right now.",
      ],
    };
  }
}
