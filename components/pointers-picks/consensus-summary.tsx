export function ConsensusSummary({
  supportingBettors,
  totalConsensusWeight,
}: {
  supportingBettors: number;
  totalConsensusWeight: number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
      {supportingBettors} tracked bettors | weighted support {totalConsensusWeight.toFixed(2)}
    </div>
  );
}
