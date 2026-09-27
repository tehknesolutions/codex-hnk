export const DAY074_QUEST_ID='HNK-BINAH-D074-V1' as const;
export const DAY074_XP=100 as const;
export const DAY074_REQUIRED_SELF_ACCUSATIONS=3 as const;

export interface Day074SelfAccusationEntry {
  statement:string;
  specificityAnswer:string;
}

export interface Day074EvidenceInput {
  sessionId:string;
  entries:Day074SelfAccusationEntry[];
  omissionsReviewedConfirmed:boolean;
  observationInterpretationBeliefSeparatedConfirmed:boolean;
  privateVaultEntryRef:string;
  privateVaultE2eeConfirmed:true;
  practiceRecordNoPrivateProseConfirmed:boolean;
  voluntaryCompletionConfirmed:boolean;
  nextDayNotAutoStartedConfirmed:boolean;
}

const uuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export function buildDay074EvidenceV1(input:Day074EvidenceInput){
  if(!uuid(input.sessionId))throw new Error('day074_session_id_invalid');
  if(input.entries.length!==DAY074_REQUIRED_SELF_ACCUSATIONS)throw new Error('day074_exactly_three_entries_required');
  for(const entry of input.entries){
    if(!entry.statement.trim())throw new Error('day074_statement_required');
    if(!entry.specificityAnswer.trim())throw new Error('day074_specificity_answer_required');
  }
  if(!input.omissionsReviewedConfirmed)throw new Error('day074_omissions_review_required');
  if(!input.observationInterpretationBeliefSeparatedConfirmed)throw new Error('day074_epistemic_separation_required');
  if(!uuid(input.privateVaultEntryRef)||!input.privateVaultE2eeConfirmed)throw new Error('day074_vault_e2ee_required');
  if(!input.practiceRecordNoPrivateProseConfirmed)throw new Error('day074_private_prose_boundary_required');
  if(!input.voluntaryCompletionConfirmed)throw new Error('day074_voluntary_completion_required');
  if(!input.nextDayNotAutoStartedConfirmed)throw new Error('day074_no_auto_start_required');
  return {
    protocol_version:DAY074_QUEST_ID,
    session_id:input.sessionId,
    mode:'first_completion',
    self_accusation_count:DAY074_REQUIRED_SELF_ACCUSATIONS,
    omissions_reviewed_confirmed:true,
    observation_interpretation_belief_separated_confirmed:true,
    private_vault_entry_ref:input.privateVaultEntryRef,
    private_vault_e2ee_confirmed:true,
    practice_record_no_private_prose_confirmed:true,
    voluntary_completion_confirmed:true,
    next_day_not_auto_started_confirmed:true,
    xp_reward:DAY074_XP
  } as const;
}

export function buildDay074SafeMetrics(input:Day074EvidenceInput){
  return {
    self_accusation_count:input.entries.length,
    omissions_reviewed_confirmed:input.omissionsReviewedConfirmed,
    epistemic_separation_confirmed:input.observationInterpretationBeliefSeparatedConfirmed
  } as const;
}
