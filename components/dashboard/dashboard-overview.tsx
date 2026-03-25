import { DataCard } from "@/components/shared/data-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { type DashboardOverviewViewModel } from "@/lib/view-models/dashboard";

export function DashboardOverview({ viewModel }: { viewModel: DashboardOverviewViewModel }) {
  const leadMetrics = viewModel.metrics.slice(0, 2);
  const supportMetrics = [viewModel.metrics[2], viewModel.metrics[0]].filter(Boolean);

  return (
    <div className="space-y-12">
      <section className="grid gap-5 xl:grid-cols-[1.38fr_0.62fr]">
        <SectionCard
          variant="spotlight"
          eyebrow="Lead matchup"
          title="Start with tonight"
          description="The front page should move like a real desk: lead game first, feed context second, route depth right underneath."
        >
          {viewModel.leadGame ? (
            <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
              <DataCard
                variant="feature"
                eyebrow="On deck"
                title={viewModel.leadGame.title}
                subtitle={viewModel.leadGame.subtitle}
                description={viewModel.leadGame.description}
                href={viewModel.leadGame.href}
                actionLabel="Open matchup"
              />
              <div className="grid gap-4">
                {leadMetrics.map((metric) => (
                  <DataCard
                    key={metric.label}
                    variant="stat"
                    eyebrow={metric.label}
                    title={metric.value}
                    description={metric.detail}
                  />
                ))}
              </div>
            </div>
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
        {supportMetrics.map((metric, index) => (
          <DataCard
            key={`${metric.label}-${index}`}
            variant="stat"
            eyebrow={metric.label}
            title={metric.value}
            description={metric.detail}
          />
        ))}
        <DataCard
          variant="context"
          eyebrow="Navigation"
          title="Open the board"
          description="Use the front page to move quickly into live games, team profiles, and player props without losing feed context."
        />
      </section>

      <section className="grid gap-7 xl:grid-cols-2">
        <SectionCard
          eyebrow="Games"
          title="Live slate routes"
          description="The fastest game routes stay right on the front page so you can move from overview into analysis in one click."
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
          title="Props routes"
          description="Player pages show up here only when the live slate and props feed can support them cleanly."
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
