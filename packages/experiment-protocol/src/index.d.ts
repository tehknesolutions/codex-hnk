import type { RuntimeSessionArtifact } from "@hnk/runtime-session-artifact";

export const HNK_EXPERIMENT_PROTOCOL_ID: "HNK_EXPERIMENT_PROTOCOL_V1";
export const HNK_EXPERIMENT_PROTOCOL_VERSION: "1.0.0";
export const HNK_EXPERIMENT_CLAIM_BOUNDARY: "EXPERIMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF";
export const HNK_EXPERIMENT_ROLES: readonly ["CONTROL", "EXPERIMENT"];
export const HNK_EXPERIMENT_STATUSES: readonly ["PREREGISTERED", "IN_PROGRESS", "READY_TO_FINALIZE", "COMPLETED"];

export type HnkExperimentRole = (typeof HNK_EXPERIMENT_ROLES)[number];
export type HnkExperimentStatus = (typeof HNK_EXPERIMENT_STATUSES)[number];

export interface HnkExperimentPlan {
  observed_variables: string[];
  controlled_variables: string[];
  intervention: string | null;
  control_sessions_required: number;
  experimental_sessions_required: number;
  completion_criteria: string[];
  exclusion_criteria: string[];
}

export interface HnkExperimentSessionAssignment {
  assignment_id: string;
  role: HnkExperimentRole;
  added_at: string;
  artifact: RuntimeSessionArtifact;
}

export interface HnkExperimentReport {
  completed_at: string;
  descriptive_summary: string;
  interpretation: string;
  limitations: string[];
  conclusion_scope: "DESCRIPTIVE_AND_INTERPRETIVE_ONLY";
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
}

export interface HnkExperimentProtocol {
  protocol_id: "HNK_EXPERIMENT_PROTOCOL_V1";
  protocol_version: "1.0.0";
  authority: "HNK_AUTHORED_EXPERIMENT_PROTOCOL";
  experiment_id: string;
  created_at: string;
  locked_at: string;
  preregistration_locked: true;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  title: string;
  question: string;
  hypothesis: string;
  plan: HnkExperimentPlan;
  sessions: HnkExperimentSessionAssignment[];
  report: HnkExperimentReport | null;
  status: HnkExperimentStatus;
  claim_boundary: "EXPERIMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF";
}

export interface CreateExperimentProtocolInput {
  experiment_id: string;
  created_at: string;
  locked_at: string;
  title: string;
  question: string;
  hypothesis: string;
  plan: HnkExperimentPlan;
}

export interface AddExperimentArtifactInput {
  assignment_id: string;
  role: HnkExperimentRole;
  added_at: string;
  artifact: RuntimeSessionArtifact | string;
}

export interface FinalizeExperimentProtocolInput {
  completed_at: string;
  descriptive_summary: string;
  interpretation: string;
  limitations?: string[];
}

export function createExperimentProtocol(input: CreateExperimentProtocolInput): HnkExperimentProtocol;
export function addExperimentArtifact(protocol: HnkExperimentProtocol, input: AddExperimentArtifactInput): HnkExperimentProtocol;
export function finalizeExperimentProtocol(protocol: HnkExperimentProtocol, input: FinalizeExperimentProtocolInput): HnkExperimentProtocol;
export function validateExperimentProtocol(protocol: unknown): Readonly<{ ok: boolean; issues: string[] }>;
export function experimentDescriptiveSummary(protocol: HnkExperimentProtocol): Readonly<Record<string, unknown>>;
export function serializeExperimentProtocol(protocol: HnkExperimentProtocol): string;
export function parseExperimentProtocol(text: string): HnkExperimentProtocol;
export function experimentProtocolSummary(): Readonly<Record<string, unknown>>;
