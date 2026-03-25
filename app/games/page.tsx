import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataCard } from "@/components/shared/data-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatRow } from "@/components/shared/stat-row";
import { StatusChip } from "@/components/shared/status-chip";
import { getGamesPageViewModel } from "@/lib/view-models/games-page";

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const viewModel = await getGamesPageViewModel(date);
  const leadGame = viewModel.cards[0];
  const remainingGames = viewModel.cards.slice(1);

  return (
    <>
      <PageHeader
        eyebrow="Games"
        title="Daily slate"
        description="Browse the full board by date, keep tip times and market context tight, and move into matchup pages without losing the feed state."
        variant="slate"
        aside={
          <div className="rounded-[24px] border border-[rgba(17,25,24,0.08)] bg-[rgba(255,252,247,0.78)] px-5 py-4 shadow-[0_8px_18px_rgba(17,25,24,0.03)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--text-soft)]">
              Slate note
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {viewModel.slateSummary}
            </p>
          </div>
        }
      />
      <SectionCard
        variant="spotlight"
        eyebrow="Date view"
        title={viewModel.sectionTitle}
        description="A clean slate browser for light nights, crowded boards, and delayed markets."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={viewModel.previousHref} className="ui-button">
              Previous day
            </Link>
            <Link href={viewModel.todayHref} className="ui-button ui-button-accent">
              Today
            </Link>
            <Link href={viewModel.nextHref} className="ui-button">
              Next day
            </Link>
          </div>
        }
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-[rgba(17,25,24,0.08)] bg-[rgba(255,253,249,0.86)] px-5 py-4">
          <p className="text-sm font-semibold text-slate-800">{viewModel.selectedDateLabel}</p>
          <p className="text-sm text-[var(--text-muted)]">{viewModel.slateSummary}</p>
        </div>
        {viewModel.cards.length === 0 && viewModel.emptyState ? (
          <EmptyState title={viewModel.emptyState.title} description={viewModel.emptyState.description} />
        ) : (
          <div className="space-y-5">
            {leadGame ? (
              <DataCard
                key={leadGame.id}
                variant="feature"
                href={leadGame.href}
                eyebrow={leadGame.time}
                title={leadGame.title}
                description={leadGame.description}
                badge={<StatusChip label={leadGame.statusChip.label} tone={leadGame.statusChip.tone} />}
                actionLabel="Open matchup"
                footer={<p className="text-sm leading-6 text-[var(--text-soft)]">{leadGame.statusSummary}</p>}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.76)] p-3">
                    <StatRow
                      label={leadGame.markets[0].label}
                      value={leadGame.markets[0].value}
                      detail={leadGame.markets[0].detail}
                    />
                  </div>
                  <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.76)] p-3">
                    <StatRow
                      label={leadGame.markets[1].label}
                      value={leadGame.markets[1].value}
                      detail={leadGame.markets[1].detail}
                    />
                  </div>
                  <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.76)] p-3">
                    <StatRow
                      label={leadGame.markets[2].label}
                      value={leadGame.markets[2].value}
                      detail={leadGame.markets[2].detail}
                    />
                  </div>
                </div>
              </DataCard>
            ) : null}
            <div className="grid gap-4 xl:grid-cols-3">
              {remainingGames.map((game) => (
              <DataCard
                key={game.id}
                variant="compact"
                href={game.href}
                eyebrow={game.time}
                title={game.title}
                description={game.description}
                badge={<StatusChip label={game.statusChip.label} tone={game.statusChip.tone} />}
                actionLabel="Open matchup"
                footer={<p className="text-sm leading-6 text-[var(--text-soft)]">{game.statusSummary}</p>}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.76)] p-3">
                    <StatRow
                      label={game.markets[0].label}
                      value={game.markets[0].value}
                      detail={game.markets[0].detail}
                    />
                  </div>
                  <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.76)] p-3">
                    <StatRow
                      label={game.markets[1].label}
                      value={game.markets[1].value}
                      detail={game.markets[1].detail}
                    />
                  </div>
                  <div className="rounded-[16px] border border-[rgba(17,25,24,0.07)] bg-[rgba(243,235,222,0.76)] p-3">
                    <StatRow
                      label={game.markets[2].label}
                      value={game.markets[2].value}
                      detail={game.markets[2].detail}
                    />
                  </div>
                </div>
              </DataCard>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </>
  );
}
