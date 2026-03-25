import Link from "next/link";
import { type Game, type Team } from "@/types/nba";

export function RecentGamesPanel({
  games,
  teams,
  title,
}: {
  games: Game[];
  teams: Team[];
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {games.map((game) => {
          const homeTeam = teams.find((team) => team.id === game.homeTeamId);
          const awayTeam = teams.find((team) => team.id === game.awayTeamId);

          return (
            <Link
              key={game.id}
              href={`/matchup/${game.homeTeamId}/${game.awayTeamId}`}
              className="block rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 transition hover:border-white/15"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">
                    {awayTeam?.abbreviation} at {homeTeam?.abbreviation}
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(game.gameDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm text-slate-300">
                  {game.homeScore !== null && game.awayScore !== null
                    ? `${awayTeam?.abbreviation} ${game.awayScore} - ${homeTeam?.abbreviation} ${game.homeScore}`
                    : "Upcoming"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
