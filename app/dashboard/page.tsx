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
        title="The premium NBA board"
        description="Live games, player markets, and trust signals in one sharper board built to feel fast, readable, and decisive."
        variant="default"
        aside={
          <div className="rounded-[26px] border border-[rgba(16,23,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,247,243,0.78))] px-5 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[var(--text-soft)]">
              Market coverage
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
