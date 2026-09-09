import type { Json } from '@hnk/database';
import { CompletionService, buildDay012CompletionRequest, type CompleteDayResponseV1, type CompletionRpcArgsV2, type CompletionResult } from '@hnk/completion-contract';
import { buildDay012EvidenceV1, buildDay012SafeMetrics, type Day012EvidenceInput } from '@hnk/practice-contract';
import type { HnkSupabaseClient } from './index';
export type { Day012DiscomfortResponse } from '@hnk/practice-contract';

export interface SealDay012V1Input{evidence:Day012EvidenceInput;totalDurationSeconds:number;localRecordHash?:string|null;clientCompletedAt?:string;clientCompletionId?:string}
function asJson(v:unknown):Json{return v as Json}
function parse(v:Json):CompleteDayResponseV1{
 if(typeof v!=='object'||v===null||Array.isArray(v))throw new Error('invalid_completion_response');
 const r=v as Record<string,Json|undefined>;
 if(r.day!==12||r.completion_contract_id!=='HNK-KETHER-D012-COMP-V1'||r.quest_definition_id!=='HNK-KETHER-D012-V1'||r.canonical_source_sha!=='a3be33e6d390b6c507e284d6dad6aaf94ebd4294'||typeof r.first_completion!=='boolean'||typeof r.xp_awarded!=='number'||typeof r.xp_total!=='number'||!Array.isArray(r.progression_events))throw new Error('invalid_completion_response');
 return v as unknown as CompleteDayResponseV1;
}
export function createDay012ClientCompletionId(sessionId:string){if(!sessionId.trim())throw new Error('practice_session_id_required');return`hnk:d012:completion:v1:${sessionId}`}
export async function startDay012PracticeSessionV1(client:HnkSupabaseClient,input:{clientSessionId:string;appVersion?:string|null;startedAt?:string}){
 if(!input.clientSessionId.trim())throw new Error('client_session_id_required');const{data:auth,error:authError}=await client.auth.getUser();if(authError)throw authError;if(!auth.user?.id)throw new Error('authentication_required');
 const{data,error}=await client.from('practice_sessions').insert({user_id:auth.user.id,day:12,client_session_id:input.clientSessionId,mode:'first_completion',state:'active',started_at:input.startedAt??new Date().toISOString(),app_version:input.appVersion??null,metrics:{},evidence:{}}).select('id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence').single();if(error)throw error;return data;
}
export async function loadDay012PracticeSessionV1(client:HnkSupabaseClient,sessionId:string){
 if(!sessionId.trim())throw new Error('practice_session_id_required');const{data:auth,error:authError}=await client.auth.getUser();if(authError)throw authError;if(!auth.user?.id)throw new Error('authentication_required');
 const{data,error}=await client.from('practice_sessions').select('id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence').eq('id',sessionId).eq('user_id',auth.user.id).eq('day',12).maybeSingle();if(error)throw error;return data;
}
export async function sealDay012V1(client:HnkSupabaseClient,input:SealDay012V1Input):Promise<CompletionResult>{
 const evidence=buildDay012EvidenceV1(input.evidence);const metrics=buildDay012SafeMetrics({totalDurationSeconds:input.totalDurationSeconds});
 const{error:e}=await client.from('practice_sessions').update({duration_seconds:input.totalDurationSeconds,metrics:asJson(metrics),evidence:asJson(evidence),state:'evidence_pending',ended_at:input.clientCompletedAt??new Date().toISOString(),local_record_hash:input.localRecordHash??null}).eq('id',evidence.session_id);if(e)throw e;
 const request=buildDay012CompletionRequest({sessionId:evidence.session_id,clientCompletionId:input.clientCompletionId??createDay012ClientCompletionId(evidence.session_id),localRecordHash:input.localRecordHash??undefined,clientCompletedAt:input.clientCompletedAt??new Date().toISOString()});
 const rpc=client.rpc.bind(client) as unknown as(name:'complete_codex_day_v2',args:CompletionRpcArgsV2)=>Promise<{data:Json;error:{message:string;code?:string}|null}>;
 return new CompletionService({async completeCodexDayV2(args){const{data,error}=await rpc('complete_codex_day_v2',args);if(error)throw new Error(error.message||error.code||'completion_rpc_failed');return parse(data)}}).complete(request);
}
