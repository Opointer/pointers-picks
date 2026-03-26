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
      className={`rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[rgba(242,234,223,0.72)] ${
        compact ? "p-5 text-left" : "p-8 text-center"
      }`}
    >
      <h2 className={`${compact ? "text-lg" : "text-xl"} font-sans font-extrabold tracking-[-0.04em] text-[var(--foreground-strong)]`}>{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
