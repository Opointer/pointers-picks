export function LoadingState({
  label,
  lines = 3,
  compact = false,
}: {
  label: string;
  lines?: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-soft)] ${
        compact ? "p-5" : "p-6"
      } text-sm text-slate-600`}
    >
      <p className="font-medium text-slate-900">{label}</p>
      <div className="mt-4 space-y-3 animate-pulse">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`rounded-full bg-slate-200 ${index === 0 ? "h-4 w-3/4" : "h-3 w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}
