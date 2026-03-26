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
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  variant?: "default" | "slate" | "detail";
  aside?: ReactNode;
}) {
  const variantClass =
    variant === "slate"
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,233,220,0.95))]"
      : variant === "detail"
        ? "bg-[linear-gradient(180deg,rgba(255,253,249,0.99),rgba(236,226,212,0.96))]"
        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(243,235,223,0.95))]";

  return (
    <header
      className={`relative overflow-hidden rounded-[36px] border border-[var(--border-soft)] px-6 py-7 shadow-[var(--shadow-soft)] sm:px-8 sm:py-9 ${variantClass}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,91,87,0.38),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-72 bg-[linear-gradient(270deg,rgba(15,91,87,0.08),transparent)]" />
      <div className="pointer-events-none absolute -right-12 top-5 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(15,91,87,0.14),transparent_70%)]" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {backHref ? (
                <Link href={backHref} className="ui-back-link">
                  <span aria-hidden="true">←</span>
                  {backLabel ?? "Back"}
                </Link>
              ) : null}
              <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--accent-primary)]">
                {eyebrow}
              </p>
            </div>
            <div className={`grid gap-6 ${aside ? "xl:grid-cols-[1.2fr_0.8fr] xl:items-end" : ""}`}>
              <div className="flex flex-col gap-4">
                <h1 className="ui-masthead max-w-5xl text-[3.5rem] leading-[0.9] text-[var(--foreground-strong)] sm:text-[4.75rem]">
                  {title}
                </h1>
                <p className="max-w-[46rem] text-[1.02rem] leading-7 text-[var(--text-muted)] sm:text-[1.06rem]">
                  {description}
                </p>
              </div>
              {aside ? <div className="min-w-0">{aside}</div> : null}
            </div>
          </div>
          {actions}
        </div>
      </div>
    </header>
  );
}
