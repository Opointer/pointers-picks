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
        description="Move through the slate by date, open player pages quickly, and keep feed quality visible before you read a single market."
        variant="slate"
      />
      <div className="space-y-6">
        <SectionCard
          variant="spotlight"
          eyebrow="Date view"
          title={viewModel.selectedDateLabel}
          description={viewModel.summary}
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
          <div className="flex flex-wrap gap-2">
            {viewModel.trustChips.map((chip) => (
              <StatusChip key={`${chip.label}-${chip.tone}`} label={chip.label} tone={chip.tone} />
            ))}
          </div>
          {viewModel.warnings.length > 0 ? (
            <div className="mt-5 space-y-2">
              {viewModel.warnings.map((warning) => (
                <p
                  key={warning}
                  className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]"
                >
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          eyebrow="Available pages"
          title="Players on the slate"
          description="This is the fastest route into player-level props pages for the selected date."
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
                  eyebrow="Player page"
                  title={player.title}
                  subtitle={player.subtitle}
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
