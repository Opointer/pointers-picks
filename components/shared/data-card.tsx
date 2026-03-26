import Link from "next/link";
import { type ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { type ViewState } from "@/components/shared/view-state";

export interface DataCardProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  description?: string;
  badge?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  href?: string;
  actionLabel?: string;
  variant?: "default" | "stat" | "feature" | "compact" | "context";
  state?: ViewState;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function DataCard({
  title,
  eyebrow,
  subtitle,
  description,
  badge,
  children,
  footer,
  href,
  actionLabel = "Open details",
  variant = "default",
  state = "default",
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
}: DataCardProps) {
  const shellClass =
    variant === "feature"
      ? "rounded-[30px] border border-[rgba(16,23,23,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(240,231,218,0.94))] p-7 shadow-[var(--shadow-raise)]"
      : variant === "stat"
        ? "rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_8px_18px_rgba(16,23,23,0.03)]"
        : variant === "context"
          ? "rounded-[22px] border border-[rgba(16,23,23,0.06)] bg-[rgba(255,253,249,0.72)] p-5 shadow-[0_6px_14px_rgba(16,23,23,0.018)]"
          : variant === "compact"
            ? "rounded-[24px] border border-[var(--border-soft)] bg-[rgba(255,253,249,0.92)] p-5 shadow-[0_8px_18px_rgba(16,23,23,0.03)]"
            : "rounded-[26px] border border-[var(--border-soft)] bg-[rgba(255,253,249,0.9)] p-6 shadow-[0_10px_22px_rgba(16,23,23,0.035)]";

  if (state === "loading") {
    return (
      <article className={`animate-pulse ${shellClass}`}>
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="mt-5 h-8 w-2/3 rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-200" />
        <div className="mt-6 space-y-3">
          <div className="h-3 w-full rounded-full bg-slate-200" />
          <div className="h-3 w-5/6 rounded-full bg-slate-200" />
        </div>
      </article>
    );
  }

  if (state === "empty") {
    return (
      <article className={shellClass}>
        <EmptyState
          compact
          title={emptyTitle ?? "No card data"}
          description={emptyDescription ?? "There is no live content to show in this module right now."}
        />
      </article>
    );
  }

  if (state === "error") {
    return (
      <article className={shellClass}>
        <ErrorState
          compact
          title={errorTitle ?? "Card unavailable"}
          description={errorDescription ?? "This module could not render cleanly from the current live feed."}
        />
      </article>
    );
  }

  const titleClass =
    variant === "feature"
      ? "ui-masthead text-[2.7rem] leading-[0.94]"
      : variant === "stat"
        ? "font-sans text-[1.95rem] leading-none tracking-[-0.05em]"
        : variant === "compact"
          ? "font-sans text-[1.18rem] leading-tight tracking-[-0.04em]"
          : variant === "context"
            ? "font-sans text-[1rem] leading-tight tracking-[-0.02em]"
            : "font-sans text-[1.45rem] leading-tight tracking-[-0.04em]";

  const cardBody = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--text-soft)]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className={`${titleClass} mt-3 text-[var(--foreground-strong)]`}>{title}</h3>
          {subtitle ? (
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--accent-primary-strong)]">{subtitle}</p>
          ) : null}
        </div>
        {badge}
      </div>
      {description ? (
        <p className={`${variant === "feature" ? "mt-4" : "mt-3"} text-sm leading-7 text-[var(--text-muted)]`}>
          {description}
        </p>
      ) : null}
      {children ? <div className={variant === "feature" ? "mt-6" : "mt-5"}>{children}</div> : null}
      {footer ? <div className={variant === "feature" ? "mt-6" : "mt-5"}>{footer}</div> : null}
      {href ? (
        <div className={`${variant === "feature" ? "mt-6" : "mt-5"} border-t border-[var(--border-soft)] pt-4`}>
          <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent-primary-strong)] transition duration-150 group-hover:text-[var(--accent-primary)]">
            {actionLabel}
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      ) : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className={`group block ${shellClass} transition duration-200 hover:-translate-y-[2px] hover:border-[var(--border-strong)] hover:bg-white hover:shadow-[var(--shadow-raise)]`}
    >
      {cardBody}
    </Link>
  ) : (
    <article className={shellClass}>{cardBody}</article>
  );
}
