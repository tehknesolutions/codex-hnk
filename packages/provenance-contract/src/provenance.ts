import type { ProvenanceQuery, ProvenanceRecord, ProvenanceTrace, ProvenanceValidationIssue } from "./types.js";

const missing = (value: unknown) => typeof value !== "string" || value.trim().length === 0;

export function validateProvenanceRecord(record: ProvenanceRecord): ProvenanceValidationIssue[] {
  const issues: ProvenanceValidationIssue[] = [];
  for (const [field, value] of [["id",record.id],["subject_id",record.subject_id],["label",record.label],["domain",record.domain]] as const) {
    if (missing(value)) issues.push({ code:"MISSING_FIELD", field, message:`${field} is required` });
  }
  if (!record.source || missing(record.source.id) || missing(record.source.title)) {
    issues.push({ code:"MISSING_SOURCE", field:"source", message:"provenance requires a named source" });
  }
  if (record.authority === "CANON" && record.evidence_scope !== "CANON_APPROVED") {
    issues.push({ code:"INVALID_CANON_SCOPE", field:"evidence_scope", message:"CANON authority requires CANON_APPROVED scope" });
  }
  if (record.authority === "HNK_AUTHORED" && record.evidence_scope !== "HNK_AUTHORED") {
    issues.push({ code:"INVALID_AUTHORED_SCOPE", field:"evidence_scope", message:"HNK_AUTHORED authority requires HNK_AUTHORED scope" });
  }
  return issues;
}

export function queryProvenance(records: readonly ProvenanceRecord[], query: ProvenanceQuery): ProvenanceRecord[] {
  return records.filter((record) =>
    (!query.subject_id || record.subject_id === query.subject_id) &&
    (!query.domain || record.domain === query.domain) &&
    (!query.authority || record.authority === query.authority) &&
    (!query.status || record.status === query.status) &&
    (!query.source_id || record.source.id === query.source_id)
  );
}

export function traceProvenance(records: readonly ProvenanceRecord[], subject_id: string): ProvenanceTrace {
  const matched = queryProvenance(records, { subject_id });
  const ids = new Set(matched.map((record) => record.id));
  const conflicts = records.filter((record) => record.conflicts_with?.some((id) => ids.has(id)) || matched.some((item) => item.conflicts_with?.includes(record.id)));
  return {
    subject_id,
    records: matched,
    authorities: [...new Set(matched.map((record) => record.authority))],
    source_ids: [...new Set(matched.map((record) => record.source.id))],
    conflicts,
  };
}

export function assertProvenanceRecord(record: ProvenanceRecord): ProvenanceRecord {
  const issues = validateProvenanceRecord(record);
  if (issues.length) throw new Error(`HNK_PROVENANCE_CONTRACT_INVALID: ${issues.map((i)=>`${i.code}:${i.field ?? "record"}`).join(", ")}`);
  return record;
}
