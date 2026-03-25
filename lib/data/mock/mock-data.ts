import { type HistoricalGame, type Player, type Team, type TeamStats } from "@/types/nba";

export const teams: Team[] = [
  { id: "bos", name: "Celtics", city: "Boston", abbreviation: "BOS", conference: "East" },
  { id: "nyk", name: "Knicks", city: "New York", abbreviation: "NYK", conference: "East" },
  { id: "mil", name: "Bucks", city: "Milwaukee", abbreviation: "MIL", conference: "East" },
  { id: "phi", name: "76ers", city: "Philadelphia", abbreviation: "PHI", conference: "East" },
  { id: "mia", name: "Heat", city: "Miami", abbreviation: "MIA", conference: "East" },
  { id: "cle", name: "Cavaliers", city: "Cleveland", abbreviation: "CLE", conference: "East" },
  { id: "den", name: "Nuggets", city: "Denver", abbreviation: "DEN", conference: "West" },
  { id: "okc", name: "Thunder", city: "Oklahoma City", abbreviation: "OKC", conference: "West" },
  { id: "min", name: "Timberwolves", city: "Minnesota", abbreviation: "MIN", conference: "West" },
  { id: "dal", name: "Mavericks", city: "Dallas", abbreviation: "DAL", conference: "West" },
  { id: "phx", name: "Suns", city: "Phoenix", abbreviation: "PHX", conference: "West" },
  { id: "lal", name: "Lakers", city: "Los Angeles", abbreviation: "LAL", conference: "West" },
];

