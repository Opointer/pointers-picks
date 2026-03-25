import { GameCard } from "@/components/games/game-card";
import { type Game, type Team } from "@/types/nba";

export function GamesList({ games, teams }: { games: Game[]; teams: Team[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {games.map((game) => (
        <GameCard key={game.id} game={game} teams={teams} />
      ))}
    </div>
  );
}
