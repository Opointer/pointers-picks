import { normalizePlayerName } from "@/lib/props/identity/normalize-name";
import { type CanonicalPlayer, type Player } from "@/types/nba";

const aliasOverrides: Record<string, string[]> = {
  "Shai Gilgeous-Alexander": ["Shai Gilgeous Alexander", "SGA"],
  "Karl-Anthony Towns": ["Karl Anthony Towns", "KAT"],
  "LeBron James": ["Lebron James"],
  "Luka Doncic": ["Luka Dončić"],
};

function toCanonicalId(player: Player): string {
  return `nba:${normalizePlayerName(`${player.firstName} ${player.lastName}`).replace(/\s+/g, "-")}`;
}

export function buildCanonicalPlayerRegistry(players: Player[]): CanonicalPlayer[] {
  return players.map((player) => {
    const fullName = `${player.firstName} ${player.lastName}`;
    const aliases = aliasOverrides[fullName] ?? [];

    return {
      canonicalPlayerId: toCanonicalId(player),
      internalPlayerId: player.id,
      fullName,
      normalizedFullName: normalizePlayerName(fullName),
      teamId: player.teamId,
      aliases,
      normalizedAliases: aliases.map(normalizePlayerName),
      seasonRosterEntries: [{ teamId: player.teamId }],
    };
  });
}
