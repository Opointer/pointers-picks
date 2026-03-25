import { EDGE_CONFIG } from "@/lib/edge/constants";
import {
  type ConsensusMarket,
  type GameOdds,
  type MarketLine,
  type MatchResolution,
  type PlayerPropOdds,
} from "@/types/nba";

export interface ResolvedOddsMatch<T> {
  line?: MarketLine;
  source?: T;
  matchResolution: MatchResolution;
}

function getExactMarketKey(market: ConsensusMarket): string {
  if (market.marketType === "spread" || market.marketType === "total") {
    return `${market.marketType}:${market.gameId}:${market.consensusDirection}:${market.line}`;
  }

  if (market.marketType === "moneyline") {
    return `${market.marketType}:${market.gameId}:${market.consensusDirection}`;
  }

  return `${market.marketType}:${market.playerId}:${market.consensusDirection}:${market.line}`;
}

function getOddsKey(marketType: string, scopeId: string, direction: string, line?: number): string {
  return line === undefined
    ? `${marketType}:${scopeId}:${direction}`
    : `${marketType}:${scopeId}:${direction}:${line}`;
}

function getRequestedScopeId(market: ConsensusMarket): string | undefined {
  return market.playerId ?? market.gameId;
}

function getTolerance(marketType: ConsensusMarket["marketType"]): number {
  if (marketType === "spread") {
    return EDGE_CONFIG.spreadTolerance;
  }

  if (marketType === "total") {
    return EDGE_CONFIG.totalTolerance;
  }

  if (marketType.startsWith("player_")) {
    return EDGE_CONFIG.propTolerance;
  }

  return 0;
}

function getPenalty(marketType: ConsensusMarket["marketType"], delta: number): number {
  if (marketType === "spread") {
    return delta <= 0.5
      ? EDGE_CONFIG.spreadHalfPointPenalty
      : EDGE_CONFIG.spreadFullPointPenalty;
  }

  if (marketType === "total") {
    return delta <= 0.5 ? EDGE_CONFIG.totalHalfPointPenalty : EDGE_CONFIG.totalFullPointPenalty;
  }

  if (marketType.startsWith("player_")) {
    return EDGE_CONFIG.propHalfPointPenalty;
  }

  return 0;
}

function timestampValue(timestamp?: string): number {
  return timestamp ? Date.parse(timestamp) : 0;
}

export function resolveGameOddsMatch(
  market: ConsensusMarket,
  gameOdds: GameOdds[],
): ResolvedOddsMatch<GameOdds> {
  const scopeId = getRequestedScopeId(market);

  if (!scopeId || !market.gameId) {
    return {
      matchResolution: {
        quality: "none",
        requestedLine: market.line,
      },
    };
  }

  const exactMap = new Map<string, { line: MarketLine; source: GameOdds }>();
  const candidates: Array<{ line: MarketLine; source: GameOdds }> = [];

  for (const odds of gameOdds) {
    if (odds.gameId !== market.gameId) {
      continue;
    }

    exactMap.set(getOddsKey("spread", odds.gameId, "home", odds.spread.home.line), {
      line: odds.spread.home,
      source: odds,
    });
    exactMap.set(getOddsKey("spread", odds.gameId, "away", odds.spread.away.line), {
      line: odds.spread.away,
      source: odds,
    });
    exactMap.set(getOddsKey("total", odds.gameId, "over", odds.total.over.line), {
      line: odds.total.over,
      source: odds,
    });
    exactMap.set(getOddsKey("total", odds.gameId, "under", odds.total.under.line), {
      line: odds.total.under,
      source: odds,
    });
    exactMap.set(getOddsKey("moneyline", odds.gameId, "home"), {
      line: odds.moneyline.home,
      source: odds,
    });
    exactMap.set(getOddsKey("moneyline", odds.gameId, "away"), {
      line: odds.moneyline.away,
      source: odds,
    });

    if (market.marketType === "spread") {
      candidates.push(
        market.consensusDirection === "home"
          ? { line: odds.spread.home, source: odds }
          : { line: odds.spread.away, source: odds },
      );
    } else if (market.marketType === "total") {
      candidates.push(
        market.consensusDirection === "over"
          ? { line: odds.total.over, source: odds }
          : { line: odds.total.under, source: odds },
      );
    }
  }

  const exactMatch = exactMap.get(getExactMarketKey(market));

  if (exactMatch) {
    return {
      line: exactMatch.line,
      source: exactMatch.source,
      matchResolution: {
        quality: "exact",
        requestedLine: market.line,
        matchedLine: exactMatch.line.line,
        delta: 0,
        penaltyApplied: 0,
      },
    };
  }

  if (market.marketType === "moneyline") {
    return {
      matchResolution: {
        quality: "none",
        requestedLine: market.line,
      },
    };
  }

  const tolerance = getTolerance(market.marketType);
  const safeCandidates = candidates
    .map((candidate) => ({
      ...candidate,
      delta: Math.abs(candidate.line.line - market.line),
    }))
    .filter((candidate) => candidate.delta <= tolerance)
    .sort((left, right) => {
      if (left.delta !== right.delta) {
        return left.delta - right.delta;
      }

      return timestampValue(right.line.timestamp) - timestampValue(left.line.timestamp);
    });

  const nearMatch = safeCandidates[0];

  if (!nearMatch) {
    return {
      matchResolution: {
        quality: "none",
        requestedLine: market.line,
      },
    };
  }

  return {
    line: nearMatch.line,
    source: nearMatch.source,
    matchResolution: {
      quality: "near",
      requestedLine: market.line,
      matchedLine: nearMatch.line.line,
      delta: nearMatch.delta,
      penaltyApplied: getPenalty(market.marketType, nearMatch.delta),
    },
  };
}

