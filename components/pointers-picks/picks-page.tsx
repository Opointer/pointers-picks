import { PicksMethodCard } from "@/components/pointers-picks/picks-method-card";
import { PicksSection } from "@/components/pointers-picks/picks-section";
import { PropsSection } from "@/components/pointers-picks/props-section";
import { DataCard } from "@/components/shared/data-card";
import { SectionCard } from "@/components/shared/section-card";
import { StatusChip } from "@/components/shared/status-chip";
import { type GameBetPicksPageViewModel } from "@/lib/view-models/game-bet-picks";

export function PicksPage({ viewModel }: { viewModel: GameBetPicksPageViewModel }) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-4">
        {viewModel.summaryCards.map((card) => (
          <DataCard
            key={card.eyebrow}
            variant="stat"
            eyebrow={card.eyebrow}
            title={card.title}
            description={card.description}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <PicksMethodCard />
        <SectionCard
          variant="dense"
          eyebrow="Trust rail"
          title={viewModel.systemState.title}
          description={viewModel.systemState.description}
        >
          <div className="flex flex-wrap gap-2">
            {viewModel.systemState.chips.map((chip) => (
              <StatusChip key={`${chip.label}-${chip.tone}`} label={chip.label} tone={chip.tone} />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {viewModel.systemState.warnings.map((warning) => (
              <div
                key={warning}
                className="rounded-[20px] border border-slate-900/8 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600"
              >
                {warning}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <PicksSection
        title="Game Bets"
        description="These markets still have enough support and clean enough context to stay on the board."
        picks={viewModel.gameBets.active}
        emptyTitle="No qualified game bets right now"
        emptyDescription="The current slate does not have a game market that cleared the board cleanly enough to show here."
        variant="default"
      />
      <PicksSection
        title="Filtered or passed"
        description="These markets are still visible so the board explains what dropped out and why."
        picks={viewModel.gameBets.passed}
        emptyTitle="No passed game markets to review"
        emptyDescription="Every available market that cleared the board is already shown in the qualified section above."
        variant="dense"
      />
      <PropsSection placeholder={viewModel.propsPlaceholder} />
    </div>
  );
}
