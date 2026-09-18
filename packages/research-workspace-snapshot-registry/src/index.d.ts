import type {
  HnkResearchWorkspaceSnapshot,
  HnkResearchWorkspaceSnapshotComparison,
} from "@hnk/research-workspace-snapshot";

export declare const HNK_WORKSPACE_SNAPSHOT_REGISTRY_ID: "HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1";
export declare const HNK_WORKSPACE_SNAPSHOT_REGISTRY_VERSION: "1.0.0";
export declare const HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY: "SNAPSHOT_REGISTRY_CATALOGS_CHECKPOINT_LINEAGE_AND_HEAD_POINTER_NOT_TRUTH_REVIEW_DECISION_OR_CANON";

export interface HnkWorkspaceSnapshotRegistryRecord {
  record_id: string;
  snapshot_digest: string;
  snapshot_key: string;
  label: string;
  snapshot_created_at: string;
  parent_snapshot_digest: string | null;
  registered_at: string;
  snapshot: HnkResearchWorkspaceSnapshot;
  record_digest: string;
}

export interface HnkWorkspaceSnapshotHeadEvent {
  event_id: string;
  from_snapshot_digest: string | null;
  to_snapshot_digest: string;
  moved_at: string;
  reason: string;
  explicit_human_signal: string;
  event_digest: string;
}

export interface HnkWorkspaceSnapshotFork {
  parent_snapshot_digest: string;
  child_snapshot_digests: string[];
}

export interface HnkWorkspaceSnapshotRegistry {
  registry_id: typeof HNK_WORKSPACE_SNAPSHOT_REGISTRY_ID;
  registry_version: typeof HNK_WORKSPACE_SNAPSHOT_REGISTRY_VERSION;
  authority: "HNK_AUTHORED_WORKSPACE_SNAPSHOT_REGISTRY";
  registry_key: string;
  title: string;
  created_at: string;
  snapshots: HnkWorkspaceSnapshotRegistryRecord[];
  head_events: HnkWorkspaceSnapshotHeadEvent[];
  head_snapshot_digest: string | null;
  registry_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  immutable_snapshot_history: true;
  explicit_head_move_required: true;
  machine_can_choose_head: false;
  automatic_truth_inference: false;
  machine_can_decide_review: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY;
}

export interface CreateWorkspaceSnapshotRegistryInput {
  registry_key: string;
  title: string;
  created_at: string;
}

export interface RegisterWorkspaceSnapshotInput {
  snapshot: HnkResearchWorkspaceSnapshot;
  registered_at: string;
}

export interface MoveWorkspaceSnapshotHeadInput {
  to_snapshot_digest: string;
  moved_at: string;
  reason: string;
  explicit_human_signal: string;
}

export interface WorkspaceSnapshotRegistryValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface WorkspaceSnapshotRegistryIndex {
  registry_key: string;
  snapshot_count: number;
  root_count: number;
  tip_count: number;
  fork_count: number;
  head_snapshot_digest: string | null;
  roots: string[];
  tips: string[];
  forks: HnkWorkspaceSnapshotFork[];
  timeline: ReadonlyArray<HnkWorkspaceSnapshotRegistryRecord>;
  head_history: ReadonlyArray<HnkWorkspaceSnapshotHeadEvent>;
  orphan_count: 0;
  truth_assessed: false;
  canon_promotion_permitted: false;
}

export interface HnkWorkspaceSnapshotAncestry {
  snapshot_digest: string;
  root_snapshot_digest: string;
  path_root_to_snapshot: string[];
  depth: number;
}

export declare function workspaceSnapshotRegistryProjection(registry: HnkWorkspaceSnapshotRegistry): Readonly<Record<string, unknown>>;
export declare function createWorkspaceSnapshotRegistry(input: CreateWorkspaceSnapshotRegistryInput): HnkWorkspaceSnapshotRegistry;
export declare function registerWorkspaceSnapshot(registry: HnkWorkspaceSnapshotRegistry, input: RegisterWorkspaceSnapshotInput): HnkWorkspaceSnapshotRegistry;
export declare function moveWorkspaceSnapshotHead(registry: HnkWorkspaceSnapshotRegistry, input: MoveWorkspaceSnapshotHeadInput): HnkWorkspaceSnapshotRegistry;
export declare function validateWorkspaceSnapshotRegistry(registry: unknown): WorkspaceSnapshotRegistryValidation;
export declare function workspaceSnapshotRegistryIndex(registry: HnkWorkspaceSnapshotRegistry): WorkspaceSnapshotRegistryIndex;
export declare function workspaceSnapshotAncestry(registry: HnkWorkspaceSnapshotRegistry, snapshotDigest: string): HnkWorkspaceSnapshotAncestry;
export declare function compareRegisteredWorkspaceSnapshots(registry: HnkWorkspaceSnapshotRegistry, leftDigest: string, rightDigest: string): HnkResearchWorkspaceSnapshotComparison;
export declare function serializeWorkspaceSnapshotRegistry(registry: HnkWorkspaceSnapshotRegistry): string;
export declare function parseWorkspaceSnapshotRegistry(text: string): HnkWorkspaceSnapshotRegistry;
export declare function workspaceSnapshotRegistrySummary(): Readonly<Record<string, unknown>>;
