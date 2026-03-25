export function EmptyState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] ${
        compact ? "p-5 text-left" : "p-8 text-center"
      }`}
    >
      <h2 className={`${compact ? "text-lg" : "text-xl"} font-sans font-semibold tracking-[-0.03em] text-slate-950`}>{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
