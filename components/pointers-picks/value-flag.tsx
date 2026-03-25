export function ValueFlag({
  valueFlag,
  expectedValue,
}: {
  valueFlag?: boolean;
  expectedValue?: number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
      {valueFlag ? "Positive EV" : "No EV"} {expectedValue !== undefined ? `| EV ${expectedValue.toFixed(3)}` : ""}
    </div>
  );
}
