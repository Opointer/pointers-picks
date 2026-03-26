import { DataCard } from "@/components/shared/data-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { type DashboardOverviewViewModel } from "@/lib/view-models/dashboard";

export function DashboardOverview({ viewModel }: { viewModel: DashboardOverviewViewModel }) {
  const leadMetrics = viewModel.metrics.slice(0, 2);
  const supportMetrics = [viewModel.metrics[2], viewModel.metrics[0]].filter(Boolean);

  return (
    <div className="space-y-10 lg:space-y-12">
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <SectionCard
          variant="spotlight"
          eyebrow="Pointers Picks"
          title="The live board starts here"
          description="Lead game first, market posture second, and quick routes into the full slate and player pages right underneath."
        >
          {viewModel.leadGame ? (
            <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
              <DataCard
                variant="feature"
                eyebrow="Featured game"
                title={viewModel.leadGame.title}
                subtitle={viewModel.leadGame.subtitle}
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
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-soft)]">
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
                  variant="default"
                  eyebrow="Market pulse"
                  title="Tonight's read"
                  description="Use the front page to move into the board quickly without losing what the live feed is telling you."
                >
                  <div className="grid gap-3">
                    {supportMetrics.map((metric, index) => (
                      <div
                        key={`${metric.label}-${index}`}
                        className="rounded-[18px] border border-[rgba(16,23,23,0.08)] bg-[rgba(255,253,249,0.78)] px-4 py-3"
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-soft)]">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-[var(--foreground-strong)]">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{metric.detail}</p>
                      </div>
                    ))}
                  </div>
                </DataCard>

                <DataCard
                  variant="context"
                  eyebrow="Quick routes"
                  title="Move through the board"
                  description="Jump from the front page into games, props, teams, and live status without hitting filler screens."
                />
              </div>
            </div>
          ) : (
            <EmptyState
              title={viewModel.emptyState?.title ?? "No live slate"}
              description={
                viewModel.emptyState?.description ?? "There is no scheduled live matchup to feature right now."
              }
            />
          )}
        </SectionCard>

        <SectionCard
          variant="dense"
          eyebrow="Coverage"
          title={viewModel.trust.title}
          description={viewModel.trust.description}
        >
          <div className="flex flex-wrap gap-2.5">
            {viewModel.trust.chips.map((chip) => (
              <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {viewModel.trust.warnings.map((warning) => (
              <p
                key={warning}
                className="rounded-[18px] border border-[var(--border-soft)] bg-[rgba(242,234,223,0.72)] px-4 py-3 text-sm leading-6 text-[var(--text-muted)]"
              >
                {warning}
              </p>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Games"
          title="Tonight's slate"
          description="The fastest routes into the board stay on the front page so you can open the next game without hunting."
        >
          {viewModel.slateCards.length === 0 ? (
            <EmptyState
              title="No games on the board"
              description="There are no scheduled live matchups to route into right now."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {viewModel.slateCards.map((card) => (
                <DataCard
                  key={card.id}
                  variant="compact"
                  href={card.href}
                  eyebrow="Game page"
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
          title="Player markets"
          description="Player pages show up here only when the live slate and props feed can support a real destination."
        >
          {viewModel.propCards.length === 0 ? (
            <EmptyState
              title="No props pages available"
              description="Player props pages will appear here when the live slate and props feed line up."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {viewModel.propCards.map((card) => (
                <DataCard
                  key={card.id}
                  variant="compact"
                  href={card.href}
                  eyebrow="Player props"
                  title={card.title}
                  subtitle={card.subtitle}
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
