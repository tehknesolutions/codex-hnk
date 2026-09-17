import type { SymbolicRuntimeSession } from "@hnk/symbolic-runtime-contract";

export interface RuntimeSessionArtifactInitialState {
  readonly session_id: string;
  readonly created_at: string;
  readonly intention: string;
  readonly current_state: string;
  readonly target_state: string;
}

export interface RuntimeSessionArtifact {
  readonly artifact_id: "HNK_RUNTIME_SESSION_ARTIFACT_V1";
  readonly artifact_version: "1.0.0";
  readonly exported_at: string;
  readonly persistence: "USER_CONTROLLED_FILE_ONLY";
  readonly server_persistence: false;
  readonly browser_persistence: false;
  readonly runtime_contract_id: "HNK_SYMBOLIC_RUNTIME_CONTRACT_V1";
  readonly runtime_contract_version: "1.0.0";
  readonly claim_boundary: "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF";
  readonly initial: RuntimeSessionArtifactInitialState;
  readonly session: SymbolicRuntimeSession;
}

export interface RuntimeSessionArtifactInput {
  readonly session: SymbolicRuntimeSession;
  readonly exported_at: string;
  readonly initial: RuntimeSessionArtifactInitialState;
}

export interface RuntimeSessionArtifactValidation {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export interface RuntimeSessionReplay {
  readonly ok: boolean;
  readonly replayed: SymbolicRuntimeSession | null;
  readonly matches_snapshot: boolean;
  readonly issues: readonly string[];
}

export interface RuntimeSessionComparisonMetric {
  readonly key: string;
  readonly left: string | number | boolean | null;
  readonly right: string | number | boolean | null;
  readonly equal: boolean;
}

export interface RuntimeSessionComparison {
  readonly compatible: boolean;
  readonly same_event_sequence: boolean;
  readonly differences: readonly string[];
  readonly metrics: readonly RuntimeSessionComparisonMetric[];
}

export const HNK_RUNTIME_SESSION_ARTIFACT_ID: "HNK_RUNTIME_SESSION_ARTIFACT_V1";
export const HNK_RUNTIME_SESSION_ARTIFACT_VERSION: "1.0.0";

export function createRuntimeSessionArtifact(input: RuntimeSessionArtifactInput): RuntimeSessionArtifact;
export function validateRuntimeSessionArtifact(artifact: unknown): RuntimeSessionArtifactValidation;
export function serializeRuntimeSessionArtifact(artifact: RuntimeSessionArtifact): string;
export function parseRuntimeSessionArtifact(text: string): RuntimeSessionArtifact;
export function replayRuntimeSessionArtifact(artifact: RuntimeSessionArtifact): RuntimeSessionReplay;
export function compareRuntimeSessionArtifacts(left: RuntimeSessionArtifact, right: RuntimeSessionArtifact): RuntimeSessionComparison;
export function runtimeSessionArtifactSummary(): Readonly<{
  artifact_id: typeof HNK_RUNTIME_SESSION_ARTIFACT_ID;
  version: typeof HNK_RUNTIME_SESSION_ARTIFACT_VERSION;
  runtime_contract_id: "HNK_SYMBOLIC_RUNTIME_CONTRACT_V1";
  deterministic_replay: true;
  comparison: true;
  server_persistence: false;
  browser_persistence: false;
  user_controlled_export: true;
  claim_boundary: "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF";
}>;
