export interface MockStatusSummary {
  provider: string;
  freshness: string;
  fallback: string;
  warnings: string[];
}

export interface MockMetric {
  label: string;
  value: string;
  detail: string;
}

export interface MockSignalCard {
  id: string;
  title: string;
  subtitle: string;
  market: string;
  line: string;
  source: string;
  matchQuality: string;
  confidence: string;
  classification: string;
  rationale: string;
  href?: string;
}

export interface MockGameCard {
  id: string;
  title: string;
  tip: string;
  time: string;
  spread: string;
  total: string;
  moneyline: string;
  href: string;
}

export interface MockTableRow {
  primary: string;
  secondary: string;
  values: string[];
  href?: string;
  id?: string;
}

export interface MockMatchupPageData {
  title: string;
  subtitle: string;
  summary: string;
  marketStrip: MockMetric[];
  factors: MockMetric[];
  relatedProps: MockSignalCard[];
}

export interface MockPropsPageData {
  title: string;
  subtitle: string;
  summary: string;
  availableMarkets: MockMetric[];
  reliability: MockMetric[];
  notes: string[];
}

export const platformStatus: MockStatusSummary = {
  provider: "Mock foundation",
  freshness: "Static demo content",
  fallback: "No live dependency",
  warnings: [
    "This reset intentionally removes live odds and backend dependencies from the rendered app.",
    "Player props are placeholders until the component system and data contracts are rebuilt.",
  ],
};

export const dashboardMetrics: MockMetric[] = [
  { label: "Tonight's strongest edges", value: "3", detail: "Static examples for layout review" },
  { label: "Playable props", value: "2", detail: "Placeholder cards with trust states" },
  { label: "Trust status", value: "Stable", detail: "UI renders without API calls" },
  { label: "System mode", value: "UI First", detail: "No live data in the page layer" },
];

export const featuredGame: MockGameCard = {
  id: "game-1",
  title: "Knicks at Celtics",
  tip: "Boston still grades above the number, but the margin is tight enough that context matters.",
  time: "Thu 7:30 PM CT",
  spread: "BOS -4.5",
  total: "229.5",
  moneyline: "BOS -180",
  href: "/matchup/bos/nyk",
};

export const topGameSignals: MockSignalCard[] = [
  {
    id: "game-signal-1",
    title: "Celtics spread lean",
    subtitle: "Knicks at Celtics",
    market: "Spread",
    line: "BOS -4.5",
    source: "Mock board",
    matchQuality: "Exact",
    confidence: "Measured",
    classification: "Lean",
    rationale: "Boston still sits above the current number, but the layout keeps the explanation restrained and trust-first.",
    href: "/matchup/bos/nyk",
  },
  {
    id: "game-signal-2",
    title: "Nuggets moneyline watch",
    subtitle: "Mavericks at Nuggets",
    market: "Moneyline",
    line: "DEN -150",
    source: "Mock board",
    matchQuality: "Exact",
    confidence: "Capped",
    classification: "Watchlist",
    rationale: "Use this card to prototype moneyline trust language without implying a live edge.",
    href: "/matchup/den/dal",
  },
  {
    id: "game-signal-3",
    title: "Thunder total review",
    subtitle: "Lakers at Thunder",
    market: "Total",
    line: "229.5",
    source: "Mock board",
    matchQuality: "Near",
    confidence: "Reduced",
    classification: "Pass",
    rationale: "This example exists to show a clear pass reason when line quality or context is weak.",
    href: "/matchup/okc/lal",
  },
];

export const topPropSignals: MockSignalCard[] = [
  {
    id: "prop-signal-1",
    title: "Jayson Tatum points",
    subtitle: "Boston vs New York",
    market: "Player points",
    line: "28.5",
    source: "Mock board",
    matchQuality: "Exact",
    confidence: "Capped",
    classification: "Watchlist",
    rationale: "This placeholder card proves the props surface can read clearly before the live props pipeline is rebuilt.",
    href: "/props/game-1/bos-1",
  },
  {
    id: "prop-signal-2",
    title: "Luka Doncic assists",
    subtitle: "Dallas at Denver",
    market: "Player assists",
    line: "9.0",
    source: "Mock board",
    matchQuality: "Near",
    confidence: "Reduced",
    classification: "Pass",
    rationale: "Use this layout to show how prop markets communicate unavailable or downgraded trust states.",
    href: "/props/game-2/dal-1",
  },
];

export const gamesList: MockGameCard[] = [
  featuredGame,
  {
    id: "game-2",
    title: "Mavericks at Nuggets",
    tip: "Denver owns the cleaner profile, but this page is now presentation-only.",
    time: "Thu 9:00 PM CT",
    spread: "DEN -3.5",
    total: "234.5",
    moneyline: "DEN -150",
    href: "/matchup/den/dal",
  },
  {
    id: "game-3",
    title: "Lakers at Thunder",
    tip: "A higher-volatility spot that should read as a pass until live confidence logic returns.",
    time: "Fri 8:00 PM CT",
    spread: "OKC -6.0",
    total: "229.5",
    moneyline: "OKC -220",
    href: "/matchup/okc/lal",
  },
];

