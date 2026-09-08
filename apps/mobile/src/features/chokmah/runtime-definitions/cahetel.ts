import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;

function cahetel(
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
    cycle: 'Cahetel',
    cycleIndex: 1,
    cycleDay,
    cycleLength: 5,
    gate: sequential,
    phases,
    evidence,
  };
}

export const CAHETEL_DAY_037 = cahetel(37, 1, [
  { id: 'threshold', label: 'Limiar da Receptividade', kind: 'threshold' },
  { id: 'vakog', label: 'VAKOG sem rótulo', kind: 'practice' },
  { id: 'layers', label: 'Dado · Interpretação · Hipótese', kind: 'review' },
  { id: 'integration', label: 'Receber primeiro', kind: 'integration' },
  { id: 'grounding', label: 'Retorno ao ambiente', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Cahetel 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'vakog_completed', 'layers_separated', 'discernment_rule_defined'],
  minimums: { perceptions_logged: 20, vakog_seconds: 420 },
});

export const CAHETEL_DAY_038 = cahetel(38, 2, [
  { id: 'threshold', label: 'Limiar do Pacing', kind: 'threshold' },
  { id: 'pacing', label: 'Acompanhar pensamentos', kind: 'practice' },
  { id: 'leading', label: 'Leading permissivo', kind: 'practice' },
  { id: 'review', label: 'Pensamento não é fato', kind: 'review' },
  { id: 'grounding', label: 'Retorno voluntário', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Cahetel 2/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'pacing_completed', 'leading_completed', 'voluntary_choice_preserved', 'personal_suggestion_limit_defined'],
  minimums: { thoughts_paced: 10, pacing_seconds: 360 },
});

export const CAHETEL_DAY_039 = cahetel(39, 3, [
  { id: 'threshold', label: 'Limiar Somático', kind: 'threshold' },
  { id: 'safety', label: 'Neck Safety Gate', kind: 'instruction' },
  { id: 'neutral', label: 'Fase neutra', kind: 'practice' },
  { id: 'symbolic', label: 'Fase simbólica', kind: 'comparison' },
  { id: 'layers', label: 'Sensação · Imagem · Interpretação · Hipótese', kind: 'review' },
  { id: 'grounding', label: 'Retorno corporal', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Cahetel 3/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'safety_clear', 'neutral_phase_completed', 'symbolic_phase_completed', 'layers_separated', 'telepathy_not_claimed'],
  minimums: { neutral_seconds: 180, symbolic_seconds: 240 },
});

export const CAHETEL_DAY_040 = cahetel(40, 4, [
  { id: 'threshold', label: 'Limiar da Autoindução', kind: 'threshold' },
  { id: 'verbal', label: 'Truísmos + sugestão permissiva', kind: 'practice' },
  { id: 'silent', label: 'Condição silenciosa', kind: 'comparison' },
  { id: 'compare', label: 'Comparar sem escolher vencedor', kind: 'review' },
  { id: 'grounding', label: 'Retorno ocular e ambiental', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Cahetel 4/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'verbal_condition_completed',
    'silent_condition_completed',
    'comparison_completed',
    'autonomy_preserved',
  ],
  minimums: {
    verbal_seconds: 360,
    silent_seconds: 360,
    truisms_logged: 3,
    suggestions_logged: 1,
  },
});

export const CAHETEL_DAY_041 = cahetel(41, 5, [
  { id: 'threshold', label: 'Limiar da Intuição Zoe', kind: 'threshold' },
  { id: 'question', label: 'Pergunta espiritual não urgente', kind: 'instruction' },
  { id: 'active', label: 'Recepção com pergunta', kind: 'practice' },
  { id: 'open', label: 'Recepção aberta', kind: 'comparison' },
  { id: 'discernment', label: 'Experiência · interpretação · alternativa · verificação', kind: 'review' },
  { id: 'grounding', label: 'Retorno ao ambiente', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo do ciclo', kind: 'seal' },
  { id: 'complete', label: 'Cahetel 5/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'question_defined',
    'active_reception_completed',
    'open_reception_completed',
    'interpretation_delayed',
    'alternative_recorded',
    'verification_defined',
  ],
  minimums: {
    active_reception_seconds: 420,
    open_reception_seconds: 420,
  },
});

export const CAHETEL_CANON_RUNTIME = [
  CAHETEL_DAY_037,
  CAHETEL_DAY_038,
  CAHETEL_DAY_039,
  CAHETEL_DAY_040,
  CAHETEL_DAY_041,
] as const;
