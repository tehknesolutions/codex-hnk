export type ProvenanceAuthority = "CANON" | "HISTORICAL_REFERENCE" | "SOURCE_DERIVED" | "HNK_AUTHORED" | "RESEARCH_ONLY";
export type ProvenanceStatus = "CANON" | "REFERENCE" | "CANDIDATE" | "RESEARCH_ONLY" | "EXCLUDED";
export type ProvenanceOrigin = "CANON_CORE" | "HISTORICAL_SOURCE" | "LIBRARY_SOURCE" | "HNK_AUTHORED" | "RESEARCH_PIPELINE";
export type ProvenanceEvidenceScope = "SOURCE_SCOPED" | "INDEPENDENTLY_VERIFIED" | "HNK_AUTHORED" | "CANON_APPROVED";

export interface ProvenanceSourceRef {
  id: string;
  title: string;
  author_or_order?: string;
  locator?: string;
  url?: string;
}

export interface ProvenanceRecord {
  id: string;
  subject_id: string;
  label: string;
  domain: string;
  authority: ProvenanceAuthority;
  status: ProvenanceStatus;
  origin: ProvenanceOrigin;
  evidence_scope: ProvenanceEvidenceScope;
  source: ProvenanceSourceRef;
  claim?: string;
  relation?: string;
  target?: string;
  conflicts_with?: string[];
  notes?: string;
}

export interface ProvenanceQuery {
  subject_id?: string;
  domain?: string;
  authority?: ProvenanceAuthority;
  status?: ProvenanceStatus;
  source_id?: string;
}

export interface ProvenanceValidationIssue {
  code: "MISSING_FIELD" | "MISSING_SOURCE" | "INVALID_CANON_SCOPE" | "INVALID_AUTHORED_SCOPE";
  field?: string;
  message: string;
}

export interface ProvenanceTrace {
  subject_id: string;
  records: ProvenanceRecord[];
  authorities: ProvenanceAuthority[];
  source_ids: string[];
  conflicts: ProvenanceRecord[];
}
