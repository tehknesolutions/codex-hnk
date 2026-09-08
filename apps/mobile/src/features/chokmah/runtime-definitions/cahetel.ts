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

export const CAHETEL_CANON_RUNTIME = [CAHETEL_DAY_037, CAHETEL_DAY_038, CAHETEL_DAY_039] as const;
