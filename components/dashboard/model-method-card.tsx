export function ModelMethodCard() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-8">
      <p className="text-sm uppercase tracking-[0.28em] text-slate-300">How The Model Works</p>
      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
        <p>
          Phase 2 keeps the model explainable by extending the Phase 1 factors with home and away
          splits, configurable last-N form, and a clamped consistency score.
        </p>
        <p>
          The weighted matchup score is still normalized, scaled, and then adjusted by an exact +3
          home-court edge after scaling.
        </p>
        <p>
          Confidence and projected scores remain conservative: confidence is capped at 75 and the
          score-range adjustment from edge is capped at plus or minus 8 points.
        </p>
      </div>
    </section>
  );
}
