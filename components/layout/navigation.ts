export interface NavigationItem {
  href: string;
  label: string;
}

export const primaryNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/games", label: "Games" },
  { href: "/props", label: "Props" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/system-status", label: "Status" },
];
