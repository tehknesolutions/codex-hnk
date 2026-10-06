import { describe, expect, it } from "vitest";
import { getLab, getLabRegistry, isExecutableLab } from "../src/registry.js";

describe("M8 Lab Registry", () => {
  it("projects the full 109-day structural horizon", () => {
    expect(getLabRegistry()).toHaveLength(109);
  });

  it("exposes only the approved executable frontier", () => {
    expect(getLabRegistry().filter((lab) => lab.status === "AVAILABLE")).toHaveLength(72);
    expect(getLab("072")?.status).toBe("AVAILABLE");
    expect(getLab("073")?.status).toBe("DORMANT");
    expect(getLab("074")?.status).toBe("DORMANT");
  });

  it("never manufactures executable routes for dormant days", () => {
    expect(getLab("073")).toEqual({ labId: "DAY-073", dayId: "073", status: "DORMANT" });
    expect(isExecutableLab("073")).toBe(false);
  });

  it("fails closed for malformed and out-of-range ids", () => {
    expect(getLab("73")).toBeUndefined();
    expect(getLab("000")).toBeUndefined();
    expect(getLab("110")).toBeUndefined();
  });

  it("projects executable labs to the practice contract namespace", () => {
    expect(getLab("001")).toMatchObject({
      labId: "DAY-001",
      status: "AVAILABLE",
      href: "/labs/day-001",
      practiceContractRef: "@hnk/practice-contract/day001",
    });
  });
});
