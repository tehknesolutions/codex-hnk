import type { HnkWorkspaceSnapshotRegistry } from "@hnk/research-workspace-snapshot-registry";

export declare const HNK_RESEARCH_RELEASE_MANIFEST_ID: "HNK_RESEARCH_RELEASE_MANIFEST_V1";
export declare const HNK_RESEARCH_RELEASE_MANIFEST_VERSION: "1.0.0";
export declare const HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY: "RELEASE_MANIFEST_BINDS_RESEARCH_STATE_CODE_CONTRACTS_AND_VALIDATION_EVIDENCE_NOT_TRUTH_AUTHORSHIP_TIME_OR_CANON";
export declare const HNK_RELEASE_VALIDATOR_RESULTS: readonly ["PASS", "FAIL", "NOT_EXECUTED", "INFRASTRUCTURE_BLOCKED"];

export type HnkReleaseValidatorResult = (typeof HNK_RELEASE_VALIDATOR_RESULTS)[number];
export type HnkReleaseValidatorExecutionStatus = "COMPLETE_PASS" | "HAS_FAILURE" | "INCOMPLETE";

export interface HnkReleaseContractBinding {
  contract_id: string;
  contract_version: string;
  package_name: string;
  source_path: string;
  content_digest: string;
}

export interface HnkReleaseValidatorBinding {
  validator_id: string;
  source_path: string;
  content_digest: string;
  result: HnkReleaseValidatorResult;
  executed_at: string | null;
  environment: string;
  evidence_note: string;
}

export interface HnkResearchReleaseManifest {
  release_id: typeof HNK_RESEARCH_RELEASE_MANIFEST_ID;
  release_version: typeof HNK_RESEARCH_RELEASE_MANIFEST_VERSION;
  authority: "HNK_AUTHORED_RESEARCH_RELEASE_MANIFEST";
  release_key: string;
  label: string;
  created_at: string;
  workspace_snapshot_registry: HnkWorkspaceSnapshotRegistry;
  workspace_registry_digest: string;
  head_snapshot_digest: string;
  head_record_digest: string;
  head_event_digest: string;
  git: {
    repository_full_name: string;
    commit_sha: string;
    ref: string;
    working_tree_status: "NOT_ASSESSED";
  };
  runtime: {
    node_engine: string;
    package_manager: string;
  };
  contracts: HnkReleaseContractBinding[];
  validators: HnkReleaseValidatorBinding[];
  validator_execution_status: HnkReleaseValidatorExecutionStatus;
  reproduction: {
    install_command: string;
    validation_commands: string[];
    build_command: string;
    notes: string[];
  };
  manifest_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  content_integrity_scope: true;
  authorship_proof: false;
  trusted_timestamp_proof: false;
  truth_assessed: false;
  production_readiness_inferred: false;
  machine_can_decide_review: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY;
}

export interface CreateReleaseContractBindingInput {
  contract_id: string;
  contract_version: string;
  package_name: string;
  source_path: string;
  source_text: string;
}

export interface CreateReleaseValidatorBindingInput {
  validator_id: string;
  source_path: string;
  source_text: string;
  result: HnkReleaseValidatorResult;
  executed_at?: string | null;
  environment: string;
  evidence_note: string;
}

export interface CreateResearchReleaseManifestInput {
  release_key: string;
  label: string;
  created_at: string;
  workspace_snapshot_registry: HnkWorkspaceSnapshotRegistry;
  git: {
    repository_full_name: string;
    commit_sha: string;
    ref: string;
  };
  runtime: {
    node_engine: string;
    package_manager: string;
  };
  contracts: HnkReleaseContractBinding[];
  validators: HnkReleaseValidatorBinding[];
  reproduction: {
    install_command: string;
    validation_commands: string[];
    build_command: string;
    notes?: string[];
  };
}

export interface ResearchReleaseManifestValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export declare function createReleaseContractBinding(input: CreateReleaseContractBindingInput): HnkReleaseContractBinding;
export declare function createReleaseValidatorBinding(input: CreateReleaseValidatorBindingInput): HnkReleaseValidatorBinding;
export declare function releaseValidatorExecutionStatus(validators: ReadonlyArray<HnkReleaseValidatorBinding>): HnkReleaseValidatorExecutionStatus;
export declare function researchReleaseManifestProjection(manifest: HnkResearchReleaseManifest): Readonly<Record<string, unknown>>;
export declare function createResearchReleaseManifest(input: CreateResearchReleaseManifestInput): HnkResearchReleaseManifest;
export declare function validateResearchReleaseManifest(manifest: unknown): ResearchReleaseManifestValidation;
export declare function serializeResearchReleaseManifest(manifest: HnkResearchReleaseManifest): string;
export declare function parseResearchReleaseManifest(text: string): HnkResearchReleaseManifest;
export declare function researchReleaseManifestSummary(): Readonly<Record<string, unknown>>;
