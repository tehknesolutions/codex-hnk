import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;

function haziel(
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
    cycle: 'Haziel',
    cycleIndex: 2,
    cycleDay,
    cycleLength: 5,
    gate: sequential,
    phases,
    evidence,
  };
}

export const HAZIEL_DAY_042 = haziel(42, 1, [
  { id: 'threshold', label: 'Limiar da Atenção Frontal', kind: 'threshold' },
  { id: 'massage', label: 'Massagem frontal suave', kind: 'practice' },
  { id: 'residual', label: 'Sensação residual', kind: 'practice' },
  { id: 'control', label: 'Controle corporal neutro', kind: 'comparison' },
  { id: 'compare', label: 'Contato · sensação · interpretação', kind: 'review' },
  { id: 'grounding', label: 'Retorno ocular e ambiental', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Haziel 1/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'massage_completed',
    'residual_completed',
    'control_completed',
    'comparison_completed',
    'interpretation_separated',
    'safety_clear',
  ],
  requiredPresent: ['frontal_sensation_present', 'control_sensation_present'],
  minimums: {
    massage_seconds: 180,
    residual_seconds: 300,
    control_seconds: 300,
  },
});

export const HAZIEL_DAY_043 = haziel(43, 2, [
  { id: 'threshold', label: 'Limiar da Pérola Azul', kind: 'threshold' },
  { id: 'blue', label: 'Pérola Azul', kind: 'practice' },
  { id: 'gray', label: 'Ponto cinza controle', kind: 'comparison' },
  { id: 'compare', label: 'Deliberado · espontâneo · interpretação', kind: 'review' },
  { id: 'grounding', label: 'Retorno visual', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Haziel 2/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'blue_completed',
    'gray_completed',
    'comparison_completed',
    'interpretation_separated',
    'clairvoyance_not_claimed',
    'safety_clear',
  ],
  requiredPresent: ['blue_content_present', 'gray_content_present'],
  minimums: {
    blue_seconds: 600,
    gray_seconds: 600,
  },
});

export const HAZIEL_DAY_044 = haziel(44, 3, [
  { id: 'threshold', label: 'Limiar dos Truísmos', kind: 'threshold' },
  { id: 'compose', label: 'Seis fatos + três sugestões', kind: 'practice' },
  { id: 'active', label: 'Leitura do roteiro', kind: 'practice' },
  { id: 'neutral', label: 'Texto neutro', kind: 'comparison' },
  { id: 'review', label: 'Auditoria ética da linguagem', kind: 'review' },
  { id: 'grounding', label: 'Retorno voluntário', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Haziel 3/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'active_script_completed',
    'neutral_comparison_completed',
    'ethical_review_completed',
    'autonomy_preserved',
  ],
  minimums: {
    truisms_logged: 6,
    suggestions_logged: 3,
  },
});

export const HAZIEL_CANON_RUNTIME = [
  HAZIEL_DAY_042,
  HAZIEL_DAY_043,
  HAZIEL_DAY_044,
] as const;
