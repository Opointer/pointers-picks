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
        title="Tonight's slate"
        description="Tip times, odds, and the fastest path into each matchup."
        variant="slate"
        aside={
          <div className="rounded-[24px] border border-[rgba(16,23,23,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--text-soft)]">
              Slate
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{viewModel.slateSummary}</p>
          </div>
        }
      />

      <SectionCard
        variant="spotlight"
        eyebrow="Date"
        title={viewModel.sectionTitle}
        description="Move through the schedule and open the next game."
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
        <div className="mb-6 grid gap-4 rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,253,249,0.9)] p-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--text-soft)]">
              Selected date
            </p>
            <p className="mt-2 text-2xl font-extrabold tracking-[-0.05em] text-[var(--foreground-strong)]">
              {viewModel.selectedDateLabel}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-[rgba(16,23,23,0.08)] bg-[rgba(242,234,223,0.76)] px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-soft)]">
                Slate note
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{viewModel.slateSummary}</p>
            </div>
            <div className="rounded-[18px] border border-[rgba(16,23,23,0.08)] bg-[rgba(216,235,228,0.48)] px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-soft)]">
                Format
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                One board for full slates, light nights, and empty dates.
              </p>
            </div>
          </div>
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
                <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
                  <div className="rounded-[22px] border border-[rgba(16,23,23,0.08)] bg-[rgba(20,52,51,0.95)] px-5 py-4 text-white">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-white/70">
                      Lead matchup
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="h-2 rounded-full bg-white/12">
                        <div className="h-2 w-[74%] rounded-full bg-[var(--accent-gold)]" />
                      </div>
                      <div className="h-2 rounded-full bg-white/12">
                        <div className="h-2 w-[61%] rounded-full bg-[#77c3ba]" />
                      </div>
                      <div className="h-2 rounded-full bg-white/12">
                        <div className="h-2 w-[52%] rounded-full bg-white/70" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      Start with the top game, then work the rest of the board.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {leadGame.markets.map((market) => (
                      <div
                        key={market.label}
                        className="rounded-[18px] border border-[rgba(16,23,23,0.08)] bg-[rgba(242,234,223,0.74)] p-4"
                      >
                        <StatRow label={market.label} value={market.value} detail={market.detail} />
                      </div>
                    ))}
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
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {game.markets.map((market) => (
                        <div
                          key={market.label}
                          className="rounded-[16px] border border-[rgba(16,23,23,0.07)] bg-[rgba(242,234,223,0.76)] p-3"
                        >
                          <StatRow label={market.label} value={market.value} detail={market.detail} />
                        </div>
                      ))}
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
