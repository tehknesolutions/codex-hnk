import type { SafeMetricRecord } from './types.js';

export const DAY010_QUEST_ID='HNK-KETHER-D010-V1' as const;
export const DAY010_SOURCE_SHA='167b3380e029456be1571f1d6dc3d491775acec5' as const;
export type Day010AnchorResponse='STRONG'|'WEAK'|'ABSENT';

export interface Day010EvidenceV1{
 protocol_version:typeof DAY010_QUEST_ID;source_sha:typeof DAY010_SOURCE_SHA;session_id:string;mode?:'first_completion'|'revisit';
 jachin:{calm_before:number;calm_after:number;anchor_paired:true;somatic_vault_entry_ref:string};
 boaz:{neutral_test_completed:true;response:Day010AnchorResponse;suppression_avoidance_confirmed:true;non_infallibility_confirmed:true};
 middle:{final_pairing_completed:true;psalm_22_19_prayer_confirmed:true;extraordinary_sensation_not_required_confirmed:true};
 soul_mirror:{completed:true;response_recorded:true;responsible_use_vault_entry_ref:string};
 voluntary_completion_confirmed:true;safety_stop_occurred?:boolean;
}

export interface Day010EvidenceInput{
 sessionId:string;mode?:'first_completion'|'revisit';calmBefore:number;calmAfter:number;somaticVaultEntryRef:string;
 neutralTestCompleted:boolean;response:Day010AnchorResponse;suppressionAvoidanceConfirmed:boolean;nonInfallibilityConfirmed:boolean;
 finalPairingCompleted:boolean;psalm2219PrayerConfirmed:boolean;extraordinarySensationNotRequiredConfirmed:boolean;
 responseRecorded:boolean;responsibleUseVaultEntryRef:string;safetyStopOccurred?:boolean;
}

function score(v:number,label:string){if(!Number.isInteger(v)||v<0||v>10)throw new Error(`invalid_${label}`)}
function ref(v:string,label:string){const x=v.trim();if(!x||x.length>256||/\s/.test(x))throw new Error(`invalid_${label}`);return x}

export function buildDay010EvidenceV1(i:Day010EvidenceInput):Day010EvidenceV1{
 if(!i.sessionId.trim())throw new Error('practice_session_id_required');score(i.calmBefore,'calm_before');score(i.calmAfter,'calm_after');
 const somaticRef=ref(i.somaticVaultEntryRef,'somatic_vault_ref');const responsibleRef=ref(i.responsibleUseVaultEntryRef,'responsible_use_vault_ref');
 if(!i.neutralTestCompleted||!i.suppressionAvoidanceConfirmed||!i.nonInfallibilityConfirmed)throw new Error('day010_boaz_required');
 if(!i.finalPairingCompleted||!i.psalm2219PrayerConfirmed||!i.extraordinarySensationNotRequiredConfirmed)throw new Error('day010_middle_required');
 if(!i.responseRecorded)throw new Error('day010_soul_mirror_required');
 if(!['STRONG','WEAK','ABSENT'].includes(i.response))throw new Error('day010_response_invalid');
 return{protocol_version:DAY010_QUEST_ID,source_sha:DAY010_SOURCE_SHA,session_id:i.sessionId,mode:i.mode,
  jachin:{calm_before:i.calmBefore,calm_after:i.calmAfter,anchor_paired:true,somatic_vault_entry_ref:somaticRef},
  boaz:{neutral_test_completed:true,response:i.response,suppression_avoidance_confirmed:true,non_infallibility_confirmed:true},
  middle:{final_pairing_completed:true,psalm_22_19_prayer_confirmed:true,extraordinary_sensation_not_required_confirmed:true},
  soul_mirror:{completed:true,response_recorded:true,responsible_use_vault_entry_ref:responsibleRef},
  voluntary_completion_confirmed:true,safety_stop_occurred:i.safetyStopOccurred};
}

export function buildDay010SafeMetrics(i:{totalDurationSeconds:number}):SafeMetricRecord{if(!Number.isInteger(i.totalDurationSeconds)||i.totalDurationSeconds<0)throw new Error('invalid_total_duration_seconds');return{total_duration_seconds:i.totalDurationSeconds}}
