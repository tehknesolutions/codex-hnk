import type { HnkSupabaseClient } from './index';
import type { SafePracticeMetrics } from './practice-record';

export type PortalEvidenceValue = number | boolean | string | null;
export type PortalSafeEvidence = Record<string, PortalEvidenceValue | undefined>;

export interface SavePortalPracticeInput {
  sessionId: string;
  durationSeconds?: number | null;
  metrics?: SafePracticeMetrics;
  evidence: PortalSafeEvidence;
  endedAt?: string | null;
  localRecordHash?: string | null;
}

const PORTAL_STRING_KEYS = new Set([
  'schema_version',
  'tuner_preset_id',
  'transition_preset_id',
  'sigil_asset_id',
  'vault_receipt',
]);

function normalizeMetrics(record: SafePracticeMetrics = {}): Record<string, number | boolean | null> {
  const output: Record<string, number | boolean | null> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!key.trim()) throw new Error('metrics_key_required');
    if (value === undefined) continue;
    const valid = value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
    if (!valid) throw new Error('metrics_must_be_numeric_boolean_or_null');
    output[key] = value;
  }
  return output;
}

function normalizePortalEvidence(record: PortalSafeEvidence): Record<string, PortalEvidenceValue> {
  const output: Record<string, PortalEvidenceValue> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!key.trim()) throw new Error('portal_evidence_key_required');
    if (value === undefined) continue;
    if (/plaintext/i.test(key)) throw new Error('portal_plaintext_evidence_forbidden');
    if (typeof value === 'string') {
      if (!PORTAL_STRING_KEYS.has(key)) throw new Error(`portal_string_evidence_forbidden:${key}`);
      if (!value.trim()) throw new Error(`portal_string_evidence_required:${key}`);
      output[key] = value;
      continue;
    }
    const valid = value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
    if (!valid) throw new Error(`portal_evidence_invalid:${key}`);
    output[key] = value;
  }
  if (Object.keys(output).length === 0) throw new Error('portal_evidence_required');
  return output;
}

/**
 * Portal-only persistence boundary.
 *
 * Ordinary Practice Records remain numeric/boolean/null only. Portals need a
 * small set of version/receipt identifiers demanded by the server contract.
 * This adapter allows only those identifiers and rejects plaintext-shaped keys
 * before any remote persistence occurs.
 */
export async function savePortalPracticeRecord(
  client: HnkSupabaseClient,
  input: SavePortalPracticeInput,
): Promise<void> {
  if (!input.sessionId.trim()) throw new Error('practice_session_id_required');
  if (input.durationSeconds != null && (!Number.isInteger(input.durationSeconds) || input.durationSeconds < 0)) {
    throw new Error('invalid_duration_seconds');
  }

  const metrics = normalizeMetrics(input.metrics);
  const evidence = normalizePortalEvidence(input.evidence);

  const { error } = await client
    .from('practice_sessions')
    .update({
      duration_seconds: input.durationSeconds ?? null,
      metrics,
      evidence,
      state: 'evidence_pending',
      ended_at: input.endedAt ?? new Date().toISOString(),
      local_record_hash: input.localRecordHash ?? null,
    })
    .eq('id', input.sessionId);

  if (error) throw error;
}
