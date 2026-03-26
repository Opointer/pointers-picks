import { type ViewState } from "@/components/shared/view-state";

export interface ConfidenceIndicatorProps {
  label?: string;
  tone?: "high" | "medium" | "low" | "measured" | "reduced" | "capped";
  state?: ViewState;
}

const toneMap = {
  high: { bars: 3, color: "bg-emerald-600", text: "text-emerald-900" },
  medium: { bars: 2, color: "bg-[var(--accent-gold)]", text: "text-[#734e12]" },
  low: { bars: 1, color: "bg-rose-500", text: "text-rose-900" },
  measured: { bars: 2, color: "bg-[var(--accent-primary)]", text: "text-[var(--accent-primary-strong)]" },
  reduced: { bars: 1, color: "bg-[var(--accent-gold)]", text: "text-[#734e12]" },
  capped: { bars: 2, color: "bg-slate-400", text: "text-slate-800" },
} as const;

export function ConfidenceIndicator({
  label = "Measured",
  tone = "measured",
  state = "default",
}: ConfidenceIndicatorProps) {
  if (state === "loading") {
    return <div className="h-11 w-full animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (state === "empty") {
    label = "No confidence";
    tone = "low";
  }

  if (state === "error") {
    label = "Unavailable";
    tone = "low";
  }

  const config = toneMap[tone];

  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[var(--border-soft)] bg-[rgba(242,234,223,0.64)] px-4 py-3">
      <span className={`text-[11px] font-extrabold uppercase tracking-[0.12em] ${config.text}`}>{label}</span>
      <div className="flex items-end gap-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`w-2 rounded-full ${
              index < config.bars ? config.color : "bg-slate-200"
            } ${index === 2 ? "h-5" : index === 1 ? "h-3.5" : "h-2.5"}`}
          />
        ))}
      </div>
    </div>
  );
}
