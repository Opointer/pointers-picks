import { formatRecord, formatSignedNumber } from "@/lib/utils/format";
import { type TeamDetailResponse } from "@/types/nba";

export function TeamTrendPanel({ detail }: { detail: TeamDetailResponse }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-3xl border border-white/10 bg-white/6 p-6">
        <p className="text-sm text-slate-400">Recent Form</p>
        <p className="mt-2 text-3xl font-semibold text-white">
          {formatSignedNumber(detail.trend.recentFormAverage)}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Average margin over last {detail.trend.lastNGames} completed games.
        </p>
      </article>
      <article className="rounded-3xl border border-white/10 bg-white/6 p-6">
        <p className="text-sm text-slate-400">Trend Delta</p>
        <p className="mt-2 text-3xl font-semibold text-white">
          {formatSignedNumber(detail.trend.trendDelta)}
        </p>
        <p className="mt-2 text-sm text-slate-300">Change from oldest to latest recent game.</p>
      </article>
      <article className="rounded-3xl border border-white/10 bg-white/6 p-6">
        <p className="text-sm text-slate-400">Consistency</p>
        <p className="mt-2 text-3xl font-semibold text-white">{detail.trend.consistencyScore.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-300">
          Home {formatRecord(detail.stats.homeWins, detail.stats.homeLosses)} | Away{" "}
          {formatRecord(detail.stats.awayWins, detail.stats.awayLosses)}
        </p>
      </article>
    </section>
  );
}
