import { describe, expect, it } from "vitest";
import {
  JOURNEY_HORIZON,
  buildJourneyRegistry,
  getJourneyDay,
  getJourneySlots,
  isExecutableDay,
} from "./registry.js";

describe("M6 journey registry", () => {
  it("exposes the complete 001-109 structural horizon", () => {
    const slots = getJourneySlots();
    expect(JOURNEY_HORIZON).toBe(109);
    expect(slots).toHaveLength(109);
    expect(slots[0]?.dayId).toBe("001");
    expect(slots[108]?.dayId).toBe("109");
  });

  it("keeps the approved executable frontier at 001-072", () => {
    expect(getJourneyDay("001")?.status).toBe("AVAILABLE");
    expect(getJourneyDay("072")?.status).toBe("AVAILABLE");
    expect(getJourneyDay("073")?.status).toBe("DORMANT");
    expect(getJourneyDay("109")?.status).toBe("DORMANT");
    expect(isExecutableDay("072")).toBe(true);
    expect(isExecutableDay("073")).toBe(false);
  });

  it.each(["73", "abc", "000", "110", "", " 001"])(
    "fails closed for malformed or out-of-range id %s",
    (dayId) => {
      expect(getJourneyDay(dayId)).toBeUndefined();
      expect(isExecutableDay(dayId)).toBe(false);
    },
  );

  it("never gives a dormant slot an executable href", () => {
    const dormant = getJourneySlots().filter((slot) => slot.status === "DORMANT");
    expect(dormant.length).toBe(37);
    expect(dormant.every((slot) => !("href" in slot))).toBe(true);
  });

  it("rejects duplicate executable registrations", () => {
    expect(() =>
      buildJourneyRegistry([
        { dayId: "001", status: "AVAILABLE", href: "/day-001", sourceKind: "LEGACY_DAY" },
        { dayId: "001", status: "AVAILABLE", href: "/day-001-copy", sourceKind: "LEGACY_DAY" },
      ]),
    ).toThrow(/duplicate/i);
  });

  it("rejects incomplete executable registrations", () => {
    expect(() =>
      buildJourneyRegistry([
        { dayId: "001", status: "AVAILABLE", href: "", sourceKind: "LEGACY_DAY" },
      ]),
    ).toThrow(/href/i);
  });
});
