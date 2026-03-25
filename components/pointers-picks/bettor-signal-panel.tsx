import { type TrackedBettor } from "@/types/nba";
import { DataCard } from "@/components/shared/data-card";
import { EmptyState } from "@/components/shared/empty-state";

export function BettorSignalPanel({ bettors }: { bettors: TrackedBettor[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(148,163,184,0.03)_100%)] p-6 shadow-[0_24px_72px_rgba(2,6,23,0.30)] backdrop-blur-md sm:p-7">
      <h2 className="text-xl font-semibold text-white">Trust copy placeholder</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        This module stays in the layout so the eventual trust explainer has a stable home. During
        the reset, it avoids scoring claims and simply reinforces how the product should talk about
        uncertainty.
      </p>
      {bettors.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {bettors.map((bettor) => (
            <DataCard key={bettor.id} title={bettor.displayName} subtitle="Tracked bettor placeholder" />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            compact
            title="No tracked bettor cards yet"
            description="Keep this area reserved for future trust methodology, source definitions, and market-status notes."
          />
        </div>
      )}
    </section>
  );
}
