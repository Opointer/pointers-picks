import { formatSignedNumber } from "@/lib/utils/format";
import { type MatchupAnalysisResponse } from "@/types/nba";

export function RecentFormComparison({ analysis }: { analysis: MatchupAnalysisResponse }) {
  const home = analysis.matchup.homeTeam;
  const away = analysis.matchup.awayTeam;

  return (
    <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/6 p-6 md:grid-cols-2">
      <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
        <p className="text-sm text-slate-400">{home.team.abbreviation} Recent Form</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatSignedNumber(home.trend.recentFormAverage)}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Trend {formatSignedNumber(home.trend.trendDelta)} | Consistency {home.trend.consistencyScore.toFixed(2)}
        </p>
      </article>
      <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
        <p className="text-sm text-slate-400">{away.team.abbreviation} Recent Form</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatSignedNumber(away.trend.recentFormAverage)}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Trend {formatSignedNumber(away.trend.trendDelta)} | Consistency {away.trend.consistencyScore.toFixed(2)}
        </p>
      </article>
    </section>
  );
}
