import type { Json } from '@hnk/database';
import {
  CompletionService,
  buildDay002CompletionRequest,
  type CompleteDayResponseV1,
  type CompletionRpcArgsV2,
  type CompletionResult,
} from '@hnk/completion-contract';
import {
  buildDay002EvidenceV1,
  buildDay002SafeMetrics,
  type Day002EvidenceInput,
} from '@hnk/practice-contract';
import type { HnkSupabaseClient } from './index';

export interface SealDay002V1Input {
  evidence: Day002EvidenceInput;
  totalDurationSeconds: number;
  impulseCount: number;
  pauseCount?: number;
  localRecordHash?: string | null;
  clientCompletedAt?: string;
  clientCompletionId?: string;
}

function asJson(value: unknown): Json {
  return value as Json;
}

function parseDay002V1Response(value: Json): CompleteDayResponseV1 {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('invalid_completion_response');
  const row = value as Record<string, Json | undefined>;
  const progress = row.progress;
  const crown = row.crown;
  const events = row.progression_events;
  if (
    row.day !== 2 ||
    typeof row.completion_contract_id !== 'string' ||
    typeof row.quest_definition_id !== 'string' ||
    typeof row.canonical_source_sha !== 'string' ||
    typeof row.first_completion !== 'boolean' ||
    typeof row.xp_awarded !== 'number' ||
    typeof row.xp_total !== 'number' ||
    typeof row.initiatory_grade !== 'number' ||
    typeof row.initiatory_title !== 'string' ||
    typeof row.server_completed_at !== 'string' ||
    typeof progress !== 'object' || progress === null || Array.isArray(progress) ||
    typeof crown !== 'object' || crown === null || Array.isArray(crown) ||
    !Array.isArray(events) || !events.every((event) => typeof event === 'string')
  ) throw new Error('invalid_completion_response');
  return value as unknown as CompleteDayResponseV1;
}

export function createDay002ClientCompletionId(sessionId: string): string {
  if (!sessionId.trim()) throw new Error('practice_session_id_required');
  return `hnk:d002:completion:v1:${sessionId}`;
}

export async function startDay002PracticeSessionV1(
  client: HnkSupabaseClient,
  input: { clientSessionId: string; appVersion?: string | null; startedAt?: string },
) {
  if (!input.clientSessionId.trim()) throw new Error('client_session_id_required');
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user?.id) throw new Error('authentication_required');

  const { data, error } = await client
    .from('practice_sessions')
    .insert({
      user_id: authData.user.id,
      day: 2,
      client_session_id: input.clientSessionId,
      mode: 'first_completion',
      state: 'active',
      started_at: input.startedAt ?? new Date().toISOString(),
      app_version: input.appVersion ?? null,
      metrics: {},
      evidence: {},
    })
    .select('id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    userId: data.user_id,
    day: data.day,
    clientSessionId: data.client_session_id,
    mode: data.mode,
    state: data.state,
    startedAt: data.started_at,
    endedAt: data.ended_at,
    durationSeconds: data.duration_seconds,
    metrics: data.metrics,
    evidence: data.evidence,
  };
}

export async function sealDay002V1(
  client: HnkSupabaseClient,
  input: SealDay002V1Input,
): Promise<CompletionResult> {
  const evidence = buildDay002EvidenceV1(input.evidence);
  const sessionId = evidence.session_id;
  const metrics = buildDay002SafeMetrics({
    impulseCount: input.impulseCount,
    totalDurationSeconds: input.totalDurationSeconds,
    pauseCount: input.pauseCount ?? 0,
  });

  const { error: evidenceError } = await client
    .from('practice_sessions')
    .update({
      duration_seconds: input.totalDurationSeconds,
      metrics: asJson(metrics),
      evidence: asJson(evidence),
      state: 'evidence_pending',
      ended_at: input.clientCompletedAt ?? new Date().toISOString(),
      local_record_hash: input.localRecordHash ?? null,
    })
    .eq('id', sessionId);
  if (evidenceError) throw evidenceError;

  const request = buildDay002CompletionRequest({
    sessionId,
    clientCompletionId: input.clientCompletionId ?? createDay002ClientCompletionId(sessionId),
    localRecordHash: input.localRecordHash ?? undefined,
    clientCompletedAt: input.clientCompletedAt ?? new Date().toISOString(),
  });

  const rpc = client.rpc.bind(client) as unknown as (
    name: 'complete_codex_day_v2',
    args: CompletionRpcArgsV2,
  ) => Promise<{ data: Json; error: { message: string; code?: string } | null }>;

  const service = new CompletionService({
    async completeCodexDayV2(args: CompletionRpcArgsV2): Promise<CompleteDayResponseV1> {
      const { data, error } = await rpc('complete_codex_day_v2', args);
      if (error) throw new Error(error.message || error.code || 'completion_rpc_failed');
      return parseDay002V1Response(data);
    },
  });
  return service.complete(request);
}
