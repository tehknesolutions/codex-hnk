import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;

function aladiah(
  day: number,
  cycleDay: number,
  phases: DayDefinition['phases'],
  evidence: DayDefinition['evidence'],
): DayDefinition {
  return {
    day,
    chapter: 2,
    sephira: 'Chokmah',
    world: 'Atziluth',
    cycle: 'Aladiah',
    cycleIndex: 3,
    cycleDay,
    cycleLength: 5,
    gate: sequential,
    phases,
    evidence,
  };
}

export const ALADIAH_DAY_047 = aladiah(47, 1, [
  { id: 'threshold', label: 'Limiar da Percepção Periférica', kind: 'threshold' },
  { id: 'black', label: 'Fundo preto · luz indireta', kind: 'practice' },
  { id: 'white', label: 'Fundo branco · luz indireta', kind: 'practice' },
  { id: 'bright-black', label: 'Controle claro · fundo preto', kind: 'comparison' },
  { id: 'bright-white', label: 'Controle claro · fundo branco', kind: 'comparison' },
  { id: 'compare', label: 'Contraste · contexto · interpretação', kind: 'review' },
  { id: 'grounding', label: 'Retorno visual e ambiental', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Aladiah 1/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','black_completed','white_completed','bright_black_completed','bright_white_completed',
    'comparison_completed','interpretation_separated','null_results_preserved','diagnosis_not_made','safety_clear',
  ],
  requiredPresent: ['primary_effect_present','control_effect_present'],
  minimums: {
    black_seconds: 300,
    white_seconds: 300,
    bright_black_seconds: 300,
    bright_white_seconds: 300,
  },
});

export const ALADIAH_DAY_048 = aladiah(48, 2, [
  { id: 'threshold', label: 'Limiar dos Loops Narrativos', kind: 'threshold' },
  { id: 'loops', label: 'Abrir 1→2→3 · fechar 3→2→1', kind: 'practice' },
  { id: 'linear', label: 'Três histórias lineares', kind: 'comparison' },
  { id: 'compare', label: 'Loop · linear · experiência', kind: 'review' },
  { id: 'grounding', label: 'Fechamento explícito dos fios', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault cifrado', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Aladiah 2/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','loop_structure_completed','linear_control_completed','all_threads_closed',
    'comparison_completed','interpretation_separated','consent_only','coercion_not_used','vault_saved','safety_clear',
  ],
  requiredPresent: ['loop_effect_present','linear_effect_present'],
  minimums: {
    loops_opened: 3,
    loops_closed: 3,
    linear_stories_completed: 3,
  },
});

export const ALADIAH_DAY_049 = aladiah(49, 3, [
  { id: 'threshold', label: 'Limiar Interoceptivo', kind: 'threshold' },
  { id: 'active-rest', label: 'Repouso · condição ativa', kind: 'grounding' },
  { id: 'active-count', label: 'Pulso · janela de 30 s', kind: 'practice' },
  { id: 'thermal', label: 'Visualização térmica', kind: 'practice' },
  { id: 'control-rest', label: 'Repouso · condição controle', kind: 'grounding' },
  { id: 'control-count', label: 'Pulso · sem visualização térmica', kind: 'comparison' },
  { id: 'compare', label: 'Contagem · sensação · hipótese', kind: 'review' },
  { id: 'grounding', label: 'Retorno corporal e ambiental', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Aladiah 3/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','active_rest_completed','active_count_completed','thermal_visualization_completed',
    'control_rest_completed','control_count_completed','comparison_completed','interpretation_separated','no_diagnosis_claim','safety_clear',
  ],
  requiredPresent: ['active_pulse_count','control_pulse_count','active_heat_present','control_heat_present'],
  minimums: {
    active_rest_seconds: 300,
    active_count_seconds: 30,
    control_rest_seconds: 300,
    control_count_seconds: 30,
  },
});

export const ALADIAH_DAY_050 = aladiah(50, 4, [
  { id: 'threshold', label: 'Limiar do Contorno', kind: 'threshold' },
  { id: 'primary', label: 'Pessoa consentida ou próprio reflexo', kind: 'practice' },
  { id: 'control', label: 'Espelho, silhueta ou fundo controlado', kind: 'comparison' },
  { id: 'compare', label: 'Contorno · contexto · ética', kind: 'review' },
  { id: 'grounding', label: 'Retorno visual e social', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Aladiah 4/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','primary_completed','control_completed','comparison_completed','interpretation_separated',
    'consent_rule_respected','privacy_preserved','diagnosis_not_made','null_results_preserved','safety_clear',
  ],
  requiredPresent: ['primary_effect_present','control_effect_present','third_party_used','third_party_consent'],
  minimums: {
    primary_seconds: 300,
    control_seconds: 300,
  },
});

export const ALADIAH_DAY_051 = aladiah(51, 5, [
  { id: 'threshold', label: 'Limiar do Sigilo de Discernimento', kind: 'threshold' },
  { id: 'compose', label: 'Frase · redução · desenho', kind: 'practice' },
  { id: 'observe', label: 'Observação do sigilo · 3 min', kind: 'practice' },
  { id: 'control', label: 'Regra em texto simples', kind: 'comparison' },
  { id: 'compare', label: 'Símbolo · texto · interpretação', kind: 'review' },
  { id: 'grounding', label: 'Retorno e regra antipânico', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault cifrado', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Aladiah 5/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','reduction_documented','sigil_drawn','observation_completed','text_control_completed',
    'comparison_completed','interpretation_separated','symbolic_anchor_only','no_guaranteed_protection_claim','panic_rule_acknowledged',
    'vault_saved','safety_clear',
  ],
  requiredPresent: ['sigil_effect_present','text_effect_present'],
  minimums: {
    sigil_observation_seconds: 180,
  },
});

export const ALADIAH_CANON_RUNTIME = [
  ALADIAH_DAY_047,
  ALADIAH_DAY_048,
  ALADIAH_DAY_049,
  ALADIAH_DAY_050,
  ALADIAH_DAY_051,
] as const;
