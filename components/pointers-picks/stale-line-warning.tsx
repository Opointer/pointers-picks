export function StaleLineWarning({ show }: { show?: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
      The market moved against this side, so the edge was reduced before the pick was classified.
    </p>
  );
}
