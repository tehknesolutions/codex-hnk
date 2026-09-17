import type { HnkClaimDossier, HnkClaimScope } from "@hnk/claim-dossier";
import type { HnkEvidenceReviewGate, HnkEvidenceReviewOutcome } from "@hnk/evidence-review-gate";

export declare const HNK_REVIEWED_CLAIM_REGISTRY_ID: "HNK_REVIEWED_CLAIM_REGISTRY_V1";
export declare const HNK_REVIEWED_CLAIM_REGISTRY_VERSION: "1.0.0";
export declare const HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY: "REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON";
export declare const HNK_REVIEWED_CLAIM_CLASSIFICATIONS: readonly ["DESCRIPTIVE_SUMMARY", "HYPOTHESIS", "MORE_EVIDENCE_REQUIRED", "UNSUPPORTED_AT_SCOPE"];

export type HnkReviewedClaimClassification = (typeof HNK_REVIEWED_CLAIM_CLASSIFICATIONS)[number];

export interface HnkReviewedClaimRecord {
  record_id: string;
  claim_id: string;
  claim_version: number;
  statement: string;
  scope: HnkClaimScope;
  classification: HnkReviewedClaimClassification;
  review_outcome: HnkEvidenceReviewOutcome;
  dossier_digest: string;
  review_gate_digest: string;
  synthesis_key: string;
  synthesis_digest: string;
  reviewer: string;
  reviewed_at: string;
  explicit_human_signal: string;
  review_rationale: string;
  unresolved_questions: string[];
  gaps: string[];
  conflicts: string[];
  registered_at: string;
  supersedes_record_id: string | null;
  record_digest: string;
  human_review_derived: true;
  truth_assessed: false;
  canon_status: "NOT_CANON";
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
}

export interface HnkReviewedClaimRegistry {
  registry_id: typeof HNK_REVIEWED_CLAIM_REGISTRY_ID;
  registry_version: typeof HNK_REVIEWED_CLAIM_REGISTRY_VERSION;
  authority: "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY";
  registry_key: string;
  title: string;
  created_at: string;
  records: HnkReviewedClaimRecord[];
  registry_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  machine_can_decide_review: false;
  automatic_truth_inference: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY;
}

export interface CreateReviewedClaimRegistryInput {
  registry_key: string;
  title: string;
  created_at: string;
}

export interface AddReviewedClaimInput {
  record_id: string;
  registered_at: string;
  dossier: HnkClaimDossier;
  review_gate: HnkEvidenceReviewGate;
  supersedes_record_id?: string | null;
}

export interface ReviewedClaimRegistryValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface ReviewedClaimRegistryQuery {
  q?: string;
  classification?: HnkReviewedClaimClassification;
  scope?: HnkClaimScope;
  active_only?: boolean;
  claim_id?: string;
}

export interface HnkReviewedClaimRegistryEntry extends HnkReviewedClaimRecord {
  active: boolean;
  superseded_by_record_id: string | null;
}

export interface ReviewedClaimRegistryIndex {
  registry_key: string;
  total_records: number;
  active_claims: number;
  claim_ids: number;
  classification_counts: Readonly<Record<HnkReviewedClaimClassification, number>>;
  active_classification_counts: Readonly<Record<HnkReviewedClaimClassification, number>>;
  records: ReadonlyArray<HnkReviewedClaimRegistryEntry>;
  truth_assessed: false;
  canon_promotion_permitted: false;
}

export declare function reviewedClaimRegistryProjection(registry: HnkReviewedClaimRegistry): Readonly<Record<string, unknown>>;
export declare function createReviewedClaimRegistry(input: CreateReviewedClaimRegistryInput): HnkReviewedClaimRegistry;
export declare function addReviewedClaim(registry: HnkReviewedClaimRegistry, input: AddReviewedClaimInput): HnkReviewedClaimRegistry;
export declare function validateReviewedClaimRegistry(registry: unknown): ReviewedClaimRegistryValidation;
export declare function verifyReviewedClaimRecord(record: HnkReviewedClaimRecord, dossier: HnkClaimDossier, reviewGate: HnkEvidenceReviewGate): ReviewedClaimRegistryValidation;
export declare function reviewedClaimRegistryIndex(registry: HnkReviewedClaimRegistry): ReviewedClaimRegistryIndex;
export declare function queryReviewedClaimRegistry(registry: HnkReviewedClaimRegistry, query?: ReviewedClaimRegistryQuery): ReadonlyArray<HnkReviewedClaimRegistryEntry>;
export declare function serializeReviewedClaimRegistry(registry: HnkReviewedClaimRegistry): string;
export declare function parseReviewedClaimRegistry(text: string): HnkReviewedClaimRegistry;
export declare function reviewedClaimRegistrySummary(): Readonly<Record<string, unknown>>;
