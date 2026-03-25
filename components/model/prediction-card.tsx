import { formatRange } from "@/lib/utils/format";
import { type ModelResponse, type Team } from "@/types/nba";

export function PredictionCard({
  prediction,
  homeTeam,
  awayTeam,
}: {
  prediction: ModelResponse;
  homeTeam: Team;
  awayTeam: Team;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl shadow-slate-950/20">
      <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Prediction Output</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white/6 p-5">
          <p className="text-sm text-slate-400">Projected winner</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {prediction.winner.city} {prediction.winner.name}
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/6 p-5">
          <p className="text-sm text-slate-400">Confidence</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {prediction.confidence.level} ({prediction.confidence.score}%)
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/6 p-5">
          <p className="text-sm text-slate-400">Projected score range</p>
          <p className="mt-2 text-sm font-medium leading-7 text-slate-100">
            {awayTeam.abbreviation}: {formatRange(prediction.projectedScoreRange.away)}
            <br />
            {homeTeam.abbreviation}: {formatRange(prediction.projectedScoreRange.home)}
          </p>
        </article>
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300">{prediction.summary}</p>
      {prediction.meta ? (
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          Model {prediction.meta.modelVersion} | Inputs: {prediction.meta.inputsUsed.join(", ")} | Last N: {prediction.meta.lastNGames}
        </p>
      ) : null}
    </section>
  );
}
