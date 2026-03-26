import { describe, expect, it } from "vitest";
import { primaryNavigation } from "@/components/layout/navigation";

describe("primary navigation", () => {
  it("does not expose redirect-only routes", () => {
    expect(primaryNavigation.some((item) => item.href === "/pointers-picks")).toBe(false);
    expect(primaryNavigation.some((item) => item.href === "/model")).toBe(false);
  });
});
