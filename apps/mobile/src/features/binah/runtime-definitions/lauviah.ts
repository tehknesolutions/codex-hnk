import type { DayDefinition } from '@hnk/day-runtime';

const sequential={requiresPrevious:true} as const;
function lauviah(day:number,cycleDay:number,phases:DayDefinition['phases'],evidence:DayDefinition['evidence']):DayDefinition{return{day,chapter:3,sephira:'Binah',world:'Atziluth',cycle:'Lauviah',cycleIndex:3,cycleDay,cycleLength:5,gate:sequential,phases,evidence};}

export const LAUVIAH_BINAH_DAY_084=lauviah(84,1,[
 {id:'threshold',label:'Limiar do Espelho de Fogo',kind:'threshold'},
 {id:'active',label:'Espelho em penumbra · observação voluntária',kind:'practice'},
 {id:'review',label:'Percepção · tensão · interpretação',kind:'review'},
 {id:'grounding',label:'Aumentar luz · orientar · retornar',kind:'grounding',requiresReturnConfirmation:true},
 {id:'vault',label:'Vault opcional',kind:'review'},{id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Lauviah 1/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','setup_checked','mirror_practice_completed','blinking_allowed','voluntary_stop_available','objective_entity_not_claimed','diagnosis_not_claimed','intensity_not_scored','fire_safety_preserved','electric_fallback_truthfully_labeled','orientation_restored','safety_clear'],requiredPresent:['illumination_path_code','effect_present','comparison_used'],minimums:{active_seconds:1}});

export const LAUVIAH_BINAH_DAY_085=lauviah(85,2,[
 {id:'threshold',label:'Limiar do Fogo Negro',kind:'threshold'},
 {id:'vault',label:'Último ano · quatro categorias',kind:'practice'},
 {id:'review',label:'Padrão · responsabilidade · reparação',kind:'review'},
 {id:'grounding',label:'Sair da ruminação',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Lauviah 2/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','year_review_completed','anger_reviewed','impatience_reviewed','spiritual_pride_reviewed','intellectual_arrogance_reviewed','memory_not_fabricated','uncertainty_preserved','emotion_behavior_identity_separated','rumination_avoided','safe_repair_considered','vault_saved','safety_clear'],requiredPresent:['anger_count','impatience_count','spiritual_pride_count','intellectual_arrogance_count']});

export const LAUVIAH_BINAH_DAY_086=lauviah(86,3,[
 {id:'threshold',label:'Limiar do Fogo Branco',kind:'threshold'},
 {id:'vault',label:'Quatro forças · evidência ou lacuna',kind:'practice'},
 {id:'review',label:'Força · excesso · limite · serviço',kind:'review'},
 {id:'grounding',label:'Virtude sem ranking',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Lauviah 3/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','initiative_reviewed','courage_reviewed','mental_dynamism_reviewed','vigorous_devotion_reviewed','evidence_or_gap_recorded','limits_recorded','no_spiritual_ranking','no_superiority_claim','rest_and_consent_preserved','proportional_application_defined','vault_saved','safety_clear'],minimums:{categories_reviewed:4,evidence_examples_count:0}});

export const LAUVIAH_BINAH_DAY_087=lauviah(87,4,[
 {id:'threshold',label:'Limiar da Leitura de Mente',kind:'threshold'},
 {id:'vault',label:'Três hipóteses · fonte · evidência',kind:'practice'},
 {id:'review',label:'Sei · suspeito · ouvi · não sei',kind:'review'},
 {id:'grounding',label:'Comunicação sem vigilância',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Lauviah 4/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','three_hypotheses_recorded','evidence_types_separated','direct_speech_not_erased','inference_named_as_inference','unknown_acknowledged','privacy_preserved','no_surveillance','no_compulsive_interrogation','third_party_identity_not_sent','vault_saved','safety_clear'],minimums:{hypotheses_count:3}});

export const LAUVIAH_BINAH_DAY_088=lauviah(88,5,[
 {id:'threshold',label:'Limiar da Transmutação do Fogo',kind:'threshold'},
 {id:'vault',label:'Contexto manejável · ação segura',kind:'practice'},
 {id:'active',label:'Respiração natural · chama devocional simbólica',kind:'practice'},
 {id:'review',label:'Ira · impulso · escolha',kind:'review'},
 {id:'grounding',label:'Soltar visualização · retornar',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Lauviah 5/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','manageable_memory_selected','current_danger_absent','natural_breath_preserved','no_forced_retention','visualization_completed','anger_reason_not_erased','intensity_drop_not_required','high_stakes_action_deferred_if_activated','energy_transfer_not_claimed','safe_action_defined','vault_saved','orientation_restored','safety_clear'],requiredPresent:['pre_intensity','post_intensity'],minimums:{active_seconds:1}});

export const LAUVIAH_BINAH_CANON_RUNTIME=[LAUVIAH_BINAH_DAY_084,LAUVIAH_BINAH_DAY_085,LAUVIAH_BINAH_DAY_086,LAUVIAH_BINAH_DAY_087,LAUVIAH_BINAH_DAY_088] as const;
