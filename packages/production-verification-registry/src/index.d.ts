import type {
  HnkDeploymentExecutionReceipt,
} from "@hnk/deployment-execution-receipt";

export declare const HNK_PRODUCTION_VERIFICATION_REGISTRY_ID: "HNK_PRODUCTION_VERIFICATION_REGISTRY_V1";
export declare const HNK_PRODUCTION_VERIFICATION_REGISTRY_VERSION: "1.0.0";
export declare const HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY: "PRODUCTION_REGISTRY_PRESERVES_DEPLOYMENT_RECEIPTS_POST_DEPLOYMENT_OBSERVATIONS_AND_EXPLICIT_HUMAN_PRODUCTION_DECISIONS_NOT_GLOBAL_READINESS_TRUTH_OR_CANON";
export declare const HNK_POST_DEPLOYMENT_CHECK_RESULTS: readonly ["PASS", "FAIL", "UNVERIFIED"];
export declare const HNK_POST_DEPLOYMENT_OVERALL_STATUSES: readonly ["PASS", "FAIL", "UNVERIFIED"];
export declare const HNK_PRODUCTION_GATE_DECISIONS: readonly ["PRODUCTION_ACCEPTED", "PRODUCTION_REJECTED", "PRODUCTION_HELD"];

export type HnkPostDeploymentCheckResult = (typeof HNK_POST_DEPLOYMENT_CHECK_RESULTS)[number];
export type HnkPostDeploymentOverallStatus = (typeof HNK_POST_DEPLOYMENT_OVERALL_STATUSES)[number];
export type HnkProductionGateDecision = (typeof HNK_PRODUCTION_GATE_DECISIONS)[number];

export interface HnkDeploymentReceiptRecord {
  record_id: string;
  release_key: string;
  target_environment: string;
  receipt_digest: string;
  provider_result: string;
  registered_at: string;
  receipt: HnkDeploymentExecutionReceipt;
  record_digest: string;
}

export interface HnkPostDeploymentCheck {
  check_id: string;
  kind: "URL" | "HEALTH" | "SMOKE" | "CUSTOM";
  expected: string;
  observed: string;
  result: HnkPostDeploymentCheckResult;
  evidence_note: string;
  evidence_digest: string;
}

export interface HnkPostDeploymentVerification {
  verification_id: string;
  release_key: string;
  target_environment: string;
  receipt_digest: string;
  expected_git_commit_sha: string;
  observed_git_commit_sha: string;
  observed_url: string;
  checks: HnkPostDeploymentCheck[];
  overall_status: HnkPostDeploymentOverallStatus;
  verified_by: string;
  verified_at: string;
  verification_digest: string;
  network_checks_executed_by_contract: false;
  production_readiness_inferred: false;
  truth_assessed: false;
}

export interface HnkHumanProductionGateDecisionEvent {
  decision_id: string;
  release_key: string;
  target_environment: string;
  receipt_digest: string;
  verification_digest: string;
  verification_status: HnkPostDeploymentOverallStatus;
  decision: HnkProductionGateDecision;
  reviewer: string;
  decided_at: string;
  explicit_human_signal: string;
  rationale: string;
  supersedes_decision_id: string | null;
  decision_digest: string;
  human_decision: true;
  machine_can_decide: false;
}

export interface HnkProductionVerificationRegistry {
  registry_id: typeof HNK_PRODUCTION_VERIFICATION_REGISTRY_ID;
  registry_version: typeof HNK_PRODUCTION_VERIFICATION_REGISTRY_VERSION;
  authority: "HNK_AUTHORED_PRODUCTION_VERIFICATION_REGISTRY";
  registry_key: string;
  title: string;
  created_at: string;
  receipts: HnkDeploymentReceiptRecord[];
  verifications: HnkPostDeploymentVerification[];
  decisions: HnkHumanProductionGateDecisionEvent[];
  registry_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  immutable_receipt_history: true;
  immutable_verification_history: true;
  immutable_decision_history: true;
  human_production_gate_required: true;
  deployment_succeeded_auto_accepts_production: false;
  post_deployment_pass_auto_accepts_production: false;
  latest_receipt_and_verification_required: true;
  production_accept_requires_succeeded_receipt_and_pass_verification: true;
  machine_can_accept_production: false;
  network_checks_executed_by_registry: false;
  automatic_truth_inference: false;
  production_readiness_inferred: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY;
}

