import { beforeEach, describe, expect, it } from "vitest";
import { getLabDefinition, getLabPhases, registerLabDefinition } from "../src/definition.js";

const valid = () => ({
  dayId: "001",
  objective: "Execute the registered Day protocol.",
  preparation: ["Prepare the environment."],
  steps: [{ stepId: "s1", order: 1, title: "Begin", instruction: "Follow the Day contract." }],
  evidence: [{ evidenceId: "e1", label: "Structured protocol evidence", kind: "STRUCTURED" as const, required: true }],
  completion: { authority: "SERVER" as const, practiceResultCanPromoteCanon: false as const },
});

describe("M8 generic Lab definition", () => {
  it("exposes the five required phases in order", () => {
    expect(getLabPhases()).toEqual(["OBJECTIVE", "PREPARATION", "STEPS", "EVIDENCE", "COMPLETION"]);
  });

  it("registers an executable Day definition without changing authority", () => {
    registerLabDefinition(valid());
    expect(getLabDefinition("001")?.completion).toEqual({ authority: "SERVER", practiceResultCanPromoteCanon: false });
  });

  it("rejects dormant Days even when a practice file exists", () => {
    expect(() => registerLabDefinition({ ...valid(), dayId: "074" })).toThrow("lab_not_executable:074");
    expect(getLabDefinition("074")).toBeUndefined();
  });

  it("rejects definitions without objective or ordered executable steps", () => {
    expect(() => registerLabDefinition({ ...valid(), objective: " " })).toThrow("lab_objective_required");
    expect(() => registerLabDefinition({ ...valid(), steps: [{ ...valid().steps[0], order: 2 }] })).toThrow("lab_steps_must_be_contiguous");
  });

  it("rejects any completion contract that could promote practice into canon", () => {
    expect(() => registerLabDefinition({ ...valid(), completion: { authority: "SERVER", practiceResultCanPromoteCanon: true } as never })).toThrow("lab_completion_boundary_invalid");
  });
});
