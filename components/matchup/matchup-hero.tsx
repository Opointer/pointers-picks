import { type MatchupAnalysisResponse } from "@/types/nba";

export function MatchupHero({ analysis }: { analysis: MatchupAnalysisResponse }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Matchup Analysis</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        {analysis.matchup.awayTeam.team.city} at {analysis.matchup.homeTeam.team.city}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{analysis.model.summary}</p>
    </section>
  );
}
