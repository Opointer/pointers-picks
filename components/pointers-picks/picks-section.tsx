import { EmptyState } from "@/components/shared/empty-state";
import { PickCard } from "@/components/pointers-picks/pick-card";
import { SectionCard } from "@/components/shared/section-card";
import { type GameBetPickCardViewModel } from "@/lib/view-models/game-bet-picks";

export function PicksSection({
  title,
  picks,
  description,
  emptyTitle,
  emptyDescription,
  variant = "default",
}: {
  title: string;
  picks: GameBetPickCardViewModel[];
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  variant?: "default" | "dense";
}) {
  return (
    <SectionCard
      variant={variant === "dense" ? "dense" : "default"}
      eyebrow={title}
      title={title}
      description={description}
    >
      {picks.length === 0 ? (
        <EmptyState
          title={emptyTitle ?? `No active ${title.toLowerCase()} right now`}
          description={
            emptyDescription ??
            "Signals are either too weak or conflicting, so the board is correctly staying selective."
          }
        />
      ) : (
        <div className="grid gap-4">
          {picks.map((pick) => (
            <PickCard key={pick.id} pick={pick} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
