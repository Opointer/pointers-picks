import { type ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { type ViewState } from "@/components/shared/view-state";

export function SectionCard({
  title,
  eyebrow,
  description,
  children,
  actions,
  variant = "default",
  state = "default",
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  variant?: "default" | "spotlight" | "dense";
  state?: ViewState;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}) {
  const body =
    state === "loading" ? (
      <LoadingState label="Loading section" lines={4} />
    ) : state === "empty" ? (
      <EmptyState
        compact
        title={emptyTitle ?? "Nothing to show right now"}
        description={emptyDescription ?? "This section has no live content to display yet."}
      />
    ) : state === "error" ? (
      <ErrorState
        compact
        title={errorTitle ?? "Section unavailable"}
        description={errorDescription ?? "This section could not render safely from the live feed."}
      />
    ) : (
      children
    );

  const cardClass =
    variant === "spotlight"
      ? "rounded-[34px] border border-[rgba(16,23,23,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,233,220,0.95))] p-6 shadow-[var(--shadow-soft)] sm:p-8"
      : variant === "dense"
        ? "rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_8px_18px_rgba(16,23,23,0.03)] sm:p-6"
        : "rounded-[30px] border border-[var(--border-soft)] bg-[rgba(255,253,249,0.88)] p-6 shadow-[0_12px_24px_rgba(16,23,23,0.04)] sm:p-7";

  return (
    <section className={cardClass}>
      {eyebrow ? (
        <p className="text-[10px] font-extrabold uppercase tracking-[0.38em] text-[var(--accent-primary)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-soft)] pb-6">
        <div className="flex flex-col gap-2">
          <h2 className={`${variant === "dense" ? "text-[1.35rem]" : "text-[1.8rem]"} font-sans leading-tight font-extrabold tracking-[-0.05em] text-[var(--foreground-strong)]`}>
            {title}
          </h2>
          {description ? (
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)]">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className={variant === "dense" ? "mt-5" : "mt-7"}>{body}</div>
    </section>
  );
}
