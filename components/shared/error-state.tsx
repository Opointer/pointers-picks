export function ErrorState({
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
      className={`rounded-[24px] border border-rose-700/16 bg-[linear-gradient(180deg,#fff8f8,#fff5f5)] ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <h2 className={`${compact ? "text-lg" : "text-xl"} font-sans font-extrabold tracking-[-0.04em] text-rose-950`}>{title}</h2>
      <p className="mt-3 text-sm leading-6 text-rose-900/80">{description}</p>
    </div>
  );
}
