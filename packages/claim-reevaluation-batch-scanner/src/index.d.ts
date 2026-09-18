import type { HnkClaimDossier } from "@hnk/claim-dossier";
import type { HnkClaimReevaluationAssessment, HnkClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
import type { HnkEvidenceSynthesis } from "@hnk/evidence-synthesis";
import type { HnkReviewedClaimClassification, HnkReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

export declare const HNK_CLAIM_REEVALUATION_BATCH_SCANNER_ID: "HNK_CLAIM_REEVALUATION_BATCH_SCANNER_V1";
export declare const HNK_CLAIM_REEVALUATION_BATCH_SCANNER_VERSION: "1.0.0";
export declare const HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY: "BATCH_SCANNER_AUTOMATES_CHANGE_DETECTION_COVERAGE_NOT_HUMAN_REVIEW_RECLASSIFICATION_TRUTH_OR_CANON";
export declare const HNK_BATCH_SCAN_STATUSES: readonly [
  "CURRENT",
  "REVIEW_DUE",
  "MISSING_ORIGINAL_DOSSIER",
  "MISSING_CANDIDATE_SYNTHESIS"
];

export type HnkBatchScanStatus = (typeof HNK_BATCH_SCAN_STATUSES)[number];

export interface HnkClaimReevaluationBatchResult {
  claim_id: string;
  reviewed_record_id: string;
  claim_version: number;
  previous_classification: HnkReviewedClaimClassification;
  synthesis_key: string;
  original_synthesis_digest: string;
  status: HnkBatchScanStatus;
  original_dossier_digest: string | null;
  candidate_synthesis_digest: string | null;
  assessment: HnkClaimReevaluationAssessment | null;
}

export interface HnkClaimReevaluationBatchScan {
  scan_id: typeof HNK_CLAIM_REEVALUATION_BATCH_SCANNER_ID;
  scan_version: typeof HNK_CLAIM_REEVALUATION_BATCH_SCANNER_VERSION;
  authority: "HNK_AUTHORED_CLAIM_REEVALUATION_BATCH_SCANNER";
  scanned_at: string;
  reviewed_registry_key: string;
  reviewed_registry_digest: string;
  active_claims: number;
  dossier_inputs: number;
  synthesis_inputs: number;
  coverage_complete: boolean;
  results: HnkClaimReevaluationBatchResult[];
  status_counts: Readonly<Record<HnkBatchScanStatus, number>>;
  unused_dossier_digests: string[];
  unused_candidate_synthesis_keys: string[];
  scan_digest: string;
  machine_can_decide_review: false;
  machine_can_change_classification: false;
  automatic_truth_inference: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY;
}

export interface ScanClaimReevaluationBatchInput {
  reviewed_registry: HnkReviewedClaimRegistry;
  original_dossiers: HnkClaimDossier[];
  candidate_syntheses: HnkEvidenceSynthesis[];
  scanned_at: string;
}

export interface BatchQueueMaterialization {
  queue: HnkClaimReevaluationQueue;
  scan: HnkClaimReevaluationBatchScan;
  review_due_found: number;
  added: number;
  skipped_existing: number;
  unresolved_coverage: number;
  machine_changed_classifications: false;
  human_review_required_for_added_items: true;
}

export interface ClaimReevaluationBatchScannerValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export declare function batchScanProjection(scan: HnkClaimReevaluationBatchScan): Readonly<Record<string, unknown>>;
export declare function scanClaimReevaluationBatch(input: ScanClaimReevaluationBatchInput): HnkClaimReevaluationBatchScan;
export declare function materializeClaimReevaluationBatch(queue: HnkClaimReevaluationQueue, input: ScanClaimReevaluationBatchInput): BatchQueueMaterialization;
export declare function validateClaimReevaluationBatchScan(scan: unknown): ClaimReevaluationBatchScannerValidation;
export declare function serializeClaimReevaluationBatchScan(scan: HnkClaimReevaluationBatchScan): string;
export declare function parseClaimReevaluationBatchScan(text: string): HnkClaimReevaluationBatchScan;
export declare function claimReevaluationBatchScannerSummary(): Readonly<Record<string, unknown>>;
