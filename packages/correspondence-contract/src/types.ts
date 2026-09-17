export type CorrespondenceOrigin = "HISTORICAL_SOURCE" | "HNK_AUTHORED";

export type CorrespondenceClaimKind =
  | "SOURCE_FACT"
  | "TRADITION_CLAIM"
  | "CORRESPONDENCE"
  | "INTERPRETATION"
  | "HNK_AUTHORED";

export type CorrespondenceDecision =
  | "REFERENCE"
  | "CANDIDATE"
  | "CANON"
  | "RESEARCH_ONLY"
  | "EXCLUDE_OPERATIONALLY";

export type EvidenceScope =
  | "SOURCE_SCOPED"
  | "INDEPENDENTLY_VERIFIED"
  | "HNK_AUTHORED";

export interface CorrespondenceSourceRef {
  id: string;
  title: string;
  author_or_order?: string;
  url?: string;
  edition_or_recension?: string;
  date_label?: string;
}

export interface CorrespondenceOrdinalIdentity {
  tarot_card_number?: number;
  hebrew_letter_position?: number;
  path_number?: number;
  glyph_position?: number;
}

export interface CorrespondenceRecord {
  id: string;
  subject_id: string;
  domain: string;
  value: string;

  tradition_id: string;
  system_version: string;
  historical_layer: string;

  origin: CorrespondenceOrigin;
  claim_kind: CorrespondenceClaimKind;
  evidence_scope: EvidenceScope;
  decision: CorrespondenceDecision;

  ordinals?: CorrespondenceOrdinalIdentity;

  sources: CorrespondenceSourceRef[];
  conflicts_with?: string[];
  inherits_from?: string[];

  hnk_author?: string;
  hnk_rationale?: string;

  notes?: string;
}

export interface CorrespondenceQuery {
  subject_id?: string;
  domain?: string;
  tradition_id?: string;
  decision?: CorrespondenceDecision;
}

export interface CorrespondenceConflictSet {
  subject_id: string;
  domain: string;
  records: CorrespondenceRecord[];
}

export interface CorrespondenceValidationIssue {
  code:
    | "MISSING_FIELD"
    | "INVALID_SEMVER"
    | "MISSING_SOURCE"
    | "HNK_AUTHORSHIP_REQUIRED"
    | "HNK_RATIONALE_REQUIRED"
    | "AUTHORED_SCOPE_REQUIRED"
    | "CANON_SOURCE_SCOPE_INVALID"
    | "ORDINAL_COLLAPSE_RISK";
  field?: string;
  message: string;
}

export interface CorrespondenceResolution {
  status: "NONE" | "SINGLE" | "MULTIPLE" | "CONFLICT";
  records: CorrespondenceRecord[];
}
