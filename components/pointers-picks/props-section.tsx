import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { type GameBetPicksPageViewModel } from "@/lib/view-models/game-bet-picks";

export function PropsSection({
  placeholder,
}: {
  placeholder: GameBetPicksPageViewModel["propsPlaceholder"];
}) {
  return (
    <SectionCard
      variant="dense"
      eyebrow="Player Props"
      title={placeholder.title}
      description={placeholder.description}
    >
      <div className="flex flex-wrap gap-2">
        {placeholder.chips.map((chip) => (
          <StatusChip key={`${chip.label}-${chip.tone}`} label={chip.label} tone={chip.tone} />
        ))}
      </div>
      <div className="mt-5">
        <EmptyState
          compact
          title="Props are tracked separately"
          description="Player props now have their own hub and player pages. This board stays focused on game markets until the props board is ready."
        />
      </div>
    </SectionCard>
  );
}
