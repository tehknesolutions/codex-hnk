import { describe, expect, it } from "vitest";
import { buildJourneyRegistry } from "./registry.js";
import { getJourneyNavigation, getJourneyNavigationFromRegistry, resolveJourneyTarget } from "./navigation.js";

describe("M6 journey navigation", () => {
  it("has no previous Day before the first executable Day", () => {
    const nav = getJourneyNavigation("001");
    expect(nav.previous).toBeNull();
    expect(nav.next?.dayId).toBe("002");
  });

  it("stops at the approved executable frontier", () => {
    const nav = getJourneyNavigation("072");
    expect(nav.previous?.dayId).toBe("071");
    expect(nav.next).toBeNull();
  });

  it("resolves dormant and invalid targets without manufacturing hrefs", () => {
    expect(resolveJourneyTarget("073")).toEqual({ dayId: "073", status: "DORMANT" });
    expect(resolveJourneyTarget("109")).toEqual({ dayId: "109", status: "DORMANT" });
    expect(resolveJourneyTarget("73")).toEqual({ dayId: "73", status: "UNAVAILABLE" });
    expect(resolveJourneyTarget("abc")).toEqual({ dayId: "abc", status: "UNAVAILABLE" });
  });

  it("skips registry gaps instead of deriving day + 1 routes", () => {
    const registry = buildJourneyRegistry([
      { dayId: "001", status: "AVAILABLE", href: "/day-001", sourceKind: "LEGACY_DAY" },
      { dayId: "003", status: "AVAILABLE", href: "/day-003", sourceKind: "LEGACY_DAY" },
    ]);
    const nav = getJourneyNavigationFromRegistry("001", registry);
    expect(nav.next?.dayId).toBe("003");
    expect(nav.next?.href).toBe("/day-003");
  });

  it("rejects navigation from a dormant or malformed Day", () => {
    expect(() => getJourneyNavigation("073")).toThrow(/available/i);
    expect(() => getJourneyNavigation("000")).toThrow(/available|invalid/i);
  });
});
