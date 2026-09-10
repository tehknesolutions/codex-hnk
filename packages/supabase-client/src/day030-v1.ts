import type { Json } from '@hnk/database';
import {
  CompletionService,
  buildDay030CompletionRequest,
  type CompleteDayResponseV1,
  type CompletionRpcArgsV2,
  type CompletionResult,
} from '@hnk/completion-contract';
import {
  buildDay030EvidenceV1,
  buildDay030SafeMetrics,
  day030TotalDurationSeconds,
  type Day030EvidenceInput,
} from '@hnk/practice-contract';
import type { HnkSupabaseClient } from './index';

export interface SealDay030V1Input {
  evidence: Day030EvidenceInput;
  localRecordHash?: string | null;
  clientCompletedAt?: string;
  clientCompletionId?: string;
}

function asJson(value: unknown): Json { return value as Json; }

function parseCompletion(value: Json): CompleteDayResponseV1 {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('invalid_completion_response');
  const row = value as Record<string, Json | undefined>;
  if (
    row.day !== 30
    || row.completion_contract_id !== 'HNK-KETHER-D030-COMP-V1'
    || row.quest_definition_id !== 'HNK-KETHER-D030-V1'
    || row.canonical_source_sha !== 'a9bea648b20595579ef70c11ba3f319e477845dd'
    || typeof row.first_completion !== 'boolean'
    || typeof row.xp_awarded !== 'number'
    || typeof row.xp_total !== 'number'
    || !Array.isArray(row.progression_events)
  ) throw new Error('invalid_completion_response');
  return value as unknown as CompleteDayResponseV1;
}

export function createDay030ClientCompletionId(sessionId: string): string {
  if (!sessionId.trim()) throw new Error('practice_session_id_required');
  return `hnk:d030:completion:v1:${sessionId}`;
}

export async function startDay030PracticeSessionV1(
  client: HnkSupabaseClient,
  input: { clientSessionId: string; appVersion?: string | null; startedAt?: string },
) {
  if (!input.clientSessionId.trim()) throw new Error('client_session_id_required');
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!auth.user?.id) throw new Error('authentication_required');
  const { data, error } = await client.from('practice_sessions').insert({
    user_id: auth.user.id,
    day: 30,
    client_session_id: input.clientSessionId,
    mode: 'first_completion',
    state: 'active',
    started_at: input.startedAt ?? new Date().toISOString(),
    app_version: input.appVersion ?? null,
    metrics: {},
    evidence: {},
  }).select('id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence').single();
  if (error) throw error;
  return data;
}

export async function loadDay030PracticeSessionV1(client: HnkSupabaseClient, sessionId: string) {
  if (!sessionId.trim()) throw new Error('practice_session_id_required');
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!auth.user?.id) throw new Error('authentication_required');
  const { data, error } = await client.from('practice_sessions')
    .select('id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence')
    .eq('id', sessionId).eq('user_id', auth.user.id).eq('day', 30).maybeSingle();
  if (error) throw error;
  return data;
}

export async function sealDay030V1(client: HnkSupabaseClient, input: SealDay030V1Input): Promise<CompletionResult> {
  const evidence = buildDay030EvidenceV1(input.evidence);
  const total = day030TotalDurationSeconds(evidence);
  const distractionCount = evidence.jachin.distraction_count + evidence.boaz.distraction_count;
  const metrics = buildDay030SafeMetrics({
    totalDurationSeconds: total,
    distractionCount,
    volumePermille: evidence.jachin.volume_permille,
  });
  const { error: saveError } = await client.from('practice_sessions').update({
    duration_seconds: total,
    metrics: asJson(metrics),
    evidence: asJson(evidence),
    state: 'evidence_pending',
    ended_at: input.clientCompletedAt ?? new Date().toISOString(),
    local_record_hash: input.localRecordHash ?? null,
  }).eq('id', evidence.session_id);
  if (saveError) throw saveError;

  const request = buildDay030CompletionRequest({
    sessionId: evidence.session_id,
    clientCompletionId: input.clientCompletionId ?? createDay030ClientCompletionId(evidence.session_id),
    ...(input.localRecordHash ? { localRecordHash: input.localRecordHash } : {}),
    clientCompletedAt: input.clientCompletedAt ?? new Date().toISOString(),
  });
  const rpc = client.rpc.bind(client) as unknown as (
    name: 'complete_codex_day_v2',
    args: CompletionRpcArgsV2,
  ) => Promise<{ data: Json; error: { message: string; code?: string } | null }>;
  return new CompletionService({
    async completeCodexDayV2(args) {
      const { data, error } = await rpc('complete_codex_day_v2', args);
      if (error) throw new Error(error.message || error.code || 'completion_rpc_failed');
      return parseCompletion(data);
    },
  }).complete(request);
}
