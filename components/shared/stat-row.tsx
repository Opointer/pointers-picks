import { type ViewState } from "@/components/shared/view-state";

export interface StatRowProps {
  label: string;
  value?: string;
  detail?: string;
  state?: ViewState;
}

export function StatRow({
  label,
  value,
  detail,
  state = "default",
}: StatRowProps) {
  if (state === "loading") {
    return (
      <div className="flex items-center justify-between gap-4 py-3.5 animate-pulse">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="h-4 w-20 rounded-full bg-slate-200" />
      </div>
    );
  }

  if (state === "empty") {
    value = value ?? "No data";
    detail = detail ?? "No supporting detail yet.";
  }

  if (state === "error") {
    value = value ?? "Unavailable";
    detail = detail ?? "This stat could not be rendered.";
  }

  return (
    <div className="flex items-start justify-between gap-4 border-t border-[var(--border-soft)] py-3.5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--foreground-strong)]">{label}</p>
        {detail ? <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">{detail}</p> : null}
      </div>
      <p className="shrink-0 text-sm font-extrabold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
