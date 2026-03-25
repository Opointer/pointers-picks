import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { SectionCard } from "@/components/shared/section-card";
import { getTeamsPageViewModel, type TeamsPageRowViewModel } from "@/lib/view-models/teams-page";

const columns: DataTableColumn<TeamsPageRowViewModel>[] = [
  {
    key: "team",
    header: "Team",
    render: (row) => (
      <Link href={row.href} className="font-semibold text-slate-950 transition hover:text-teal-800">
        {row.title}
      </Link>
    ),
  },
  {
    key: "profile",
    header: "Profile",
    render: (row) => <span className="text-slate-600">{row.summary}</span>,
  },
  {
    key: "anchors",
    header: "Anchor stats",
    render: (row) => <span className="text-slate-600">{row.anchors}</span>,
  },
];

export default async function TeamsPage() {
  const viewModel = await getTeamsPageViewModel();

  return (
    <>
      <PageHeader
        eyebrow="Teams"
        title="Team directory"
        description="League-wide team pages built from the live schedule, recent results, and current roster context."
        aside={
          <div className="rounded-[24px] border border-[rgba(17,25,24,0.08)] bg-[rgba(255,252,247,0.78)] px-5 py-4 shadow-[0_8px_18px_rgba(17,25,24,0.03)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--text-soft)]">
              League directory
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Team profiles link straight into live context instead of acting like a static directory.
            </p>
          </div>
        }
      />
      <SectionCard
        variant="spotlight"
        eyebrow="League view"
        title="All teams"
        description="Open a team page for record, recent form, roster context, and the next available market."
      >
        <DataTable
          columns={columns}
          rows={viewModel.rows}
          getRowKey={(row) => row.id}
          emptyTitle={viewModel.emptyState?.title ?? "No teams available"}
          emptyDescription={
            viewModel.emptyState?.description ??
            "The live team directory is unavailable right now."
          }
        />
      </SectionCard>
    </>
  );
}
