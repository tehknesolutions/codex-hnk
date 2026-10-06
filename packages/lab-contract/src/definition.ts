import { getLab } from "./registry.js";

export type LabPhase = "OBJECTIVE" | "PREPARATION" | "STEPS" | "EVIDENCE" | "COMPLETION";

export interface LabStepDefinition {
  stepId: string;
  order: number;
  title: string;
  instruction: string;
  optional?: boolean;
}

export interface LabEvidenceRequirement {
  evidenceId: string;
  label: string;
  kind: "STRUCTURED" | "VAULT_REF" | "ENCRYPTED_MEDIA_REF";
  required: boolean;
}

export interface ExecutableLabDefinition {
  dayId: string;
  objective: string;
  preparation: readonly string[];
  steps: readonly LabStepDefinition[];
  evidence: readonly LabEvidenceRequirement[];
  completion: {
    authority: "SERVER";
    practiceResultCanPromoteCanon: false;
  };
}

const DEFINITIONS = new Map<string, ExecutableLabDefinition>();

export function registerLabDefinition(definition: ExecutableLabDefinition): void {
  const lab = getLab(definition.dayId);
  if (!lab || lab.status !== "AVAILABLE") throw new Error(`lab_not_executable:${definition.dayId}`);
  if (!definition.objective.trim()) throw new Error("lab_objective_required");
  if (definition.preparation.some((item) => !item.trim())) throw new Error("lab_preparation_invalid");
  if (definition.steps.length === 0) throw new Error("lab_steps_required");
  const orders = definition.steps.map((step) => step.order);
  if (new Set(orders).size !== orders.length || [...orders].sort((a, b) => a - b).some((n, i) => n !== i + 1)) {
    throw new Error("lab_steps_must_be_contiguous");
  }
  if (definition.steps.some((step) => !step.stepId.trim() || !step.title.trim() || !step.instruction.trim())) {
    throw new Error("lab_step_invalid");
  }
  if (definition.evidence.some((item) => !item.evidenceId.trim() || !item.label.trim())) {
    throw new Error("lab_evidence_invalid");
  }
  if (definition.completion.authority !== "SERVER" || definition.completion.practiceResultCanPromoteCanon !== false) {
    throw new Error("lab_completion_boundary_invalid");
  }
  DEFINITIONS.set(definition.dayId, Object.freeze({
    ...definition,
    preparation: Object.freeze([...definition.preparation]),
    steps: Object.freeze(definition.steps.map((step) => Object.freeze({ ...step }))),
    evidence: Object.freeze(definition.evidence.map((item) => Object.freeze({ ...item }))),
    completion: Object.freeze({ ...definition.completion }),
  }));
}

export function getLabDefinition(dayId: string): ExecutableLabDefinition | undefined {
  const lab = getLab(dayId);
  if (!lab || lab.status !== "AVAILABLE") return undefined;
  return DEFINITIONS.get(dayId);
}

export function getLabPhases(): readonly LabPhase[] {
  return Object.freeze(["OBJECTIVE", "PREPARATION", "STEPS", "EVIDENCE", "COMPLETION"]);
}
