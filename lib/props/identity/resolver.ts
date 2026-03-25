import { normalizePlayerName } from "@/lib/props/identity/normalize-name";
import { type CanonicalPlayer, type PlayerIdentityResolution } from "@/types/nba";

function isActiveForTeam(player: CanonicalPlayer, teamId: string | undefined): boolean {
  if (!teamId) {
    return true;
  }

  return player.seasonRosterEntries.some((entry) => entry.teamId === teamId);
}

export function resolvePlayerIdentity({
  rawPlayerLabel,
  registry,
  teamIds,
}: {
  rawPlayerLabel: string;
  registry: CanonicalPlayer[];
  teamIds: string[];
}): PlayerIdentityResolution {
  const normalizedLabel = normalizePlayerName(rawPlayerLabel);
  const activeCandidates = registry.filter((player) =>
    teamIds.length > 0 ? teamIds.some((teamId) => isActiveForTeam(player, teamId)) : true,
  );

  const exactNameMatches = activeCandidates.filter(
    (player) => player.normalizedFullName === normalizedLabel,
  );

  if (exactNameMatches.length === 1) {
    const player = exactNameMatches[0];

    return {
      rawPlayerLabel,
      canonicalPlayerId: player.canonicalPlayerId,
      internalPlayerId: player.internalPlayerId,
      resolvedTeamId: player.teamId,
      quality: "high",
      matchedBy: "exact_name",
    };
  }

  const aliasMatches = activeCandidates.filter((player) =>
    player.normalizedAliases.includes(normalizedLabel),
  );

  if (aliasMatches.length === 1) {
    const player = aliasMatches[0];

    return {
      rawPlayerLabel,
      canonicalPlayerId: player.canonicalPlayerId,
      internalPlayerId: player.internalPlayerId,
      resolvedTeamId: player.teamId,
      quality: "high",
      matchedBy: "alias",
    };
  }

  const normalizedMatches = activeCandidates.filter((player) => {
    if (player.normalizedFullName === normalizedLabel) {
      return true;
    }

    return player.normalizedFullName.includes(normalizedLabel) || normalizedLabel.includes(player.normalizedFullName);
  });

  if (normalizedMatches.length === 1) {
    const player = normalizedMatches[0];

    return {
      rawPlayerLabel,
      canonicalPlayerId: player.canonicalPlayerId,
      internalPlayerId: player.internalPlayerId,
      resolvedTeamId: player.teamId,
      quality: "medium",
      matchedBy: "normalized_name",
      reason: "Resolved through normalized roster name matching.",
    };
  }

  const ambiguousCandidates = [
    ...new Set(
      [...exactNameMatches, ...aliasMatches, ...normalizedMatches].map(
        (player) => `${player.fullName} (${player.teamId})`,
      ),
    ),
  ];

  if (ambiguousCandidates.length > 1) {
    return {
      rawPlayerLabel,
      quality: "none",
      matchedBy: "none",
      reason: "Multiple active roster candidates matched this label.",
      ambiguousCandidates,
    };
  }

  return {
    rawPlayerLabel,
    quality: "none",
    matchedBy: "none",
    reason: "No active roster player matched this label.",
  };
}
