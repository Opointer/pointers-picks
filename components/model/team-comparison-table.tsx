import { type TeamComparisonRow } from "@/types/nba";

function winnerClass(winner: "home" | "away" | "tie"): string {
  if (winner === "home") {
    return "text-emerald-300";
  }

  if (winner === "away") {
    return "text-sky-300";
  }

  return "text-slate-300";
}

export function TeamComparisonTable({
  comparisons,
  homeLabel,
  awayLabel,
}: {
  comparisons: TeamComparisonRow[];
  homeLabel: string;
  awayLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-xl font-semibold text-white">Side-by-Side Team Comparison</h2>
        <p className="mt-2 text-sm text-slate-300">
          This table shows the human-readable team stats behind the model output.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">{homeLabel}</th>
              <th className="px-5 py-4">{awayLabel}</th>
              <th className="px-5 py-4">Winner</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comparison) => (
              <tr key={comparison.key} className="border-t border-white/5 text-sm text-slate-200">
                <td className="px-5 py-4 font-semibold text-white">{comparison.label}</td>
                <td className="px-5 py-4">{comparison.homeValue.toFixed(1)}</td>
                <td className="px-5 py-4">{comparison.awayValue.toFixed(1)}</td>
                <td className={`px-5 py-4 font-medium ${winnerClass(comparison.winner)}`}>
                  {comparison.winner === "tie"
                    ? "Even"
                    : comparison.winner === "home"
                      ? homeLabel
                      : awayLabel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
