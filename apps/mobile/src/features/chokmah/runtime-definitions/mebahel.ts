import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;
function mebahel(day: number, cycleDay: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']): DayDefinition {
  return { day, chapter: 2, sephira: 'Chokmah', world: 'Atziluth', cycle: 'Mebahel', cycleIndex: 7, cycleDay, cycleLength: 5, gate: sequential, phases, evidence };
}

export const MEBAHEL_DAY_067 = mebahel(67,1,[
  {id:'threshold',label:'Limiar da Âncora Espacial',kind:'threshold'},
  {id:'anchor-a',label:'Círculo azul · entrada e saída',kind:'practice'},
  {id:'anchor-b',label:'Retorno à âncora',kind:'practice'},
  {id:'control',label:'Ponto neutro sem círculo/fórmula',kind:'comparison'},
  {id:'cancel',label:'Cancelamento deliberado',kind:'review'},
  {id:'compare',label:'Latência · silêncio · foco',kind:'review'},
  {id:'grounding',label:'Orientação ambiental',kind:'grounding',requiresReturnConfirmation:true},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Mebahel 1/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','anchor_first_completed','anchor_return_completed','control_completed','cancellation_completed','comparison_completed','objective_space_power_not_claimed','risk_movement_avoided','orientation_preserved','safety_clear'],requiredPresent:['active_effect_present','control_effect_present'],minimums:{active_seconds:1,control_seconds:1}});

export const MEBAHEL_DAY_068 = mebahel(68,2,[
  {id:'threshold',label:'Limiar do Jejum Digital',kind:'threshold'},
  {id:'plan',label:'Três fontes + exceções essenciais',kind:'practice'},
  {id:'fast',label:'Janela protegida · até 12h',kind:'practice'},
  {id:'control',label:'Janela habitual comparável',kind:'comparison'},
  {id:'compare',label:'Foco · ansiedade · checagens',kind:'review'},
  {id:'grounding',label:'Retorno deliberado à conectividade',kind:'grounding',requiresReturnConfirmation:true},
  {id:'vault',label:'Vault da política pessoal',kind:'review'},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Mebahel 2/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','three_sources_identified','essential_exceptions_defined','fast_completed','control_completed','comparison_completed','early_exit_allowed','critical_alerts_preserved','responsibilities_preserved','egregore_not_literalized','sustainable_rule_defined','vault_saved','safety_clear'],minimums:{sources_count:3,fast_seconds:1,control_seconds:1}});

export const MEBAHEL_DAY_069 = mebahel(69,3,[
  {id:'threshold',label:'Limiar do Movimento Ocular',kind:'threshold'},
  {id:'active',label:'Movimentos laterais confortáveis',kind:'practice'},
  {id:'control',label:'Olhar central estável',kind:'comparison'},
  {id:'compare',label:'Foco · conforto · sintomas',kind:'review'},
  {id:'grounding',label:'Repouso visual e orientação',kind:'grounding',requiresReturnConfirmation:true},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Mebahel 3/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','no_forced_repetition','no_extreme_speed','brainwave_claim_not_made','therapy_substitute_not_claimed','relevant_condition_guidance_respected','orientation_restored','safety_clear'],minimums:{repetitions_completed:1,active_seconds:1,control_seconds:1}});

export const MEBAHEL_DAY_070 = mebahel(70,4,[
  {id:'threshold',label:'Limiar do Pantáculo',kind:'threshold'},
  {id:'active',label:'Costas · peito · Coroa',kind:'practice'},
  {id:'control',label:'Três marcadores azuis neutros',kind:'comparison'},
  {id:'compare',label:'Limite · calma · prudência',kind:'review'},
  {id:'grounding',label:'Risco concreto e retorno',kind:'grounding',requiresReturnConfirmation:true},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Mebahel 4/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','master_verified','upright_not_mirrored','three_positions_completed','control_completed','comparison_completed','invulnerability_not_claimed','real_safety_preserved','risk_measure_named','orientation_restored','safety_clear'],requiredPresent:['tetragrammaton_master_id'],minimums:{active_seconds:1,control_seconds:1}});

export const MEBAHEL_DAY_071 = mebahel(71,5,[
  {id:'threshold',label:'Limiar do Banimento',kind:'threshold'},
  {id:'active',label:'Círculo + chamas imaginárias',kind:'practice'},
  {id:'control',label:'Gesto + respiração sem fórmula',kind:'comparison'},
  {id:'compare',label:'Tensão · ruminação · expectativa',kind:'review'},
  {id:'grounding',label:'Encerramento único e cotidiano',kind:'grounding',requiresReturnConfirmation:true},
  {id:'vault',label:'Vault do padrão nomeado',kind:'review'},
  {id:'seal',label:'Selo',kind:'seal'},{id:'complete',label:'Mebahel 5/5',kind:'complete'},
],{requiredTrue:['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','imaginary_flame_only','entity_diagnosis_not_claimed','anti_compulsion_rule_confirmed','no_repeat_to_neutralize_fear','practical_boundary_considered','vault_saved','orientation_restored','safety_clear'],requiredPresent:['active_effect_present','control_effect_present'],minimums:{active_seconds:1,control_seconds:1}});

export const MEBAHEL_CANON_RUNTIME=[MEBAHEL_DAY_067,MEBAHEL_DAY_068,MEBAHEL_DAY_069,MEBAHEL_DAY_070,MEBAHEL_DAY_071] as const;
