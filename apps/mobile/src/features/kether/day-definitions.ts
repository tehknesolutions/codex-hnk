import { ketherGateForDay, type DayDefinition } from '@hnk/day-runtime';

function cycleDay(
  cycle: string,
  cycleIndex: number,
  day: number,
  cycleDayNumber: number,
  phases: DayDefinition['phases'],
  evidence: DayDefinition['evidence'],
): DayDefinition {
  return {
    day,
    chapter: 1,
    sephira: 'Kether',
    world: 'Atziluth',
    cycle,
    cycleIndex,
    cycleDay: cycleDayNumber,
    cycleLength: 5,
    gate: ketherGateForDay(day),
    phases,
    evidence,
  };
}

const jeliel = (day: number, cycleDayNumber: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']) =>
  cycleDay('Jeliel', 2, day, cycleDayNumber, phases, evidence);

const sitael = (day: number, cycleDayNumber: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']) =>
  cycleDay('Sitael', 3, day, cycleDayNumber, phases, evidence);

export const JELIEL_DAY_006 = jeliel(6, 1, [
  { id: 'threshold', label: 'Limiar do Silêncio', kind: 'threshold' },
  { id: 'listening', label: 'Escuta sem rótulo', kind: 'practice' },
  { id: 'silence', label: 'Silêncio verbal', kind: 'practice' },
  { id: 'vocalization', label: 'IOD-LAMED-IOD', kind: 'practice' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Evidência e selo', kind: 'seal' },
  { id: 'complete', label: 'Jeliel 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'jeliel_vocalization_completed'],
  minimums: { listening_minutes: 3, silence_practice_minutes: 10, internal_chatter_returns: 0 },
});

export const JELIEL_DAY_007 = jeliel(7, 2, [
  { id: 'threshold', label: 'Limiar da Entrega', kind: 'threshold' },
  { id: 'relaxation', label: 'Relaxamento das pálpebras', kind: 'practice' },
  { id: 'test', label: 'Teste voluntário', kind: 'practice' },
  { id: 'release', label: 'Liberação explícita', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'evidence', label: 'Registro de esforço e sensação', kind: 'reflection' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Jeliel 2/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'release_completed'],
  minimums: { relaxation_rating: 0, effort_rating: 0, attempts: 1 },
});

export const JELIEL_DAY_008 = jeliel(8, 3, [
  { id: 'threshold', label: 'Limiar da Descida', kind: 'threshold' },
  { id: 'body-descent', label: 'Relaxamento corporal', kind: 'practice' },
  { id: 'countdown', label: 'Contagem regressiva', kind: 'practice' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'evidence', label: 'Registro de atenção', kind: 'reflection' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Jeliel 3/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed'],
  minimums: { countdown_start: 100, last_number_recalled: 0, relaxation_rating: 0, distractions: 0 },
});

export const JELIEL_DAY_009 = jeliel(9, 4, [
  { id: 'threshold', label: 'Limiar do Sonho', kind: 'threshold' },
  { id: 'intention', label: 'Intenção antes de dormir', kind: 'instruction' },
  { id: 'morning-capture', label: 'Captura ao despertar', kind: 'reflection' },
  { id: 'layers', label: 'Sonho · Emoção · Hipótese', kind: 'review' },
  { id: 'grounding', label: 'Orientação ao dia', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Jeliel 4/5', kind: 'complete' },
], {
  requiredPresent: ['dream_recalled'],
  requiredTrue: ['protocol_completed', 'return_confirmed', 'capture_completed'],
  minimums: { sleep_quality: 0 },
});

export const JELIEL_DAY_010 = jeliel(10, 5, [
  { id: 'threshold', label: 'Limiar da Âncora', kind: 'threshold' },
  { id: 'baseline', label: 'Baseline', kind: 'review' },
  { id: 'pairing', label: 'Pareamento da âncora', kind: 'practice' },
  { id: 'neutral-return', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'test', label: 'Teste da âncora', kind: 'comparison' },
  { id: 'seal', label: 'Selo do Fragmento II', kind: 'seal' },
  { id: 'complete', label: 'Jeliel 5/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'neutral_test_completed'],
  minimums: { pairing_seconds: 10, calm_before: 0, calm_after: 0 },
  categories: { response: ['none', 'weak', 'moderate', 'strong'] },
});

export const SITAEL_DAY_011 = sitael(11, 1, [
  { id: 'threshold', label: 'Limiar do Observador', kind: 'threshold' },
  { id: 'mirror', label: 'Espelho do Observador', kind: 'practice' },
  { id: 'split', label: 'Observação vs interpretação', kind: 'reflection' },
  { id: 'grounding', label: 'Grounding visual', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Sitael 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed'],
  minimums: {
    practice_seconds: 300,
    observations_logged_count: 3,
    judgments_noticed: 0,
    attention_stability: 0,
  },
});

export const SITAEL_DAY_012 = sitael(12, 2, [
  { id: 'threshold', label: 'Limiar da Chama', kind: 'threshold' },
  { id: 'safety', label: 'Fire Safety Gate', kind: 'instruction' },
  { id: 'trataka', label: 'Trataka', kind: 'practice' },
  { id: 'grounding', label: 'Saída ocular', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Sitael 2/5', kind: 'complete' },
], {
  requiredPresent: ['practice_seconds', 'distractions', 'attention_stability'],
  requiredTrue: ['protocol_completed', 'return_confirmed', 'safety_check_completed'],
});

export const SITAEL_DAY_013 = sitael(13, 3, [
  { id: 'threshold', label: 'Limiar do Triturador', kind: 'threshold' },
  { id: 'crusher', label: '1000 menos 7', kind: 'practice' },
  { id: 'recovery', label: 'Erro e retorno', kind: 'review' },
  { id: 'grounding', label: 'Encerrar carga', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Sitael 3/5', kind: 'complete' },
], {
  requiredPresent: ['last_correct_number', 'errors', 'distractions', 'attention_stability'],
  requiredTrue: ['protocol_completed', 'return_confirmed'],
  minimums: { start_number: 1000, errors: 0, distractions: 0, attention_stability: 0 },
});

export const SITAEL_DAY_014 = sitael(14, 4, [
  { id: 'threshold', label: 'Limiar do Círculo Azul', kind: 'threshold' },
  { id: 'reference', label: 'Referência breve', kind: 'instruction' },
  { id: 'internal-focus', label: 'Concentração interna', kind: 'practice' },
  { id: 'reconstruction', label: 'Reconstrução', kind: 'review' },
  { id: 'grounding', label: 'Retorno aos objetos reais', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Sitael 4/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed'],
  minimums: { practice_seconds: 300, returns: 0, reconstructions: 0, attention_stability: 0 },
});

export const SITAEL_DAY_015 = sitael(15, 5, [
  { id: 'threshold', label: 'Limiar do Retorno', kind: 'threshold' },
  { id: 'externalize', label: 'Externalizar padrões', kind: 'reflection' },
  { id: 'method', label: 'Escolher encerramento', kind: 'instruction' },
  { id: 'closure', label: 'Encerramento material', kind: 'practice' },
  { id: 'commitment', label: 'Disciplina de amanhã', kind: 'review' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo do Fragmento III', kind: 'seal' },
  { id: 'complete', label: 'Sitael 5/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'action_commitment_created'],
  minimums: { patterns_externalized_count: 3, discipline_rating: 0 },
  categories: { destruction_method: ['fire', 'tear'] },
});

export const KETHER_JELIEL_DEFINITIONS = [JELIEL_DAY_006, JELIEL_DAY_007, JELIEL_DAY_008, JELIEL_DAY_009, JELIEL_DAY_010] as const;
export const KETHER_SITAEL_DEFINITIONS = [SITAEL_DAY_011, SITAEL_DAY_012, SITAEL_DAY_013, SITAEL_DAY_014, SITAEL_DAY_015] as const;

export const KETHER_RUNTIME_DEFINITIONS = [
  ...KETHER_JELIEL_DEFINITIONS,
  ...KETHER_SITAEL_DEFINITIONS,
] as const;

export function getKetherDayDefinition(day: number): DayDefinition | null {
  return KETHER_RUNTIME_DEFINITIONS.find((definition) => definition.day === day) ?? null;
}
