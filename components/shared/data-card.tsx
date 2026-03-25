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
  variant?: "default" | "stat" | "feature" | "compact";
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
      ? "rounded-[30px] border border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(255,253,249,1),rgba(248,242,235,0.96))] p-8 shadow-[0_22px_44px_rgba(24,33,32,0.08)]"
      : variant === "stat"
        ? "rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4.5 shadow-[0_5px_12px_rgba(24,33,32,0.03)]"
        : variant === "compact"
          ? "rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4.5 shadow-[0_5px_12px_rgba(24,33,32,0.03)]"
          : "rounded-[28px] border border-[rgba(24,33,32,0.08)] bg-[rgba(255,252,247,0.82)] p-6 shadow-[0_4px_12px_rgba(24,33,32,0.02)]";
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
          description={
            emptyDescription ??
            "Use this empty state when a card has no meaningful content to render yet."
          }
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
          description={
            errorDescription ??
            "Use this visual-only error state when content cannot be shown cleanly."
          }
        />
      </article>
    );
  }

  const cardBody = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--text-soft)]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className={`${variant === "stat" ? "font-sans text-[1.9rem] font-semibold tracking-[-0.035em]" : variant === "feature" ? "text-[2.3rem] font-semibold tracking-[-0.045em]" : variant === "compact" ? "font-sans text-[1.24rem] font-semibold tracking-[-0.03em]" : "font-sans text-[1.45rem] font-semibold tracking-[-0.035em]"} mt-3 leading-tight text-slate-950`}>
            {title}
          </h3>
          {subtitle ? <p className="mt-1.5 text-sm leading-6 text-slate-700">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      {description ? <p className={`${variant === "compact" || variant === "stat" ? "mt-3" : "mt-4"} text-sm leading-7 text-[var(--text-muted)]`}>{description}</p> : null}
      {children ? <div className={variant === "feature" ? "mt-7" : "mt-5"}>{children}</div> : null}
      {footer ? <div className={variant === "feature" ? "mt-7" : "mt-5"}>{footer}</div> : null}
      {href ? (
        <div className={`${variant === "feature" ? "mt-7" : "mt-5"} border-t border-[var(--border-soft)] pt-4`}>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--accent-teal-strong)] transition duration-150 group-hover:text-[var(--accent-teal)]">
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
      className={`group block ${shellClass} transition duration-150 hover:-translate-y-[1px] hover:border-[var(--border-strong)] hover:bg-white hover:shadow-[0_16px_28px_rgba(24,33,32,0.07)]`}
    >
      {cardBody}
    </Link>
  ) : (
    <article className={shellClass}>
      {cardBody}
    </article>
  );
}
