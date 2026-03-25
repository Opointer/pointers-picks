import { type EdgeTier, type MatchQuality } from "@/types/nba";

export function EdgeSummary({
  edgeScore,
  edgeTier,
  matchQuality,
  nearMatchPenalty,
}: {
  edgeScore?: number;
  edgeTier?: EdgeTier;
  matchQuality?: MatchQuality;
  nearMatchPenalty?: number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
      Edge Score {edgeScore?.toFixed(0) ?? "0"} | Edge Tier {edgeTier ?? "None"} | Match{" "}
      {matchQuality ?? "none"}
      {nearMatchPenalty ? ` | Penalty ${nearMatchPenalty.toFixed(2)}` : ""}
    </div>
  );
}
