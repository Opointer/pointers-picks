import Link from "next/link";
import { type ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actions,
  variant = "default",
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  variant?: "default" | "slate" | "detail";
}) {
  const variantClass =
    variant === "slate"
      ? "bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(246,240,230,0.96))]"
      : variant === "detail"
        ? "bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(248,243,236,0.96))]"
        : "bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(250,245,238,0.94))]";

  return (
    <header className={`relative overflow-hidden rounded-[34px] border border-[var(--border-soft)] px-6 py-8 shadow-[var(--shadow-soft)] sm:px-8 sm:py-9 ${variantClass}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(13,92,99,0.35),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-[linear-gradient(270deg,rgba(13,92,99,0.04),transparent)]" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {backHref ? (
              <Link href={backHref} className="ui-back-link">
                <span aria-hidden="true">←</span>
                {backLabel ?? "Back"}
              </Link>
            ) : null}
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--accent-teal)]">
              {eyebrow}
            </p>
          </div>
          {actions}
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="max-w-5xl text-[2.9rem] leading-[0.92] font-semibold tracking-[-0.055em] text-slate-950 sm:text-[4rem]">
            {title}
          </h1>
          <p className="max-w-[44rem] text-[0.98rem] leading-7 text-[var(--text-muted)] sm:text-[1.03rem]">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}
