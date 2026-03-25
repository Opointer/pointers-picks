import { buildConsensusMarkets } from "@/lib/consensus/engine";
import { getDataProvider } from "@/lib/data/provider-factory";
import { buildEdgeResult, buildMoneylineEdgeResult } from "@/lib/edge/engine";
import { resolveGameOddsMatch, resolvePropOddsMatch } from "@/lib/edge/matching";
import { getOddsProvider } from "@/lib/odds/provider-factory";
import { buildPointersPick } from "@/lib/picks/engine";
import { getBettorSignalsProvider } from "@/lib/picks/provider";
import { getGameResearchScore, getPropResearchScore } from "@/lib/picks/research";
import {
  type ConsensusMarket,
  type MatchupAnalysisResponse,
  type Player,
  type PointersPicksPageData,
} from "@/types/nba";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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

function getPropProjection(player: Player | undefined, market: ConsensusMarket): number | undefined {
  if (!player) {
    return undefined;
  }

  if (market.marketType === "player_points") {
    return player.pointsPerGame;
  }

  if (market.marketType === "player_rebounds") {
    return player.reboundsPerGame;
  }

  if (market.marketType === "player_assists") {
    return player.assistsPerGame;
  }

  if (market.marketType === "player_pra") {
    return player.pointsPerGame + player.reboundsPerGame + player.assistsPerGame;
  }

  return undefined;
}

function getPropModelScore({
  projection,
  direction,
  line,
}: {
  projection: number | undefined;
  direction: ConsensusMarket["consensusDirection"];
  line: number;
}): number {
  if (projection === undefined) {
    return 0;
  }

  const diff = projection - line;
  return clamp((direction === "over" ? diff : -diff) * 15, -100, 100);
}

function getPropResearchScoreForMarket(player: Player | undefined, market: ConsensusMarket) {
  const research = getPropResearchScore(player, market);

  return {
    score:
      market.consensusDirection === "under" ? research.score * -1 : research.score,
    limitedInputs: research.limitedInputs,
  };
}

export async function getPointersPicksPageData(): Promise<PointersPicksPageData> {
  const dataProvider = getDataProvider();
  const bettorProvider = getBettorSignalsProvider();
  const oddsProvider = getOddsProvider();

  const [trackedBettors, bettorPicks, players, gameOdds, playerPropOdds] = await Promise.all([
    bettorProvider.getTrackedBettors(),
    bettorProvider.getBettorPicks(),
    dataProvider.getPlayers(),
    oddsProvider.getGameOdds(),
    oddsProvider.getPlayerPropOdds(),
  ]);

  const consensusMarkets = buildConsensusMarkets(bettorPicks, trackedBettors);
  const gameBets = [];
  const playerProps = [];

  for (const market of consensusMarkets) {
    if (market.gameId && market.homeTeamId && market.awayTeamId && !market.playerId) {
      const analysis = await dataProvider.getMatchupAnalysis(market.homeTeamId, market.awayTeamId);
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

      gameBets.push(
        buildPointersPick({
          id: market.id,
          section: "Game Bets",
          market,
          line: market.line,
          modelLean:
            analysis.model.winner.id === analysis.matchup.homeTeam.team.id
              ? `${analysis.matchup.homeTeam.team.abbreviation} lean`
              : `${analysis.matchup.awayTeam.team.abbreviation} lean`,
          bettorConsensusLean: getDisplayLean(market),
          modelScore,
          consensusScore: market.consensusScore,
          researchScore,
          limitedPropInputs: false,
          edge,
          modelProjection,
          currentMarketLine: oddsMatch.line?.line,
          marketTimestamp: oddsMatch.line?.timestamp,
          openLine: oddsMatch.line?.openLine,
          oddsSource: oddsMatch.source?.fetchMeta?.source,
        }),
      );
    } else if (market.playerId) {
      const player = players.find((entry) => entry.id === market.playerId);
      const oddsMatch = resolvePropOddsMatch(market, playerPropOdds);
      const projection = getPropProjection(player, market);
      const propResearch = getPropResearchScoreForMarket(player, market);
      const edge =
        oddsMatch.line && projection !== undefined
          ? buildEdgeResult({
              marketType: market.marketType,
              direction: market.consensusDirection,
              modelEdge: getModelEdgeForLineMarket({
                market,
                projectedValue: projection,
                marketLine: oddsMatch.line.line,
              }),
              consensusScore: market.consensusScore,
              consensusMatchesPick: true,
              currentLine: oddsMatch.line.line,
              openLine: oddsMatch.line.openLine,
              matchResolution: oddsMatch.matchResolution,
            })
          : null;

      playerProps.push(
        buildPointersPick({
          id: market.id,
          section: "Player Props",
          market,
          line: market.line,
          modelLean:
            player
              ? `${player.lastName} ${market.consensusDirection === "over" ? "over" : "under"} lean`
              : "Model not available",
          bettorConsensusLean: getDisplayLean(market),
          modelScore: getPropModelScore({
            projection,
            direction: market.consensusDirection,
            line: market.line,
          }),
          consensusScore: market.consensusScore,
          researchScore: propResearch.score,
          limitedPropInputs: propResearch.limitedInputs,
          edge,
          modelProjection: projection,
          currentMarketLine: oddsMatch.line?.line,
          marketTimestamp: oddsMatch.line?.timestamp,
          openLine: oddsMatch.line?.openLine,
          oddsSource: oddsMatch.source?.fetchMeta?.source,
        }),
      );
    }
  }

  return {
    gameBets: gameBets.sort((left, right) => Math.abs(right.edgeScore ?? 0) - Math.abs(left.edgeScore ?? 0)),
    playerProps: playerProps.sort((left, right) => Math.abs(right.edgeScore ?? 0) - Math.abs(left.edgeScore ?? 0)),
    trackedBettors,
    consensusMarkets,
  };
}
