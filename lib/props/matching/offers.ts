import { createPropLogger, type PlayerPropLogEntry } from "@/lib/props/observability";
import {
  type PlayerPropFreshnessState,
  type PlayerPropMatchResult,
  type PlayerPropOffer,
  type PlayerPropPassReason,
  type PlayerPropStatus,
} from "@/types/nba";

const preferredSportsbooks = ["mockbook", "fanduel", "draftkings", "altbook"];
const freshMinutes = 30;
const agingMinutes = 120;

function getFreshnessState(timestamp: string | undefined, nowIso: string): PlayerPropFreshnessState {
  if (!timestamp) {
    return "unknown";
  }

  const diffMs = Date.parse(nowIso) - Date.parse(timestamp);

  if (Number.isNaN(diffMs)) {
    return "unknown";
  }

  const diffMinutes = diffMs / 60000;

  if (diffMinutes <= freshMinutes) {
    return "fresh";
  }

  if (diffMinutes <= agingMinutes) {
    return "aging";
  }

  return "stale";
}

function getSportsbookRank(sportsbook: string | undefined): number {
  const index = preferredSportsbooks.indexOf(sportsbook ?? "");
  return index === -1 ? preferredSportsbooks.length : index;
}

function getPrimaryCandidateScore({
  offer,
  freshnessState,
}: {
  offer: PlayerPropOffer;
  freshnessState: PlayerPropFreshnessState;
}): number {
  const completeness =
    Number(offer.overPriceAmerican !== undefined) + Number(offer.underPriceAmerican !== undefined);
  const freshnessScore = freshnessState === "fresh" ? 2 : freshnessState === "aging" ? 1 : 0;
  const identityScore =
    offer.identityResolution.quality === "high" ? 2 : offer.identityResolution.quality === "medium" ? 1 : 0;

  return completeness + freshnessScore + identityScore - getSportsbookRank(offer.sportsbook);
}

function getReasonForOffer({
  offer,
  freshnessState,
}: {
  offer: PlayerPropOffer;
  freshnessState: PlayerPropFreshnessState;
}): PlayerPropPassReason | undefined {
  if (offer.identityResolution.quality === "none") {
    return "player_unresolved";
  }

  if (freshnessState === "stale") {
    return "stale_data";
  }

  if (offer.integrityFlags.includes("one_sided_offer")) {
    return "one_sided_offer";
  }

  if (offer.identityResolution.quality === "low") {
    return "low_match_confidence";
  }

  return undefined;
}

function buildMatchResult({
  offer,
  primaryLine,
  primarySportsbook,
  selected,
  nowIso,
}: {
  offer: PlayerPropOffer;
  primaryLine: number | undefined;
  primarySportsbook: string | undefined;
  selected: boolean;
  nowIso: string;
}): PlayerPropMatchResult {
  const freshnessState = getFreshnessState(offer.sourceTimestamp, nowIso);
  const reason = getReasonForOffer({ offer, freshnessState });
  const lineDelta =
    primaryLine !== undefined && offer.line !== undefined ? Math.abs(offer.line - primaryLine) : undefined;
  const lineRelationship = selected
    ? "primary"
    : lineDelta === 0
      ? "exact"
      : lineDelta !== undefined && lineDelta <= 0.5
        ? "near"
        : lineDelta !== undefined
          ? "alternate"
          : "none";

  let matchQuality: PlayerPropMatchResult["matchQuality"] = "high";

  if (reason === "player_unresolved" || reason === "stale_data") {
    matchQuality = "none";
  } else if (
    offer.identityResolution.quality === "medium" ||
    freshnessState === "aging" ||
    offer.integrityFlags.includes("one_sided_offer")
  ) {
    matchQuality = "low";
  } else if (!selected && (offer.sportsbook !== primarySportsbook || lineRelationship === "near")) {
    matchQuality = "medium";
  }

  return {
    traceId: offer.traceId,
    canonicalPlayerId: offer.canonicalPlayerId,
    internalPlayerId: offer.internalPlayerId,
    gameId: offer.gameId,
    marketType: offer.marketType,
    line: offer.line,
    sportsbook: offer.sportsbook,
    offer,
    matchQuality,
    identityQuality: offer.identityResolution.quality,
    lineRelationship,
    freshnessState,
    selected,
    reason,
  };
}

export function matchPlayerPropOffers({
  offers,
  gameId,
  canonicalPlayerId,
  nowIso,
}: {
  offers: PlayerPropOffer[];
  gameId: string;
  canonicalPlayerId: string;
  nowIso: string;
}): { matches: PlayerPropMatchResult[]; logs: PlayerPropLogEntry[] } {
  const logger = createPropLogger();
  const scopedOffers = offers.filter(
    (offer) => offer.gameId === gameId && offer.canonicalPlayerId === canonicalPlayerId && offer.marketType,
  );
  const matches: PlayerPropMatchResult[] = [];

  const markets = [...new Set(scopedOffers.map((offer) => offer.marketType))];

  for (const marketType of markets) {
    const marketOffers = scopedOffers
      .filter((offer) => offer.marketType === marketType)
      .sort((left, right) => {
        const leftScore = getPrimaryCandidateScore({
          offer: left,
          freshnessState: getFreshnessState(left.sourceTimestamp, nowIso),
        });
        const rightScore = getPrimaryCandidateScore({
          offer: right,
          freshnessState: getFreshnessState(right.sourceTimestamp, nowIso),
        });

        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }

        const leftTime = left.sourceTimestamp ? Date.parse(left.sourceTimestamp) : 0;
        const rightTime = right.sourceTimestamp ? Date.parse(right.sourceTimestamp) : 0;
        return rightTime - leftTime;
      });

    const primary = marketOffers[0];

    if (!primary) {
      continue;
    }

    for (const offer of marketOffers) {
      const match = buildMatchResult({
        offer,
        primaryLine: primary.line,
        primarySportsbook: primary.sportsbook,
        selected: offer.traceId === primary.traceId,
        nowIso,
      });

      logger.record({
        event:
          match.matchQuality === "none"
            ? "prop_offer_unmatched"
            : match.lineRelationship === "near"
              ? "prop_offer_near_matched"
              : "prop_offer_matched",
        traceId: match.traceId,
        gameId: match.gameId,
        canonicalPlayerId: match.canonicalPlayerId,
        rawPlayerLabel: offer.rawPlayerLabel,
        sportsbook: match.sportsbook,
        marketType,
        line: match.line,
        identityQuality: match.identityQuality,
        matchQuality: match.matchQuality,
        freshnessState: match.freshnessState,
        reason: match.reason,
      });

      if (match.freshnessState === "stale") {
        logger.record({
          event: "prop_offer_stale",
          traceId: match.traceId,
          gameId: match.gameId,
          canonicalPlayerId: match.canonicalPlayerId,
          rawPlayerLabel: offer.rawPlayerLabel,
          sportsbook: match.sportsbook,
          marketType,
          line: match.line,
          freshnessState: match.freshnessState,
          reason: "Offer timestamp is outside the freshness window.",
        });
      }

      matches.push(match);
    }
  }

  return {
    matches,
    logs: logger.flush(),
  };
}

export function getPropStatusFromMatch(match: PlayerPropMatchResult): PlayerPropStatus {
  if (match.matchQuality === "none") {
    return "unavailable";
  }

  if (match.matchQuality === "low") {
    return "pass";
  }

  return "watch";
}
