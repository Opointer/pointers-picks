import Link from "next/link";
import { type Game, type Team } from "@/types/nba";

export function GameCard({ game, teams }: { game: Game; teams: Team[] }) {
  const homeTeam = teams.find((team) => team.id === game.homeTeamId);
  const awayTeam = teams.find((team) => team.id === game.awayTeamId);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/6 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{game.status}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {awayTeam?.abbreviation} at {homeTeam?.abbreviation}
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {new Date(game.gameDate).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          {game.status === "final" ? (
            <p className="mt-3 text-sm font-medium text-slate-100">
              Final score: {awayTeam?.abbreviation} {game.awayScore}, {homeTeam?.abbreviation} {game.homeScore}
            </p>
          ) : null}
        </div>
        <Link
          href={`/matchup/${game.homeTeamId}/${game.awayTeamId}`}
          className="rounded-full border border-amber-300/30 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
        >
          Analyze
        </Link>
      </div>
    </article>
  );
}
