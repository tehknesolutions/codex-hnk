import type { HnkEvidenceSynthesis, HnkSynthesisGroupStatus } from "@hnk/evidence-synthesis";

export declare const HNK_CLAIM_DOSSIER_ID: "HNK_CLAIM_DOSSIER_V1";
export declare const HNK_CLAIM_DOSSIER_VERSION: "1.0.0";
export declare const HNK_CLAIM_DOSSIER_BOUNDARY: "CLAIM_DOSSIER_ORGANIZES_EVIDENCE_RELEVANCE_GAPS_AND_CONFLICTS_NOT_TRUTH_OR_CANON";
export declare const HNK_CLAIM_SCOPES: readonly ["DESCRIPTIVE", "PROCESS_INTEGRITY", "EXPLORATORY_INTERPRETATION"];
export declare const HNK_CLAIM_EVIDENCE_RELATIONS: readonly ["CONSISTENT_WITH", "INCONSISTENT_WITH", "CONTEXT_ONLY", "UNRESOLVED"];

export type HnkClaimScope = (typeof HNK_CLAIM_SCOPES)[number];
export type HnkClaimEvidenceRelation = (typeof HNK_CLAIM_EVIDENCE_RELATIONS)[number];

export interface HnkClaimEvidenceLink {
  link_id: string;
  metric_signature_digest: string;
  metric_id: string;
  metric_label: string;
  group_status: HnkSynthesisGroupStatus;
  convergent_direction: "HIGHER" | "LOWER" | "EQUAL" | null;
  relation: HnkClaimEvidenceRelation;
  rationale: string;
  source_questions: ReadonlyArray<string>;
}

export interface HnkClaimDossier {
  dossier_id: typeof HNK_CLAIM_DOSSIER_ID;
  dossier_version: typeof HNK_CLAIM_DOSSIER_VERSION;
  authority: "HNK_AUTHORED_CLAIM_DOSSIER";
  claim_id: string;
  statement: string;
  scope: HnkClaimScope;
  authored_by: string;
  created_at: string;
  synthesis_binding: {
    synthesis_key: string;
    synthesis_digest: string;
  };
  evidence_links: HnkClaimEvidenceLink[];
  gaps: string[];
  conflicts: string[];
  notes: string[];
  dossier_digest: string;
  human_relevance_classification_required: true;
  automatic_truth_inference: false;
  automatic_canon_promotion: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_CLAIM_DOSSIER_BOUNDARY;
}

export interface CreateClaimDossierInput {
  claim_id: string;
  statement: string;
  scope: HnkClaimScope;
  authored_by: string;
  created_at: string;
  synthesis: HnkEvidenceSynthesis;
  evidence_links: Array<{
    link_id: string;
    metric_signature_digest: string;
    relation: HnkClaimEvidenceRelation;
    rationale: string;
  }>;
  gaps?: string[];
  conflicts?: string[];
  notes?: string[];
}

export interface ClaimDossierValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface ClaimDossierAssessment {
  claim_id: string;
  linked_groups: number;
  relation_counts: Readonly<Record<HnkClaimEvidenceRelation, number>>;
  group_status_counts: Readonly<Record<HnkSynthesisGroupStatus, number>>;
  unresolved_links: string[];
  gaps: string[];
  conflicts: string[];
  ready_for_human_review: boolean;
  blocking_reasons: string[];
  truth_assessed: false;
  canon_promotion_permitted: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
}

export declare function claimDossierProjection(dossier: HnkClaimDossier): Readonly<Record<string, unknown>>;
export declare function createClaimDossier(input: CreateClaimDossierInput): HnkClaimDossier;
export declare function validateClaimDossier(dossier: unknown): ClaimDossierValidation;
export declare function assessClaimDossier(dossier: HnkClaimDossier): ClaimDossierAssessment;
export declare function verifyClaimDossierAgainstSynthesis(dossier: HnkClaimDossier, synthesis: HnkEvidenceSynthesis): ClaimDossierValidation;
export declare function serializeClaimDossier(dossier: HnkClaimDossier): string;
export declare function parseClaimDossier(text: string): HnkClaimDossier;
export declare function claimDossierSummary(): Readonly<Record<string, unknown>>;