export const teamStats: TeamStats[] = [
  { teamId: "bos", wins: 53, losses: 21, pointsPerGame: 118.1, pointsAllowedPerGame: 108.9, offensiveRating: 119.4, defensiveRating: 110.2, pace: 99.6, homeWins: 30, homeLosses: 7, awayWins: 23, awayLosses: 14, homePointsPerGame: 119.8, awayPointsPerGame: 116.4, homePointsAllowedPerGame: 107.4, awayPointsAllowedPerGame: 110.3, lastFiveGameMargins: [6, 11, -2, 8, 13] },
  { teamId: "nyk", wins: 48, losses: 26, pointsPerGame: 114.7, pointsAllowedPerGame: 109.8, offensiveRating: 116.3, defensiveRating: 111.1, pace: 96.8, homeWins: 27, homeLosses: 10, awayWins: 21, awayLosses: 16, homePointsPerGame: 115.9, awayPointsPerGame: 113.5, homePointsAllowedPerGame: 108.8, awayPointsAllowedPerGame: 110.9, lastFiveGameMargins: [2, 5, 7, -1, 9] },
  { teamId: "mil", wins: 46, losses: 28, pointsPerGame: 116.2, pointsAllowedPerGame: 112.5, offensiveRating: 117.1, defensiveRating: 113.4, pace: 100.4, homeWins: 25, homeLosses: 11, awayWins: 21, awayLosses: 17, homePointsPerGame: 117.8, awayPointsPerGame: 114.6, homePointsAllowedPerGame: 111.0, awayPointsAllowedPerGame: 114.0, lastFiveGameMargins: [-4, 10, 3, 1, 7] },
  { teamId: "phi", wins: 43, losses: 31, pointsPerGame: 112.6, pointsAllowedPerGame: 109.4, offensiveRating: 114.8, defensiveRating: 111.3, pace: 97.4, homeWins: 24, homeLosses: 13, awayWins: 19, awayLosses: 18, homePointsPerGame: 113.4, awayPointsPerGame: 111.8, homePointsAllowedPerGame: 108.3, awayPointsAllowedPerGame: 110.5, lastFiveGameMargins: [9, -6, 4, 2, 6] },
  { teamId: "mia", wins: 41, losses: 33, pointsPerGame: 110.8, pointsAllowedPerGame: 109.6, offensiveRating: 112.3, defensiveRating: 110.9, pace: 95.9, homeWins: 23, homeLosses: 14, awayWins: 18, awayLosses: 19, homePointsPerGame: 111.7, awayPointsPerGame: 109.9, homePointsAllowedPerGame: 108.4, awayPointsAllowedPerGame: 110.8, lastFiveGameMargins: [-8, 4, 5, -2, 3] },
  { teamId: "cle", wins: 50, losses: 24, pointsPerGame: 115.1, pointsAllowedPerGame: 108.4, offensiveRating: 117.5, defensiveRating: 109.2, pace: 97.1, homeWins: 29, homeLosses: 8, awayWins: 21, awayLosses: 16, homePointsPerGame: 116.7, awayPointsPerGame: 113.4, homePointsAllowedPerGame: 106.9, awayPointsAllowedPerGame: 109.9, lastFiveGameMargins: [12, 6, -3, 10, 8] },
  { teamId: "den", wins: 51, losses: 23, pointsPerGame: 117.3, pointsAllowedPerGame: 111.2, offensiveRating: 118.4, defensiveRating: 112.1, pace: 97.8, homeWins: 30, homeLosses: 7, awayWins: 21, awayLosses: 16, homePointsPerGame: 118.7, awayPointsPerGame: 115.9, homePointsAllowedPerGame: 109.3, awayPointsAllowedPerGame: 113.1, lastFiveGameMargins: [4, 7, 2, -1, 11] },
  { teamId: "okc", wins: 52, losses: 22, pointsPerGame: 119.2, pointsAllowedPerGame: 111.0, offensiveRating: 120.2, defensiveRating: 111.6, pace: 101.2, homeWins: 28, homeLosses: 9, awayWins: 24, awayLosses: 13, homePointsPerGame: 120.3, awayPointsPerGame: 118.1, homePointsAllowedPerGame: 109.9, awayPointsAllowedPerGame: 112.0, lastFiveGameMargins: [3, 9, 6, -4, 10] },
  { teamId: "min", wins: 49, losses: 25, pointsPerGame: 112.4, pointsAllowedPerGame: 106.8, offensiveRating: 113.8, defensiveRating: 108.0, pace: 96.5, homeWins: 27, homeLosses: 10, awayWins: 22, awayLosses: 15, homePointsPerGame: 113.1, awayPointsPerGame: 111.7, homePointsAllowedPerGame: 105.4, awayPointsAllowedPerGame: 108.1, lastFiveGameMargins: [1, -5, 8, 6, 4] },
  { teamId: "dal", wins: 47, losses: 27, pointsPerGame: 117.6, pointsAllowedPerGame: 113.1, offensiveRating: 118.8, defensiveRating: 114.2, pace: 99.2, homeWins: 26, homeLosses: 11, awayWins: 21, awayLosses: 16, homePointsPerGame: 118.9, awayPointsPerGame: 116.3, homePointsAllowedPerGame: 111.6, awayPointsAllowedPerGame: 114.5, lastFiveGameMargins: [5, 2, 11, -3, 8] },
  { teamId: "phx", wins: 44, losses: 30, pointsPerGame: 115.7, pointsAllowedPerGame: 112.2, offensiveRating: 116.6, defensiveRating: 113.0, pace: 98.1, homeWins: 24, homeLosses: 13, awayWins: 20, awayLosses: 17, homePointsPerGame: 116.8, awayPointsPerGame: 114.6, homePointsAllowedPerGame: 111.1, awayPointsAllowedPerGame: 113.3, lastFiveGameMargins: [-2, 3, 7, 5, -1] },
  { teamId: "lal", wins: 42, losses: 32, pointsPerGame: 113.8, pointsAllowedPerGame: 112.8, offensiveRating: 114.7, defensiveRating: 113.8, pace: 100.1, homeWins: 25, homeLosses: 12, awayWins: 17, awayLosses: 20, homePointsPerGame: 115.1, awayPointsPerGame: 112.5, homePointsAllowedPerGame: 111.3, awayPointsAllowedPerGame: 114.2, lastFiveGameMargins: [7, -4, 2, 9, 1] },
];

