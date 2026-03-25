import { PageHeader } from "@/components/layout/page-header";
import { DataCard } from "@/components/shared/data-card";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { getPlatformStatusViewModel } from "@/lib/view-models/platform-status";

export default async function SystemStatusPage() {
  const status = await getPlatformStatusViewModel();

  return (
    <>
      <PageHeader
        eyebrow="System Status"
        title="Feed status"
        description="Track provider health, coverage, freshness, and any live warnings affecting the board."
        variant="detail"
      />
      <div className="space-y-6">
        <SectionCard
          variant="spotlight"
          eyebrow="Current state"
          title={status.headline}
          description={status.summary}
        >
          <div className="flex flex-wrap gap-2">
            <StatusChip label={status.providerChip.label} tone={status.providerChip.tone} />
            <StatusChip label={status.freshnessChip.label} tone={status.freshnessChip.tone} />
            <StatusChip label={status.fallbackChip.label} tone={status.fallbackChip.tone} />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {status.detailCards.map((card) => (
              <DataCard
                key={card.label}
                variant="stat"
                eyebrow={card.label}
                title={card.value}
                description={card.detail}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          variant="dense"
          eyebrow="Warnings"
          title="Active warnings"
          description={status.lastUpdatedLabel}
        >
          <div className="grid gap-3">
            {status.warnings.map((warning) => (
              <div
                key={warning}
                className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-4 text-sm leading-7 text-[var(--text-muted)]"
              >
                {warning}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
