import { createPropLogger, type PlayerPropLogEntry } from "@/lib/props/observability";
import { getPropStatusFromMatch } from "@/lib/props/matching/offers";
import {
  type MatchupAnalysisResponse,
  type Player,
  type PlayerPropMatchResult,
  type PlayerPropPassReason,
  type PlayerPropStatus,
} from "@/types/nba";

export interface ReadOnlyPlayerPropScore {
  traceId: string;
  status: PlayerPropStatus;
  confidence: "Low" | "Medium";
  projection?: number;
  projectionDelta?: number;
  rationale: string;
  passReason?: PlayerPropPassReason;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getProjectionForMarket({
  player,
  marketType,
  matchup,
}: {
  player: Player;
  marketType: PlayerPropMatchResult["marketType"];
  matchup?: MatchupAnalysisResponse;
}): number | undefined {
  if (
    player.pointsPerGame <= 0 &&
    player.reboundsPerGame <= 0 &&
    player.assistsPerGame <= 0
  ) {
    return undefined;
  }

  const paceAdjustment = matchup ? (matchup.matchup.homeTeam.stats.pace + matchup.matchup.awayTeam.stats.pace - 198) / 6 : 0;

  if (marketType === "player_points") {
    return clamp(player.pointsPerGame + paceAdjustment, 0, 60);
  }

  if (marketType === "player_rebounds") {
    return clamp(player.reboundsPerGame + paceAdjustment * 0.2, 0, 25);
  }

  if (marketType === "player_assists") {
    return clamp(player.assistsPerGame + paceAdjustment * 0.15, 0, 20);
  }

  if (marketType === "player_pra") {
    return clamp(
      player.pointsPerGame + player.reboundsPerGame + player.assistsPerGame + paceAdjustment * 1.2,
      0,
      80,
    );
  }

  return undefined;
}

function buildRationale({
  match,
  projection,
  projectionDelta,
  status,
}: {
  match: PlayerPropMatchResult;
  projection?: number;
  projectionDelta?: number;
  status: PlayerPropStatus;
}): string {
  if (status === "unavailable") {
    return match.reason === "player_unresolved"
      ? "The player label could not be resolved cleanly against the active roster, so this market stays unavailable."
      : match.reason === "stale_data"
        ? "This market is available from the feed, but the timestamp is stale enough that it stays unavailable."
        : "This market could not be matched safely enough to display as a usable prop.";
  }

  if (status === "pass") {
    if (match.reason === "one_sided_offer") {
      return "Only one side of the market was available from the selected offer, so the board keeps it as a Pass.";
    }

    return "The offer matched the player context, but the line quality or freshness is not strong enough to elevate it beyond Pass.";
  }

  if (projection !== undefined && projectionDelta !== undefined) {
    return `Projection ${projection.toFixed(1)} against line ${match.line?.toFixed(1) ?? "N/A"} keeps this market on watch while trust and freshness remain the priority.`;
  }

  return "The player and market matched cleanly, but season production inputs are still limited for this player.";
}

export function scoreReadOnlyPlayerProp({
  match,
  player,
  matchup,
}: {
  match: PlayerPropMatchResult;
  player?: Player;
  matchup?: MatchupAnalysisResponse;
}): { score: ReadOnlyPlayerPropScore; logs: PlayerPropLogEntry[] } {
  const logger = createPropLogger();
  const baseStatus = getPropStatusFromMatch(match);

  if (!player || !match.marketType || match.line === undefined) {
    const score: ReadOnlyPlayerPropScore = {
      traceId: match.traceId,
      status: "unavailable",
      confidence: "Low",
      rationale: "The player or market context was incomplete, so this prop stays unavailable.",
      passReason: "partial_data",
    };

    logger.record({
      event: "prop_score_blocked",
      traceId: match.traceId,
      gameId: match.gameId,
      canonicalPlayerId: match.canonicalPlayerId,
      rawPlayerLabel: match.offer.rawPlayerLabel,
      sportsbook: match.sportsbook,
      marketType: match.marketType,
      line: match.line,
      matchQuality: match.matchQuality,
      freshnessState: match.freshnessState,
      reason: score.passReason,
    });

    return { score, logs: logger.flush() };
  }

  const projection = getProjectionForMarket({
    player,
    marketType: match.marketType,
    matchup,
  });
  const projectionDelta = projection !== undefined ? projection - match.line : undefined;

  let status: PlayerPropStatus = baseStatus;
  let passReason: PlayerPropPassReason | undefined = match.reason;

  if (status === "watch" && (projectionDelta === undefined || Math.abs(projectionDelta) < 0.75)) {
    if (projectionDelta === undefined) {
      const score: ReadOnlyPlayerPropScore = {
        traceId: match.traceId,
        status,
        confidence: "Medium",
        rationale:
          "The offer matched cleanly, but player season production is not available from the live roster feed yet.",
      };

      return { score, logs: logger.flush() };
    }

    status = "pass";
    passReason = "weak_projection_edge";
  }

  const score: ReadOnlyPlayerPropScore = {
    traceId: match.traceId,
    status,
    confidence: status === "watch" ? "Medium" : "Low",
    projection,
    projectionDelta,
    rationale: buildRationale({
      match,
      projection,
      projectionDelta,
      status,
    }),
    passReason,
  };

  if (status !== "watch") {
    logger.record({
      event: "prop_score_blocked",
      traceId: match.traceId,
      gameId: match.gameId,
      canonicalPlayerId: match.canonicalPlayerId,
      rawPlayerLabel: match.offer.rawPlayerLabel,
      sportsbook: match.sportsbook,
      marketType: match.marketType,
      line: match.line,
      matchQuality: match.matchQuality,
      freshnessState: match.freshnessState,
      reason: passReason,
    });
  }

  return { score, logs: logger.flush() };
}
