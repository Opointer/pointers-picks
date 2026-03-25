import { type ViewState } from "@/components/shared/view-state";

export function StatusChip({
  label,
  tone = "neutral",
  state = "default",
}: {
  label?: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  state?: ViewState;
}) {
  if (state === "loading") {
    return <span className="inline-flex h-7 w-28 animate-pulse rounded-full bg-slate-200" />;
  }

  if (state === "empty") {
    label = label ?? "No status";
    tone = "neutral";
  }

  if (state === "error") {
    label = label ?? "Unavailable";
    tone = "danger";
  }

  const toneClass =
    tone === "accent"
      ? "border-[rgba(13,92,99,0.12)] bg-[rgba(215,236,235,0.72)] text-[var(--accent-teal-strong)]"
      : tone === "success"
        ? "border-emerald-700/12 bg-emerald-700/[0.06] text-emerald-900"
      : tone === "warning"
          ? "border-[rgba(155,106,33,0.14)] bg-[rgba(244,230,200,0.78)] text-[#6f4d17]"
        : tone === "danger"
          ? "border-rose-700/12 bg-[rgba(244,225,225,0.82)] text-rose-900"
          : "border-[rgba(24,33,32,0.08)] bg-[rgba(246,240,230,0.7)] text-slate-700";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[0.08em] uppercase ${toneClass}`}>
      {label}
    </span>
  );
}
