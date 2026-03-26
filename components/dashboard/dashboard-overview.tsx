import { DataCard } from "@/components/shared/data-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { type DashboardOverviewViewModel } from "@/lib/view-models/dashboard";

export function DashboardOverview({ viewModel }: { viewModel: DashboardOverviewViewModel }) {
  const leadMetrics = viewModel.metrics.slice(0, 2);
  const statusMetric = viewModel.metrics[2];
  const leadWarning = viewModel.trust.warnings[0];

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
        <SectionCard
          variant="spotlight"
          eyebrow="Lead game"
          title={viewModel.leadGame ? "Start here" : "No lead game tonight"}
          description={
            viewModel.leadGame
              ? "Open the top matchup first, then work the rest of the slate."
              : "There is no featured game on the board right now."
          }
        >
          {viewModel.leadGame ? (
            <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
              <DataCard
                variant="feature"
                eyebrow={viewModel.leadGame.subtitle}
                title={viewModel.leadGame.title}
                description={viewModel.leadGame.description}
                href={viewModel.leadGame.href}
                actionLabel="Open matchup"
                footer={
                  <div className="grid gap-3 md:grid-cols-2">
                    {leadMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-[18px] border border-[rgba(16,23,23,0.08)] bg-[rgba(242,234,223,0.76)] px-4 py-3"
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-xl font-extrabold tracking-[-0.05em] text-[var(--foreground-strong)]">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{metric.detail}</p>
                      </div>
                    ))}
                  </div>
                }
              />

              <div className="grid gap-4">
                <DataCard
                  variant="stat"
                  eyebrow={statusMetric?.label ?? "Status"}
                  title={statusMetric?.value ?? "Unavailable"}
                  description={statusMetric?.detail ?? "Live status is unavailable."}
                />
                <DataCard
                  variant="compact"
                  eyebrow="Slate"
                  title="See every game"
                  description="Open the full board by date and go straight to the next matchup."
                  href="/games"
                  actionLabel="Browse slate"
                />
                <DataCard
                  variant="context"
                  eyebrow="Props"
                  title="Go to player markets"
                  description="Jump into posted player markets without leaving the main board."
                  href="/props"
                  actionLabel="View props"
                />
              </div>
            </div>
          ) : (
            <EmptyState
              title={viewModel.emptyState?.title ?? "No featured game"}
              description={viewModel.emptyState?.description ?? "There is no featured matchup to show right now."}
            />
          )}
        </SectionCard>

        <SectionCard variant="dense" eyebrow="Status" title={viewModel.trust.title} description="Quick read on the feeds.">
          <div className="flex flex-wrap gap-2">
            {viewModel.trust.chips.map((chip) => (
              <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
            ))}
          </div>
          {leadWarning ? (
            <p className="mt-4 rounded-[18px] border border-[var(--border-soft)] bg-[rgba(242,234,223,0.72)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
              {leadWarning}
            </p>
          ) : null}
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Slate"
          title="Tonight's slate"
          description="The next few matchups, ready to open."
        >
          {viewModel.slateCards.length === 0 ? (
            <EmptyState
              title="No games on the slate"
              description="There are no scheduled matchups to open right now."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {viewModel.slateCards.map((card) => (
                <DataCard
                  key={card.id}
                  variant="compact"
                  href={card.href}
                  eyebrow={card.subtitle}
                  title={card.title}
                  description={card.description}
                  actionLabel="Open matchup"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          variant="dense"
          eyebrow="Props"
          title="Player markets"
          description="Posted player pages for tonight."
        >
          {viewModel.propCards.length === 0 ? (
            <EmptyState
              compact
              title="No posted props"
              description="Player markets have not been posted for tonight's slate yet."
            />
          ) : (
            <div className="grid gap-4">
              {viewModel.propCards.map((card) => (
                <DataCard
                  key={card.id}
                  variant="compact"
                  href={card.href}
                  eyebrow={card.subtitle}
                  title={card.title}
                  description={card.description}
                  actionLabel="View props"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  );
}
