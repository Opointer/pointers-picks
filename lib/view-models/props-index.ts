import {
  formatCentralDateLabel,
  sanitizeDateKey,
  shiftDateKey,
  toCentralDateKey,
} from "@/lib/view-models/date-controls";
import { type PlatformStatusChipViewModel } from "@/lib/view-models/platform-status";
import { getAvailablePlayerPropPages } from "@/lib/services/player-props";

export interface PropsIndexPlayerCardViewModel {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  href: string;
}

export interface PropsIndexViewModel {
  selectedDate: string;
  selectedDateLabel: string;
  todayHref: string;
  previousHref: string;
  nextHref: string;
  summary: string;
  trustChips: PlatformStatusChipViewModel[];
  warnings: string[];
  players: PropsIndexPlayerCardViewModel[];
  emptyState?: {
    title: string;
    description: string;
  };
}

export async function getPropsIndexViewModel(selectedDateParam?: string): Promise<PropsIndexViewModel> {
  const selectedDate = sanitizeDateKey(selectedDateParam) ?? toCentralDateKey(new Date());

  try {
    const result = await getAvailablePlayerPropPages({ selectedDate });
    const players = result.pages.map((page) => ({
      id: page.id,
      title: page.title,
      subtitle: page.subtitle,
      detail: page.detail,
      href: page.href,
    }));

    return {
      selectedDate,
      selectedDateLabel: formatCentralDateLabel(selectedDate),
      todayHref: `/props?date=${toCentralDateKey(new Date())}`,
      previousHref: `/props?date=${shiftDateKey(selectedDate, -1)}`,
      nextHref: `/props?date=${shiftDateKey(selectedDate, 1)}`,
      summary:
        players.length > 0
          ? `${players.length} player market page${players.length === 1 ? "" : "s"} available for ${formatCentralDateLabel(selectedDate)}.`
          : `No player markets are posted for ${formatCentralDateLabel(selectedDate)}.`,
      trustChips: [
        {
          label: result.feedAvailable ? "Live feed" : "Feed unavailable",
          tone: result.feedAvailable ? "success" : "danger",
        },
        {
          label: result.fetchedAt ? "Feed refreshed" : "Feed refresh missing",
          tone: result.fetchedAt ? "neutral" : "warning",
        },
        {
          label: players.length > 0 ? "Player markets live" : "Props not posted",
          tone: players.length > 0 ? "neutral" : "warning",
        },
      ],
      warnings: result.warnings,
      players,
      emptyState:
        players.length === 0
          ? {
              title: "No player markets posted",
              description: "There are no verified player pages to open for this slate yet.",
            }
          : undefined,
    };
  } catch (error) {
    return {
      selectedDate,
      selectedDateLabel: formatCentralDateLabel(selectedDate),
      todayHref: `/props?date=${toCentralDateKey(new Date())}`,
      previousHref: `/props?date=${shiftDateKey(selectedDate, -1)}`,
      nextHref: `/props?date=${shiftDateKey(selectedDate, 1)}`,
      summary: "Player market pages could not be loaded.",
      trustChips: [
        { label: "Feed unavailable", tone: "danger" },
        { label: "Feed refresh missing", tone: "warning" },
        { label: "Props not posted", tone: "warning" },
      ],
      warnings: [
        error instanceof Error
          ? error.message
          : "The props board could not be loaded.",
      ],
      players: [],
      emptyState: {
        title: "Props board unavailable",
        description: "The props board could not be loaded for the selected date.",
      },
    };
  }
}
