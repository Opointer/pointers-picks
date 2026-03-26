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
      ? "border-[rgba(15,91,87,0.16)] bg-[rgba(216,235,228,0.72)] text-[var(--accent-primary-strong)]"
      : tone === "success"
        ? "border-emerald-700/14 bg-emerald-700/[0.06] text-emerald-900"
        : tone === "warning"
          ? "border-[rgba(156,108,33,0.16)] bg-[rgba(241,228,203,0.82)] text-[#734e12]"
          : tone === "danger"
            ? "border-rose-700/14 bg-[rgba(246,225,221,0.92)] text-rose-900"
            : "border-[rgba(16,23,23,0.08)] bg-[rgba(244,237,228,0.86)] text-[var(--text-muted)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] ${toneClass}`}
    >
      {label}
    </span>
  );
}
