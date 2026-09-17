import type { HnkCanonRecord } from "@hnk/canon-contract";

export type SymbolicRuntimePhase =
  | "INTENTION_CAPTURED"
  | "SPECIFIED"
  | "CONSTRUCTED"
  | "ACTIVE"
  | "OBSERVED"
  | "FEEDBACK_RECORDED"
  | "CLOSED"
  | "ABORTED";

export type SymbolicRuntimeEventType =
  | "GENERATE"
  | "SPECIFY"
  | "CONSTRUCT"
  | "BIND"
  | "ACTIVATE"
  | "OBSERVE"
  | "FEEDBACK"
  | "REGULATE"
  | "PRUNE"
  | "CHOOSE"
  | "CYCLE"
  | "COMPLETE"
  | "ABORT";

export type EvidenceScope = "OBSERVED" | "SELF_REPORTED" | "SYSTEM_MEASURED" | "MIXED";
export type FeedbackAction = "CONTINUE" | "CORRECT" | "PRUNE" | "CLOSE";
export type RegulationAction = "MAINTAIN" | "CORRECT" | "LIMIT" | "PAUSE";

export interface SymbolicRuntimeSessionInput {
  session_id: string;
  created_at: string;
  intention: string;
  current_state: string;
  target_state: string;
}

export interface SymbolicRuntimeEvent {
  event_id: string;
  type: SymbolicRuntimeEventType;
  at: string;
  payload?: Record<string, unknown>;
}

export interface SymbolicRuntimeSession {
  readonly contract_id: "HNK_SYMBOLIC_RUNTIME_CONTRACT_V1";
  readonly contract_version: "1.0.0";
  readonly canon_contract_id: string;
  readonly canon_sources: readonly string[];
  readonly session_id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly phase: SymbolicRuntimePhase;
  readonly cycle: number;
  readonly intention: string;
  readonly current_state: string;
  readonly target_state: string;
  readonly candidates: readonly Record<string, unknown>[];
  readonly specification: null | Readonly<{
    path_id: string;
    from_state: string;
    to_state: string;
    constraints: readonly string[];
  }>;
  readonly construction: null | Readonly<{
    construction_id: string;
    steps: readonly Readonly<{ step_id: string; action: string }>[];
  }>;
  readonly symbolic_key: null | Readonly<{ key_id: string; reference: string }>;
  readonly vessel: null | Readonly<{ vessel_id: string; context_type: string; context_ref: string }>;
  readonly choices: readonly Record<string, unknown>[];
  readonly regulations: readonly Record<string, unknown>[];
  readonly prunings: readonly Record<string, unknown>[];
  readonly observations: readonly Readonly<{
    observation_id: string;
    raw: string;
    interpretation: string | null;
    at: string;
  }>[];
  readonly feedback: readonly Readonly<{
    feedback_id: string;
    assessment: string;
    next_action: FeedbackAction;
    at: string;
  }>[];
  readonly result: null | Readonly<{
    result_state: string;
    evidence_scope: EvidenceScope;
    evidence: readonly unknown[];
    claim_boundary: "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF";
    completed_at: string;
  }>;
  readonly abort: null | Readonly<{ reason: string; aborted_at: string }>;
  readonly events: readonly SymbolicRuntimeEvent[];
}

export const HNK_SYMBOLIC_RUNTIME_CONTRACT_ID: "HNK_SYMBOLIC_RUNTIME_CONTRACT_V1";
export const HNK_SYMBOLIC_RUNTIME_VERSION: "1.0.0";
export const HNK_SYMBOLIC_RUNTIME_PHASES: readonly SymbolicRuntimePhase[];
export const HNK_SYMBOLIC_RUNTIME_EVENTS: readonly SymbolicRuntimeEventType[];
export const HNK_SYMBOLIC_RUNTIME_CANON_SOURCES: readonly string[];
export const HNK_SYMBOLIC_RUNTIME_CANON: readonly HnkCanonRecord[];

export function allowedSymbolicRuntimeEvents(phase: SymbolicRuntimePhase): readonly SymbolicRuntimeEventType[];
export function createSymbolicRuntimeSession(input: SymbolicRuntimeSessionInput): SymbolicRuntimeSession;
export function applySymbolicRuntimeEvent(session: SymbolicRuntimeSession, event: SymbolicRuntimeEvent): SymbolicRuntimeSession;
export function validateSymbolicRuntimeSession(session: unknown): Readonly<{ ok: boolean; issues: readonly string[] }>;
export function symbolicRuntimeSummary(): Readonly<{
  contract_id: string;
  version: string;
  canon_contract_id: string;
  canon_contract_ok: boolean;
  canon_dependencies: number;
  phases: number;
  events: number;
  deterministic_reducer: true;
  caller_supplied_ids_and_timestamps: true;
  evidence_scoped_results: true;
  metaphysical_efficacy_claimed: false;
}>;
