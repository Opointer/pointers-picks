import Link from "next/link";
import { formatRecord } from "@/lib/utils/format";
import { type Team, type TeamStats } from "@/types/nba";

export function TeamsTable({ teams, stats }: { teams: Team[]; stats: TeamStats[] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Team</th>
              <th className="px-5 py-4">Record</th>
              <th className="px-5 py-4">PPG</th>
              <th className="px-5 py-4">Allowed</th>
              <th className="px-5 py-4">Off Rtg</th>
              <th className="px-5 py-4">Def Rtg</th>
              <th className="px-5 py-4">Pace</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const teamStat = stats.find((entry) => entry.teamId === team.id);

              if (!teamStat) {
                return null;
              }

              return (
                <tr key={team.id} className="border-t border-white/5 text-sm text-slate-200">
                  <td className="px-5 py-4">
                    <Link href={`/teams/${team.id}`} className="font-semibold text-white transition hover:text-amber-200">
                      {team.city} {team.name}
                    </Link>
                    <p className="text-slate-400">{team.abbreviation}</p>
                  </td>
                  <td className="px-5 py-4">{formatRecord(teamStat.wins, teamStat.losses)}</td>
                  <td className="px-5 py-4">{teamStat.pointsPerGame.toFixed(1)}</td>
                  <td className="px-5 py-4">{teamStat.pointsAllowedPerGame.toFixed(1)}</td>
                  <td className="px-5 py-4">{teamStat.offensiveRating.toFixed(1)}</td>
                  <td className="px-5 py-4">{teamStat.defensiveRating.toFixed(1)}</td>
                  <td className="px-5 py-4">{teamStat.pace.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
