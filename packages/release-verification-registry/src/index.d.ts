import type {
  HnkReproducibilityStatus,
  HnkReproducibilityVerificationReport,
} from "@hnk/reproducibility-verifier";

export declare const HNK_RELEASE_VERIFICATION_REGISTRY_ID: "HNK_RELEASE_VERIFICATION_REGISTRY_V1";
export declare const HNK_RELEASE_VERIFICATION_REGISTRY_VERSION: "1.0.0";
export declare const HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY: "VERIFICATION_REGISTRY_PRESERVES_REPORT_HISTORY_AND_EXPLICIT_HUMAN_RELEASE_DECISIONS_NOT_TRUTH_READINESS_OR_CANON";
export declare const HNK_RELEASE_GATE_DECISIONS: readonly ["RELEASE_ACCEPTED", "RELEASE_REJECTED", "RELEASE_HELD"];

export type HnkReleaseGateDecision = (typeof HNK_RELEASE_GATE_DECISIONS)[number];

export interface HnkReleaseVerificationRecord {
  record_id: string;
  release_key: string;
  manifest_digest: string;
  report_digest: string;
  overall_status: HnkReproducibilityStatus;
  registered_at: string;
  report: HnkReproducibilityVerificationReport;
  record_digest: string;
}

export interface HnkHumanReleaseGateDecisionEvent {
  decision_id: string;
  release_key: string;
  report_digest: string;
  report_overall_status: HnkReproducibilityStatus;
  decision: HnkReleaseGateDecision;
  reviewer: string;
  decided_at: string;
  explicit_human_signal: string;
  rationale: string;
  non_match_override_acknowledged: boolean;
  supersedes_decision_id: string | null;
  decision_digest: string;
  human_decision: true;
  machine_can_decide: false;
}

export interface HnkReleaseVerificationRegistry {
  registry_id: typeof HNK_RELEASE_VERIFICATION_REGISTRY_ID;
  registry_version: typeof HNK_RELEASE_VERIFICATION_REGISTRY_VERSION;
  authority: "HNK_AUTHORED_RELEASE_VERIFICATION_REGISTRY";
  registry_key: string;
  title: string;
  created_at: string;
  reports: HnkReleaseVerificationRecord[];
  decisions: HnkHumanReleaseGateDecisionEvent[];
  registry_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  immutable_report_history: true;
  immutable_decision_history: true;
  human_release_gate_required: true;
  match_auto_accepts_release: false;
  non_match_acceptance_requires_explicit_override: true;
  machine_can_accept_release: false;
  automatic_truth_inference: false;
  production_readiness_inferred: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY;
}

export interface CreateReleaseVerificationRegistryInput {
  registry_key: string;
  title: string;
  created_at: string;
}

export interface RegisterReleaseVerificationReportInput {
  report: HnkReproducibilityVerificationReport;
  registered_at: string;
}

export interface DecideHumanReleaseGateInput {
  release_key: string;
  report_digest: string;
  decision: HnkReleaseGateDecision;
  reviewer: string;
  decided_at: string;
  explicit_human_signal: string;
  rationale: string;
  non_match_override_acknowledged?: boolean;
}

export interface ReleaseVerificationRegistryValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface HnkReleaseVerificationStatusEntry {
  release_key: string;
  report_count: number;
  latest_report_digest: string;
  latest_report_status: HnkReproducibilityStatus;
  decision_count: number;
  current_decision: HnkReleaseGateDecision | null;
  current_decision_id: string | null;
  current_decision_report_digest: string | null;
  current_decision_report_status: HnkReproducibilityStatus | null;
  current_decision_is_on_latest_report: boolean;
  accepted: boolean;
  human_gate_pending: boolean;
}

export interface ReleaseVerificationRegistryIndex {
  registry_key: string;
  releases: number;
  reports: number;
  decisions: number;
  accepted_releases: number;
  pending_human_gate: number;
  match_reports_without_acceptance: number;
  statuses: ReadonlyArray<HnkReleaseVerificationStatusEntry>;
  truth_assessed: false;
  production_readiness_inferred: false;
  canon_promotion_permitted: false;
}

export declare function releaseVerificationRegistryProjection(registry: HnkReleaseVerificationRegistry): Readonly<Record<string, unknown>>;
export declare function createReleaseVerificationRegistry(input: CreateReleaseVerificationRegistryInput): HnkReleaseVerificationRegistry;
export declare function registerReleaseVerificationReport(registry: HnkReleaseVerificationRegistry, input: RegisterReleaseVerificationReportInput): HnkReleaseVerificationRegistry;
export declare function decideHumanReleaseGate(registry: HnkReleaseVerificationRegistry, input: DecideHumanReleaseGateInput): HnkReleaseVerificationRegistry;
export declare function validateReleaseVerificationRegistry(registry: unknown): ReleaseVerificationRegistryValidation;
export declare function releaseVerificationRegistryIndex(registry: HnkReleaseVerificationRegistry): ReleaseVerificationRegistryIndex;
export declare function serializeReleaseVerificationRegistry(registry: HnkReleaseVerificationRegistry): string;
export declare function parseReleaseVerificationRegistry(text: string): HnkReleaseVerificationRegistry;
export declare function releaseVerificationRegistrySummary(): Readonly<Record<string, unknown>>;
