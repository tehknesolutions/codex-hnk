import type { Json } from '@hnk/database';
import { CompletionService, buildDay006CompletionRequest, type CompleteDayResponseV1, type CompletionRpcArgsV2, type CompletionResult } from '@hnk/completion-contract';
import { buildDay006EvidenceV1, buildDay006SafeMetrics, type Day006EvidenceInput } from '@hnk/practice-contract';
import type { HnkSupabaseClient } from './index';

export interface SealDay006V1Input { evidence:Day006EvidenceInput; totalDurationSeconds:number; soundsNotedCount?:number; thoughtReturns?:number; localRecordHash?:string|null; clientCompletedAt?:string; clientCompletionId?:string; }
function asJson(value:unknown):Json{return value as Json}
function parse(value:Json):CompleteDayResponseV1{
  if(typeof value!=='object'||value===null||Array.isArray(value))throw new Error('invalid_completion_response'); const row=value as Record<string,Json|undefined>;
  if(row.day!==6||row.completion_contract_id!=='HNK-KETHER-D006-COMP-V1'||row.quest_definition_id!=='HNK-KETHER-D006-V1'||row.canonical_source_sha!=='923c43ae0a68d63a4c88f67d83076b72e0b06c39'||typeof row.first_completion!=='boolean'||typeof row.xp_awarded!=='number'||typeof row.xp_total!=='number'||!Array.isArray(row.progression_events))throw new Error('invalid_completion_response');
  return value as unknown as CompleteDayResponseV1;
}
export function createDay006ClientCompletionId(sessionId:string){if(!sessionId.trim())throw new Error('practice_session_id_required');return `hnk:d006:completion:v1:${sessionId}`}
export async function startDay006PracticeSessionV1(client:HnkSupabaseClient,input:{clientSessionId:string;appVersion?:string|null;startedAt?:string}){
  if(!input.clientSessionId.trim())throw new Error('client_session_id_required');const{data:auth,error:authError}=await client.auth.getUser();if(authError)throw authError;if(!auth.user?.id)throw new Error('authentication_required');
  const{data,error}=await client.from('practice_sessions').insert({user_id:auth.user.id,day:6,client_session_id:input.clientSessionId,mode:'first_completion',state:'active',started_at:input.startedAt??new Date().toISOString(),app_version:input.appVersion??null,metrics:{},evidence:{}}).select('id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence').single();if(error)throw error;return data;
}
export async function sealDay006V1(client:HnkSupabaseClient,input:SealDay006V1Input):Promise<CompletionResult>{
  const evidence=buildDay006EvidenceV1(input.evidence);const metrics=buildDay006SafeMetrics({totalDurationSeconds:input.totalDurationSeconds,soundsNotedCount:input.soundsNotedCount,thoughtReturns:input.thoughtReturns});
  const{error:e}=await client.from('practice_sessions').update({duration_seconds:input.totalDurationSeconds,metrics:asJson(metrics),evidence:asJson(evidence),state:'evidence_pending',ended_at:input.clientCompletedAt??new Date().toISOString(),local_record_hash:input.localRecordHash??null}).eq('id',evidence.session_id);if(e)throw e;
  const request=buildDay006CompletionRequest({sessionId:evidence.session_id,clientCompletionId:input.clientCompletionId??createDay006ClientCompletionId(evidence.session_id),localRecordHash:input.localRecordHash??undefined,clientCompletedAt:input.clientCompletedAt??new Date().toISOString()});
  const rpc=client.rpc.bind(client) as unknown as (name:'complete_codex_day_v2',args:CompletionRpcArgsV2)=>Promise<{data:Json;error:{message:string;code?:string}|null}>;
  return new CompletionService({async completeCodexDayV2(args){const{data,error}=await rpc('complete_codex_day_v2',args);if(error)throw new Error(error.message||error.code||'completion_rpc_failed');return parse(data)}}).complete(request);
}