export const teamRows: MockTableRow[] = [
  { id: "bos", primary: "Boston Celtics", secondary: "East • 53-21", values: ["118.1 PPG", "108.9 PA", "99.6 pace"], href: "/teams/bos" },
  { id: "den", primary: "Denver Nuggets", secondary: "West • 51-23", values: ["117.3 PPG", "111.2 PA", "97.8 pace"], href: "/teams/den" },
  { id: "okc", primary: "Oklahoma City Thunder", secondary: "West • 52-22", values: ["119.2 PPG", "111.0 PA", "101.2 pace"], href: "/teams/okc" },
  { id: "nyk", primary: "New York Knicks", secondary: "East • 48-26", values: ["114.7 PPG", "109.8 PA", "96.8 pace"], href: "/teams/nyk" },
];

export const playerRows: MockTableRow[] = [
  { id: "bos-1", primary: "Jayson Tatum", secondary: "BOS • Forward", values: ["27.3 PPG", "8.4 RPG", "4.9 APG"], href: "/props/game-1/bos-1" },
  { id: "nyk-1", primary: "Jalen Brunson", secondary: "NYK • Guard", values: ["28.6 PPG", "3.7 RPG", "6.5 APG"], href: "/props/game-1/nyk-1" },
  { id: "den-1", primary: "Nikola Jokic", secondary: "DEN • Center", values: ["26.5 PPG", "12.1 RPG", "9.2 APG"], href: "/props/game-2/den-1" },
  { id: "dal-1", primary: "Luka Doncic", secondary: "DAL • Guard", values: ["33.2 PPG", "8.8 RPG", "9.4 APG"], href: "/props/game-2/dal-1" },
];

export const matchupPages: Record<string, MockMatchupPageData> = {
  "bos-nyk": {
    title: "Knicks at Celtics",
    subtitle: "Game detail workspace",
    summary: "Boston still grades as the steadier side in this placeholder matchup, but the page now emphasizes structure, market framing, and trust states over calculation depth.",
    marketStrip: [
      { label: "Spread", value: "BOS -4.5", detail: "Mock board" },
      { label: "Total", value: "229.5", detail: "Mock board" },
      { label: "Moneyline", value: "BOS -180", detail: "Mock board" },
      { label: "Trust", value: "Static", detail: "No live dependency" },
    ],
    factors: [
      { label: "Projected margin", value: "BOS by 5", detail: "Placeholder UI copy" },
      { label: "Recent form", value: "Advantage BOS", detail: "Compact factor card" },
      { label: "Offense vs defense", value: "Slight BOS edge", detail: "Support module" },
      { label: "Line quality", value: "Exact mock match", detail: "Trust-first language" },
    ],
    relatedProps: [topPropSignals[0]],
  },
  "den-dal": {
    title: "Mavericks at Nuggets",
    subtitle: "Game detail workspace",
    summary: "This example is meant to prove layout hierarchy and market packaging before the underlying data contracts are rebuilt.",
    marketStrip: [
      { label: "Spread", value: "DEN -3.5", detail: "Mock board" },
      { label: "Total", value: "234.5", detail: "Mock board" },
      { label: "Moneyline", value: "DEN -150", detail: "Mock board" },
      { label: "Trust", value: "Static", detail: "No live dependency" },
    ],
    factors: [
      { label: "Projected margin", value: "DEN by 4", detail: "Placeholder output" },
      { label: "Recent form", value: "Even", detail: "Keep tone measured" },
      { label: "Offense vs defense", value: "High variance", detail: "Support module" },
      { label: "Line quality", value: "Exact mock match", detail: "Trust-first language" },
    ],
    relatedProps: [topPropSignals[1]],
  },
};

export const propsPages: Record<string, MockPropsPageData> = {
  "game-1:bos-1": {
    title: "Jayson Tatum props",
    subtitle: "Player props analysis workspace",
    summary: "This page is intentionally static. Its job is to establish the structure for prop availability, trust states, and analyst-style explanations before live props return.",
    availableMarkets: [
      { label: "Points", value: "28.5", detail: "Watchlist" },
      { label: "Rebounds", value: "8.5", detail: "Placeholder only" },
      { label: "Assists", value: "5.0", detail: "Placeholder only" },
      { label: "PRA", value: "41.5", detail: "Placeholder only" },
    ],
    reliability: [
      { label: "Source", value: "Mock board", detail: "No live dependency" },
      { label: "Confidence", value: "Reduced", detail: "No scoring engine attached" },
      { label: "Match quality", value: "Exact", detail: "Static placeholder" },
      { label: "Status", value: "UI foundation", detail: "Phase 1 only" },
    ],
    notes: [
      "Use this page to validate card hierarchy, tone, and spacing.",
      "Treat all props as non-actionable placeholders until the prop pipeline is rebuilt.",
    ],
  },
  "game-2:dal-1": {
    title: "Luka Doncic props",
    subtitle: "Player props analysis workspace",
    summary: "This placeholder page demonstrates how unavailable or downgraded markets should read clearly instead of looking broken.",
    availableMarkets: [
      { label: "Assists", value: "9.0", detail: "Pass" },
      { label: "Points", value: "32.5", detail: "Placeholder only" },
      { label: "Rebounds", value: "8.5", detail: "Placeholder only" },
      { label: "PRA", value: "49.5", detail: "Placeholder only" },
    ],
    reliability: [
      { label: "Source", value: "Mock board", detail: "No live dependency" },
      { label: "Confidence", value: "Low", detail: "Downgraded by design" },
      { label: "Match quality", value: "Near", detail: "Example state only" },
      { label: "Status", value: "Needs rebuild", detail: "Prop logic removed from UI" },
    ],
    notes: [
      "Props should explain why they are unavailable, not just disappear.",
      "This route is now a shell for the future component system.",
    ],
  },
};
