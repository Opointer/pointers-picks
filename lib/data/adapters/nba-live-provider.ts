import { buildBacktestSummary } from "@/lib/model/backtest";
import { MODEL_CONFIG } from "@/lib/model/constants";
import { type DataProvider } from "@/lib/data/provider";
import { buildMatchupAnalysis } from "@/lib/selectors/matchup-details";
import { buildTeamDetail, buildTeamTrendSnapshot } from "@/lib/selectors/team-details";
import {
  type BacktestSummary,
  type Game,
  type HistoricalGame,
  type MatchupAnalysisResponse,
  type MatchupContext,
  type Player,
  type Team,
  type TeamDetailResponse,
  type TeamStats,
  type TeamTrendSnapshot,
} from "@/types/nba";

const ESPN_BASE_URL =
  process.env.NBA_DATA_BASE_URL ??
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba";
const CACHE_TTL_MS = Number(process.env.NBA_DATA_CACHE_MS ?? 1000 * 60 * 30);

const EASTERN_ABBREVIATIONS = new Set([
  "ATL",
  "BOS",
  "BKN",
  "CHA",
  "CHI",
  "CLE",
  "DET",
  "IND",
  "MIA",
  "MIL",
  "NY",
  "ORL",
  "PHI",
  "TOR",
  "WSH",
]);

const TEAM_ID_ALIASES: Record<string, string> = {
  GS: "gsw",
  NY: "nyk",
  NO: "nop",
  SA: "sas",
  UTAH: "uta",
};

type CacheEntry<T> = {
  expiresAt: number;
  value?: T;
  promise?: Promise<T>;
};

type GlobalCache = {
  teams?: CacheEntry<TeamDataset>;
  schedule?: CacheEntry<LeagueGamesDataset>;
  players?: CacheEntry<PlayerDataset>;
  teamStats?: CacheEntry<TeamStats[]>;
};

type TeamDataset = {
  teams: Team[];
  espnIdToTeam: Map<string, Team>;
  teamIdToEspnId: Map<string, string>;
};

type LeagueGamesDataset = {
  games: Game[];
  historicalGames: HistoricalGame[];
};

type PlayerDataset = {
  players: Player[];
};

type EspnStatistic = {
  name?: string;
  value?: unknown;
  displayValue?: unknown;
};

type EspnStatisticCategory = {
  stats?: EspnStatistic[];
};

type EspnTeamReference = {
  id?: string | number;
  abbreviation?: string;
  name?: string;
  location?: string;
  nickname?: string;
};

type EspnTeamListEntry = {
  team?: EspnTeamReference;
};

type EspnTeamsResponse = {
  sports?: Array<{
    leagues?: Array<{
      teams?: EspnTeamListEntry[];
    }>;
  }>;
};

type EspnCompetitor = {
  homeAway?: string;
  score?: {
    value?: number | string;
  } | number | string;
  team?: {
    id?: string | number;
  };
};

type EspnEvent = {
  id?: string;
  date?: string;
  competitions?: Array<{
    date?: string;
    competitors?: EspnCompetitor[];
    status?: {
      type?: {
        completed?: boolean;
      };
    };
  }>;
};

type EspnScheduleResponse = {
  events?: EspnEvent[];
};

type EspnRosterAthlete = {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  position?: {
    abbreviation?: string;
  };
};

type EspnRosterResponse = {
  team?: {
    abbreviation?: string;
  };
  athletes?: EspnRosterAthlete[];
};

type EspnTeamStatisticsResponse = {
  team?: {
    abbreviation?: string;
  };
  results?: {
    stats?: {
      categories?: EspnStatisticCategory[];
    };
  };
};

function getGlobalCache(): GlobalCache {
  const scope = globalThis as typeof globalThis & {
    __nbaLiveProviderCache__?: GlobalCache;
  };

  if (!scope.__nbaLiveProviderCache__) {
    scope.__nbaLiveProviderCache__ = {};
  }

  return scope.__nbaLiveProviderCache__;
}

async function remember<T>(
  bucket: keyof GlobalCache,
  loader: () => Promise<T>,
): Promise<T> {
  const store = getGlobalCache();
  const existing = store[bucket] as CacheEntry<T> | undefined;
  const now = Date.now();

  if (existing?.value && existing.expiresAt > now) {
    return existing.value;
  }

  if (existing?.promise) {
    return existing.promise;
  }

  const promise = loader()
    .then((value) => {
      (store[bucket] as CacheEntry<T>) = {
        value,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };

      return value;
    })
    .catch((error) => {
      delete store[bucket];
      throw error;
    });

  (store[bucket] as CacheEntry<T>) = {
    expiresAt: now + CACHE_TTL_MS,
    promise,
  };

  return promise;
}

