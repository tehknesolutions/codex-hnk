import { ketherGateForDay, type DayDefinition } from '@hnk/day-runtime';

const achaiah = (
  day: number,
  cycleDay: number,
  phases: DayDefinition['phases'],
  evidence: DayDefinition['evidence'],
): DayDefinition => ({
  day,
  chapter: 1,
  sephira: 'Kether',
  world: 'Atziluth',
  cycle: 'Achaiah',
  cycleIndex: 7,
  cycleDay,
  cycleLength: 5,
  gate: ketherGateForDay(day),
  phases,
  evidence,
});

export const ACHAIAH_DAY_031 = achaiah(31, 1, [
  { id: 'threshold', label: 'Limiar da Entrega', kind: 'threshold' },
  { id: 'analysis', label: 'Condição A · Análise', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'surrender', label: 'Condição B · Entrega', kind: 'comparison' },
  { id: 'comparison', label: 'Comparação', kind: 'review' },
  { id: 'return-gate', label: 'Return Gate', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Achaiah 1/5', kind: 'complete' },
], {
  requiredPresent: ['safety_stop'],
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'analysis_condition_completed',
    'surrender_condition_completed',
    'comparison_logged',
    'responsibility_resumed',
    'safety_clear',
  ],
});

export const ACHAIAH_DAY_032 = achaiah(32, 2, [
  { id: 'threshold', label: 'Limiar da Descida', kind: 'threshold' },
  { id: 'elevator', label: 'Condição A · Elevador', kind: 'practice' },
  { id: 'deep-observation', label: 'Observação no nível 7', kind: 'practice' },
  { id: 'return-up', label: 'Retorno 7 → 1', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control', label: 'Condição B · Contagem', kind: 'comparison' },
  { id: 'comparison', label: 'Comparação', kind: 'review' },
  { id: 'return-gate', label: 'Return Gate', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Achaiah 2/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'elevator_condition_completed',
    'countdown_control_completed',
    'critical_floor_logged',
    'orientation_preserved',
  ],
});

export const ACHAIAH_DAY_033 = achaiah(33, 3, [
  { id: 'threshold', label: 'Limiar da Imobilidade Voluntária', kind: 'threshold' },
  { id: 'active', label: 'Condição A · Esdaile Stillness', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno motor', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control', label: 'Condição B · Quiet Control', kind: 'comparison' },
  { id: 'comparison', label: 'Comparação motora', kind: 'review' },
  { id: 'return-gate', label: 'Return Gate', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Achaiah 3/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'esdaile_condition_completed',
    'quiet_control_completed',
    'motor_impulses_logged',
    'voluntary_movement_return_confirmed',
  ],
});

export const ACHAIAH_DAY_034 = achaiah(34, 4, [
  { id: 'threshold', label: 'Limiar do Signo-Sinal', kind: 'threshold' },
  { id: 'installation', label: 'Instalação · 3 repetições', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno ao estado comum', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control', label: 'Gesto controle', kind: 'comparison' },
  { id: 'anchor-test', label: 'Teste da âncora', kind: 'practice' },
  { id: 'cancel', label: 'Cancelamento explícito', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Achaiah 4/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'control_gesture_completed',
    'anchor_test_completed',
    'cancel_confirmed',
  ],
  minimums: { installation_repetitions: 3 },
});

export const ACHAIAH_DAY_035 = achaiah(35, 5, [
  { id: 'threshold', label: 'Limiar do Limite', kind: 'threshold' },
  { id: 'geometry-review', label: 'Geometria descrita · sem pentagrama inventado', kind: 'instruction' },
  { id: 'active', label: 'Condição A · Ritual completo descrito', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control', label: 'Condição B · Geometria neutra', kind: 'comparison' },
  { id: 'comparison', label: 'Boundary Record', kind: 'review' },
  { id: 'prudence', label: 'Checkpoint de prudência', kind: 'review' },
  { id: 'return-gate', label: 'Return Gate', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo do Fragmento VII', kind: 'seal' },
  { id: 'complete', label: 'Achaiah 5/5 · Coroa 7/7', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'full_ritual_completed',
    'geometric_control_completed',
    'boundary_comparison_logged',
    'prudence_check_completed',
  ],
});

export const KETHER_ACHAIAH_DEFINITIONS = [
  ACHAIAH_DAY_031,
  ACHAIAH_DAY_032,
  ACHAIAH_DAY_033,
  ACHAIAH_DAY_034,
  ACHAIAH_DAY_035,
] as const;

export function getAchaiahDefinition(day: number): DayDefinition | null {
  return KETHER_ACHAIAH_DEFINITIONS.find((definition) => definition.day === day) ?? null;
}
