import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/model/route";

describe("POST /api/model", () => {
  it("returns the expected model response shape", async () => {
    const request = new Request("http://localhost/api/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeTeamId: "bos", awayTeamId: "nyk" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveProperty("winner");
    expect(payload).toHaveProperty("projectedScoreRange");
    expect(payload).toHaveProperty("confidence");
    expect(payload).toHaveProperty("summary");
    expect(payload).toHaveProperty("factors");
    expect(payload).toHaveProperty("teamComparisons");
    expect(payload).toHaveProperty("meta");
  });

  it("rejects duplicate teams", async () => {
    const request = new Request("http://localhost/api/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeTeamId: "bos", awayTeamId: "bos" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/different teams/i);
  });
});