async function fetchEspnJson<T>(path: string): Promise<T> {
  const response = await fetch(`${ESPN_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: Math.max(60, Math.floor(CACHE_TTL_MS / 1000)) },
  });

  if (!response.ok) {
    throw new Error(`NBA live data request failed for ${path} with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

function normalizeTeamId(abbreviation: string): string {
  return (TEAM_ID_ALIASES[abbreviation] ?? abbreviation.toLowerCase());
}

function parseConference(abbreviation: string): "East" | "West" {
  return EASTERN_ABBREVIATIONS.has(abbreviation) ? "East" : "West";
}

function coerceNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readStatisticMap(categories: EspnStatisticCategory[] | undefined): Map<string, number> {
  const stats = new Map<string, number>();

  for (const category of categories ?? []) {
    for (const stat of category?.stats ?? []) {
      if (typeof stat?.name === "string") {
        stats.set(stat.name, coerceNumber(stat?.value ?? stat?.displayValue));
      }
    }
  }

  return stats;
}

function mapPosition(value: string | undefined): Player["position"] {
  if (value === "G") {
    return "G";
  }

  if (value === "F") {
    return "F";
  }

  if (value === "C") {
    return "C";
  }

  if (value === "G-F" || value === "F-G") {
    return "G/F";
  }

  if (value === "F-C" || value === "C-F") {
    return "F/C";
  }

  return "G/F";
}

function extractScore(value: EspnCompetitor["score"]): number {
  if (
    typeof value === "object" &&
    value !== null &&
    "value" in value
  ) {
    return coerceNumber(value.value);
  }

  return coerceNumber(value);
}

function sortGamesAscending<T extends { gameDate: string }>(games: T[]): T[] {
  return [...games].sort((left, right) => left.gameDate.localeCompare(right.gameDate));
}

function sortGamesDescending<T extends { gameDate: string }>(games: T[]): T[] {
  return [...games].sort((left, right) => right.gameDate.localeCompare(left.gameDate));
}

function toGameRecord(event: EspnEvent, teamsByEspnId: Map<string, Team>): Game | HistoricalGame | null {
  const competition = event?.competitions?.[0];
  const competitors = competition?.competitors;

  if (!competition || !Array.isArray(competitors) || competitors.length < 2) {
    return null;
  }

  const homeCompetitor = competitors.find((entry) => entry?.homeAway === "home");
  const awayCompetitor = competitors.find((entry) => entry?.homeAway === "away");
  const homeTeam = teamsByEspnId.get(String(homeCompetitor?.team?.id ?? ""));
  const awayTeam = teamsByEspnId.get(String(awayCompetitor?.team?.id ?? ""));

  if (!homeTeam || !awayTeam || typeof event?.id !== "string") {
    return null;
  }

  const completed = Boolean(competition?.status?.type?.completed);
  const homeScore = completed ? extractScore(homeCompetitor?.score) : null;
  const awayScore = completed ? extractScore(awayCompetitor?.score) : null;

  return {
    id: event.id,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    gameDate: competition?.date ?? event?.date ?? new Date().toISOString(),
    status: completed ? "final" : "upcoming",
    homeScore,
    awayScore,
  };
}

function padMargins(values: number[]): [number, number, number, number, number] {
  const padded = [...values];

  while (padded.length < 5) {
    padded.push(0);
  }

  return [padded[0] ?? 0, padded[1] ?? 0, padded[2] ?? 0, padded[3] ?? 0, padded[4] ?? 0];
}

function calculateTeamStats(teamId: string, historicalGames: HistoricalGame[], statMap: Map<string, number>): TeamStats {
  const games = sortGamesDescending(
    historicalGames.filter((game) => game.homeTeamId === teamId || game.awayTeamId === teamId),
  );
  const homeGames = games.filter((game) => game.homeTeamId === teamId);
  const awayGames = games.filter((game) => game.awayTeamId === teamId);

  const wins = games.filter((game) => {
    const homeScore = game.homeScore ?? 0;
    const awayScore = game.awayScore ?? 0;
    return game.homeTeamId === teamId ? homeScore > awayScore : awayScore > homeScore;
  }).length;
  const losses = Math.max(games.length - wins, 0);

  const average = (items: HistoricalGame[], selector: (game: HistoricalGame) => number): number =>
    items.length > 0
      ? items.reduce((sum, item) => sum + selector(item), 0) / items.length
      : 0;

  const pointsFor = (game: HistoricalGame) =>
    game.homeTeamId === teamId ? (game.homeScore ?? 0) : (game.awayScore ?? 0);
  const pointsAgainst = (game: HistoricalGame) =>
    game.homeTeamId === teamId ? (game.awayScore ?? 0) : (game.homeScore ?? 0);

  const homeWins = homeGames.filter((game) => (game.homeScore ?? 0) > (game.awayScore ?? 0)).length;
  const homeLosses = Math.max(homeGames.length - homeWins, 0);
  const awayWins = awayGames.filter((game) => (game.awayScore ?? 0) > (game.homeScore ?? 0)).length;
  const awayLosses = Math.max(awayGames.length - awayWins, 0);

  const avgFieldGoalsAttempted = statMap.get("avgFieldGoalsAttempted") ?? 0;
  const avgFreeThrowsAttempted = statMap.get("avgFreeThrowsAttempted") ?? 0;
  const avgOffensiveRebounds = statMap.get("avgOffensiveRebounds") ?? 0;
  const avgTurnovers = statMap.get("avgTurnovers") ?? 0;
  const pace =
    avgFieldGoalsAttempted + avgFreeThrowsAttempted * 0.44 - avgOffensiveRebounds + avgTurnovers;
  const safePace = pace > 0 ? pace : 98;
  const pointsPerGame = average(games, pointsFor);
  const pointsAllowedPerGame = average(games, pointsAgainst);

  return {
    teamId,
    wins,
    losses,
    pointsPerGame,
    pointsAllowedPerGame,
    offensiveRating: safePace > 0 ? (pointsPerGame / safePace) * 100 : 0,
    defensiveRating: safePace > 0 ? (pointsAllowedPerGame / safePace) * 100 : 0,
    pace: safePace,
    homeWins,
    homeLosses,
    awayWins,
    awayLosses,
    homePointsPerGame: average(homeGames, pointsFor),
    awayPointsPerGame: average(awayGames, pointsFor),
    homePointsAllowedPerGame: average(homeGames, pointsAgainst),
    awayPointsAllowedPerGame: average(awayGames, pointsAgainst),
    lastFiveGameMargins: padMargins(
      games.slice(0, 5).map((game) => pointsFor(game) - pointsAgainst(game)),
    ),
  };
}

async function loadTeamsDataset(): Promise<TeamDataset> {
  return remember("teams", async () => {
    const response = await fetchEspnJson<EspnTeamsResponse>("/teams");
    const rawTeams = response?.sports?.[0]?.leagues?.[0]?.teams ?? [];
    const teams = rawTeams
      .map((entry) => entry?.team)
      .filter((team): team is EspnTeamReference => Boolean(team))
      .map((team) => {
        const abbreviation = String(team.abbreviation ?? "").toUpperCase();

        return {
          id: normalizeTeamId(abbreviation),
          name: String(team.name ?? ""),
          city: String(team.location ?? team.nickname ?? ""),
          abbreviation: abbreviation === "NY" ? "NYK" : abbreviation === "GS" ? "GSW" : abbreviation === "NO" ? "NOP" : abbreviation === "SA" ? "SAS" : abbreviation === "UTAH" ? "UTA" : abbreviation,
          conference: parseConference(abbreviation),
        } satisfies Team;
      });
    const espnIdToTeam = new Map<string, Team>();
    const teamIdToEspnId = new Map<string, string>();

    for (const entry of rawTeams) {
      const rawTeam = entry?.team;
      const abbreviation = String(rawTeam?.abbreviation ?? "").toUpperCase();
      const teamId = normalizeTeamId(abbreviation);
      const team = teams.find((value) => value.id === teamId);

      if (team && rawTeam?.id !== undefined) {
        espnIdToTeam.set(String(rawTeam.id), team);
        teamIdToEspnId.set(team.id, String(rawTeam.id));
      }
    }

    return {
      teams,
      espnIdToTeam,
      teamIdToEspnId,
    };
  });
}

async function loadLeagueGamesDataset(): Promise<LeagueGamesDataset> {
  return remember("schedule", async () => {
    const { espnIdToTeam, teamIdToEspnId } = await loadTeamsDataset();
    const scheduleResponses = await Promise.all(
      [...teamIdToEspnId.values()].map((espnTeamId) =>
        fetchEspnJson<EspnScheduleResponse>(`/teams/${espnTeamId}/schedule`),
      ),
    );
    const uniqueEvents = new Map<string, Game | HistoricalGame>();

    for (const response of scheduleResponses) {
      for (const event of response?.events ?? []) {
        const game = toGameRecord(event, espnIdToTeam);

        if (game) {
          uniqueEvents.set(game.id, game);
        }
      }
    }

    const allGames = sortGamesAscending([...uniqueEvents.values()]);

    return {
      games: allGames.map((game) => ({
        id: game.id,
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        gameDate: game.gameDate,
        status: game.status,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
      })),
      historicalGames: allGames
        .filter((game): game is HistoricalGame => game.status === "final")
        .map((game) => ({
          id: game.id,
          homeTeamId: game.homeTeamId,
          awayTeamId: game.awayTeamId,
          gameDate: game.gameDate,
          status: "final",
          homeScore: game.homeScore,
          awayScore: game.awayScore,
          modeledWinnerTeamId: null,
        })),
    };
  });
}

async function loadPlayersDataset(): Promise<PlayerDataset> {
  return remember("players", async () => {
    const { teams, teamIdToEspnId } = await loadTeamsDataset();
    const rosterResponses = await Promise.all(
      teams.map((team) =>
        fetchEspnJson<EspnRosterResponse>(`/teams/${teamIdToEspnId.get(team.id)}/roster`),
      ),
    );
    const playersById = new Map<string, Player>();

    for (const response of rosterResponses) {
      const rawTeam = response?.team;
      const rawAbbreviation = String(rawTeam?.abbreviation ?? "").toUpperCase();
      const teamId = normalizeTeamId(rawAbbreviation);

      for (const athlete of response?.athletes ?? []) {
        if (!athlete?.id || !athlete?.firstName || !athlete?.lastName) {
          continue;
        }

        playersById.set(String(athlete.id), {
          id: String(athlete.id),
          teamId,
          firstName: String(athlete.firstName),
          lastName: String(athlete.lastName),
          position: mapPosition(String(athlete?.position?.abbreviation ?? "")),
          pointsPerGame: 0,
          reboundsPerGame: 0,
          assistsPerGame: 0,
        });
      }
    }

    return {
      players: [...playersById.values()].sort((left, right) => {
        const lastNameCompare = left.lastName.localeCompare(right.lastName);
        return lastNameCompare !== 0
          ? lastNameCompare
          : left.firstName.localeCompare(right.firstName);
      }),
    };
  });
}

async function loadTeamStatsDataset(): Promise<TeamStats[]> {
  return remember("teamStats", async () => {
    const { teams, teamIdToEspnId } = await loadTeamsDataset();
    const { historicalGames } = await loadLeagueGamesDataset();
    const statisticsResponses = await Promise.all(
      teams.map((team) =>
        fetchEspnJson<EspnTeamStatisticsResponse>(`/teams/${teamIdToEspnId.get(team.id)}/statistics`),
      ),
    );
    const statsByTeamId = new Map<string, Map<string, number>>();

    for (const response of statisticsResponses) {
      const rawTeam = response?.team;
      const teamId = normalizeTeamId(String(rawTeam?.abbreviation ?? ""));
      statsByTeamId.set(teamId, readStatisticMap(response?.results?.stats?.categories));
    }

    return teams.map((team) =>
      calculateTeamStats(team.id, historicalGames, statsByTeamId.get(team.id) ?? new Map()),
    );
  });
}

function findOrThrow<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class NbaLiveProvider implements DataProvider {
  async getTeams(): Promise<Team[]> {
    const dataset = await loadTeamsDataset();
    return clone(dataset.teams);
  }

  async getPlayers(): Promise<Player[]> {
    const dataset = await loadPlayersDataset();
    return clone(dataset.players);
  }

  async getGames(): Promise<Game[]> {
    const dataset = await loadLeagueGamesDataset();
    return clone(dataset.games);
  }

  async getHistoricalGames(): Promise<HistoricalGame[]> {
    const dataset = await loadLeagueGamesDataset();
    return clone(dataset.historicalGames);
  }

  async getRecentGamesForTeam(teamId: string, limit: number): Promise<Game[]> {
    const games = await this.getHistoricalGames();
    return clone(
      sortGamesDescending(games)
        .filter((game) => game.homeTeamId === teamId || game.awayTeamId === teamId)
        .slice(0, limit),
    );
  }

  async getTeamStats(teamId: string): Promise<TeamStats> {
    const stats = (await loadTeamStatsDataset()).find((entry) => entry.teamId === teamId);
    return clone(findOrThrow(stats, `Missing live team stats for ${teamId}.`));
  }

  async getAllTeamStats(): Promise<TeamStats[]> {
    return clone(await loadTeamStatsDataset());
  }

  async getTeamTrend(
    teamId: string,
    lastNGames = MODEL_CONFIG.lastNGamesDefault,
  ): Promise<TeamTrendSnapshot> {
    const [stats, historicalGames] = await Promise.all([
      this.getTeamStats(teamId),
      this.getHistoricalGames(),
    ]);

    return clone(buildTeamTrendSnapshot(stats, historicalGames, lastNGames));
  }

  async getTeamDetail(
    teamId: string,
    lastNGames = MODEL_CONFIG.lastNGamesDefault,
  ): Promise<TeamDetailResponse> {
    const [teams, players, historicalGames, stats] = await Promise.all([
      this.getTeams(),
      this.getPlayers(),
      this.getHistoricalGames(),
      this.getTeamStats(teamId),
    ]);
    const team = findOrThrow(teams.find((entry) => entry.id === teamId), `Missing live team ${teamId}.`);

    return clone(buildTeamDetail(team, stats, players, historicalGames, lastNGames));
  }

  async getMatchupContext(homeTeamId: string, awayTeamId: string): Promise<MatchupContext> {
    const [teams, allStats] = await Promise.all([this.getTeams(), this.getAllTeamStats()]);
    const homeTeam = findOrThrow(
      teams.find((entry) => entry.id === homeTeamId),
      `Missing live home team ${homeTeamId}.`,
    );
    const awayTeam = findOrThrow(
      teams.find((entry) => entry.id === awayTeamId),
      `Missing live away team ${awayTeamId}.`,
    );
    const homeTeamStats = findOrThrow(
      allStats.find((entry) => entry.teamId === homeTeamId),
      `Missing live stats for ${homeTeamId}.`,
    );
    const awayTeamStats = findOrThrow(
      allStats.find((entry) => entry.teamId === awayTeamId),
      `Missing live stats for ${awayTeamId}.`,
    );

    return clone({
      homeTeam,
      awayTeam,
      homeTeamStats,
      awayTeamStats,
    });
  }

  async getMatchupAnalysis(
    homeTeamId: string,
    awayTeamId: string,
    lastNGames = MODEL_CONFIG.lastNGamesDefault,
  ): Promise<MatchupAnalysisResponse> {
    const [context, teams, allStats, players, historicalGames] = await Promise.all([
      this.getMatchupContext(homeTeamId, awayTeamId),
      this.getTeams(),
      this.getAllTeamStats(),
      this.getPlayers(),
      this.getHistoricalGames(),
    ]);

    return clone(
      buildMatchupAnalysis(context, teams, allStats, players, historicalGames, lastNGames),
    );
  }

  async runBacktest(lastNGames = MODEL_CONFIG.lastNGamesDefault): Promise<BacktestSummary> {
    const [historicalGames, teams, allStats] = await Promise.all([
      this.getHistoricalGames(),
      this.getTeams(),
      this.getAllTeamStats(),
    ]);

    return clone(
      buildBacktestSummary(
        historicalGames,
        (game) => ({
          homeTeam: findOrThrow(
            teams.find((entry) => entry.id === game.homeTeamId),
            `Missing home team ${game.homeTeamId}.`,
          ),
          awayTeam: findOrThrow(
            teams.find((entry) => entry.id === game.awayTeamId),
            `Missing away team ${game.awayTeamId}.`,
          ),
          homeTeamStats: findOrThrow(
            allStats.find((entry) => entry.teamId === game.homeTeamId),
            `Missing stats for ${game.homeTeamId}.`,
          ),
          awayTeamStats: findOrThrow(
            allStats.find((entry) => entry.teamId === game.awayTeamId),
            `Missing stats for ${game.awayTeamId}.`,
          ),
        }),
        lastNGames,
      ),
    );
  }
}
