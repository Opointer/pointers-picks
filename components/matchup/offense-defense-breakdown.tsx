import { type MatchupAnalysisResponse } from "@/types/nba";

export function OffenseDefenseBreakdown({ analysis }: { analysis: MatchupAnalysisResponse }) {
  const home = analysis.matchup.homeTeam;
  const away = analysis.matchup.awayTeam;

  return (
    <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/6 p-6 md:grid-cols-2">
      <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
        <h2 className="text-xl font-semibold text-white">{home.team.abbreviation} Profile</h2>
        <p className="mt-3 text-sm text-slate-300">
          Offense {home.stats.offensiveRating.toFixed(1)} | Defense {home.stats.defensiveRating.toFixed(1)} | Pace {home.stats.pace.toFixed(1)}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Home PPG {home.stats.homePointsPerGame.toFixed(1)} | Home Allowed {home.stats.homePointsAllowedPerGame.toFixed(1)}
        </p>
      </article>
      <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
        <h2 className="text-xl font-semibold text-white">{away.team.abbreviation} Profile</h2>
        <p className="mt-3 text-sm text-slate-300">
          Offense {away.stats.offensiveRating.toFixed(1)} | Defense {away.stats.defensiveRating.toFixed(1)} | Pace {away.stats.pace.toFixed(1)}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Away PPG {away.stats.awayPointsPerGame.toFixed(1)} | Away Allowed {away.stats.awayPointsAllowedPerGame.toFixed(1)}
        </p>
      </article>
    </section>
  );
}
