import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageHeader } from "@/components/layout/page-header";
import { StatusChip } from "@/components/shared/status-chip";
import { getDashboardOverviewViewModel } from "@/lib/view-models/dashboard";

export default async function DashboardPage() {
  const viewModel = await getDashboardOverviewViewModel();

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Today's desk"
        description="Start with the live board, check feed health, and move straight into games, teams, and props."
        variant="default"
        aside={
          <div className="rounded-[24px] border border-[rgba(17,25,24,0.08)] bg-[rgba(255,252,247,0.78)] px-5 py-4 shadow-[0_8px_18px_rgba(17,25,24,0.03)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--text-soft)]">
              Live desk
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {viewModel.trust.chips.slice(0, 3).map((chip) => (
                <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
              ))}
            </div>
          </div>
        }
      />
      <DashboardOverview viewModel={viewModel} />
    </>
  );
}
