import { ketherGateForDay, type DayDefinition } from '@hnk/day-runtime';

const lelahel = (
  day: number,
  cycleDay: number,
  phases: DayDefinition['phases'],
  evidence: DayDefinition['evidence'],
): DayDefinition => ({
  day,
  chapter: 1,
  sephira: 'Kether',
  world: 'Atziluth',
  cycle: 'Lelahel',
  cycleIndex: 6,
  cycleDay,
  cycleLength: 5,
  gate: ketherGateForDay(day),
  phases,
  evidence,
});

export const LELAHEL_DAY_026 = lelahel(26, 1, [
  { id: 'threshold', label: 'Limiar do Ponto Frontal', kind: 'threshold' },
  { id: 'active', label: 'Condição A · Foco frontal', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control', label: 'Condição B · Ponto neutro', kind: 'comparison' },
  { id: 'comparison', label: 'Comparação sem diagnóstico', kind: 'review' },
  { id: 'grounding', label: 'Saída orientada', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lelahel 1/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'active_condition_completed',
    'control_condition_completed',
    'comparison_logged',
    'dispersions_logged',
  ],
});

export const LELAHEL_DAY_027 = lelahel(27, 2, [
  { id: 'threshold', label: 'Limiar da Pérola Azul', kind: 'threshold' },
  { id: 'reference', label: 'Referência azul', kind: 'instruction' },
  { id: 'active', label: 'Condição A · Pérola Azul', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control', label: 'Condição B · Ponto cinza', kind: 'comparison' },
  { id: 'comparison', label: 'Estabilidade visual comparada', kind: 'review' },
  { id: 'grounding', label: 'Grounding visual', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lelahel 2/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'blue_condition_completed',
    'grey_control_completed',
    'visual_comparison_logged',
    'grounding_completed',
  ],
});

export const LELAHEL_DAY_028 = lelahel(28, 3, [
  { id: 'threshold', label: 'Limiar do Cockpit', kind: 'threshold' },
  { id: 'reference-pending', label: 'Referência canônica pendente', kind: 'instruction' },
  { id: 'complete', label: 'Bloqueado editorialmente', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'active_architecture_completed',
    'control_architecture_completed',
    'navigation_comparison_logged',
  ],
  minimums: { eight_circuits_logged: 8 },
});

export const LELAHEL_DAY_029 = lelahel(29, 4, [
  { id: 'threshold', label: 'Limiar da Separação', kind: 'threshold' },
  { id: 'patterns', label: 'Três padrões + respostas', kind: 'reflection' },
  { id: 'control-read', label: 'Condição de leitura', kind: 'comparison' },
  { id: 'closure', label: 'Encerramento representacional', kind: 'practice' },
  { id: 'first-action', label: 'Primeira resposta substituta', kind: 'review' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lelahel 4/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'control_read_completed',
    'closure_completed',
    'first_action_defined',
  ],
  minimums: {
    patterns_defined: 3,
    replacement_behaviors_defined: 3,
  },
});

export const LELAHEL_DAY_030 = lelahel(30, 5, [
  { id: 'threshold', label: 'Limiar Acústico', kind: 'threshold' },
  { id: 'audio-pending', label: 'Par de áudio aprovado pendente', kind: 'instruction' },
  { id: 'complete', label: 'Bloqueado por asset', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed',
    'return_confirmed',
    'active_audio_completed',
    'control_audio_completed',
    'comparison_logged',
    'exit_clarity_logged',
    'grounding_completed',
  ],
});

export const KETHER_LELAHEL_DEFINITIONS = [
  LELAHEL_DAY_026,
  LELAHEL_DAY_027,
  LELAHEL_DAY_028,
  LELAHEL_DAY_029,
  LELAHEL_DAY_030,
] as const;

export function getLelahelDefinition(day: number): DayDefinition | null {
  return KETHER_LELAHEL_DEFINITIONS.find((definition) => definition.day === day) ?? null;
}
