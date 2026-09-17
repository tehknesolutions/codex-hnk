import {
  findConflictSets,
  queryCorrespondences,
  resolveCorrespondence,
  validateCorrespondenceRecord,
  type CorrespondenceQuery,
  type CorrespondenceRecord,
} from "@hnk/correspondence-contract";
import type {
  CorrespondenceGap,
  CorrespondenceRegistryApi,
  RegistryComparison,
  RegistryDataset,
  RegistryValidationResult,
  TraditionCoverage,
} from "./types.js";

export class CorrespondenceRegistry implements CorrespondenceRegistryApi {
  readonly records: readonly CorrespondenceRecord[];
  readonly gaps: readonly CorrespondenceGap[];
  readonly datasets: readonly RegistryDataset[];

  constructor(datasets: readonly RegistryDataset[]) {
    this.datasets = datasets;
    this.records = datasets.flatMap((dataset) => [...dataset.records]);
    this.gaps = datasets.flatMap((dataset) => [...dataset.gaps]);
  }

  query(query: CorrespondenceQuery): CorrespondenceRecord[] {
    return queryCorrespondences(this.records, query);
  }

  resolve(query: Pick<CorrespondenceQuery, "subject_id" | "domain" | "tradition_id">) {
    return resolveCorrespondence(this.records, query);
  }

  compare(subject_id: string, domain: string): RegistryComparison {
    const records = this.query({ subject_id, domain });
    const by_tradition: Record<string, CorrespondenceRecord[]> = {};

    for (const record of records) {
      const group = by_tradition[record.tradition_id] ?? [];
      group.push(record);
      by_tradition[record.tradition_id] = group;
    }

    return {
      subject_id,
      domain,
      by_tradition,
      gaps: this.gaps.filter((gap) => gap.subject_id === subject_id && gap.domain === domain),
    };
  }

  conflicts() {
    return findConflictSets(this.records);
  }

  coverage(): TraditionCoverage[] {
    return this.datasets.map((dataset) => ({
      tradition_id: dataset.tradition_id,
      record_count: dataset.records.length,
      subject_count: new Set(dataset.records.map((record) => record.subject_id)).size,
      domains: [...new Set(dataset.records.map((record) => record.domain))].sort(),
      gap_count: dataset.gaps.length,
    }));
  }

  validate(): RegistryValidationResult {
    const issues: string[] = [];
    const recordIds = new Set<string>();
    const gapIds = new Set<string>();

    for (const dataset of this.datasets) {
      if (!/^\d+\.\d+\.\d+$/.test(dataset.system_version)) {
        issues.push(`${dataset.id}: invalid system_version ${dataset.system_version}`);
      }

      for (const record of dataset.records) {
        if (recordIds.has(record.id)) issues.push(`duplicate record id: ${record.id}`);
        recordIds.add(record.id);

        if (record.tradition_id !== dataset.tradition_id) {
          issues.push(`${record.id}: tradition_id does not match dataset ${dataset.id}`);
        }
        if (record.system_version !== dataset.system_version) {
          issues.push(`${record.id}: system_version does not match dataset ${dataset.id}`);
        }

        for (const issue of validateCorrespondenceRecord(record)) {
          issues.push(`${record.id}: ${issue.code}:${issue.field ?? "record"}`);
        }
      }

      for (const gap of dataset.gaps) {
        if (gapIds.has(gap.id)) issues.push(`duplicate gap id: ${gap.id}`);
        gapIds.add(gap.id);
        if (gap.tradition_id !== dataset.tradition_id) {
          issues.push(`${gap.id}: tradition_id does not match dataset ${dataset.id}`);
        }
      }
    }

    return { ok: issues.length === 0, issues };
  }
}
