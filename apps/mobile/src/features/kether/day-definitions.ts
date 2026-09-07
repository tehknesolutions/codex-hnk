import { ketherGateForDay, type DayDefinition } from '@hnk/day-runtime';

const base = (day: number, cycleDay: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']): DayDefinition => ({
  day,
  chapter: 1,
  sephira: 'Kether',
  world: 'Atziluth',
  cycle: 'Jeliel',
  cycleIndex: 2,
  cycleDay,
  cycleLength: 5,
  gate: ketherGateForDay(day),
  phases,
  evidence,
});

export const JELIEL_DAY_006 = base(
  6,
  1,
  [
    { id: 'threshold', label: 'Limiar do Silêncio', kind: 'threshold' },
    { id: 'listening', label: 'Escuta sem rótulo', kind: 'practice' },
    { id: 'silence', label: 'Silêncio verbal', kind: 'practice' },
    { id: 'vocalization', label: 'IOD-LAMED-IOD', kind: 'practice' },
    { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'seal', label: 'Evidência e selo', kind: 'seal' },
    { id: 'complete', label: 'Jeliel 1/5', kind: 'complete' },
  ],
  {
    requiredTrue: ['protocol_completed', 'return_confirmed', 'jeliel_vocalization_completed'],
    minimums: {
      listening_minutes: 3,
      silence_practice_minutes: 10,
      internal_chatter_returns: 0,
    },
  },
);

export const JELIEL_DAY_007 = base(
  7,
  2,
  [
    { id: 'threshold', label: 'Limiar da Entrega', kind: 'threshold' },
    { id: 'relaxation', label: 'Relaxamento das pálpebras', kind: 'practice' },
    { id: 'test', label: 'Teste voluntário', kind: 'practice' },
    { id: 'release', label: 'Liberação explícita', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'evidence', label: 'Registro de esforço e sensação', kind: 'reflection' },
    { id: 'seal', label: 'Selo', kind: 'seal' },
    { id: 'complete', label: 'Jeliel 2/5', kind: 'complete' },
  ],
  {
    requiredTrue: ['protocol_completed', 'return_confirmed', 'release_completed'],
    minimums: {
      relaxation_rating: 0,
      effort_rating: 0,
      attempts: 1,
    },
  },
);

export const JELIEL_DAY_008 = base(
  8,
  3,
  [
    { id: 'threshold', label: 'Limiar da Descida', kind: 'threshold' },
    { id: 'body-descent', label: 'Relaxamento corporal', kind: 'practice' },
    { id: 'countdown', label: 'Contagem regressiva', kind: 'practice' },
    { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'evidence', label: 'Registro de atenção', kind: 'reflection' },
    { id: 'seal', label: 'Selo', kind: 'seal' },
    { id: 'complete', label: 'Jeliel 3/5', kind: 'complete' },
  ],
  {
    requiredTrue: ['protocol_completed', 'return_confirmed'],
    minimums: {
      countdown_start: 100,
      last_number_recalled: 0,
      relaxation_rating: 0,
      distractions: 0,
    },
  },
);

export const JELIEL_DAY_009 = base(
  9,
  4,
  [
    { id: 'threshold', label: 'Limiar do Sonho', kind: 'threshold' },
    { id: 'intention', label: 'Intenção antes de dormir', kind: 'instruction' },
    { id: 'morning-capture', label: 'Captura ao despertar', kind: 'reflection' },
    { id: 'layers', label: 'Sonho · Emoção · Hipótese', kind: 'review' },
    { id: 'grounding', label: 'Orientação ao dia', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'seal', label: 'Selo', kind: 'seal' },
    { id: 'complete', label: 'Jeliel 4/5', kind: 'complete' },
  ],
  {
    requiredPresent: ['dream_recalled'],
    requiredTrue: ['protocol_completed', 'return_confirmed', 'capture_completed'],
    minimums: {
      sleep_quality: 0,
    },
  },
);

export const JELIEL_DAY_010 = base(
  10,
  5,
  [
    { id: 'threshold', label: 'Limiar da Âncora', kind: 'threshold' },
    { id: 'baseline', label: 'Baseline', kind: 'review' },
    { id: 'pairing', label: 'Pareamento da âncora', kind: 'practice' },
    { id: 'neutral-return', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'test', label: 'Teste da âncora', kind: 'comparison' },
    { id: 'seal', label: 'Selo do Fragmento II', kind: 'seal' },
    { id: 'complete', label: 'Jeliel 5/5', kind: 'complete' },
  ],
  {
    requiredTrue: ['protocol_completed', 'return_confirmed', 'neutral_test_completed'],
    minimums: {
      pairing_seconds: 10,
      calm_before: 0,
      calm_after: 0,
    },
    categories: {
      response: ['none', 'weak', 'moderate', 'strong'],
    },
  },
);

export const KETHER_JELIEL_DEFINITIONS = [
  JELIEL_DAY_006,
  JELIEL_DAY_007,
  JELIEL_DAY_008,
  JELIEL_DAY_009,
  JELIEL_DAY_010,
] as const;

export function getKetherDayDefinition(day: number): DayDefinition | null {
  return KETHER_JELIEL_DEFINITIONS.find((definition) => definition.day === day) ?? null;
}
