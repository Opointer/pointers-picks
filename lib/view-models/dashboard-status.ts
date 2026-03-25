import {
  getPlatformStatusViewModel,
  type PlatformStatusViewModel,
} from "@/lib/view-models/platform-status";

export interface DashboardStatusViewModel {
  title: string;
  description: string;
  chips: PlatformStatusViewModel["providerChip"][];
  warnings: string[];
}

export async function getDashboardStatusViewModel(): Promise<DashboardStatusViewModel> {
  const status = await getPlatformStatusViewModel();

  return {
    title: "Feed status",
    description:
      "Live source, freshness, and coverage stay visible before you move into the slate.",
    chips: [status.providerChip, status.freshnessChip, status.fallbackChip],
    warnings: status.warnings,
  };
}
