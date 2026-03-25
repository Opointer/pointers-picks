import { type PickClassification } from "@/types/nba";

export function PickBadge({ value }: { value: PickClassification }) {
  const className =
    value === "Strong Lean"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/30"
      : value === "Lean"
        ? "bg-amber-300/15 text-amber-100 border-amber-300/30"
        : "bg-slate-400/10 text-slate-300 border-slate-400/20";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${className}`}>
      {value}
    </span>
  );
}