export function resolvePropOddsMatch(
  market: ConsensusMarket,
  propOdds: PlayerPropOdds[],
): ResolvedOddsMatch<PlayerPropOdds> {
  if (!market.playerId) {
    return {
      matchResolution: {
        quality: "none",
        requestedLine: market.line,
      },
    };
  }

  const exactMap = new Map<string, { line: MarketLine; source: PlayerPropOdds }>();
  const candidates: Array<{ line: MarketLine; source: PlayerPropOdds }> = [];

  for (const prop of propOdds) {
    if (prop.playerId !== market.playerId || prop.marketType !== market.marketType) {
      continue;
    }

    exactMap.set(getOddsKey(prop.marketType, prop.playerId, "over", prop.over.line), {
      line: prop.over,
      source: prop,
    });
    exactMap.set(getOddsKey(prop.marketType, prop.playerId, "under", prop.under.line), {
      line: prop.under,
      source: prop,
    });

    candidates.push(
      market.consensusDirection === "over"
        ? { line: prop.over, source: prop }
        : { line: prop.under, source: prop },
    );
  }

  const exactMatch = exactMap.get(getExactMarketKey(market));

  if (exactMatch) {
    return {
      line: exactMatch.line,
      source: exactMatch.source,
      matchResolution: {
        quality: "exact",
        requestedLine: market.line,
        matchedLine: exactMatch.line.line,
        delta: 0,
        penaltyApplied: 0,
      },
    };
  }

  const safeCandidates = candidates
    .map((candidate) => ({
      ...candidate,
      delta: Math.abs(candidate.line.line - market.line),
    }))
    .filter((candidate) => candidate.delta <= EDGE_CONFIG.propTolerance)
    .sort((left, right) => {
      if (left.delta !== right.delta) {
        return left.delta - right.delta;
      }

      return timestampValue(right.line.timestamp) - timestampValue(left.line.timestamp);
    });

  const nearMatch = safeCandidates[0];

  if (!nearMatch) {
    return {
      matchResolution: {
        quality: "none",
        requestedLine: market.line,
      },
    };
  }

  return {
    line: nearMatch.line,
    source: nearMatch.source,
    matchResolution: {
      quality: "near",
      requestedLine: market.line,
      matchedLine: nearMatch.line.line,
      delta: nearMatch.delta,
      penaltyApplied: getPenalty(market.marketType, nearMatch.delta),
    },
  };
}
