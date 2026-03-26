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
        description="Active players, with props links only when a posted market exists."
        aside={
          <div className="rounded-[24px] border border-[rgba(16,23,23,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--text-soft)]">
              Active players
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Props links only appear when a real player page is available.
            </p>
          </div>
        }
      />
      <SectionCard
        variant="spotlight"
        eyebrow="League"
        title="Active rosters"
        description="Open player pages when there is a real market behind them."
      >
        <DataTable
          columns={columns}
          rows={viewModel.rows}
          getRowKey={(row) => row.id}
          emptyTitle={viewModel.emptyState?.title ?? "No players available"}
          emptyDescription={
            viewModel.emptyState?.description ??
            "The player directory could not be loaded."
          }
        />
      </SectionCard>
    </>
  );
}
