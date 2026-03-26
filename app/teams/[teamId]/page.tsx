import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataCard } from "@/components/shared/data-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import {
  getTeamDetailViewModel,
  type TeamDetailTableRowViewModel,
} from "@/lib/view-models/team-detail";

const recentGamesColumns: DataTableColumn<TeamDetailTableRowViewModel>[] = [
  {
    key: "game",
    header: "Game",
    render: (row) => <span className="font-semibold text-slate-950">{row.primary}</span>,
  },
  {
    key: "result",
    header: "Result",
    render: (row) => <span className="text-slate-600">{row.secondary}</span>,
  },
  {
    key: "context",
    header: "Context",
    render: (row) => <span className="text-slate-400">{row.tertiary}</span>,
  },
];

const playerColumns: DataTableColumn<TeamDetailTableRowViewModel>[] = [
  {
    key: "player",
    header: "Player",
    render: (row) => <span className="font-semibold text-slate-950">{row.primary}</span>,
  },
  {
    key: "profile",
    header: "Profile",
    render: (row) => <span className="text-slate-600">{row.secondary}</span>,
  },
  {
    key: "production",
    header: "Notes",
    render: (row) => <span className="text-slate-400">{row.tertiary}</span>,
  },
];

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const viewModel = await getTeamDetailViewModel(teamId).catch(() => null);

  if (!viewModel) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={viewModel.header.eyebrow}
        title={viewModel.header.title}
        description={viewModel.header.description}
        backHref="/teams"
        backLabel="Back to teams"
        variant="detail"
        aside={
          <div className="rounded-[26px] border border-[rgba(16,23,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,247,243,0.78))] px-5 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[var(--text-soft)]">
              Team profile
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Record, trends, roster context, and the next market lane all stay on one page.
            </p>
          </div>
        }
      />
      <div className="space-y-6">
        <SectionCard
          variant="spotlight"
          eyebrow="Profile"
          title="Team snapshot"
          description="Start with the big picture first: record, efficiency, pace, and the overall shape of the team."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {viewModel.summaryCards.map((card) => (
              <DataCard
                key={card.eyebrow}
                variant="stat"
                eyebrow={card.eyebrow}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
          <div className="mt-6 rounded-[22px] border border-[rgba(16,23,23,0.08)] bg-[rgba(20,52,51,0.95)] px-5 py-4 text-white">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/70">
              Profile signal
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="h-2 rounded-full bg-white/12">
                <div className="h-2 w-[66%] rounded-full bg-[var(--accent-gold)]" />
              </div>
              <div className="h-2 rounded-full bg-white/12">
                <div className="h-2 w-[58%] rounded-full bg-[#77c3ba]" />
              </div>
              <div className="h-2 rounded-full bg-white/12">
                <div className="h-2 w-[48%] rounded-full bg-white/70" />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          variant="dense"
          eyebrow="Trends"
          title="Recent profile"
          description="Trend and split context stay visible without taking over the page."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {viewModel.trendCards.map((card) => (
              <DataCard
                key={card.eyebrow}
                variant="compact"
                eyebrow={card.eyebrow}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Market context"
          title={viewModel.marketOverlay.title}
          description="If the next game is on the board, the market context stays attached to the team profile instead of living on a separate route."
          actions={
            <div className="flex flex-wrap gap-2">
              {viewModel.marketOverlay.chips.map((chip) => (
                <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
              ))}
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            {viewModel.marketOverlay.items.map((item) => (
              <DataCard
                key={item.eyebrow}
                variant="compact"
                eyebrow={item.eyebrow}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-[var(--text-soft)]">{viewModel.marketOverlay.note}</p>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            variant="dense"
            eyebrow="Recent games"
            title="Recent results"
            description="A compact read on the last few results and where they happened."
          >
            <DataTable
              columns={recentGamesColumns}
              rows={viewModel.recentGames}
              getRowKey={(row) => row.id}
              emptyTitle="No recent games"
              emptyDescription="Recent-game context is unavailable for this team right now."
            />
          </SectionCard>

          <SectionCard
            variant="dense"
            eyebrow="Core players"
            title="Roster"
            description="Current live roster context for this team."
          >
            <DataTable
              columns={playerColumns}
              rows={viewModel.playerRows}
              getRowKey={(row) => row.id}
              emptyTitle="No player rows"
              emptyDescription="Player summary data is unavailable for this team."
            />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
