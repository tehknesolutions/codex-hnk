import type { HnkClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
import type { HnkResearchArtifactLibrary } from "@hnk/research-artifact-library";
import type { HnkReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

export declare const HNK_RESEARCH_WORKSPACE_SNAPSHOT_ID: "HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1";
export declare const HNK_RESEARCH_WORKSPACE_SNAPSHOT_VERSION: "1.0.0";
export declare const HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY: "WORKSPACE_SNAPSHOT_FREEZES_RESEARCH_STATE_NOT_TRUTH_REVIEW_DECISION_OR_CANON";
export declare const HNK_WORKSPACE_COMPONENTS: readonly ["ARTIFACT_LIBRARY", "REVIEWED_CLAIM_REGISTRY", "CLAIM_REEVALUATION_QUEUE"];

export type HnkWorkspaceComponent = (typeof HNK_WORKSPACE_COMPONENTS)[number];

export interface HnkResearchWorkspaceSnapshot {
  snapshot_id: typeof HNK_RESEARCH_WORKSPACE_SNAPSHOT_ID;
  snapshot_version: typeof HNK_RESEARCH_WORKSPACE_SNAPSHOT_VERSION;
  authority: "HNK_AUTHORED_RESEARCH_WORKSPACE_SNAPSHOT";
  snapshot_key: string;
  label: string;
  created_at: string;
  parent_snapshot_digest: string | null;
  components: {
    artifact_library: HnkResearchArtifactLibrary;
    reviewed_claim_registry: HnkReviewedClaimRegistry;
    claim_reevaluation_queue: HnkClaimReevaluationQueue;
  };
  component_digests: {
    artifact_library: string;
    reviewed_claim_registry: string;
    claim_reevaluation_queue: string;
  };
  state_summary: {
    artifacts: number;
    latest_artifacts: number;
    reviewed_records: number;
    active_claims: number;
    review_due_items: number;
  };
  snapshot_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  immutable_checkpoint: true;
  automatic_truth_inference: false;
  machine_can_decide_review: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY;
}

export interface CreateResearchWorkspaceSnapshotInput {
  snapshot_key: string;
  label: string;
  created_at: string;
  parent_snapshot_digest?: string | null;
  artifact_library: HnkResearchArtifactLibrary;
  reviewed_claim_registry: HnkReviewedClaimRegistry;
  claim_reevaluation_queue: HnkClaimReevaluationQueue;
}

export interface ResearchWorkspaceSnapshotValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface HnkResearchWorkspaceSnapshotComparison {
  left_snapshot_digest: string;
  right_snapshot_digest: string;
  same_snapshot: boolean;
  lineage_relation: "SAME" | "LEFT_PARENT_OF_RIGHT" | "RIGHT_PARENT_OF_LEFT" | "UNRELATED_OR_INDIRECT";
  changed_components: HnkWorkspaceComponent[];
  component_changes: {
    ARTIFACT_LIBRARY: boolean;
    REVIEWED_CLAIM_REGISTRY: boolean;
    CLAIM_REEVALUATION_QUEUE: boolean;
  };
  deltas: {
    artifacts: number;
    latest_artifacts: number;
    reviewed_records: number;
    active_claims: number;
    review_due_items: number;
  };
  truth_assessed: false;
  canon_promotion_permitted: false;
}

export interface HnkResearchWorkspaceRestoreBundle {
  restored_from_snapshot_digest: string;
  artifact_library: HnkResearchArtifactLibrary;
  reviewed_claim_registry: HnkReviewedClaimRegistry;
  claim_reevaluation_queue: HnkClaimReevaluationQueue;
  exact_component_restore: true;
  server_write_performed: false;
  browser_persistence_performed: false;
}

export declare function researchWorkspaceSnapshotProjection(snapshot: HnkResearchWorkspaceSnapshot): Readonly<Record<string, unknown>>;
export declare function createResearchWorkspaceSnapshot(input: CreateResearchWorkspaceSnapshotInput): HnkResearchWorkspaceSnapshot;
export declare function validateResearchWorkspaceSnapshot(snapshot: unknown): ResearchWorkspaceSnapshotValidation;
export declare function compareResearchWorkspaceSnapshots(left: HnkResearchWorkspaceSnapshot, right: HnkResearchWorkspaceSnapshot): HnkResearchWorkspaceSnapshotComparison;
export declare function restoreResearchWorkspaceSnapshot(snapshot: HnkResearchWorkspaceSnapshot): HnkResearchWorkspaceRestoreBundle;
export declare function serializeResearchWorkspaceSnapshot(snapshot: HnkResearchWorkspaceSnapshot): string;
export declare function parseResearchWorkspaceSnapshot(text: string): HnkResearchWorkspaceSnapshot;
export declare function researchWorkspaceSnapshotSummary(): Readonly<Record<string, unknown>>;
