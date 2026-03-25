import { CONSENSUS_RULES } from "@/lib/consensus/constants";
import { groupPicksByMarket } from "@/lib/consensus/markets";
import { getBettorWeight } from "@/lib/bettors/scorer";
import {
  type BettorPick,
  type ConsensusMarket,
  type PickDirection,
  type TrackedBettor,
} from "@/types/nba";

function directionValue(direction: PickDirection): number {
  return direction === "home" || direction === "over" ? 1 : -1;
}

export function buildConsensusMarkets(
  bettorPicks: BettorPick[],
  trackedBettors: TrackedBettor[],
): ConsensusMarket[] {
  const grouped = groupPicksByMarket(bettorPicks);

  return [...grouped.entries()].map(([id, picks]) => {
    const uniqueBettors = new Set(picks.map((pick) => pick.bettorId));

    let weightedSum = 0;
    let totalConsensusWeight = 0;

    for (const pick of picks) {
      const bettor = trackedBettors.find((entry) => entry.id === pick.bettorId);
      if (!bettor) {
        continue;
      }

      const weight = getBettorWeight(bettor, pick.marketType);
      weightedSum += weight * directionValue(pick.direction);
      totalConsensusWeight += weight;
    }

    const consensusScore =
      totalConsensusWeight > 0 ? (weightedSum / totalConsensusWeight) * 100 : 0;
    const consensusDirection: PickDirection =
      consensusScore >= 0
        ? picks[0].marketType.startsWith("player_") || picks[0].marketType === "total"
          ? "over"
          : "home"
        : picks[0].marketType.startsWith("player_") || picks[0].marketType === "total"
          ? "under"
          : "away";

    return {
      id,
      marketType: picks[0].marketType,
      gameId: picks[0].gameId,
      homeTeamId: picks[0].homeTeamId,
      awayTeamId: picks[0].awayTeamId,
      playerId: picks[0].playerId,
      line: picks[0].line,
      picks,
      consensusDirection,
      consensusScore,
      supportingBettors: uniqueBettors.size,
      totalConsensusWeight,
      minimumQualityPassed:
        uniqueBettors.size >= CONSENSUS_RULES.minimumSupportingBettors,
    };
  });
}
