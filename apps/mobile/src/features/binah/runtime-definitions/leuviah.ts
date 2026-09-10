import type { DayDefinition } from '@hnk/day-runtime';

const sequential={requiresPrevious:true} as const;
function leuviah(day:number,cycleDay:number,phases:DayDefinition['phases'],evidence:DayDefinition['evidence']):DayDefinition{return{day,chapter:3,sephira:'Binah',world:'Atziluth',cycle:'Leuviah',cycleIndex:5,cycleDay,cycleLength:5,gate:sequential,phases,evidence};}

export const LEUVIAH_DAY_094=leuviah(94,1,[
 {id:'threshold',label:'Limiar da Água Clara',kind:'threshold'},{id:'practice',label:'Copo de água · foco contemplativo',kind:'practice'},{id:'review',label:'Observação · sensação · interpretação',kind:'review'},{id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},{id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Leuviah 1/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','focus_object_prepared','observation_completed','fact_interpretation_separated','water_hidden_properties_not_claimed','energy_transfer_not_claimed','intensity_not_scored','orientation_restored','safety_clear'],requiredPresent:['effect_present'],minimums:{practice_seconds:1}});

export const LEUVIAH_DAY_095=leuviah(95,2,[
 {id:'threshold',label:'Limiar da Água Negra',kind:'threshold'},{id:'vault',label:'Cinco categorias autobiográficas',kind:'practice'},{id:'review',label:'Padrão sem diagnóstico ou sentença',kind:'review'},{id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},{id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Leuviah 2/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','melancholy_reviewed','self_pity_reviewed','jealousy_reviewed','resentment_reviewed','mood_instability_reviewed','memory_not_forced','diagnosis_not_claimed','moral_sentence_not_claimed','safe_repair_not_forced','vault_saved','orientation_restored','safety_clear'],minimums:{categories_reviewed:5,total_examples_count:0}});

export const LEUVIAH_DAY_096=leuviah(96,3,[
 {id:'threshold',label:'Limiar da Água Branca',kind:'threshold'},{id:'vault',label:'Quatro virtudes · evidência ou lacuna',kind:'practice'},{id:'review',label:'Força · limite · serviço',kind:'review'},{id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},{id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Leuviah 3/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','compassion_reviewed','devotion_reviewed','emotional_empathy_reviewed','astral_sensitivity_reviewed','evidence_or_gap_recorded','limits_recorded','spiritual_ranking_avoided','astral_sensitivity_not_objective_field','service_application_defined','vault_saved','orientation_restored','safety_clear'],minimums:{categories_reviewed:4,total_examples_count:0}});

export const LEUVIAH_DAY_097=leuviah(97,4,[
 {id:'threshold',label:'Limiar da Equivalência',kind:'threshold'},{id:'vault',label:'Equivalência · contexto · alternativas',kind:'practice'},{id:'review',label:'Comportamento não é identidade fixa',kind:'review'},{id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},{id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Leuviah 4/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','equivalence_recorded','alternatives_generated','context_considered','crying_grief_not_invalidated','serenity_not_required','fixed_identity_not_claimed','diagnosis_not_claimed','vault_saved','orientation_restored','safety_clear']});

export const LEUVIAH_DAY_098=leuviah(98,5,[
 {id:'threshold',label:'Limiar da Lavagem Ritual',kind:'threshold'},{id:'practice',label:'Banho · temperatura confortável · símbolo',kind:'practice'},{id:'review',label:'Símbolo sem diagnóstico de entidade',kind:'review'},{id:'grounding',label:'Encerrar sem compulsão',kind:'grounding',requiresReturnConfirmation:true},{id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Leuviah 5/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','ritual_completed','cold_water_optional_confirmed','physical_safety_checked','larvae_symbolic_not_entity_diagnosis','energy_cleansing_not_claimed_as_measured','anti_compulsion_rule_confirmed','orientation_restored','safety_clear'],requiredPresent:['cold_water_used','effect_present'],minimums:{practice_seconds:1}});

export const LEUVIAH_CANON_RUNTIME=[LEUVIAH_DAY_094,LEUVIAH_DAY_095,LEUVIAH_DAY_096,LEUVIAH_DAY_097,LEUVIAH_DAY_098] as const;
