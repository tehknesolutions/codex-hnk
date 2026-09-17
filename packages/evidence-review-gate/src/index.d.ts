import type { HnkClaimDossier } from "@hnk/claim-dossier";

export declare const HNK_EVIDENCE_REVIEW_GATE_ID: "HNK_EVIDENCE_REVIEW_GATE_V1";
export declare const HNK_EVIDENCE_REVIEW_GATE_VERSION: "1.0.0";
export declare const HNK_EVIDENCE_REVIEW_GATE_BOUNDARY: "HUMAN_REVIEW_MAY_CLASSIFY_CLAIM_STATUS_BUT_CANNOT_AUTO_ESTABLISH_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON";
export declare const HNK_EVIDENCE_REVIEW_OUTCOMES: readonly ["ACCEPT_AS_DESCRIPTIVE_SUMMARY", "KEEP_AS_HYPOTHESIS", "REQUEST_MORE_EVIDENCE", "REJECT_AS_UNSUPPORTED_AT_SCOPE"];

export type HnkEvidenceReviewOutcome = (typeof HNK_EVIDENCE_REVIEW_OUTCOMES)[number];

export interface HnkEvidenceReviewGate {
  gate_id: typeof HNK_EVIDENCE_REVIEW_GATE_ID;
  gate_version: typeof HNK_EVIDENCE_REVIEW_GATE_VERSION;
  authority: "HNK_HUMAN_EVIDENCE_REVIEW_GATE";
  claim_id: string;
  dossier_digest: string;
  opened_at: string;
  status: "PENDING_HUMAN_REVIEW" | "REVIEWED";
  review: null | {
    outcome: HnkEvidenceReviewOutcome;
    reviewer: string;
    reviewed_at: string;
    explicit_human_signal: string;
    rationale: string;
    unresolved_questions: string[];
    human_decision: true;
  };
  gate_digest: string;
  machine_can_decide: false;
  automatic_truth_inference: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_EVIDENCE_REVIEW_GATE_BOUNDARY;
}

export interface EvidenceReviewGateValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export declare function evidenceReviewGateProjection(gate: HnkEvidenceReviewGate): Readonly<Record<string, unknown>>;
export declare function createEvidenceReviewGate(dossier: HnkClaimDossier, input: { opened_at: string }): HnkEvidenceReviewGate;
export declare function applyHumanEvidenceReview(gate: HnkEvidenceReviewGate, dossier: HnkClaimDossier, input: {
  outcome: HnkEvidenceReviewOutcome;
  reviewer: string;
  reviewed_at: string;
  explicit_human_signal: string;
  rationale: string;
  unresolved_questions?: string[];
}): HnkEvidenceReviewGate;
export declare function validateEvidenceReviewGate(gate: unknown): EvidenceReviewGateValidation;
export declare function verifyEvidenceReviewGate(gate: HnkEvidenceReviewGate, dossier: HnkClaimDossier): EvidenceReviewGateValidation;
export declare function serializeEvidenceReviewGate(gate: HnkEvidenceReviewGate): string;
export declare function parseEvidenceReviewGate(text: string): HnkEvidenceReviewGate;
export declare function evidenceReviewGateSummary(): Readonly<Record<string, unknown>>;
