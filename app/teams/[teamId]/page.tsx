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
      />
      <div className="space-y-6">
        <SectionCard
          variant="spotlight"
          eyebrow="Profile"
          title="Team snapshot"
          description="Start with the profile that matters most: record, efficiency, and pace."
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
          description={viewModel.marketOverlay.description}
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
