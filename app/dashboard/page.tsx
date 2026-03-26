import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageHeader } from "@/components/layout/page-header";
import { StatusChip } from "@/components/shared/status-chip";
import { getDashboardOverviewViewModel } from "@/lib/view-models/dashboard";

export default async function DashboardPage() {
  const viewModel = await getDashboardOverviewViewModel();

  return (
    <>
      <PageHeader
        eyebrow="Pointers Picks"
        title="Tonight's board"
        description="The best place to start the slate, open the lead matchup, and move straight into games and props."
        variant="default"
        aside={
          <div className="rounded-[24px] border border-[rgba(16,23,23,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--text-soft)]">
              Now
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
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
