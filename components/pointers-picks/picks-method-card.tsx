import { StatRow } from "@/components/shared/stat-row";

export function PicksMethodCard() {
  return (
    <section className="rounded-[28px] border border-slate-900/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,239,0.93))] p-6 shadow-[0_16px_32px_rgba(15,23,42,0.05)] sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-700">Method</p>
      <h2 className="mt-3 text-[1.55rem] font-semibold tracking-[-0.03em] text-slate-950">How the board is built</h2>
      <div className="mt-5 rounded-[22px] border border-slate-900/8 bg-white/78 p-5">
        <StatRow
          label="Game bets"
          value="Live"
          detail="Spreads, totals, and capped moneyline checks flow into the board through the game-bet path."
        />
        <StatRow
          label="Trust metadata"
          value="Visible"
          detail="Source, freshness, fallback state, match quality, and pass reasons stay on the surface."
        />
        <StatRow
          label="Player props"
          value="Isolated"
          detail="Player props stay on their own pages until the prop scoring path is stable enough to reconnect."
        />
      </div>
    </section>
  );
}
