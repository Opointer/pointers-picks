import { describe, expect, it } from "vitest";
import { buildModelResponse } from "@/lib/model/prediction-engine";
import { type MatchupContext } from "@/types/nba";

const balancedContext: MatchupContext = {
  homeTeam: { id: "home", name: "Home", city: "Home City", abbreviation: "HOM", conference: "East" },
  awayTeam: { id: "away", name: "Away", city: "Away City", abbreviation: "AWY", conference: "West" },
  homeTeamStats: {
    teamId: "home", wins: 40, losses: 20, pointsPerGame: 112, pointsAllowedPerGame: 108,
    offensiveRating: 115, defensiveRating: 110, pace: 99, homeWins: 24, homeLosses: 8,
    awayWins: 16, awayLosses: 12, homePointsPerGame: 114, awayPointsPerGame: 110,
    homePointsAllowedPerGame: 106, awayPointsAllowedPerGame: 110, lastFiveGameMargins: [4, 1, -2, 5, 3],
  },
  awayTeamStats: {
    teamId: "away", wins: 40, losses: 20, pointsPerGame: 112, pointsAllowedPerGame: 108,
    offensiveRating: 115, defensiveRating: 110, pace: 99, homeWins: 21, homeLosses: 9,
    awayWins: 19, awayLosses: 11, homePointsPerGame: 113, awayPointsPerGame: 111,
    homePointsAllowedPerGame: 107, awayPointsAllowedPerGame: 109, lastFiveGameMargins: [4, 1, -2, 5, 3],
  },
};

describe("buildModelResponse", () => {
  it("keeps home court as an exact +3 contribution and includes meta", () => {
    const prediction = buildModelResponse(balancedContext);
    expect(prediction.winner.id).toBe("home");
    expect(prediction.factors.find((factor) => factor.key === "homeCourt")?.homeContribution).toBe(3);
    expect(prediction.meta?.modelVersion).toBe("2.0.0");
  });

  it("caps the projected score adjustment to eight points", () => {
    const prediction = buildModelResponse({
      ...balancedContext,
      homeTeamStats: {
        ...balancedContext.homeTeamStats,
        pointsPerGame: 125,
        pointsAllowedPerGame: 100,
        homeWins: 30,
        homeLosses: 2,
        lastFiveGameMargins: [15, 18, 16, 20, 22],
      },
      awayTeamStats: {
        ...balancedContext.awayTeamStats,
        pointsPerGame: 100,
        pointsAllowedPerGame: 120,
        awayWins: 8,
        awayLosses: 23,
        lastFiveGameMargins: [-20, -15, -18, -14, -16],
      },
    });

    const homeMid =
      (prediction.projectedScoreRange.home[0] + prediction.projectedScoreRange.home[1]) / 2;
    expect(homeMid).toBeLessThanOrEqual(((125 + 120) / 2 + 1.5) + 8);
  });
});
