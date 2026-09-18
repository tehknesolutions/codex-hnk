import type {
  HnkReleaseVerificationRegistry,
} from "@hnk/release-verification-registry";

export declare const HNK_DEPLOYMENT_GATE_REGISTRY_ID: "HNK_DEPLOYMENT_GATE_REGISTRY_V1";
export declare const HNK_DEPLOYMENT_GATE_REGISTRY_VERSION: "1.0.0";
export declare const HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY: "DEPLOYMENT_GATE_BINDS_EXPLICIT_HUMAN_DEPLOYMENT_AUTHORIZATION_TO_CURRENT_ACCEPTED_RELEASE_STATE_NOT_EXECUTION_READINESS_TRUTH_OR_CANON";
export declare const HNK_DEPLOYMENT_GATE_DECISIONS: readonly ["DEPLOYMENT_APPROVED", "DEPLOYMENT_REJECTED", "DEPLOYMENT_HELD"];
export declare const HNK_DEPLOYMENT_ELIGIBILITY_STATUSES: readonly ["ELIGIBLE", "STALE_RELEASE_STATE", "RELEASE_NOT_ACCEPTED", "RELEASE_NOT_FOUND", "CANDIDATE_NOT_FOUND"];

export type HnkDeploymentGateDecision = (typeof HNK_DEPLOYMENT_GATE_DECISIONS)[number];
export type HnkDeploymentEligibilityStatus = (typeof HNK_DEPLOYMENT_ELIGIBILITY_STATUSES)[number];

export interface HnkDeploymentCandidate {
  candidate_id: string;
  release_key: string;
  target_environment: string;
  source_release_registry_digest: string;
  report_digest: string;
  report_overall_status: string;
  release_decision_id: string;
  release_decision_digest: string;
  nominated_by: string;
  nominated_at: string;
  explicit_human_signal: string;
  rationale: string;
  candidate_digest: string;
  human_nomination: true;
  machine_can_nominate: false;
  automatic_deployment: false;
  deployment_executed: false;
}

export interface HnkHumanDeploymentGateDecisionEvent {
  deployment_decision_id: string;
  candidate_id: string;
  release_key: string;
  target_environment: string;
  decision: HnkDeploymentGateDecision;
  reviewer: string;
  decided_at: string;
  explicit_human_signal: string;
  rationale: string;
  eligibility_at_decision: HnkDeploymentEligibilityStatus;
  source_release_registry_digest: string;
  source_report_digest: string;
  source_release_decision_id: string;
  source_release_decision_digest: string;
  supersedes_deployment_decision_id: string | null;
  decision_digest: string;
  human_decision: true;
  machine_can_decide: false;
  deployment_executed: false;
}

export interface HnkDeploymentGateRegistry {
  registry_id: typeof HNK_DEPLOYMENT_GATE_REGISTRY_ID;
  registry_version: typeof HNK_DEPLOYMENT_GATE_REGISTRY_VERSION;
  authority: "HNK_AUTHORED_DEPLOYMENT_GATE_REGISTRY";
  registry_key: string;
  title: string;
  created_at: string;
  candidates: HnkDeploymentCandidate[];
  decisions: HnkHumanDeploymentGateDecisionEvent[];
  registry_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  immutable_candidate_history: true;
  immutable_decision_history: true;
  human_deployment_gate_required: true;
  release_accepted_auto_approves_deployment: false;
  machine_can_nominate: false;
  machine_can_approve_deployment: false;
  deployment_execution_performed_by_registry: false;
  automatic_truth_inference: false;
  production_readiness_inferred: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY;
}

export interface CreateDeploymentGateRegistryInput {
  registry_key: string;
  title: string;
  created_at: string;
}

export interface NominateDeploymentCandidateInput {
  release_verification_registry: HnkReleaseVerificationRegistry;
  release_key: string;
  target_environment: string;
  nominated_by: string;
  nominated_at: string;
  explicit_human_signal: string;
  rationale: string;
}

export interface DecideHumanDeploymentGateInput {
  release_verification_registry: HnkReleaseVerificationRegistry;
  candidate_id: string;
  decision: HnkDeploymentGateDecision;
  reviewer: string;
  decided_at: string;
  explicit_human_signal: string;
  rationale: string;
}

export interface DeploymentGateRegistryValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface HnkDeploymentCandidateEvaluation {
  candidate_id: string;
  release_key: string;
  target_environment: string;
  eligibility_status: HnkDeploymentEligibilityStatus;
  release_exists: boolean;
  release_accepted: boolean;
  latest_report_matches_candidate: boolean;
  release_decision_matches_candidate: boolean;
  latest_deployment_decision: HnkDeploymentGateDecision | null;
  latest_deployment_decision_id: string | null;
  approved_for_deployment: boolean;
  human_deployment_gate_pending: boolean;
  deployment_executed: false;
  production_readiness_inferred: false;
  canon_promotion_permitted: false;
}

export interface DeploymentGateRegistryIndex {
  registry_key: string;
  candidates: number;
  decisions: number;
  recorded_approvals: number;
  recorded_holds: number;
  recorded_rejections: number;
  human_gate_pending_without_current_state_check: number;
  machine_can_approve_deployment: false;
  deployment_execution_performed_by_registry: false;
  truth_assessed: false;
  production_readiness_inferred: false;
  canon_promotion_permitted: false;
}

export declare function deploymentGateRegistryProjection(registry: HnkDeploymentGateRegistry): Readonly<Record<string, unknown>>;
export declare function createDeploymentGateRegistry(input: CreateDeploymentGateRegistryInput): HnkDeploymentGateRegistry;
export declare function nominateDeploymentCandidate(registry: HnkDeploymentGateRegistry, input: NominateDeploymentCandidateInput): HnkDeploymentGateRegistry;
export declare function evaluateDeploymentCandidate(registry: HnkDeploymentGateRegistry, releaseVerificationRegistry: HnkReleaseVerificationRegistry, candidateId: string): HnkDeploymentCandidateEvaluation;
export declare function decideHumanDeploymentGate(registry: HnkDeploymentGateRegistry, input: DecideHumanDeploymentGateInput): HnkDeploymentGateRegistry;
export declare function validateDeploymentGateRegistry(registry: unknown): DeploymentGateRegistryValidation;
export declare function deploymentGateRegistryIndex(registry: HnkDeploymentGateRegistry): DeploymentGateRegistryIndex;
export declare function serializeDeploymentGateRegistry(registry: HnkDeploymentGateRegistry): string;
export declare function parseDeploymentGateRegistry(text: string): HnkDeploymentGateRegistry;
export declare function deploymentGateRegistrySummary(): Readonly<Record<string, unknown>>;
