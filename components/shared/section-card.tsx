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
        title={emptyTitle ?? "Nothing to show here yet"}
        description={
          emptyDescription ??
          "This section is intentionally empty so the layout can handle low-signal states cleanly."
        }
      />
    ) : state === "error" ? (
      <ErrorState
        compact
        title={errorTitle ?? "Section unavailable"}
        description={
          errorDescription ??
          "This is a visual-only error state for the component system. No backend logic is attached."
        }
      />
    ) : (
      children
    );

  const cardClass =
    variant === "spotlight"
      ? "rounded-[34px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,253,249,0.99),rgba(246,240,230,0.95))] p-6 shadow-[var(--shadow-soft)] sm:p-8"
      : variant === "dense"
        ? "rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_6px_16px_rgba(24,33,32,0.03)] sm:p-6"
        : "rounded-[30px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_8px_18px_rgba(24,33,32,0.035)] sm:p-7";

  return (
    <section className={cardClass}>
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent-teal)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-soft)] pb-6">
        <div className="flex flex-col gap-2">
          <h2 className={`${variant === "dense" ? "text-[1.38rem]" : "text-[1.62rem]"} font-sans leading-tight font-semibold tracking-[-0.04em] text-slate-950`}>
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
