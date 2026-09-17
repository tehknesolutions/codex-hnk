import type { HnkEvidenceLedger } from "@hnk/evidence-ledger";

export declare const HNK_REPLICATION_REGISTRY_ID: "HNK_REPLICATION_REGISTRY_V1";
export declare const HNK_REPLICATION_REGISTRY_VERSION: "1.0.0";
export declare const HNK_REPLICATION_REGISTRY_BOUNDARY: "REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
export declare const HNK_REPLICATION_STATUSES: readonly ["INSUFFICIENT", "SINGLE_RUN", "REPLICATED", "MIXED"];
export declare const HNK_REPLICATION_DIRECTIONS: readonly ["HIGHER", "LOWER", "EQUAL", "INSUFFICIENT"];
export declare const HNK_REPLICATION_METRIC_TYPES: readonly ["NUMBER", "COUNT", "SCALE", "BOOLEAN"];

export type HnkReplicationStatus = (typeof HNK_REPLICATION_STATUSES)[number];
export type HnkReplicationDirection = (typeof HNK_REPLICATION_DIRECTIONS)[number];
export type HnkReplicationMetricType = (typeof HNK_REPLICATION_METRIC_TYPES)[number];

export interface HnkReplicationMetricSignature {
  metric_id: string;
  metric_type: HnkReplicationMetricType;
  label: string;
  unit: string | null;
  evidence_source: string | null;
  timepoint: string | null;
  evaluation_criterion: string | null;
  signature_digest: string;
}

export interface HnkReplicationRun {
  run_id: string;
  experiment_id: string;
  ledger_digest: string;
  added_at: string;
  metric_signature_digest: string;
  control: {
    n: number;
    aggregate: number | null;
  };
  experiment: {
    n: number;
    aggregate: number | null;
  };
  direction: HnkReplicationDirection;
  eligible: boolean;
  insufficiency_reasons: string[];
}

export interface HnkReplicationRegistry {
  registry_id: typeof HNK_REPLICATION_REGISTRY_ID;
  registry_version: typeof HNK_REPLICATION_REGISTRY_VERSION;
  authority: "HNK_AUTHORED_REPLICATION_REGISTRY";
  replication_key: string;
  title: string;
  question: string;
  metric_signature: HnkReplicationMetricSignature;
  created_at: string;
  runs: HnkReplicationRun[];
  registry_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  automatic_truth_inference: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_REPLICATION_REGISTRY_BOUNDARY;
}

export interface CreateReplicationRegistryInput {
  replication_key: string;
  title: string;
  question: string;
  metric_id: string;
  created_at: string;
  seed_run_id: string;
  seed_added_at: string;
  seed_ledger: HnkEvidenceLedger;
}

export interface AddReplicationLedgerInput {
  run_id: string;
  added_at: string;
  ledger: HnkEvidenceLedger;
}

export interface ReplicationRegistryValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface HnkReplicationReport {
  replication_key: string;
  metric_signature: HnkReplicationMetricSignature;
  total_runs: number;
  eligible_runs: number;
  insufficient_runs: number;
  direction_counts: Readonly<Record<Exclude<HnkReplicationDirection, "INSUFFICIENT">, number>>;
  status: HnkReplicationStatus;
  repeated_direction: Exclude<HnkReplicationDirection, "INSUFFICIENT"> | null;
  run_results: ReadonlyArray<HnkReplicationRun>;
  truth_assessed: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_REPLICATION_REGISTRY_BOUNDARY;
}

export declare function replicationRegistryProjection(registry: HnkReplicationRegistry): Readonly<Record<string, unknown>>;
export declare function createReplicationRegistry(input: CreateReplicationRegistryInput): HnkReplicationRegistry;
export declare function addReplicationLedger(registry: HnkReplicationRegistry, input: AddReplicationLedgerInput): HnkReplicationRegistry;
export declare function validateReplicationRegistry(registry: unknown): ReplicationRegistryValidation;
export declare function replicationReport(registry: HnkReplicationRegistry): HnkReplicationReport;
export declare function serializeReplicationRegistry(registry: HnkReplicationRegistry): string;
export declare function parseReplicationRegistry(text: string): HnkReplicationRegistry;
export declare function replicationRegistrySummary(): Readonly<Record<string, unknown>>;
