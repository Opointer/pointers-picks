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
          <div className="rounded-[24px] border border-[rgba(17,25,24,0.08)] bg-[rgba(255,252,247,0.78)] px-5 py-4 shadow-[0_8px_18px_rgba(17,25,24,0.03)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--text-soft)]">
              Trust state
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
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
            description="A premium player-market view: line, odds, trust, and the reason each market stayed in or dropped out."
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
                  </DataCard>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            variant="dense"
            eyebrow="Trust"
            title="Market trust"
            description="Source, freshness, and pass states stay visible so the page never looks cleaner than the underlying market."
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
          description="Unavailable, stale, one-sided, and alternate markets stay visible here so the page explains what dropped out."
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
