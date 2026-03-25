import { DataCard } from "@/components/shared/data-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { type DashboardOverviewViewModel } from "@/lib/view-models/dashboard";

export function DashboardOverview({ viewModel }: { viewModel: DashboardOverviewViewModel }) {
  return (
    <div className="space-y-11">
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          variant="spotlight"
          eyebrow="Lead matchup"
          title="Start with the board"
          description="The front page should get you into the best live route immediately, not make you hunt through the slate."
        >
          {viewModel.leadGame ? (
            <DataCard
              variant="feature"
              eyebrow="On deck"
              title={viewModel.leadGame.title}
              subtitle={viewModel.leadGame.subtitle}
              description={viewModel.leadGame.description}
              href={viewModel.leadGame.href}
              actionLabel="Open matchup"
            />
          ) : (
            <EmptyState
              title={viewModel.emptyState?.title ?? "No live slate"}
              description={
                viewModel.emptyState?.description ??
                "No scheduled live matchup is available to feature right now."
              }
            />
          )}
        </SectionCard>

        <SectionCard
          variant="dense"
          eyebrow="Feed health"
          title={viewModel.trust.title}
          description={viewModel.trust.description}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {viewModel.trust.chips.map((chip) => (
                <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
              ))}
            </div>
            <div className="border-t border-[var(--border-soft)] pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-soft)]">
                Latest notes
              </p>
            </div>
          </div>
          <div className="mt-1 space-y-2.5">
            {viewModel.trust.warnings.map((warning) => (
              <p
                key={warning}
                className="rounded-[18px] border border-[var(--border-soft)] bg-[rgba(246,240,230,0.62)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]"
              >
                {warning}
              </p>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {viewModel.metrics.map((metric) => (
          <DataCard
            key={metric.label}
            variant="stat"
            eyebrow={metric.label}
            title={metric.value}
            description={metric.detail}
          />
        ))}
      </section>

      <section className="grid gap-7 xl:grid-cols-2">
        <SectionCard
          eyebrow="Games"
          title="Slate routes"
          description="Open the games already on the board and move into matchup detail without losing context."
        >
          {viewModel.slateCards.length === 0 ? (
            <EmptyState
              title="No games on the board"
              description="There are no scheduled live matchups to route into right now."
            />
          ) : (
            <div className="grid gap-4">
              {viewModel.slateCards.map((card) => (
                <DataCard
                  key={card.id}
                  variant="compact"
                  href={card.href}
                  eyebrow="Matchup"
                  title={card.title}
                  subtitle={card.subtitle}
                  description={card.description}
                  actionLabel="Open matchup"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Props"
          title="Player props routes"
          description="Player pages only appear when the live slate and props feed can support them."
        >
          {viewModel.propCards.length === 0 ? (
            <EmptyState
              title="No props pages available"
              description="Player props pages will appear here when the live slate and props feed line up."
            />
          ) : (
            <div className="grid gap-4">
              {viewModel.propCards.map((card) => (
                <DataCard
                  key={card.id}
                  variant="compact"
                  href={card.href}
                  eyebrow="Player props"
                  title={card.title}
                  subtitle={card.subtitle}
                  description={card.description}
                  actionLabel="Open props page"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  );
}
