import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { SectionCard } from "@/components/shared/section-card";
import {
  getPlayersPageViewModel,
  type PlayersPageRowViewModel,
} from "@/lib/view-models/players-page";

const columns: DataTableColumn<PlayersPageRowViewModel>[] = [
  {
    key: "player",
    header: "Player",
    render: (row) =>
      row.href ? (
        <Link href={row.href} className="font-semibold text-slate-950 transition hover:text-teal-800">
          {row.title}
        </Link>
      ) : (
        <span className="font-semibold text-slate-950">{row.title}</span>
      ),
  },
  {
    key: "profile",
    header: "Profile",
    render: (row) => <span className="text-slate-600">{row.profile}</span>,
  },
  {
    key: "detail",
    header: "Route",
    render: (row) => <span className="text-slate-600">{row.detail}</span>,
  },
];

export default async function PlayersPage() {
  const viewModel = await getPlayersPageViewModel();

  return (
    <>
      <PageHeader
        eyebrow="Players"
        title="Player directory"
        description="Live roster pages with direct routes into props when a scheduled game is available."
      />
      <SectionCard
        variant="spotlight"
        eyebrow="League view"
        title="Active rosters"
        description="Players link into props pages only when there is a real scheduled game to open."
      >
        <DataTable
          columns={columns}
          rows={viewModel.rows}
          getRowKey={(row) => row.id}
          emptyTitle={viewModel.emptyState?.title ?? "No players available"}
          emptyDescription={
            viewModel.emptyState?.description ??
            "The live player directory is unavailable right now."
          }
        />
      </SectionCard>
    </>
  );
}
