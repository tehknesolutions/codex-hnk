import { describe, expect, it } from "vitest";
import { getJourneyDay } from "./registry.js";
import { CHAMBER_SURFACE_IDS, projectDayChamber } from "./chamber.js";

describe("M6 day chamber projection", () => {
  it("projects every available Day into exactly five ordered semantic surfaces", () => {
    const day = getJourneyDay("001");
    if (!day) throw new Error("missing fixture day");
    const chamber = projectDayChamber(day, {
      VISAO: { ref: "day001:vision" },
      MANUSCRITO: { ref: "day001:manuscript" },
    });
    expect(chamber.surfaces.map((surface) => surface.id)).toEqual(CHAMBER_SURFACE_IDS);
    expect(chamber.surfaces).toHaveLength(5);
  });

  it("preserves authoritative Day identity, href and source kind", () => {
    const day = getJourneyDay("037");
    if (!day || day.status !== "AVAILABLE") throw new Error("missing available fixture day");
    const chamber = projectDayChamber(day, {});
    expect(chamber.dayId).toBe(day.dayId);
    expect(chamber.href).toBe(day.href);
    expect(chamber.sourceKind).toBe(day.sourceKind);
  });

  it("marks unsupported facets explicitly unavailable instead of inventing content", () => {
    const day = getJourneyDay("072");
    if (!day) throw new Error("missing fixture day");
    const chamber = projectDayChamber(day, { PRATICA: { ref: "day072:practice" } });
    expect(chamber.surfaces.find((surface) => surface.id === "PRATICA")?.status).toBe("AVAILABLE");
    expect(chamber.surfaces.find((surface) => surface.id === "DIARIO")).toEqual({ id: "DIARIO", status: "UNAVAILABLE" });
  });

  it("rejects projection for dormant Days", () => {
    const day = getJourneyDay("073");
    if (!day) throw new Error("missing dormant fixture day");
    expect(() => projectDayChamber(day, {})).toThrow(/dormant|available/i);
  });
});
