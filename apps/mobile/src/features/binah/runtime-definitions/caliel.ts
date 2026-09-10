import type { DayDefinition } from '@hnk/day-runtime';

const sequential={requiresPrevious:true} as const;
function caliel(day:number,cycleDay:number,phases:DayDefinition['phases'],evidence:DayDefinition['evidence']):DayDefinition{return{day,chapter:3,sephira:'Binah',world:'Atziluth',cycle:'Caliel',cycleIndex:4,cycleDay,cycleLength:5,gate:sequential,phases,evidence};}

export const CALIEL_DAY_089=caliel(89,1,[
 {id:'threshold',label:'Limiar da Palavra Justa',kind:'threshold'},
 {id:'window',label:'Voto de silêncio · 6 horas',kind:'practice'},
 {id:'review',label:'Impulso · necessidade · silêncio legítimo',kind:'review'},
 {id:'grounding',label:'Retorno consciente à fala',kind:'grounding',requiresReturnConfirmation:true},
 {id:'vault',label:'Vault opcional',kind:'review'},{id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Caliel 1/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','six_hour_window_completed','necessary_speech_allowed','necessary_speech_not_failure','care_work_health_consent_preserved','silence_not_used_as_punishment','others_not_coerced','return_to_speech_completed','anti_ascetic_scoring','safety_clear'],requiredPresent:['necessary_speech_count','speech_impulse_count'],minimums:{monitoring_seconds:21600,necessary_speech_count:0,speech_impulse_count:0}});

export const CALIEL_DAY_090=caliel(90,2,[
 {id:'threshold',label:'Limiar do Ar Negro',kind:'threshold'},
 {id:'vault',label:'Quatro categorias · contexto e consequência',kind:'practice'},
 {id:'review',label:'Padrão · função · alternativa',kind:'review'},
 {id:'grounding',label:'Clareza sem policiamento',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Caliel 2/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','dispersion_reviewed','futile_conversation_reviewed','justified_lie_reviewed','idea_instability_reviewed','memory_not_fabricated','legitimate_light_conversation_preserved','legitimate_opinion_change_preserved','privacy_not_forced_open','manipulation_not_auto_justified','rumination_avoided','proportional_alternative_defined','vault_saved','safety_clear'],requiredPresent:['dispersion_count','futile_conversation_count','justified_lie_count','idea_instability_count']});

export const CALIEL_DAY_091=caliel(91,3,[
 {id:'threshold',label:'Limiar do Ar Branco',kind:'threshold'},
 {id:'vault',label:'Quatro forças · evidência ou lacuna',kind:'practice'},
 {id:'review',label:'Força · excesso · limite · aplicação',kind:'review'},
 {id:'grounding',label:'Humildade intelectual',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Caliel 3/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','clarity_reviewed','precise_communication_reviewed','optimism_reviewed','learning_reviewed','evidence_or_gap_recorded','limits_recorded','no_intelligence_ranking','no_spiritual_superiority','difficulty_not_denied','feedback_space_preserved','proportional_application_defined','vault_saved','safety_clear'],minimums:{categories_reviewed:4,evidence_examples_count:0}});

export const CALIEL_DAY_092=caliel(92,4,[
 {id:'threshold',label:'Limiar da Causalidade',kind:'threshold'},
 {id:'vault',label:'Cinco nexos · evidência · alternativas',kind:'practice'},
 {id:'review',label:'Causa · correlação · sequência · hipótese',kind:'review'},
 {id:'grounding',label:'Certeza proporcional',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Caliel 4/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','five_causal_claims_recorded','mechanisms_reviewed','alternatives_reviewed','evidence_strength_reviewed','real_causality_not_denied','dangerous_experiments_avoided','neuroplasticity_not_claimed_as_measured','spiritual_causality_not_auto_claimed','uncertainty_preserved','vault_saved','safety_clear'],minimums:{causal_claims_count:5}});

export const CALIEL_DAY_093=caliel(93,5,[
 {id:'threshold',label:'Limiar do Sopro do Ar Puro',kind:'threshold'},
 {id:'practice',label:'4-4-4-4 voluntário ou Safety Adaptation',kind:'practice'},
 {id:'return',label:'Respiração natural · Return Gate',kind:'grounding',requiresReturnConfirmation:true},
 {id:'review',label:'Ritmo · conforto · interpretação',kind:'review'},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Caliel 5/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','safety_preflight_received','voluntary_start_preserved','gentle_count_confirmed','no_maximal_breath','natural_breath_returned','no_driving_water_high_consequence','no_physiological_claims','no_endurance_scoring','safety_clear'],requiredPresent:['attempted','safety_stop','adaptation_code','safety_stop_reason_code','completed_cycles'],minimums:{completed_cycles:0}});

export const CALIEL_CANON_RUNTIME=[CALIEL_DAY_089,CALIEL_DAY_090,CALIEL_DAY_091,CALIEL_DAY_092,CALIEL_DAY_093] as const;
