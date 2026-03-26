import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ConfidenceIndicator } from "@/components/shared/confidence-indicator";
import { DataCard } from "@/components/shared/data-card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { getPlayerPropsPageViewModel } from "@/lib/view-models/player-props";

export default async function PlayerPropsPage({
  params,
}: {
  params: Promise<{ gameId: string; playerId: string }>;
}) {
  const { gameId, playerId } = await params;
  const viewModel = await getPlayerPropsPageViewModel({ gameId, playerId });

  if (viewModel.notFound) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={viewModel.header.eyebrow}
        title={viewModel.header.title}
        description={viewModel.header.description}
        backHref="/props"
        backLabel="Back to props"
        variant="detail"
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
        <div className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
          <SectionCard
            variant="spotlight"
            eyebrow="Markets"
            title="Available prop markets"
            description="Line, odds, and the case for each posted market."
          >
            {viewModel.marketGroups.length === 0 && viewModel.emptyState ? (
              <EmptyState
                title={viewModel.emptyState.title}
                description={viewModel.emptyState.description}
              />
            ) : (
              <div className="grid gap-4">
                {viewModel.marketGroups.map((market) => (
                  <DataCard
                    key={market.id}
                    variant="feature"
                    eyebrow={market.marketType}
                    title={market.line}
                    subtitle={market.odds}
                    description={market.rationale}
                    badge={
                      <StatusChip
                        label={market.status === "watch" ? "Watch" : market.status === "pass" ? "Pass" : "Unavailable"}
                        tone={market.status === "watch" ? "accent" : market.status === "pass" ? "warning" : "danger"}
                      />
                    }
                    footer={
                      <ConfidenceIndicator
                        label={market.confidence}
                        tone={market.confidenceTone}
                      />
                    }
                  >
                    <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
                      <div className="rounded-[22px] border border-[rgba(16,23,23,0.08)] bg-[rgba(20,52,51,0.95)] px-5 py-4 text-white">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/70">
                          Market read
                        </p>
                        <div className="mt-4 space-y-3">
                          <div className="h-2 rounded-full bg-white/12">
                            <div className="h-2 w-[68%] rounded-full bg-[var(--accent-gold)]" />
                          </div>
                          <div className="h-2 rounded-full bg-white/12">
                            <div className="h-2 w-[58%] rounded-full bg-[#77c3ba]" />
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-white/72">
                          Line, source, and projection context in one card.
                        </p>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                      <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.72)] p-4">
                        <p className="text-sm font-medium text-slate-900">Source</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                          {market.source} • {market.freshness}
                        </p>
                      </div>
                      <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.72)] p-4">
                        <p className="text-sm font-medium text-slate-900">Match quality</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                          {market.matchQuality} identity {market.identityQuality.toLowerCase()}
                        </p>
                      </div>
                      <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.72)] p-4">
                        <p className="text-sm font-medium text-slate-900">Projection</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">{market.detail}</p>
                      </div>
                      <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.72)] p-4">
                        <p className="text-sm font-medium text-slate-900">Alternates</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                          {market.alternateCount > 0
                            ? `${market.alternateCount} alternate line${market.alternateCount > 1 ? "s" : ""} tracked`
                            : "No alternate lines tracked"}
                        </p>
                      </div>
                      </div>
                    </div>
                  </DataCard>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            variant="dense"
            eyebrow="Trust"
            title="Market trust"
            description="Source and market state at a glance."
          >
            <div className="flex flex-wrap gap-2">
              {viewModel.trustChips.map((chip) => (
                <StatusChip key={`${chip.label}-${chip.tone}`} label={chip.label} tone={chip.tone} />
              ))}
            </div>
            {viewModel.warnings.length > 0 ? (
              <div className="mt-5 space-y-3">
                {viewModel.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-7 text-[var(--text-muted)]"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            ) : null}
          </SectionCard>
        </div>

        <SectionCard
          variant="dense"
          eyebrow="Availability log"
          title="What stayed off the board"
          description="Markets that did not make the board."
        >
          <DataTable
            columns={[
              {
                key: "market",
                header: "Market",
                render: (row) => (
                  <div>
                    <p className="font-medium text-slate-950">{row.market}</p>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <StatusChip
                    label={row.status}
                    tone={row.status === "Watch" ? "accent" : row.status === "Pass" ? "warning" : "danger"}
                  />
                ),
              },
              {
                key: "detail",
                header: "Detail",
                render: (row) => (
                  <p className="max-w-2xl text-sm leading-6 text-slate-600">{row.detail}</p>
                ),
              },
            ]}
            rows={viewModel.availabilityRows}
            getRowKey={(row) => row.id}
            emptyTitle="No availability issues to show"
            emptyDescription="Every tracked prop market for this player is already represented in the market board above."
          />
        </SectionCard>
      </div>
    </>
  );
}
