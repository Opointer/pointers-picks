import { type Game, type Team } from "@/types/nba";
import { RecentGamesPanel } from "@/components/games/recent-games-panel";

export function TeamRecentGames({
  games,
  teams,
  team,
}: {
  games: Game[];
  teams: Team[];
  team: Team;
}) {
  return <RecentGamesPanel games={games} teams={teams} title={`${team.city} Recent Games`} />;
}
