import { formatSignedNumber } from "@/lib/utils/format";
import { type ModelFactorContribution } from "@/types/nba";

function getRowClass(advantage: "home" | "away" | "tie"): string {
  if (advantage === "home") {
    return "text-emerald-300";
  }

  if (advantage === "away") {
    return "text-sky-300";
  }

  return "text-slate-300";
}

export function FactorComparisonTable({
  factors,
  homeLabel,
  awayLabel,
}: {
  factors: ModelFactorContribution[];
  homeLabel: string;
  awayLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-xl font-semibold text-white">Factor Contribution Table</h2>
        <p className="mt-2 text-sm text-slate-300">
          Each factor shows the raw value used by the model and the numeric contribution it adds.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Factor</th>
              <th className="px-5 py-4">{homeLabel} Value</th>
              <th className="px-5 py-4">{awayLabel} Value</th>
              <th className="px-5 py-4">{homeLabel} Contribution</th>
              <th className="px-5 py-4">{awayLabel} Contribution</th>
              <th className="px-5 py-4">Category Edge</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((factor) => (
              <tr key={factor.key} className="border-t border-white/5 text-sm text-slate-200">
                <td className="px-5 py-4 font-semibold text-white">{factor.label}</td>
                <td className="px-5 py-4">{factor.homeValue.toFixed(1)}</td>
                <td className="px-5 py-4">{factor.awayValue.toFixed(1)}</td>
                <td className="px-5 py-4">{formatSignedNumber(factor.homeContribution)}</td>
                <td className="px-5 py-4">{formatSignedNumber(factor.awayContribution)}</td>
                <td className={`px-5 py-4 font-medium ${getRowClass(factor.advantage)}`}>
                  {factor.advantage === "tie"
                    ? "Even"
                    : factor.advantage === "home"
                      ? `${homeLabel} leads`
                      : `${awayLabel} leads`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
