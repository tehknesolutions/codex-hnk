import type { Json } from '@hnk/database';
import type { HnkSupabaseClient } from './index';

export type PracticeState = 'active' | 'evidence_pending' | 'complete';

export type SafePracticeMetricValue = number | boolean | null;
export type SafePracticeDraftValue = SafePracticeMetricValue | undefined;
export type SafePracticeMetrics = Record<string, SafePracticeDraftValue>;
export type SafePracticeEvidence = Record<string, SafePracticeDraftValue>;

export interface StartPracticeInput {
  day: number;
  clientSessionId: string;
  mode?: 'canonical' | 'revisit' | 'control';
  appVersion?: string | null;
  startedAt?: string;
}

export interface PracticeSessionRecord {
  id: string;
  userId: string;
  day: number;
  clientSessionId: string;
  mode: string;
  state: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  metrics: Json;
  evidence: Json;
}

export interface SavePracticeInput {
  sessionId: string;
  durationSeconds?: number | null;
  metrics: SafePracticeMetrics;
  evidence: SafePracticeEvidence;
  readyForCompletion: boolean;
  endedAt?: string | null;
  localRecordHash?: string | null;
}

export interface CompletionResult {
  day: number;
  firstCompletion: boolean;
  xpAwarded: number;
  xpTotal: number;
  initiatoryGrade: number;
  initiatoryTitle: string;
  crown: Json;
}

export interface CompleteDayInput {
  day: number;
  sessionId: string;
  localRecordHash?: string | null;
  clientCompletedAt?: string;
}

const SESSION_SELECT =
  'id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence';

function assertDay(day: number): void {
  if (!Number.isInteger(day) || day < 1 || day > 365) {
    throw new Error('invalid_day');
  }
}

function assertClientSessionId(value: string): void {
  if (!value.trim()) throw new Error('client_session_id_required');
}

/**
 * TypeScript unions can surface keys as `undefined` even when those keys do not
 * exist on the runtime object. We accept that draft shape, strip undefined
 * fields, and keep the network/database boundary strictly number/boolean/null.
 */
function normalizeSafeRecord(
  record: Record<string, SafePracticeDraftValue>,
  label: string,
): Record<string, SafePracticeMetricValue> {
  const normalized: Record<string, SafePracticeMetricValue> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!key.trim()) throw new Error(`${label}_key_required`);
    if (value === undefined) continue;
    const valid = value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
    if (!valid) throw new Error(`${label}_must_be_numeric_boolean_or_null`);
    normalized[key] = value;
  }
  return normalized;
}

function toSessionRecord(row: {
  id: string;
  user_id: string;
  day: number;
  client_session_id: string;
  mode: string;
  state: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  metrics: Json;
  evidence: Json;
}): PracticeSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    day: row.day,
    clientSessionId: row.client_session_id,
    mode: row.mode,
    state: row.state,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    metrics: row.metrics,
    evidence: row.evidence,
  };
}

async function requireAuthenticatedUserId(client: HnkSupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error('authentication_required');
  return data.user.id;
}

/**
 * Starts one canonical Practice Record.
 *
 * Sensitive journal text, intentions, dream prose and free-form notes do not
 * belong in `metrics` or `evidence`; those fields are deliberately constrained
 * to numbers/booleans/null. Sensitive prose belongs in the client-encrypted
 * Vault workflow.
 */
export async function startPracticeSession(
  client: HnkSupabaseClient,
  input: StartPracticeInput,
): Promise<PracticeSessionRecord> {
  assertDay(input.day);
  assertClientSessionId(input.clientSessionId);
  const userId = await requireAuthenticatedUserId(client);

  const { data, error } = await client
    .from('practice_sessions')
    .insert({
      user_id: userId,
      day: input.day,
      client_session_id: input.clientSessionId,
      mode: input.mode ?? 'canonical',
      state: 'active',
      started_at: input.startedAt ?? new Date().toISOString(),
      app_version: input.appVersion ?? null,
      metrics: {},
      evidence: {},
    })
    .select(SESSION_SELECT)
    .single();

  if (error) throw error;
  return toSessionRecord(data);
}

/**
 * Persists non-sensitive structured Practice Record data.
 *
 * `readyForCompletion=true` moves the server row to `evidence_pending`, which
 * is the only pre-completion state accepted by `complete_codex_day`.
 */
export async function savePracticeRecord(
  client: HnkSupabaseClient,
  input: SavePracticeInput,
): Promise<PracticeSessionRecord> {
  if (!input.sessionId.trim()) throw new Error('practice_session_id_required');
  if (input.durationSeconds != null && (!Number.isInteger(input.durationSeconds) || input.durationSeconds < 0)) {
    throw new Error('invalid_duration_seconds');
  }

  const metrics = normalizeSafeRecord(input.metrics, 'metrics');
  const evidence = normalizeSafeRecord(input.evidence, 'evidence');

  if (input.readyForCompletion && Object.keys(evidence).length === 0) {
    throw new Error('evidence_required');
  }

  const { data, error } = await client
    .from('practice_sessions')
    .update({
      duration_seconds: input.durationSeconds ?? null,
      metrics,
      evidence,
      state: input.readyForCompletion ? 'evidence_pending' : 'active',
      ended_at: input.endedAt ?? null,
      local_record_hash: input.localRecordHash ?? null,
    })
    .eq('id', input.sessionId)
    .select(SESSION_SELECT)
    .single();

  if (error) throw error;
  return toSessionRecord(data);
}

export function parseCompletionResult(value: Json): CompletionResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('invalid_completion_response');
  }

  const row = value as Record<string, Json | undefined>;
  const day = row.day;
  const firstCompletion = row.first_completion;
  const xpAwarded = row.xp_awarded;
  const xpTotal = row.xp_total;
  const initiatoryGrade = row.initiatory_grade;
  const initiatoryTitle = row.initiatory_title;

  if (
    typeof day !== 'number' ||
    typeof firstCompletion !== 'boolean' ||
    typeof xpAwarded !== 'number' ||
    typeof xpTotal !== 'number' ||
    typeof initiatoryGrade !== 'number' ||
    typeof initiatoryTitle !== 'string'
  ) {
    throw new Error('invalid_completion_response');
  }

  return {
    day,
    firstCompletion,
    xpAwarded,
    xpTotal,
    initiatoryGrade,
    initiatoryTitle,
    crown: row.crown ?? null,
  };
}

/**
 * Completes a Day only through the authoritative backend RPC.
 *
 * The client never supplies an XP amount. The RPC reads canonical XP from
 * `codex_days`, enforces evidence and sequential progression, awards XP
 * idempotently and owns the Day 036 Neófito → Iniciado promotion.
 */
export async function completeCodexDay(
  client: HnkSupabaseClient,
  input: CompleteDayInput,
): Promise<CompletionResult> {
  assertDay(input.day);
  if (!input.sessionId.trim()) throw new Error('practice_session_id_required');

  const { data, error } = await client.rpc('complete_codex_day', {
    p_day: input.day,
    p_session_id: input.sessionId,
    p_local_record_hash: input.localRecordHash ?? undefined,
    p_client_completed_at: input.clientCompletedAt ?? new Date().toISOString(),
  });

  if (error) throw error;
  return parseCompletionResult(data);
}

export async function getKetherCrownState(client: HnkSupabaseClient): Promise<Json> {
  const { data, error } = await client.rpc('get_kether_crown_state');
  if (error) throw error;
  return data;
}
