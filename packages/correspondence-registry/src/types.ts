import type {
  CorrespondenceConflictSet,
  CorrespondenceQuery,
  CorrespondenceRecord,
  CorrespondenceResolution,
} from "@hnk/correspondence-contract";

export interface CorrespondenceGap {
  id: string;
  subject_id: string;
  domain: string;
  tradition_id: string;
  reason: string;
  source_id: string;
}

export interface RegistryDataset {
  id: string;
  label: string;
  tradition_id: string;
  system_version: string;
  records: readonly CorrespondenceRecord[];
  gaps: readonly CorrespondenceGap[];
}

export interface RegistryComparison {
  subject_id: string;
  domain: string;
  by_tradition: Record<string, CorrespondenceRecord[]>;
  gaps: CorrespondenceGap[];
}

export interface TraditionCoverage {
  tradition_id: string;
  record_count: number;
  subject_count: number;
  domains: string[];
  gap_count: number;
}

export interface RegistryValidationResult {
  ok: boolean;
  issues: string[];
}

export interface CorrespondenceRegistryApi {
  query(query: CorrespondenceQuery): CorrespondenceRecord[];
  resolve(query: Pick<CorrespondenceQuery, "subject_id" | "domain" | "tradition_id">): CorrespondenceResolution;
  compare(subject_id: string, domain: string): RegistryComparison;
  conflicts(): CorrespondenceConflictSet[];
  coverage(): TraditionCoverage[];
  validate(): RegistryValidationResult;
}
