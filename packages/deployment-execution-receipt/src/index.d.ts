import type { HnkDeploymentGateRegistry } from "@hnk/deployment-gate-registry";
import type { HnkReleaseVerificationRegistry } from "@hnk/release-verification-registry";

export declare const HNK_DEPLOYMENT_EXECUTION_RECEIPT_ID: "HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1";
export declare const HNK_DEPLOYMENT_EXECUTION_RECEIPT_VERSION: "1.0.0";
export declare const HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY: "DEPLOYMENT_RECEIPT_ATTESTS_RECORDED_EXECUTION_METADATA_AGAINST_CURRENT_HUMAN_AUTHORIZATION_NOT_PROVIDER_SIGNATURE_READINESS_TRUTH_OR_CANON";
export declare const HNK_DEPLOYMENT_EXECUTION_RESULTS: readonly ["SUCCEEDED", "FAILED", "CANCELED", "UNKNOWN"];

export type HnkDeploymentExecutionResult = (typeof HNK_DEPLOYMENT_EXECUTION_RESULTS)[number];

export interface HnkDeploymentExecutionReceipt {
  receipt_id: typeof HNK_DEPLOYMENT_EXECUTION_RECEIPT_ID;
  receipt_version: typeof HNK_DEPLOYMENT_EXECUTION_RECEIPT_VERSION;
  authority: "HNK_AUTHORED_DEPLOYMENT_EXECUTION_RECEIPT";
  receipt_key: string;
  created_at: string;
  release_key: string;
  candidate_id: string;
  candidate_digest: string;
  deployment_decision_id: string;
  deployment_decision_digest: string;
  source_deployment_gate_registry_digest: string;
  source_release_verification_registry_digest: string;
  source_report_digest: string;
  source_release_decision_id: string;
  source_release_decision_digest: string;
  target_environment: string;
  expected_git_commit_sha: string;
  observed_git_commit_sha: string;
  provider: {
    name: string;
    deployment_id: string;
    deployment_url: string | null;
    result: HnkDeploymentExecutionResult;
  };
  execution: {
    started_at: string | null;
    completed_at: string;
    observed_by: string;
    observed_at: string;
    evidence_note: string;
    provider_payload_digest: string;
  };
  receipt_digest: string;
  deployment_authorization_current_at_receipt_creation: true;
  deployment_execution_recorded: true;
  deployment_execution_performed_by_contract: false;
  provider_signature_verified: false;
  content_integrity_scope: true;
  production_readiness_inferred: false;
  truth_assessed: false;
  authorship_proof: false;
  trusted_timestamp_proof: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY;
}

export interface CreateDeploymentExecutionReceiptInput {
  receipt_key: string;
  created_at: string;
  deployment_gate_registry: HnkDeploymentGateRegistry;
  release_verification_registry: HnkReleaseVerificationRegistry;
  candidate_id: string;
  observed_git_commit_sha: string;
  provider: {
    name: string;
    deployment_id: string;
    deployment_url?: string | null;
    result: HnkDeploymentExecutionResult;
    provider_payload_text: string;
  };
  execution: {
    started_at?: string | null;
    completed_at: string;
    observed_by: string;
    observed_at: string;
    evidence_note: string;
  };
}

export interface DeploymentExecutionReceiptValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export declare function deploymentExecutionReceiptProjection(receipt: HnkDeploymentExecutionReceipt): Readonly<Record<string, unknown>>;
export declare function createDeploymentExecutionReceipt(input: CreateDeploymentExecutionReceiptInput): HnkDeploymentExecutionReceipt;
export declare function validateDeploymentExecutionReceipt(receipt: unknown): DeploymentExecutionReceiptValidation;
export declare function serializeDeploymentExecutionReceipt(receipt: HnkDeploymentExecutionReceipt): string;
export declare function parseDeploymentExecutionReceipt(text: string): HnkDeploymentExecutionReceipt;
export declare function deploymentExecutionReceiptSummary(): Readonly<Record<string, unknown>>;