export const players: Player[] = [
  { id: "bos-1", teamId: "bos", firstName: "Jayson", lastName: "Tatum", position: "F", pointsPerGame: 27.3, reboundsPerGame: 8.4, assistsPerGame: 4.9 },
  { id: "bos-2", teamId: "bos", firstName: "Jaylen", lastName: "Brown", position: "G/F", pointsPerGame: 23.1, reboundsPerGame: 5.8, assistsPerGame: 3.4 },
  { id: "nyk-1", teamId: "nyk", firstName: "Jalen", lastName: "Brunson", position: "G", pointsPerGame: 28.6, reboundsPerGame: 3.7, assistsPerGame: 6.5 },
  { id: "nyk-2", teamId: "nyk", firstName: "Julius", lastName: "Randle", position: "F", pointsPerGame: 22.4, reboundsPerGame: 9.1, assistsPerGame: 4.7 },
  { id: "mil-1", teamId: "mil", firstName: "Giannis", lastName: "Antetokounmpo", position: "F", pointsPerGame: 30.4, reboundsPerGame: 11.2, assistsPerGame: 6.4 },
  { id: "mil-2", teamId: "mil", firstName: "Damian", lastName: "Lillard", position: "G", pointsPerGame: 24.8, reboundsPerGame: 4.3, assistsPerGame: 7.1 },
  { id: "phi-1", teamId: "phi", firstName: "Tyrese", lastName: "Maxey", position: "G", pointsPerGame: 25.1, reboundsPerGame: 3.8, assistsPerGame: 6.3 },
  { id: "phi-2", teamId: "phi", firstName: "Joel", lastName: "Embiid", position: "C", pointsPerGame: 31.0, reboundsPerGame: 10.7, assistsPerGame: 5.1 },
  { id: "mia-1", teamId: "mia", firstName: "Jimmy", lastName: "Butler", position: "F", pointsPerGame: 21.3, reboundsPerGame: 5.5, assistsPerGame: 4.8 },
  { id: "mia-2", teamId: "mia", firstName: "Bam", lastName: "Adebayo", position: "C", pointsPerGame: 20.2, reboundsPerGame: 10.3, assistsPerGame: 4.1 },
  { id: "cle-1", teamId: "cle", firstName: "Donovan", lastName: "Mitchell", position: "G", pointsPerGame: 27.8, reboundsPerGame: 5.1, assistsPerGame: 6.2 },
  { id: "cle-2", teamId: "cle", firstName: "Darius", lastName: "Garland", position: "G", pointsPerGame: 19.0, reboundsPerGame: 2.7, assistsPerGame: 6.8 },
  { id: "den-1", teamId: "den", firstName: "Nikola", lastName: "Jokic", position: "C", pointsPerGame: 26.5, reboundsPerGame: 12.1, assistsPerGame: 9.2 },
  { id: "den-2", teamId: "den", firstName: "Jamal", lastName: "Murray", position: "G", pointsPerGame: 21.4, reboundsPerGame: 4.0, assistsPerGame: 6.0 },
  { id: "okc-1", teamId: "okc", firstName: "Shai", lastName: "Gilgeous-Alexander", position: "G", pointsPerGame: 30.8, reboundsPerGame: 5.4, assistsPerGame: 6.7 },
  { id: "okc-2", teamId: "okc", firstName: "Jalen", lastName: "Williams", position: "G/F", pointsPerGame: 20.1, reboundsPerGame: 4.5, assistsPerGame: 4.7 },
  { id: "min-1", teamId: "min", firstName: "Anthony", lastName: "Edwards", position: "G", pointsPerGame: 26.0, reboundsPerGame: 5.7, assistsPerGame: 5.2 },
  { id: "min-2", teamId: "min", firstName: "Karl-Anthony", lastName: "Towns", position: "F/C", pointsPerGame: 22.1, reboundsPerGame: 8.6, assistsPerGame: 3.0 },
  { id: "dal-1", teamId: "dal", firstName: "Luka", lastName: "Doncic", position: "G", pointsPerGame: 33.2, reboundsPerGame: 8.8, assistsPerGame: 9.4 },
  { id: "dal-2", teamId: "dal", firstName: "Kyrie", lastName: "Irving", position: "G", pointsPerGame: 25.6, reboundsPerGame: 4.8, assistsPerGame: 5.3 },
  { id: "phx-1", teamId: "phx", firstName: "Kevin", lastName: "Durant", position: "F", pointsPerGame: 27.5, reboundsPerGame: 6.6, assistsPerGame: 5.2 },
  { id: "phx-2", teamId: "phx", firstName: "Devin", lastName: "Booker", position: "G", pointsPerGame: 27.1, reboundsPerGame: 4.5, assistsPerGame: 6.9 },
  { id: "lal-1", teamId: "lal", firstName: "LeBron", lastName: "James", position: "F", pointsPerGame: 25.4, reboundsPerGame: 7.2, assistsPerGame: 8.1 },
  { id: "lal-2", teamId: "lal", firstName: "Anthony", lastName: "Davis", position: "F/C", pointsPerGame: 24.7, reboundsPerGame: 12.0, assistsPerGame: 3.5 },
];

