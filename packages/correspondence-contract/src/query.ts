import type {
  CorrespondenceConflictSet,
  CorrespondenceQuery,
  CorrespondenceRecord,
  CorrespondenceResolution,
} from "./types.js";

export function queryCorrespondences(
  records: readonly CorrespondenceRecord[],
  query: CorrespondenceQuery,
): CorrespondenceRecord[] {
  return records.filter((record) => {
    if (query.subject_id && record.subject_id !== query.subject_id) return false;
    if (query.domain && record.domain !== query.domain) return false;
    if (query.tradition_id && record.tradition_id !== query.tradition_id) return false;
    if (query.decision && record.decision !== query.decision) return false;
    return true;
  });
}

export function resolveCorrespondence(
  records: readonly CorrespondenceRecord[],
  query: Pick<CorrespondenceQuery, "subject_id" | "domain" | "tradition_id">,
): CorrespondenceResolution {
  const matches = queryCorrespondences(records, query);

  if (matches.length === 0) return { status: "NONE", records: [] };
  if (matches.length === 1) return { status: "SINGLE", records: matches };

  const distinctValues = new Set(matches.map((record) => record.value));
  const distinctTraditions = new Set(matches.map((record) => record.tradition_id));

  if (distinctValues.size > 1 || distinctTraditions.size > 1) {
    return { status: "CONFLICT", records: matches };
  }

  return { status: "MULTIPLE", records: matches };
}

export function findConflictSets(
  records: readonly CorrespondenceRecord[],
): CorrespondenceConflictSet[] {
  const groups = new Map<string, CorrespondenceRecord[]>();

  for (const record of records) {
    const key = `${record.subject_id}\u0000${record.domain}`;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  const conflicts: CorrespondenceConflictSet[] = [];

  for (const group of groups.values()) {
    const values = new Set(group.map((record) => record.value));
    const traditions = new Set(group.map((record) => record.tradition_id));

    if (group.length > 1 && (values.size > 1 || traditions.size > 1)) {
      conflicts.push({
        subject_id: group[0]!.subject_id,
        domain: group[0]!.domain,
        records: [...group],
      });
    }
  }

  return conflicts;
}