export interface CreateProductionVerificationRegistryInput {
  registry_key: string;
  title: string;
  created_at: string;
}

export interface RegisterDeploymentExecutionReceiptInput {
  receipt: HnkDeploymentExecutionReceipt;
  registered_at: string;
}

export interface CreatePostDeploymentVerificationInput {
  receipt_digest: string;
  observed_git_commit_sha: string;
  observed_url: string;
  verified_by: string;
  verified_at: string;
  checks: Array<{
    check_id: string;
    kind: "URL" | "HEALTH" | "SMOKE" | "CUSTOM";
    expected: string;
    observed: string;
    result: HnkPostDeploymentCheckResult;
    evidence_note: string;
    evidence_text: string;
  }>;
}

export interface DecideHumanProductionGateInput {
  release_key: string;
  target_environment: string;
  verification_digest: string;
  decision: HnkProductionGateDecision;
  reviewer: string;
  decided_at: string;
  explicit_human_signal: string;
  rationale: string;
}

export interface ProductionVerificationRegistryValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface HnkProductionStateEntry {
  release_key: string;
  target_environment: string;
  receipt_count: number;
  latest_receipt_digest: string;
  latest_provider_result: string;
  verification_count_for_latest_receipt: number;
  latest_verification_digest: string | null;
  latest_verification_status: HnkPostDeploymentOverallStatus | null;
  decision_count: number;
  current_decision: HnkProductionGateDecision | null;
  current_decision_id: string | null;
  current_decision_is_on_latest_verification: boolean;
  production_accepted: boolean;
  human_production_gate_pending: boolean;
  verification_required: boolean;
}

export interface ProductionVerificationRegistryIndex {
  registry_key: string;
  release_environments: number;
  receipts: number;
  verifications: number;
  decisions: number;
  production_accepted: number;
  pending_human_gate: number;
  awaiting_verification: number;
  pass_without_acceptance: number;
  states: ReadonlyArray<HnkProductionStateEntry>;
  machine_can_accept_production: false;
  network_checks_executed_by_registry: false;
  truth_assessed: false;
  production_readiness_inferred: false;
  canon_promotion_permitted: false;
}

export declare function productionVerificationRegistryProjection(registry: HnkProductionVerificationRegistry): Readonly<Record<string, unknown>>;
export declare function createProductionVerificationRegistry(input: CreateProductionVerificationRegistryInput): HnkProductionVerificationRegistry;
export declare function registerDeploymentExecutionReceipt(registry: HnkProductionVerificationRegistry, input: RegisterDeploymentExecutionReceiptInput): HnkProductionVerificationRegistry;
export declare function createPostDeploymentVerification(registry: HnkProductionVerificationRegistry, input: CreatePostDeploymentVerificationInput): HnkProductionVerificationRegistry;
export declare function decideHumanProductionGate(registry: HnkProductionVerificationRegistry, input: DecideHumanProductionGateInput): HnkProductionVerificationRegistry;
export declare function validateProductionVerificationRegistry(registry: unknown): ProductionVerificationRegistryValidation;
export declare function productionVerificationRegistryIndex(registry: HnkProductionVerificationRegistry): ProductionVerificationRegistryIndex;
export declare function serializeProductionVerificationRegistry(registry: HnkProductionVerificationRegistry): string;
export declare function parseProductionVerificationRegistry(text: string): HnkProductionVerificationRegistry;
export declare function productionVerificationRegistrySummary(): Readonly<Record<string, unknown>>;
