import type {
  CorrespondenceRecord,
  CorrespondenceValidationIssue,
} from "./types.js";

const SEMVER = /^\d+\.\d+\.\d+$/;

function missing(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

export function validateCorrespondenceRecord(
  record: CorrespondenceRecord,
): CorrespondenceValidationIssue[] {
  const issues: CorrespondenceValidationIssue[] = [];

  const required: Array<[keyof CorrespondenceRecord, unknown]> = [
    ["id", record.id],
    ["subject_id", record.subject_id],
    ["domain", record.domain],
    ["value", record.value],
    ["tradition_id", record.tradition_id],
    ["system_version", record.system_version],
    ["historical_layer", record.historical_layer],
  ];

  for (const [field, value] of required) {
    if (missing(value)) {
      issues.push({
        code: "MISSING_FIELD",
        field,
        message: `${String(field)} is required`,
      });
    }
  }

  if (!SEMVER.test(record.system_version)) {
    issues.push({
      code: "INVALID_SEMVER",
      field: "system_version",
      message: "system_version must use semantic x.y.z format",
    });
  }

  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    issues.push({
      code: "MISSING_SOURCE",
      field: "sources",
      message: "at least one provenance source is required",
    });
  }

  if (record.origin === "HNK_AUTHORED") {
    if (missing(record.hnk_author)) {
      issues.push({
        code: "HNK_AUTHORSHIP_REQUIRED",
        field: "hnk_author",
        message: "HNK-authored mappings require explicit authorship",
      });
    }

    if (missing(record.hnk_rationale)) {
      issues.push({
        code: "HNK_RATIONALE_REQUIRED",
        field: "hnk_rationale",
        message: "HNK-authored mappings require an explicit design rationale",
      });
    }

    if (record.evidence_scope !== "HNK_AUTHORED") {
      issues.push({
        code: "AUTHORED_SCOPE_REQUIRED",
        field: "evidence_scope",
        message: "HNK-authored mappings must declare evidence_scope=HNK_AUTHORED",
      });
    }
  }

  if (
    record.origin === "HISTORICAL_SOURCE" &&
    record.evidence_scope === "HNK_AUTHORED"
  ) {
    issues.push({
      code: "AUTHORED_SCOPE_REQUIRED",
      field: "evidence_scope",
      message: "historical-source mappings cannot use HNK_AUTHORED evidence scope",
    });
  }

  return issues;
}

export function isCorrespondenceRecordValid(
  record: CorrespondenceRecord,
): boolean {
  return validateCorrespondenceRecord(record).length === 0;
}

export function assertCorrespondenceRecord(
  record: CorrespondenceRecord,
): CorrespondenceRecord {
  const issues = validateCorrespondenceRecord(record);
  if (issues.length > 0) {
    throw new Error(
      `HNK_CORRESPONDENCE_CONTRACT_INVALID: ${issues
        .map((issue) => `${issue.code}:${issue.field ?? "record"}`)
        .join(", ")}`,
    );
  }
  return record;
}
