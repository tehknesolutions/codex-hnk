import type {
  AttributeGainResult,
  AttributeProgressionMatrix,
  AttributeProgressionRow,
  AttributeState,
} from "./types.js";

export function validateAttributeProgressionMatrix(matrix: AttributeProgressionMatrix): void {
  if (matrix.id !== "HNK-ATTRIBUTE-PROGRESSION-MATRIX-V1") throw new Error("attribute_matrix_id_mismatch");
  if (matrix.version !== "1.0.0" || matrix.status !== "FROZEN_V1") throw new Error("attribute_matrix_version_mismatch");
  if (matrix.attribute_scale.min !== 1 || matrix.attribute_scale.max !== 20) throw new Error("attribute_scale_mismatch");
  if (matrix.rows.length !== 36) throw new Error("kether_matrix_requires_36_rows");

  const days = new Set<number>();
  for (const row of matrix.rows) {
    if (days.has(row.day)) throw new Error(`duplicate_attribute_matrix_day:${row.day}`);
    days.add(row.day);
    if (row.day < 1 || row.day > 36) throw new Error(`attribute_matrix_day_out_of_range:${row.day}`);
    if (row.attribute_gain !== 0 && row.attribute_gain !== 1) throw new Error(`attribute_gain_invalid:${row.day}`);
    if (row.primary_attribute === row.secondary_attribute) throw new Error(`attribute_pair_must_differ:${row.day}`);
    if (!row.status.startsWith("FROZEN")) throw new Error(`attribute_row_not_frozen:${row.day}`);
  }

  for (let day = 1; day <= 36; day += 1) {
    if (!days.has(day)) throw new Error(`attribute_matrix_day_missing:${day}`);
  }

  const portal = matrix.rows.find((row) => row.day === 36);
  if (!portal || portal.attribute_gain !== 0) throw new Error("portal_36_attribute_gain_forbidden");
}

export function resolveAttributeProgressionRow(
  matrix: AttributeProgressionMatrix,
  day: number,
): AttributeProgressionRow {
  validateAttributeProgressionMatrix(matrix);
  const row = matrix.rows.find((entry) => entry.day === day);
  if (!row) throw new Error(`attribute_matrix_day_not_found:${day}`);
  return row;
}

export function previewAttributeGain(
  state: AttributeState,
  row: AttributeProgressionRow,
  max = 20,
): AttributeGainResult {
  const before = state[row.primary_attribute];
  if (row.attribute_gain === 0) {
    return { attribute: row.primary_attribute, requestedGain: 0, appliedGain: 0, before, after: before, reason: "ZERO_GAIN" };
  }
  if (before >= max) {
    return { attribute: row.primary_attribute, requestedGain: 1, appliedGain: 0, before, after: before, reason: "CAP_REACHED" };
  }
  return { attribute: row.primary_attribute, requestedGain: 1, appliedGain: 1, before, after: Math.min(max, before + 1), reason: "APPLIED" };
}
