import { formatRecord } from "@/lib/utils/format";
import { type TeamDetailResponse } from "@/types/nba";

export function TeamSummaryCard({ detail }: { detail: TeamDetailResponse }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <p className="text-sm uppercase tracking-[0.26em] text-amber-300">{detail.team.conference}</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        {detail.team.city} {detail.team.name}
      </h1>
      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <article className="rounded-3xl border border-white/10 bg-white/6 p-4">
          <p className="text-sm text-slate-400">Record</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatRecord(detail.stats.wins, detail.stats.losses)}
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/6 p-4">
          <p className="text-sm text-slate-400">PPG</p>
          <p className="mt-2 text-2xl font-semibold text-white">{detail.stats.pointsPerGame.toFixed(1)}</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/6 p-4">
          <p className="text-sm text-slate-400">Allowed</p>
          <p className="mt-2 text-2xl font-semibold text-white">{detail.stats.pointsAllowedPerGame.toFixed(1)}</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/6 p-4">
          <p className="text-sm text-slate-400">Off Rtg</p>
          <p className="mt-2 text-2xl font-semibold text-white">{detail.stats.offensiveRating.toFixed(1)}</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/6 p-4">
          <p className="text-sm text-slate-400">Def Rtg</p>
          <p className="mt-2 text-2xl font-semibold text-white">{detail.stats.defensiveRating.toFixed(1)}</p>
        </article>
      </div>
    </section>
  );
}
