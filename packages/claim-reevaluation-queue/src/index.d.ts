import type { HnkClaimDossier } from "@hnk/claim-dossier";
import type { HnkEvidenceSynthesis } from "@hnk/evidence-synthesis";
import type { HnkReviewedClaimClassification, HnkReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

export declare const HNK_CLAIM_REEVALUATION_QUEUE_ID: "HNK_CLAIM_REEVALUATION_QUEUE_V1";
export declare const HNK_CLAIM_REEVALUATION_QUEUE_VERSION: "1.0.0";
export declare const HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY: "REEVALUATION_QUEUE_DETECTS_EVIDENCE_SNAPSHOT_CHANGE_NOT_NEW_TRUTH_CLASSIFICATION_OR_CANON";
export declare const HNK_REEVALUATION_REASONS: readonly [
  "SYNTHESIS_SNAPSHOT_CHANGED",
  "LINKED_GROUP_MISSING",
  "LINKED_GROUP_STATUS_CHANGED",
  "LINKED_GROUP_DIRECTION_CHANGED",
  "SOURCE_QUESTIONS_CHANGED",
  "UNCLASSIFIED_NEW_GROUPS_PRESENT"
];

export type HnkReevaluationReason = (typeof HNK_REEVALUATION_REASONS)[number];

export interface HnkLinkedGroupChange {
  metric_signature_digest: string;
  metric_id: string;
  old_group_status: string;
  new_group_status: string | null;
  old_direction: "HIGHER" | "LOWER" | "EQUAL" | null;
  new_direction: "HIGHER" | "LOWER" | "EQUAL" | null;
  old_source_questions: string[];
  new_source_questions: string[];
  changes: HnkReevaluationReason[];
}

export interface HnkClaimReevaluationAssessment {
  claim_id: string;
  reviewed_record_id: string;
  previous_claim_version: number;
  previous_classification: HnkReviewedClaimClassification;
  original_synthesis_key: string;
  original_synthesis_digest: string;
  candidate_synthesis_key: string;
  candidate_synthesis_digest: string;
  review_due: boolean;
  reasons: HnkReevaluationReason[];
  linked_group_changes: HnkLinkedGroupChange[];
  unclassified_new_group_signatures: string[];
  machine_changed_classification: false;
  machine_can_resolve: false;
  human_review_required: boolean;
  next_workflow: "NONE" | "CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW";
}

export interface HnkClaimReevaluationQueueItem extends HnkClaimReevaluationAssessment {
  item_id: string;
  detected_at: string;
  status: "REVIEW_DUE";
  original_dossier_digest: string;
  item_digest: string;
}

export interface HnkClaimReevaluationQueue {
  queue_id: typeof HNK_CLAIM_REEVALUATION_QUEUE_ID;
  queue_version: typeof HNK_CLAIM_REEVALUATION_QUEUE_VERSION;
  authority: "HNK_AUTHORED_CLAIM_REEVALUATION_QUEUE";
  queue_key: string;
  title: string;
  created_at: string;
  items: HnkClaimReevaluationQueueItem[];
  queue_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  machine_can_decide_review: false;
  machine_can_change_classification: false;
  automatic_truth_inference: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY;
}

export interface CreateClaimReevaluationQueueInput {
  queue_key: string;
  title: string;
  created_at: string;
}

export interface AssessClaimReevaluationInput {
  reviewed_registry: HnkReviewedClaimRegistry;
  claim_id: string;
  original_dossier: HnkClaimDossier;
  candidate_synthesis: HnkEvidenceSynthesis;
}

export interface AddClaimReevaluationInput extends AssessClaimReevaluationInput {
  item_id: string;
  detected_at: string;
}

export interface ClaimReevaluationQueueValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface ClaimReevaluationQueueIndex {
  queue_key: string;
  review_due: number;
  claim_ids: number;
  reason_counts: Readonly<Record<HnkReevaluationReason, number>>;
  items: ReadonlyArray<HnkClaimReevaluationQueueItem>;
  truth_assessed: false;
  classifications_changed_by_machine: false;
  canon_promotion_permitted: false;
}

export declare function claimReevaluationQueueProjection(queue: HnkClaimReevaluationQueue): Readonly<Record<string, unknown>>;
export declare function createClaimReevaluationQueue(input: CreateClaimReevaluationQueueInput): HnkClaimReevaluationQueue;
export declare function assessClaimReevaluation(input: AssessClaimReevaluationInput): HnkClaimReevaluationAssessment;
export declare function addClaimReevaluation(queue: HnkClaimReevaluationQueue, input: AddClaimReevaluationInput): HnkClaimReevaluationQueue;
export declare function validateClaimReevaluationQueue(queue: unknown): ClaimReevaluationQueueValidation;
export declare function claimReevaluationQueueIndex(queue: HnkClaimReevaluationQueue): ClaimReevaluationQueueIndex;
export declare function serializeClaimReevaluationQueue(queue: HnkClaimReevaluationQueue): string;
export declare function parseClaimReevaluationQueue(text: string): HnkClaimReevaluationQueue;
export declare function claimReevaluationQueueSummary(): Readonly<Record<string, unknown>>;
