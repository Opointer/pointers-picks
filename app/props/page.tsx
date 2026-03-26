import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataCard } from "@/components/shared/data-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { getPropsIndexViewModel } from "@/lib/view-models/props-index";

export default async function PropsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const viewModel = await getPropsIndexViewModel(date);

  return (
    <>
      <PageHeader
        eyebrow="Props"
        title="Props board"
        description="Posted player markets for the slate, grouped by date."
        variant="slate"
        aside={
          <div className="rounded-[24px] border border-[rgba(16,23,23,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--text-soft)]">
              Now
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {viewModel.trustChips.slice(0, 3).map((chip) => (
                <StatusChip key={`${chip.label}-${chip.tone}`} label={chip.label} tone={chip.tone} />
              ))}
            </div>
          </div>
        }
      />
      <div className="space-y-6">
        <SectionCard
          variant="spotlight"
          eyebrow="Date"
          title={viewModel.selectedDateLabel}
          description="Open posted player pages for this slate."
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href={viewModel.previousHref} className="ui-button">
                Previous day
              </Link>
              <Link href={viewModel.todayHref} className="ui-button ui-button-accent">
                Today
              </Link>
              <Link href={viewModel.nextHref} className="ui-button">
                Next day
              </Link>
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[22px] border border-[rgba(16,23,23,0.08)] bg-[rgba(20,52,51,0.95)] px-5 py-4 text-white">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/70">
                Posted markets
              </p>
              <div className="mt-4 space-y-3">
                <div className="h-2 rounded-full bg-white/12">
                  <div className="h-2 w-[72%] rounded-full bg-[var(--accent-gold)]" />
                </div>
                <div className="h-2 rounded-full bg-white/12">
                  <div className="h-2 w-[54%] rounded-full bg-[#77c3ba]" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/72">
                Player pages only show up here when there is a real market behind them.
              </p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {viewModel.trustChips.map((chip) => (
                  <StatusChip key={`${chip.label}-${chip.tone}`} label={chip.label} tone={chip.tone} />
                ))}
              </div>
              {viewModel.warnings.length > 0 ? (
                <div className="mt-5 space-y-2">
                  {viewModel.warnings.slice(0, 1).map((warning) => (
                    <p
                      key={warning}
                      className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]"
                    >
                      {warning}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Players"
          title="Players with posted markets"
          description="Only verified player pages show up here."
        >
          {viewModel.players.length === 0 && viewModel.emptyState ? (
            <EmptyState title={viewModel.emptyState.title} description={viewModel.emptyState.description} />
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {viewModel.players.map((player) => (
                <DataCard
                  key={player.id}
                  variant="compact"
                  href={player.href}
                  eyebrow={player.subtitle}
                  title={player.title}
                  description={player.detail}
                  actionLabel="Open props page"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
