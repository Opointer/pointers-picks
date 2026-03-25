import { type MatchQuality } from "@/types/nba";

export function MatchQualityBadge({ quality }: { quality?: MatchQuality }) {
  const label = quality === "near" ? "Near Match" : quality === "exact" ? "Exact Match" : "No Match";

  return (
    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
      {label}
    </span>
  );
}
