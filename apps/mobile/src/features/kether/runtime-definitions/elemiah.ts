import { ketherGateForDay, type DayDefinition } from '@hnk/day-runtime';

const elemiah = (day: number, cycleDay: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']): DayDefinition => ({
  day,
  chapter: 1,
  sephira: 'Kether',
  world: 'Atziluth',
  cycle: 'Elemiah',
  cycleIndex: 4,
  cycleDay,
  cycleLength: 5,
  gate: ketherGateForDay(day),
  phases,
  evidence,
});

export const ELEMIAH_DAY_016 = elemiah(16, 1, [
  { id: 'threshold', label: 'Limiar da Palavra', kind: 'threshold' },
  { id: 'preverbal', label: 'Observação pré-verbal', kind: 'practice' },
  { id: 'layers', label: 'Percepção · interpretação · crença', kind: 'review' },
  { id: 'word-silence', label: 'Silêncio · palavra · silêncio', kind: 'practice' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Elemiah 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'layers_separated', 'prayer_completed'],
  minimums: { preverbal_observation_seconds: 300 },
});

export const ELEMIAH_DAY_017 = elemiah(17, 2, [
  { id: 'threshold', label: 'Limiar Vocal', kind: 'threshold' },
  { id: 'safety', label: 'Voice Safety Check', kind: 'instruction' },
  { id: 'flow', label: 'Fluxo não semântico', kind: 'practice' },
  { id: 'silence', label: 'Silêncio gradual', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'evidence', label: 'Conforto e agência', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Elemiah 2/5', kind: 'complete' },
], {
  requiredPresent: ['duration_seconds', 'vocal_comfort', 'spontaneity_rating'],
  requiredTrue: ['protocol_completed', 'return_confirmed', 'vocalization_completed', 'agency_preserved'],
});

export const ELEMIAH_DAY_018 = elemiah(18, 3, [
  { id: 'threshold', label: 'Limiar da Ressonância', kind: 'threshold' },
  { id: 'zones', label: 'Três zonas', kind: 'practice' },
  { id: 'variation', label: 'Variação controlada', kind: 'comparison' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Elemiah 3/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'no_forced_sensation'],
  minimums: { zones_checked: 3, vocal_comfort: 0 },
});

export const ELEMIAH_DAY_019 = elemiah(19, 4, [
  { id: 'threshold', label: 'Limiar do Laboratório', kind: 'threshold' },
  { id: 'acoustic-lab', label: 'Acoustic Lab real', kind: 'practice' },
  { id: 'analysis', label: 'Análise de sinal', kind: 'review' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Elemiah 4/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'recording_created', 'analysis_viewed', 'interpretation_held_open'],
  minimums: { observations_logged_count: 2 },
});

export const ELEMIAH_DAY_020 = elemiah(20, 5, [
  { id: 'threshold', label: 'Limiar do Silêncio Pós-Vocal', kind: 'threshold' },
  { id: 'quiet', label: 'Repouso pós-vocal', kind: 'practice' },
  { id: 'record', label: 'Contraste e presença', kind: 'review' },
  { id: 'grounding', label: 'Retorno orientado', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo do Fragmento IV', kind: 'seal' },
  { id: 'complete', label: 'Elemiah 5/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed'],
  minimums: { quiet_seconds: 300, presence_rating: 0 },
  categories: { comparison_condition: ['post_vocal'] },
});

export const KETHER_ELEMIAH_DEFINITIONS = [ELEMIAH_DAY_016, ELEMIAH_DAY_017, ELEMIAH_DAY_018, ELEMIAH_DAY_019, ELEMIAH_DAY_020] as const;
