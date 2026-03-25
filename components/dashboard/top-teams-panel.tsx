import Link from "next/link";
import { type Team, type TeamStats } from "@/types/nba";

export function TopTeamsPanel({ teams, stats }: { teams: Team[]; stats: TeamStats[] }) {
  const leaders = [...stats].sort((left, right) => right.wins - left.wins).slice(0, 4);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
      <h2 className="text-xl font-semibold text-white">Top Teams Snapshot</h2>
      <div className="mt-4 grid gap-3">
        {leaders.map((stat) => {
          const team = teams.find((entry) => entry.id === stat.teamId);
          if (!team) {
            return null;
          }

          return (
            <Link
              key={stat.teamId}
              href={`/teams/${stat.teamId}`}
              className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 transition hover:border-white/15"
            >
              <span className="font-medium text-white">
                {team.city} {team.name}
              </span>
              <span className="text-sm text-slate-300">{stat.wins}-{stat.losses}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
