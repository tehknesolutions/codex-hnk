import { queryProvenance, traceProvenance, validateProvenanceRecord, type ProvenanceQuery, type ProvenanceRecord } from "@hnk/provenance-contract";

export class ProvenanceRegistry {
  readonly records: readonly ProvenanceRecord[];
  constructor(records: readonly ProvenanceRecord[]) { this.records = records; }
  query(query: ProvenanceQuery) { return queryProvenance(this.records, query); }
  trace(subject_id: string) { return traceProvenance(this.records, subject_id); }
  validate() {
    const issues = this.records.flatMap((record) => validateProvenanceRecord(record).map((issue) => `${record.id}:${issue.code}:${issue.field ?? "record"}`));
    return { ok: issues.length === 0, issues };
  }
  coverage() {
    const counts = new Map<string, number>();
    for (const record of this.records) counts.set(record.authority, (counts.get(record.authority) ?? 0) + 1);
    return Object.fromEntries(counts);
  }
}
