import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;
function hakamiah(day:number,cycleDay:number,phases:DayDefinition['phases'],evidence:DayDefinition['evidence']):DayDefinition{
  return {day,chapter:3,sephira:'Binah',world:'Atziluth',cycle:'Hakamiah',cycleIndex:2,cycleDay,cycleLength:5,gate:sequential,phases,evidence};
}

export const HAKAMIAH_DAY_079=hakamiah(79,1,[
  {id:'threshold',label:'Limiar de Thurisaz',kind:'threshold'},
  {id:'active',label:'Thurisaz vermelho-negro · limite simbólico',kind:'practice'},
  {id:'review',label:'Símbolo · sensação · fato',kind:'review'},
  {id:'grounding',label:'Dissolver e retornar',kind:'grounding',requiresReturnConfirmation:true},
  {id:'vault',label:'Vault opcional',kind:'review'},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Hakamiah 1/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','master_verified','asset_sha_verified','upright_not_mirrored','visualization_completed','visualization_dissolved','attack_not_claimed','invulnerability_not_claimed','third_party_accusation_avoided','concrete_safety_preserved','safety_clear'],requiredPresent:['effect_present'],minimums:{active_seconds:1}});

export const HAKAMIAH_DAY_080=hakamiah(80,2,[
  {id:'threshold',label:'Limiar do “Tenho Que”',kind:'threshold'},
  {id:'vault',label:'Cinco regras · consequências · categorias',kind:'practice'},
  {id:'review',label:'Manter · reformular · questionar',kind:'review'},
  {id:'grounding',label:'Liberdade responsável',kind:'grounding',requiresReturnConfirmation:true},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Hakamiah 2/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','five_rules_recorded','sources_recorded','consequences_recorded','classifications_recorded','one_rule_maintained','one_rule_reformulated','one_rule_questioned','legal_family_professional_safety_duties_preserved','third_party_reaction_not_inferred','automatic_rebellion_avoided','vault_saved','safety_clear'],minimums:{rules_count:5,classifications_count:5}});

export const HAKAMIAH_DAY_081=hakamiah(81,3,[
  {id:'threshold',label:'Limiar do “Não Consigo”',kind:'threshold'},
  {id:'vault',label:'Três limitações · impedimentos · classificação',kind:'practice'},
  {id:'path',label:'Microteste seguro ou alternativa',kind:'review'},
  {id:'grounding',label:'Limite e possibilidade',kind:'grounding',requiresReturnConfirmation:true},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Hakamiah 3/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','three_limitations_recorded','impediments_recorded','classifications_recorded','unsafe_tests_avoided','medical_limits_respected','universal_overcoming_not_claimed','safe_path_selected','vault_saved','safety_clear'],requiredPresent:['microtest_performed','alternative_path_used'],minimums:{limitations_count:3,classifications_count:3}});

export const HAKAMIAH_DAY_082=hakamiah(82,4,[
  {id:'threshold',label:'Limiar do Sempre e Nunca',kind:'threshold'},
  {id:'vault',label:'Cinco universais · contraexemplos · períodos',kind:'practice'},
  {id:'review',label:'Exceção sem negar padrão',kind:'review'},
  {id:'grounding',label:'Tempo · frequência · responsabilidade',kind:'grounding',requiresReturnConfirmation:true},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Hakamiah 4/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','five_universals_recorded','counterexamples_recorded','periods_recorded','five_rewrites_recorded','frequent_pattern_not_erased','sparse_data_uncertainty_preserved','statistical_certainty_not_claimed','responsibility_preserved','vault_saved','safety_clear'],minimums:{universals_count:5,rewrites_count:5}});

export const HAKAMIAH_DAY_083=hakamiah(83,5,[
  {id:'threshold',label:'Limiar do Espinho Protetor',kind:'threshold'},
  {id:'active',label:'Círculo físico ou fallback rotulado',kind:'practice'},
  {id:'review',label:'Limite simbólico · prudência concreta',kind:'review'},
  {id:'cleanup',label:'Desfazer · limpar · lavar mãos quando necessário',kind:'grounding'},
  {id:'grounding',label:'Retorno ao cotidiano',kind:'grounding',requiresReturnConfirmation:true},
  {id:'vault',label:'Vault opcional',kind:'review'},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Hakamiah 5/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','space_checked','exit_unobstructed','floor_stable','child_animal_safe','material_or_fallback_completed','fallback_truthfully_labeled','ritual_ended','cleanup_completed','material_movement_not_interpreted_as_intrusion','symbolic_protection_not_substitute_for_safety','anti_compulsion_rule_confirmed','concrete_boundary_named','orientation_restored','safety_clear'],requiredPresent:['material_path_code','effect_present'],minimums:{active_seconds:1}});

export const HAKAMIAH_CANON_RUNTIME=[HAKAMIAH_DAY_079,HAKAMIAH_DAY_080,HAKAMIAH_DAY_081,HAKAMIAH_DAY_082,HAKAMIAH_DAY_083] as const;
