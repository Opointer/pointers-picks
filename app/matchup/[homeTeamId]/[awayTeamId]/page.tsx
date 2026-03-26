import { ConfidenceIndicator } from "@/components/shared/confidence-indicator";
import { PageHeader } from "@/components/layout/page-header";
import { DataCard } from "@/components/shared/data-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatRow } from "@/components/shared/stat-row";
import { StatusChip } from "@/components/shared/status-chip";
import {
  getMatchupDetailViewModel,
  type MatchupComparisonRowViewModel,
} from "@/lib/view-models/matchup-detail";
import { getMatchupMarketViewModel } from "@/lib/view-models/matchup-market";

const comparisonColumns: DataTableColumn<MatchupComparisonRowViewModel>[] = [
  {
    key: "metric",
    header: "Metric",
    render: (row) => <span className="font-semibold text-slate-950">{row.metric}</span>,
  },
  {
    key: "home",
    header: "Home",
    render: (row) => <span className="text-slate-700">{row.homeValue}</span>,
  },
  {
    key: "away",
    header: "Away",
    render: (row) => <span className="text-slate-700">{row.awayValue}</span>,
  },
  {
    key: "edge",
    header: "Edge",
    render: (row) => <span className="text-slate-400">{row.edge}</span>,
  },
];

export default async function MatchupPage({
  params,
}: {
  params: Promise<{ homeTeamId: string; awayTeamId: string }>;
}) {
  const { homeTeamId, awayTeamId } = await params;
  const detailViewModel = await getMatchupDetailViewModel(homeTeamId, awayTeamId);
  const marketViewModel = await getMatchupMarketViewModel(homeTeamId, awayTeamId);

  return (
    <>
      <PageHeader
        eyebrow={detailViewModel.header.eyebrow}
        title={detailViewModel.header.title}
        description={detailViewModel.header.description}
        backHref="/games"
        backLabel="Back to slate"
        variant="detail"
        aside={
          <div className="rounded-[26px] border border-[rgba(16,23,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,247,243,0.78))] px-5 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[var(--text-soft)]">
              Market lane
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {marketViewModel.chips.slice(0, 3).map((chip) => (
                <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
              ))}
            </div>
          </div>
        }
      />
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <SectionCard
            variant="spotlight"
            eyebrow="Matchup"
            title="Game snapshot"
            description="A feature view of the game: model range, recent form, and the cleanest high-level read before you go deeper."
          >
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <DataCard
                variant="feature"
                title={detailViewModel.summaryCard.title}
                description={detailViewModel.summaryCard.description}
                footer={<p className="text-sm leading-6 text-[var(--text-soft)]">{detailViewModel.summaryCard.outlook}</p>}
              >
                <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
                  <div className="rounded-[22px] border border-[rgba(16,23,23,0.08)] bg-[rgba(20,52,51,0.95)] px-5 py-4 text-white">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/70">
                      Prediction shape
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="h-2 rounded-full bg-white/12">
                        <div className="h-2 w-[69%] rounded-full bg-[var(--accent-gold)]" />
                      </div>
                      <div className="h-2 rounded-full bg-white/12">
                        <div className="h-2 w-[58%] rounded-full bg-[#77c3ba]" />
                      </div>
                      <div className="h-2 rounded-full bg-white/12">
                        <div className="h-2 w-[46%] rounded-full bg-white/70" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      Confidence, projection range, and recent sample stay visible without turning the page into a model dump.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                  <ConfidenceIndicator
                    label={detailViewModel.summaryCard.confidenceLabel}
                    tone={detailViewModel.summaryCard.confidenceTone}
                  />
                  <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.74)] p-4">
                    <StatRow
                      label="Projected range"
                      value={detailViewModel.summaryCard.projectedRange}
                      detail="Model range"
                    />
                  </div>
                  </div>
                </div>
              </DataCard>
              <div className="grid gap-4">
                {detailViewModel.trendCards.length === 0 ? (
                  <EmptyState
                    title="No live trend cards"
                    description="Live team trend context is unavailable for this matchup right now."
                  />
                ) : (
                  detailViewModel.trendCards.map((card) => (
                    <DataCard
                      key={card.title}
                      variant="compact"
                      title={card.title}
                      subtitle={card.subtitle}
                      description={card.description}
                      badge={card.badge ? <StatusChip label={card.badge.label} tone={card.badge.tone} /> : undefined}
                    />
                  ))
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            variant="dense"
            eyebrow="Markets"
            title={marketViewModel.sectionTitle}
            description="The live market lane keeps spread, total, and moneyline context visible without taking over the page."
            actions={
              <div className="flex flex-wrap gap-2">
                {marketViewModel.chips.map((chip) => (
                  <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
                ))}
              </div>
            }
          >
            <div className="grid gap-4">
              {marketViewModel.items.map((item) => (
                <DataCard
                  key={item.label}
                  variant="compact"
                  eyebrow={item.label}
                  title={item.value}
                  description={item.detail}
                />
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-[var(--text-soft)]">{marketViewModel.note}</p>
          </SectionCard>
        </div>

        <SectionCard
          eyebrow="Comparisons"
          title="Side-by-side context"
          description="The table keeps both sides readable at a glance without dropping into a spreadsheet feel."
        >
          <DataTable
            columns={comparisonColumns}
            rows={detailViewModel.comparisonRows}
            getRowKey={(row) => row.id}
            emptyTitle="No comparison rows"
            emptyDescription="Matchup comparison data is unavailable for this game."
          />
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            variant="dense"
            eyebrow="Factors"
            title="What is driving the game"
            description="The strongest factors stay high-level and readable instead of sinking into raw model detail."
          >
            {detailViewModel.factorCards.length === 0 ? (
              <EmptyState
                title="No live factor data"
                description="The model factor breakdown is unavailable for this matchup right now."
              />
            ) : (
              <div className="grid gap-4">
                {detailViewModel.factorCards.map((factor) => (
                  <DataCard
                    key={factor.title}
                    variant="compact"
                    title={factor.title}
                    badge={factor.badge ? <StatusChip label={factor.badge.label} tone={factor.badge.tone} /> : undefined}
                    description={factor.description}
                    footer={
                      <div className="grid gap-2">
                        <div className="h-2 rounded-full bg-[rgba(16,23,23,0.08)]">
                          <div className="h-2 w-[64%] rounded-full bg-[var(--accent-primary)]" />
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Related props"
            title="Player props from this game"
            description="Use the matchup page as the clean handoff into player-level props for the same game."
          >
            {detailViewModel.relatedProps.length === 0 ? (
              <EmptyState
                title="No verified props routes"
                description="This matchup does not have any verified player market pages to open right now."
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {detailViewModel.relatedProps.map((prop) => (
                  <DataCard
                    key={prop.id}
                    variant="compact"
                    eyebrow={prop.market}
                    title={prop.title}
                    subtitle={prop.subtitle}
                    description={prop.rationale}
                    href={prop.href}
                    actionLabel="Open props page"
                  >
                    <StatRow label="Current line" value={prop.line} detail={prop.matchQuality} />
                  </DataCard>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
