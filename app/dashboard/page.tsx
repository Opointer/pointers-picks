import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageHeader } from "@/components/layout/page-header";
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
      />
      <DashboardOverview viewModel={viewModel} />
    </>
  );
}
