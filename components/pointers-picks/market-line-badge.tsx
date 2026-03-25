export function MarketLineBadge({
  value,
  source,
}: {
  value?: number;
  source?: "mock" | "live";
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
      {source ?? "market"} {value ?? "N/A"}
    </span>
  );
}
