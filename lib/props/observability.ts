export type PlayerPropLogEvent =
  | "prop_identity_resolved"
  | "prop_identity_ambiguous"
  | "prop_identity_unresolved"
  | "prop_offer_normalized"
  | "prop_offer_deduped"
  | "prop_offer_dropped"
  | "prop_offer_matched"
  | "prop_offer_near_matched"
  | "prop_offer_unmatched"
  | "prop_offer_stale"
  | "prop_score_blocked"
  | "prop_vm_fallback";

export interface PlayerPropLogEntry {
  event: PlayerPropLogEvent;
  traceId: string;
  gameId?: string;
  canonicalPlayerId?: string;
  rawPlayerLabel?: string;
  sportsbook?: string;
  marketType?: string;
  line?: number;
  identityQuality?: string;
  matchQuality?: string;
  freshnessState?: string;
  reason?: string;
}

export function createPropLogger() {
  const entries: PlayerPropLogEntry[] = [];

  return {
    record(entry: PlayerPropLogEntry) {
      entries.push(entry);
    },
    flush(): PlayerPropLogEntry[] {
      return [...entries];
    },
  };
}
