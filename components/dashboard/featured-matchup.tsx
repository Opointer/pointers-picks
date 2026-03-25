import Link from "next/link";
import { type Game, type Team } from "@/types/nba";

export function FeaturedMatchup({
  featuredGame,
  teams,
}: {
  featuredGame: Game;
  teams: Team[];
}) {
  const homeTeam = teams.find((team) => team.id === featuredGame.homeTeamId);
  const awayTeam = teams.find((team) => team.id === featuredGame.awayTeamId);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl shadow-slate-950/25">
      <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Featured Matchup</p>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-300">Upcoming game</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            {awayTeam?.city} at {homeTeam?.city}
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Open the model page to inspect the exact factor contributions for this matchup.
          </p>
        </div>
        <Link
          href={`/model?homeTeamId=${featuredGame.homeTeamId}&awayTeamId=${featuredGame.awayTeamId}`}
          className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Analyze Matchup
        </Link>
      </div>
    </section>
  );
}
