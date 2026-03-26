import { getDashboardStatusViewModel, type DashboardStatusViewModel } from "@/lib/view-models/dashboard-status";
import { getGamesPageViewModel } from "@/lib/view-models/games-page";
import { getPropsIndexViewModel } from "@/lib/view-models/props-index";
import { toCentralDateKey } from "@/lib/view-models/date-controls";

export interface DashboardMetricViewModel {
  label: string;
  value: string;
  detail: string;
}

export interface DashboardCardViewModel {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
}

export interface DashboardOverviewViewModel {
  metrics: DashboardMetricViewModel[];
  leadGame?: DashboardCardViewModel;
  slateCards: DashboardCardViewModel[];
  propCards: DashboardCardViewModel[];
  trust: DashboardStatusViewModel;
  emptyState?: {
    title: string;
    description: string;
  };
}

export async function getDashboardOverviewViewModel(): Promise<DashboardOverviewViewModel> {
  const today = toCentralDateKey(new Date());
  const [trust, games, props] = await Promise.all([
    getDashboardStatusViewModel(),
    getGamesPageViewModel(today),
    getPropsIndexViewModel(today),
  ]);

  return {
    metrics: [
      {
        label: "Games tonight",
        value: `${games.cards.length}`,
        detail: games.cards.length > 0 ? "Board is up tonight." : "No games tonight.",
      },
      {
        label: "Props pages",
        value: `${props.players.length}`,
        detail: props.players.length > 0 ? "Posted player pages are up." : "No posted player pages yet.",
      },
      {
        label: "Feed state",
        value: trust.chips[0]?.label ?? "Unavailable",
        detail: trust.description,
      },
    ],
    leadGame: games.cards[0]
      ? {
          id: games.cards[0].id,
          title: games.cards[0].title,
          subtitle: games.cards[0].time,
          description: games.cards[0].description,
          href: games.cards[0].href,
        }
      : undefined,
    slateCards: games.cards.slice(0, 4).map((card) => ({
      id: card.id,
      title: card.title,
      subtitle: card.time,
      description: card.statusSummary,
      href: card.href,
    })),
    propCards: props.players.slice(0, 4).map((card) => ({
      id: card.id,
      title: card.title,
      subtitle: card.subtitle,
      description: card.detail,
      href: card.href,
    })),
    trust,
    emptyState:
      games.cards.length === 0 && props.players.length === 0
        ? {
            title: "Nothing on tonight",
            description: "There are no games or posted player pages to feature right now.",
          }
        : undefined,
  };
}
