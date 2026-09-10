import type { DayDefinition } from '@hnk/day-runtime';

const sequential={requiresPrevious:true} as const;
function pahaliah(day:number,cycleDay:number,phases:DayDefinition['phases'],evidence:DayDefinition['evidence']):DayDefinition{return{day,chapter:3,sephira:'Binah',world:'Atziluth',cycle:'Pahaliah',cycleIndex:6,cycleDay,cycleLength:5,gate:sequential,phases,evidence};}

export const PAHALIAH_DAY_099=pahaliah(99,1,[
 {id:'threshold',label:'Limiar do Templo de Assiah',kind:'threshold'},
 {id:'practice',label:'Alongamento ou corrida · esforço seguro',kind:'practice'},
 {id:'review',label:'Esforço sem punição',kind:'review'},
 {id:'grounding',label:'Return Gate corporal',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Pahaliah 1/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','safe_preflight_completed','movement_completed','pain_not_goal','extreme_effort_avoided','corporal_punishment_avoided','xp_competition_avoided','body_limits_respected','orientation_restored','safety_clear'],requiredPresent:['movement_path_code','effect_present'],minimums:{practice_seconds:1}});

export const PAHALIAH_DAY_100=pahaliah(100,2,[
 {id:'threshold',label:'Limiar da Terra Negra',kind:'threshold'},
 {id:'vault',label:'Quatro categorias · contexto obrigatório',kind:'practice'},
 {id:'review',label:'Adiamento evitável ou limite legítimo',kind:'review'},
 {id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Pahaliah 2/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','laziness_reviewed','practice_delay_reviewed','material_attachment_reviewed','idea_stubbornness_reviewed','context_recorded','fatigue_not_moralized','poverty_not_moralized','illness_not_moralized','necessary_rest_not_moralized','executive_difficulty_not_moralized','diagnosis_not_claimed','vault_saved','orientation_restored','safety_clear'],minimums:{categories_reviewed:4,total_examples_count:0}});

export const PAHALIAH_DAY_101=pahaliah(101,3,[
 {id:'threshold',label:'Limiar da Terra Branca',kind:'threshold'},
 {id:'vault',label:'Quatro forças · evidência ou lacuna',kind:'practice'},
 {id:'review',label:'Regularidade com flexibilidade',kind:'review'},
 {id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Pahaliah 3/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','perseverance_reviewed','reliability_reviewed','practical_stability_reviewed','schedule_discipline_reviewed','evidence_or_gap_recorded','obsession_avoided','ranking_avoided','family_work_health_flexibility_preserved','unforeseen_events_flexibility_preserved','repair_path_defined','vault_saved','orientation_restored','safety_clear'],minimums:{categories_reviewed:4,total_examples_count:0}});

export const PAHALIAH_DAY_102=pahaliah(102,4,[
 {id:'threshold',label:'Limiar do Cansaço Específico',kind:'threshold'},
 {id:'vault',label:'Exaustão · evidência · contexto',kind:'practice'},
 {id:'decision',label:'Praticar · adaptar · descansar',kind:'review'},
 {id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Pahaliah 4/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','fatigue_claim_recorded','specific_tired_domain_recorded','evidence_reviewed','physical_signals_respected','real_exhaustion_allowed','sleep_pain_illness_malaise_respected','practice_not_forced','diagnosis_not_claimed','decision_context_recorded','vault_saved','orientation_restored','safety_clear'],requiredPresent:['decision_code']});

export const PAHALIAH_DAY_103=pahaliah(103,5,[
 {id:'threshold',label:'Limiar da Fixação no Altar',kind:'threshold'},
 {id:'practice',label:'Organização e limpeza funcional',kind:'practice'},
 {id:'review',label:'Funcionalidade sem perfeccionismo',kind:'review'},
 {id:'grounding',label:'Return Gate',kind:'grounding',requiresReturnConfirmation:true},
 {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Pahaliah 5/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','organization_or_cleaning_completed','perfection_not_required','anti_compulsion_rule_confirmed','domestic_safety_preserved','accessibility_preserved','cohabitation_preserved','aesthetic_ranking_avoided','orientation_restored','safety_clear'],requiredPresent:['effect_present'],minimums:{practice_seconds:1}});

export const PAHALIAH_CANON_RUNTIME=[PAHALIAH_DAY_099,PAHALIAH_DAY_100,PAHALIAH_DAY_101,PAHALIAH_DAY_102,PAHALIAH_DAY_103] as const;
