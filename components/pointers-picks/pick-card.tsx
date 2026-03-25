import { ConfidenceIndicator } from "@/components/shared/confidence-indicator";
import { DataCard } from "@/components/shared/data-card";
import { StatRow } from "@/components/shared/stat-row";
import { StatusChip } from "@/components/shared/status-chip";
import { type GameBetPickCardViewModel } from "@/lib/view-models/game-bet-picks";

function getClassificationTone(value: GameBetPickCardViewModel["classification"]) {
  if (value === "Strong Lean") {
    return "success" as const;
  }

  if (value === "Lean") {
    return "accent" as const;
  }

  return "warning" as const;
}

export function PickCard({ pick }: { pick: GameBetPickCardViewModel }) {
  return (
    <DataCard
      variant="feature"
      eyebrow={pick.market}
      title={pick.title}
      subtitle={pick.subtitle}
      description={pick.rationale}
      href={pick.href}
      actionLabel="Open matchup"
      badge={
        <StatusChip
          label={pick.classification}
          tone={getClassificationTone(pick.classification)}
        />
      }
      footer={<ConfidenceIndicator label={pick.confidence} tone={pick.confidenceTone} />}
    >
      <div className="flex flex-wrap gap-2">
        <StatusChip label={pick.source} tone={pick.source === "Live odds" ? "success" : pick.source === "Mock odds" ? "accent" : "danger"} />
        <StatusChip label={pick.matchQuality} tone={pick.matchQuality === "Exact match" ? "success" : pick.matchQuality === "Near match" ? "warning" : "danger"} />
        <StatusChip label={pick.fallback} tone={pick.fallback === "Primary feed" ? "success" : "warning"} />
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-900/8 bg-[#faf8f3] p-4">
          <StatRow label="Line" value={pick.line} detail="Board value" />
        </div>
        <div className="rounded-3xl border border-slate-900/8 bg-[#faf8f3] p-4">
          <StatRow label="Freshness" value={pick.freshness} detail={pick.marketStatus} />
        </div>
        <div className="rounded-3xl border border-slate-900/8 bg-[#faf8f3] p-4">
          <StatRow label="Model lean" value={pick.modelLean} detail={pick.edgeSummary} />
        </div>
        <div className="rounded-3xl border border-slate-900/8 bg-[#faf8f3] p-4">
          <StatRow label="Consensus" value={pick.bettorConsensusLean} detail={pick.marketStatus} />
        </div>
      </div>
    </DataCard>
  );
}
