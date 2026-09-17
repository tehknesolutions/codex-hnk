import type { HnkReplicationDirection, HnkReplicationRegistry, HnkReplicationStatus } from "@hnk/replication-registry";

export declare const HNK_EVIDENCE_SYNTHESIS_ID: "HNK_EVIDENCE_SYNTHESIS_V1";
export declare const HNK_EVIDENCE_SYNTHESIS_VERSION: "1.0.0";
export declare const HNK_EVIDENCE_SYNTHESIS_BOUNDARY: "EVIDENCE_SYNTHESIS_MAPS_CONVERGENCE_DIVERGENCE_AND_INSUFFICIENCY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
export declare const HNK_SYNTHESIS_GROUP_STATUSES: readonly ["INSUFFICIENT", "SINGLE_REGISTRY_SIGNAL", "CONVERGENT", "DIVERGENT", "MIXED"];

export type HnkSynthesisGroupStatus = (typeof HNK_SYNTHESIS_GROUP_STATUSES)[number];

export interface HnkSynthesisRegistryEntry {
  source_id: string;
  replication_key: string;
  title: string;
  question: string;
  registry_digest: string;
  metric_signature_digest: string;
  metric_id: string;
  metric_label: string;
  metric_type: string;
  unit: string | null;
  replication_status: HnkReplicationStatus;
  repeated_direction: Exclude<HnkReplicationDirection, "INSUFFICIENT"> | null;
  total_runs: number;
  eligible_runs: number;
  insufficient_runs: number;
  added_at: string;
}

export interface HnkEvidenceSynthesis {
  synthesis_id: typeof HNK_EVIDENCE_SYNTHESIS_ID;
  synthesis_version: typeof HNK_EVIDENCE_SYNTHESIS_VERSION;
  authority: "HNK_AUTHORED_EVIDENCE_SYNTHESIS";
  synthesis_key: string;
  title: string;
  created_at: string;
  registries: HnkSynthesisRegistryEntry[];
  synthesis_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  automatic_truth_inference: false;
  inferential_statistics_performed: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_EVIDENCE_SYNTHESIS_BOUNDARY;
}

export interface CreateEvidenceSynthesisInput {
  synthesis_key: string;
  title: string;
  created_at: string;
  seed_source_id: string;
  seed_added_at: string;
  seed_registry: HnkReplicationRegistry;
}

export interface AddSynthesisRegistryInput {
  source_id: string;
  added_at: string;
  registry: HnkReplicationRegistry;
}

export interface EvidenceSynthesisValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface HnkSynthesisMetricGroup {
  metric_signature_digest: string;
  metric_id: string;
  metric_label: string;
  metric_type: string;
  unit: string | null;
  registries: number;
  replicated_registries: number;
  mixed_registries: number;
  single_run_registries: number;
  insufficient_registries: number;
  replicated_direction_counts: Readonly<Record<"HIGHER" | "LOWER" | "EQUAL", number>>;
  status: HnkSynthesisGroupStatus;
  convergent_direction: "HIGHER" | "LOWER" | "EQUAL" | null;
  questions: ReadonlyArray<{
    replication_key: string;
    question: string;
    replication_status: HnkReplicationStatus;
    repeated_direction: "HIGHER" | "LOWER" | "EQUAL" | null;
  }>;
}

export interface HnkEvidenceSynthesisReport {
  synthesis_key: string;
  total_registries: number;
  metric_groups: number;
  groups: ReadonlyArray<HnkSynthesisMetricGroup>;
  group_status_counts: Readonly<Record<HnkSynthesisGroupStatus, number>>;
  truth_assessed: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  inferential_statistics_performed: false;
  claim_boundary: typeof HNK_EVIDENCE_SYNTHESIS_BOUNDARY;
}

export declare function evidenceSynthesisProjection(synthesis: HnkEvidenceSynthesis): Readonly<Record<string, unknown>>;
export declare function createEvidenceSynthesis(input: CreateEvidenceSynthesisInput): HnkEvidenceSynthesis;
export declare function addSynthesisRegistry(synthesis: HnkEvidenceSynthesis, input: AddSynthesisRegistryInput): HnkEvidenceSynthesis;
export declare function validateEvidenceSynthesis(synthesis: unknown): EvidenceSynthesisValidation;
export declare function evidenceSynthesisReport(synthesis: HnkEvidenceSynthesis): HnkEvidenceSynthesisReport;
export declare function serializeEvidenceSynthesis(synthesis: HnkEvidenceSynthesis): string;
export declare function parseEvidenceSynthesis(text: string): HnkEvidenceSynthesis;
export declare function evidenceSynthesisSummary(): Readonly<Record<string, unknown>>;