export const historicalGames: HistoricalGame[] = [
  { id: "hist-1", homeTeamId: "bos", awayTeamId: "nyk", gameDate: "2026-03-24T00:30:00.000Z", status: "final", homeScore: 120, awayScore: 109 },
  { id: "hist-2", homeTeamId: "bos", awayTeamId: "phi", gameDate: "2026-03-21T00:30:00.000Z", status: "final", homeScore: 115, awayScore: 117 },
  { id: "hist-3", homeTeamId: "cle", awayTeamId: "bos", gameDate: "2026-03-19T23:00:00.000Z", status: "final", homeScore: 108, awayScore: 118 },
  { id: "hist-4", homeTeamId: "mia", awayTeamId: "bos", gameDate: "2026-03-17T23:30:00.000Z", status: "final", homeScore: 104, awayScore: 112 },
  { id: "hist-5", homeTeamId: "bos", awayTeamId: "mil", gameDate: "2026-03-15T00:00:00.000Z", status: "final", homeScore: 121, awayScore: 115 },

  { id: "hist-6", homeTeamId: "nyk", awayTeamId: "mia", gameDate: "2026-03-23T23:30:00.000Z", status: "final", homeScore: 111, awayScore: 109 },
  { id: "hist-7", homeTeamId: "nyk", awayTeamId: "phi", gameDate: "2026-03-20T23:00:00.000Z", status: "final", homeScore: 116, awayScore: 109 },
  { id: "hist-8", homeTeamId: "mil", awayTeamId: "nyk", gameDate: "2026-03-18T00:00:00.000Z", status: "final", homeScore: 109, awayScore: 116 },
  { id: "hist-9", homeTeamId: "nyk", awayTeamId: "cle", gameDate: "2026-03-16T23:30:00.000Z", status: "final", homeScore: 108, awayScore: 109 },
  { id: "hist-10", homeTeamId: "nyk", awayTeamId: "bos", gameDate: "2026-03-13T00:00:00.000Z", status: "final", homeScore: 112, awayScore: 114 },

  { id: "hist-11", homeTeamId: "mil", awayTeamId: "phi", gameDate: "2026-03-24T00:00:00.000Z", status: "final", homeScore: 118, awayScore: 112 },
  { id: "hist-12", homeTeamId: "mil", awayTeamId: "mia", gameDate: "2026-03-22T00:00:00.000Z", status: "final", homeScore: 122, awayScore: 111 },
  { id: "hist-13", homeTeamId: "phi", awayTeamId: "mil", gameDate: "2026-03-20T23:00:00.000Z", status: "final", homeScore: 110, awayScore: 113 },
  { id: "hist-14", homeTeamId: "mil", awayTeamId: "lal", gameDate: "2026-03-17T00:30:00.000Z", status: "final", homeScore: 119, awayScore: 118 },
  { id: "hist-15", homeTeamId: "den", awayTeamId: "mil", gameDate: "2026-03-14T02:00:00.000Z", status: "final", homeScore: 117, awayScore: 110 },

  { id: "hist-16", homeTeamId: "phi", awayTeamId: "mia", gameDate: "2026-03-23T00:00:00.000Z", status: "final", homeScore: 112, awayScore: 108 },
  { id: "hist-17", homeTeamId: "phi", awayTeamId: "cle", gameDate: "2026-03-21T23:30:00.000Z", status: "final", homeScore: 103, awayScore: 107 },
  { id: "hist-18", homeTeamId: "mia", awayTeamId: "phi", gameDate: "2026-03-18T23:30:00.000Z", status: "final", homeScore: 104, awayScore: 108 },
  { id: "hist-19", homeTeamId: "phi", awayTeamId: "lal", gameDate: "2026-03-16T00:00:00.000Z", status: "final", homeScore: 111, awayScore: 109 },
  { id: "hist-20", homeTeamId: "bos", awayTeamId: "phi", gameDate: "2026-03-12T00:30:00.000Z", status: "final", homeScore: 116, awayScore: 108 },

  { id: "hist-21", homeTeamId: "mia", awayTeamId: "cle", gameDate: "2026-03-24T23:30:00.000Z", status: "final", homeScore: 104, awayScore: 109 },
  { id: "hist-22", homeTeamId: "mia", awayTeamId: "nyk", gameDate: "2026-03-22T23:30:00.000Z", status: "final", homeScore: 110, awayScore: 106 },
  { id: "hist-23", homeTeamId: "mia", awayTeamId: "mil", gameDate: "2026-03-20T23:30:00.000Z", status: "final", homeScore: 101, awayScore: 109 },
  { id: "hist-24", homeTeamId: "mia", awayTeamId: "lal", gameDate: "2026-03-17T23:30:00.000Z", status: "final", homeScore: 108, awayScore: 106 },
  { id: "hist-25", homeTeamId: "okc", awayTeamId: "mia", gameDate: "2026-03-15T01:00:00.000Z", status: "final", homeScore: 119, awayScore: 111 },

  { id: "hist-26", homeTeamId: "cle", awayTeamId: "bos", gameDate: "2026-03-23T23:00:00.000Z", status: "final", homeScore: 115, awayScore: 103 },
  { id: "hist-27", homeTeamId: "cle", awayTeamId: "nyk", gameDate: "2026-03-21T23:00:00.000Z", status: "final", homeScore: 118, awayScore: 112 },
  { id: "hist-28", homeTeamId: "phi", awayTeamId: "cle", gameDate: "2026-03-19T23:00:00.000Z", status: "final", homeScore: 104, awayScore: 114 },
  { id: "hist-29", homeTeamId: "cle", awayTeamId: "den", gameDate: "2026-03-16T23:00:00.000Z", status: "final", homeScore: 111, awayScore: 114 },
  { id: "hist-30", homeTeamId: "cle", awayTeamId: "mia", gameDate: "2026-03-13T23:00:00.000Z", status: "final", homeScore: 113, awayScore: 105 },

  { id: "hist-31", homeTeamId: "den", awayTeamId: "dal", gameDate: "2026-03-23T02:00:00.000Z", status: "final", homeScore: 119, awayScore: 113 },
  { id: "hist-32", homeTeamId: "den", awayTeamId: "phx", gameDate: "2026-03-21T02:00:00.000Z", status: "final", homeScore: 116, awayScore: 114 },
  { id: "hist-33", homeTeamId: "lal", awayTeamId: "den", gameDate: "2026-03-18T02:30:00.000Z", status: "final", homeScore: 109, awayScore: 111 },
  { id: "hist-34", homeTeamId: "den", awayTeamId: "min", gameDate: "2026-03-16T02:00:00.000Z", status: "final", homeScore: 108, awayScore: 109 },
  { id: "hist-35", homeTeamId: "den", awayTeamId: "mil", gameDate: "2026-03-13T02:00:00.000Z", status: "final", homeScore: 121, awayScore: 110 },

  { id: "hist-36", homeTeamId: "okc", awayTeamId: "lal", gameDate: "2026-03-24T01:00:00.000Z", status: "final", homeScore: 122, awayScore: 112 },
  { id: "hist-37", homeTeamId: "okc", awayTeamId: "min", gameDate: "2026-03-22T01:00:00.000Z", status: "final", homeScore: 117, awayScore: 111 },
  { id: "hist-38", homeTeamId: "dal", awayTeamId: "okc", gameDate: "2026-03-20T01:30:00.000Z", status: "final", homeScore: 118, awayScore: 114 },
  { id: "hist-39", homeTeamId: "okc", awayTeamId: "mia", gameDate: "2026-03-17T01:00:00.000Z", status: "final", homeScore: 116, awayScore: 120 },
  { id: "hist-40", homeTeamId: "okc", awayTeamId: "phx", gameDate: "2026-03-14T01:00:00.000Z", status: "final", homeScore: 124, awayScore: 114 },

  { id: "hist-41", homeTeamId: "min", awayTeamId: "phx", gameDate: "2026-03-24T01:30:00.000Z", status: "final", homeScore: 113, awayScore: 109 },
  { id: "hist-42", homeTeamId: "min", awayTeamId: "lal", gameDate: "2026-03-22T01:30:00.000Z", status: "final", homeScore: 110, awayScore: 115 },
  { id: "hist-43", homeTeamId: "den", awayTeamId: "min", gameDate: "2026-03-20T02:00:00.000Z", status: "final", homeScore: 104, awayScore: 112 },
  { id: "hist-44", homeTeamId: "min", awayTeamId: "dal", gameDate: "2026-03-17T01:30:00.000Z", status: "final", homeScore: 109, awayScore: 103 },
  { id: "hist-45", homeTeamId: "min", awayTeamId: "okc", gameDate: "2026-03-14T01:30:00.000Z", status: "final", homeScore: 107, awayScore: 106 },

  { id: "hist-46", homeTeamId: "dal", awayTeamId: "lal", gameDate: "2026-03-23T01:30:00.000Z", status: "final", homeScore: 121, awayScore: 116 },
  { id: "hist-47", homeTeamId: "dal", awayTeamId: "phx", gameDate: "2026-03-21T01:30:00.000Z", status: "final", homeScore: 118, awayScore: 107 },
  { id: "hist-48", homeTeamId: "den", awayTeamId: "dal", gameDate: "2026-03-19T02:00:00.000Z", status: "final", homeScore: 115, awayScore: 126 },
  { id: "hist-49", homeTeamId: "dal", awayTeamId: "okc", gameDate: "2026-03-16T01:30:00.000Z", status: "final", homeScore: 102, awayScore: 105 },
  { id: "hist-50", homeTeamId: "dal", awayTeamId: "min", gameDate: "2026-03-13T01:30:00.000Z", status: "final", homeScore: 120, awayScore: 112 },

  { id: "hist-51", homeTeamId: "phx", awayTeamId: "den", gameDate: "2026-03-23T02:00:00.000Z", status: "final", homeScore: 113, awayScore: 119 },
  { id: "hist-52", homeTeamId: "phx", awayTeamId: "lal", gameDate: "2026-03-21T02:00:00.000Z", status: "final", homeScore: 117, awayScore: 111 },
  { id: "hist-53", homeTeamId: "min", awayTeamId: "phx", gameDate: "2026-03-18T01:30:00.000Z", status: "final", homeScore: 114, awayScore: 106 },
  { id: "hist-54", homeTeamId: "phx", awayTeamId: "okc", gameDate: "2026-03-16T02:00:00.000Z", status: "final", homeScore: 112, awayScore: 115 },
  { id: "hist-55", homeTeamId: "phx", awayTeamId: "dal", gameDate: "2026-03-13T02:00:00.000Z", status: "final", homeScore: 110, awayScore: 118 },

  { id: "hist-56", homeTeamId: "lal", awayTeamId: "den", gameDate: "2026-03-24T02:30:00.000Z", status: "final", homeScore: 111, awayScore: 118 },
  { id: "hist-57", homeTeamId: "lal", awayTeamId: "phx", gameDate: "2026-03-22T02:30:00.000Z", status: "final", homeScore: 118, awayScore: 109 },
  { id: "hist-58", homeTeamId: "dal", awayTeamId: "lal", gameDate: "2026-03-20T01:30:00.000Z", status: "final", homeScore: 119, awayScore: 114 },
  { id: "hist-59", homeTeamId: "lal", awayTeamId: "min", gameDate: "2026-03-17T02:30:00.000Z", status: "final", homeScore: 107, awayScore: 110 },
  { id: "hist-60", homeTeamId: "lal", awayTeamId: "mil", gameDate: "2026-03-14T02:30:00.000Z", status: "final", homeScore: 113, awayScore: 116 },
];

export const upcomingGames: HistoricalGame[] = [
  { id: "game-1", homeTeamId: "bos", awayTeamId: "nyk", gameDate: "2026-03-26T00:30:00.000Z", status: "upcoming", homeScore: null, awayScore: null },
  { id: "game-2", homeTeamId: "den", awayTeamId: "dal", gameDate: "2026-03-26T02:00:00.000Z", status: "upcoming", homeScore: null, awayScore: null },
  { id: "game-3", homeTeamId: "okc", awayTeamId: "lal", gameDate: "2026-03-27T00:00:00.000Z", status: "upcoming", homeScore: null, awayScore: null },
  { id: "game-4", homeTeamId: "min", awayTeamId: "phx", gameDate: "2026-03-27T01:30:00.000Z", status: "upcoming", homeScore: null, awayScore: null },
];

export const games: HistoricalGame[] = [...upcomingGames, ...historicalGames.slice(0, 8)];
