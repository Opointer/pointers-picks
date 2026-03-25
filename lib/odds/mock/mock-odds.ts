import {
  type GameOdds,
  type PlayerPropFeed,
  type PlayerPropOdds,
  type RawOddsEvent,
} from "@/types/nba";

const timestamp = "2026-03-25T12:00:00.000Z";

export const mockGameOdds: GameOdds[] = [
  {
    gameId: "game-1",
    homeTeamId: "bos",
    awayTeamId: "nyk",
    spread: {
      home: { marketType: "spread", line: -4.5, direction: "home", sportsbook: "mockbook", timestamp, openLine: -3.5 },
      away: { marketType: "spread", line: 4.5, direction: "away", sportsbook: "mockbook", timestamp, openLine: 3.5 },
    },
    moneyline: {
      home: { marketType: "moneyline", line: -180, direction: "home", sportsbook: "mockbook", timestamp, openLine: -165 },
      away: { marketType: "moneyline", line: 155, direction: "away", sportsbook: "mockbook", timestamp, openLine: 145 },
    },
    total: {
      over: { marketType: "total", line: 229.5, direction: "over", sportsbook: "mockbook", timestamp, openLine: 227.5 },
      under: { marketType: "total", line: 229.5, direction: "under", sportsbook: "mockbook", timestamp, openLine: 227.5 },
    },
  },
  {
    gameId: "game-2",
    homeTeamId: "den",
    awayTeamId: "dal",
    spread: {
      home: { marketType: "spread", line: -3.5, direction: "home", sportsbook: "mockbook", timestamp, openLine: -2.5 },
      away: { marketType: "spread", line: 3.5, direction: "away", sportsbook: "mockbook", timestamp, openLine: 2.5 },
    },
    moneyline: {
      home: { marketType: "moneyline", line: -150, direction: "home", sportsbook: "mockbook", timestamp, openLine: -140 },
      away: { marketType: "moneyline", line: 130, direction: "away", sportsbook: "mockbook", timestamp, openLine: 120 },
    },
    total: {
      over: { marketType: "total", line: 234.5, direction: "over", sportsbook: "mockbook", timestamp, openLine: 232.5 },
      under: { marketType: "total", line: 234.5, direction: "under", sportsbook: "mockbook", timestamp, openLine: 232.5 },
    },
  },
  {
    gameId: "game-3",
    homeTeamId: "okc",
    awayTeamId: "lal",
    spread: {
      home: { marketType: "spread", line: -6.0, direction: "home", sportsbook: "mockbook", timestamp, openLine: -5.0 },
      away: { marketType: "spread", line: 6.0, direction: "away", sportsbook: "mockbook", timestamp, openLine: 5.0 },
    },
    moneyline: {
      home: { marketType: "moneyline", line: -220, direction: "home", sportsbook: "mockbook", timestamp, openLine: -205 },
      away: { marketType: "moneyline", line: 185, direction: "away", sportsbook: "mockbook", timestamp, openLine: 170 },
    },
    total: {
      over: { marketType: "total", line: 229.5, direction: "over", sportsbook: "mockbook", timestamp, openLine: 227.5 },
      under: { marketType: "total", line: 229.5, direction: "under", sportsbook: "mockbook", timestamp, openLine: 227.5 },
    },
  },
];

export const mockPlayerPropOdds: PlayerPropOdds[] = [
  {
    gameId: "game-1",
    playerId: "bos-1",
    marketType: "player_points",
    over: { marketType: "player_points", line: 28.5, direction: "over", sportsbook: "mockbook", timestamp, openLine: 27.5 },
    under: { marketType: "player_points", line: 28.5, direction: "under", sportsbook: "mockbook", timestamp, openLine: 27.5 },
  },
  {
    gameId: "game-2",
    playerId: "dal-1",
    marketType: "player_assists",
    over: { marketType: "player_assists", line: 8.5, direction: "over", sportsbook: "mockbook", timestamp, openLine: 8.0 },
    under: { marketType: "player_assists", line: 8.5, direction: "under", sportsbook: "mockbook", timestamp, openLine: 8.0 },
  },
  {
    gameId: "game-2",
    playerId: "dal-1",
    marketType: "player_pra",
    over: { marketType: "player_pra", line: 49.5, direction: "over", sportsbook: "mockbook", timestamp, openLine: 48.5 },
    under: { marketType: "player_pra", line: 49.5, direction: "under", sportsbook: "mockbook", timestamp, openLine: 48.5 },
  },
];

const mockRawPropEvents: RawOddsEvent[] = [
  {
    id: "mock-event-1",
    commence_time: "2026-03-26T00:30:00.000Z",
    home_team: "Boston Celtics",
    away_team: "New York Knicks",
    bookmakers: [
      {
        key: "mockbook",
        title: "Mockbook",
        last_update: timestamp,
        markets: [
          {
            key: "player_points",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Jayson Tatum", price: -115, point: 28.5 },
              { name: "Under", description: "Jayson Tatum", price: -105, point: 28.5 },
              { name: "Over", description: "Jalen Brunson", price: -110, point: 29.5 },
              { name: "Under", description: "Jalen Brunson", price: -110, point: 29.5 },
            ],
          },
          {
            key: "player_rebounds",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Jayson Tatum", price: -108, point: 8.5 },
              { name: "Under", description: "Jayson Tatum", price: -112, point: 8.5 },
            ],
          },
          {
            key: "player_assists",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Jayson Tatum", price: -102, point: 5.5 },
            ],
          },
          {
            key: "player_points_rebounds_assists",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Jayson Tatum", price: -118, point: 41.5 },
              { name: "Under", description: "Jayson Tatum", price: -102, point: 41.5 },
            ],
          },
        ],
      },
      {
        key: "altbook",
        title: "Altbook",
        last_update: timestamp,
        markets: [
          {
            key: "player_points",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Jayson Tatum", price: -120, point: 29.0 },
              { name: "Under", description: "Jayson Tatum", price: 100, point: 29.0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "mock-event-2",
    commence_time: "2026-03-26T02:00:00.000Z",
    home_team: "Denver Nuggets",
    away_team: "Dallas Mavericks",
    bookmakers: [
      {
        key: "mockbook",
        title: "Mockbook",
        last_update: timestamp,
        markets: [
          {
            key: "player_assists",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Luka Doncic", price: -112, point: 8.5 },
              { name: "Under", description: "Luka Doncic", price: -108, point: 8.5 },
              { name: "Over", description: "Nikola Jokic", price: -105, point: 9.5 },
              { name: "Under", description: "Nikola Jokic", price: -115, point: 9.5 },
            ],
          },
          {
            key: "player_points_rebounds_assists",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Luka Doncic", price: -110, point: 49.5 },
              { name: "Under", description: "Luka Doncic", price: -110, point: 49.5 },
            ],
          },
        ],
      },
      {
        key: "altbook",
        title: "Altbook",
        last_update: timestamp,
        markets: [
          {
            key: "player_assists",
            last_update: timestamp,
            outcomes: [
              { name: "Over", description: "Luka Dončić", price: -118, point: 9.0 },
              { name: "Under", description: "Luka Dončić", price: -102, point: 9.0 },
            ],
          },
        ],
      },
    ],
  },
];

export const mockPlayerPropFeed: PlayerPropFeed = {
  fetchMeta: {
    source: "mock",
    fetchedAt: timestamp,
    fallbackUsed: false,
  },
  events: mockRawPropEvents,
  matchedEvents: [
    { externalEventId: "mock-event-1", gameId: "game-1" },
    { externalEventId: "mock-event-2", gameId: "game-2" },
  ],
  warnings: [],
};
