import type {Json} from '@hnk/database';
import {CompletionService,type CompleteDayResponseV1,type CompletionRpcArgsV2,type CompletionResult} from '@hnk/completion-contract';
import type {HnkSupabaseClient} from './index';

export const DAY073_COMPLETION_CONTRACT_ID='HNK-CHOKMAH-D073-COMP-V2' as const;
export const DAY073_QUEST_DEFINITION_ID='HNK-CHOKMAH-D073-V2' as const;
export const DAY073_CANONICAL_SOURCE_SHA='be135a55fdd2fad853cc526f1ccb78cb933e2391' as const;

export interface SealDay073V2Input{sessionId:string;localRecordHash?:string|null;clientCompletedAt?:string;clientCompletionId?:string}

function parse(v:Json):CompleteDayResponseV1{
 if(typeof v!=='object'||v===null||Array.isArray(v))throw new Error('invalid_completion_response');
 const r=v as Record<string,Json|undefined>;
 if(r.day!==73||r.completion_contract_id!==DAY073_COMPLETION_CONTRACT_ID||r.quest_definition_id!==DAY073_QUEST_DEFINITION_ID||r.canonical_source_sha!==DAY073_CANONICAL_SOURCE_SHA||typeof r.first_completion!=='boolean'||typeof r.xp_awarded!=='number'||typeof r.xp_total!=='number'||!Array.isArray(r.progression_events))throw new Error('invalid_completion_response');
 if(r.first_completion===true){
  const p=r.progress;
  if(typeof p!=='object'||p===null||Array.isArray(p))throw new Error('invalid_progress_response');
  const pr=p as Record<string,Json|undefined>;
  if(pr.current_day!==73||pr.current_chapter!==2||pr.current_sephira!=='Chokmah'||pr.initiatory_grade!==2||pr.initiatory_title!=='Iniciado')throw new Error('invalid_day073_frozen_progress_response');
  if((r.progression_events as Json[]).includes('NEXT_DAY_UNLOCKED'))throw new Error('day073_must_not_unlock_day074');
 }
 return v as unknown as CompleteDayResponseV1;
}
export function createDay073ClientCompletionId(sessionId:string){if(!sessionId.trim())throw new Error('practice_session_id_required');return`hnk:d073:completion:v2:${sessionId}`}

/**
 * Prepared bridge only. Callers must enforce the Portal073 publication gate.
 * The live server remains authoritative and rejects absent/inactive contracts.
 */
export async function sealDay073V2(client:HnkSupabaseClient,input:SealDay073V2Input):Promise<CompletionResult>{
 if(!input.sessionId.trim())throw new Error('practice_session_id_required');
 const req={
  day:73,
  sessionId:input.sessionId,
  completionContractId:DAY073_COMPLETION_CONTRACT_ID,
  questDefinitionId:DAY073_QUEST_DEFINITION_ID,
  canonicalSourceSha:DAY073_CANONICAL_SOURCE_SHA,
  clientCompletionId:input.clientCompletionId??createDay073ClientCompletionId(input.sessionId),
  localRecordHash:input.localRecordHash??null,
  clientCompletedAt:input.clientCompletedAt??new Date().toISOString(),
 };
 const rpc=client.rpc.bind(client) as unknown as(name:'complete_codex_day_v2',args:CompletionRpcArgsV2)=>Promise<{data:Json;error:{message:string;code?:string}|null}>;
 return new CompletionService({async completeCodexDayV2(args){const{data,error}=await rpc('complete_codex_day_v2',args);if(error)throw new Error(error.message||error.code||'completion_rpc_failed');return parse(data)}}).complete(req);
}
