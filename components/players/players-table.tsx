import { type Player, type Team } from "@/types/nba";

export function PlayersTable({ players, teams }: { players: Player[]; teams: Team[] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Player</th>
              <th className="px-5 py-4">Team</th>
              <th className="px-5 py-4">Pos</th>
              <th className="px-5 py-4">PPG</th>
              <th className="px-5 py-4">RPG</th>
              <th className="px-5 py-4">APG</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const team = teams.find((entry) => entry.id === player.teamId);

              return (
                <tr key={player.id} className="border-t border-white/5 text-sm text-slate-200">
                  <td className="px-5 py-4 font-semibold text-white">
                    {player.firstName} {player.lastName}
                  </td>
                  <td className="px-5 py-4">{team?.abbreviation}</td>
                  <td className="px-5 py-4">{player.position}</td>
                  <td className="px-5 py-4">{player.pointsPerGame.toFixed(1)}</td>
                  <td className="px-5 py-4">{player.reboundsPerGame.toFixed(1)}</td>
                  <td className="px-5 py-4">{player.assistsPerGame.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
