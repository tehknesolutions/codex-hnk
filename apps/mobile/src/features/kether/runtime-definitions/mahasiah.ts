import { ketherGateForDay, type DayDefinition } from '@hnk/day-runtime';

function mahasiah(
  day: number,
  cycleDay: number,
  phases: DayDefinition['phases'],
  evidence: DayDefinition['evidence'],
): DayDefinition {
  return {
    day,
    chapter: 1,
    sephira: 'Kether',
    world: 'Atziluth',
    cycle: 'Mahasiah',
    cycleIndex: 5,
    cycleDay,
    cycleLength: 5,
    gate: ketherGateForDay(day),
    phases,
    evidence,
  };
}

export const MAHASIAH_DAY_021 = mahasiah(21, 1, [
  { id: 'threshold', label: 'Limiar do Eixo', kind: 'threshold' },
  { id: 'axis-breath', label: 'Eixo Kether–Malkuth', kind: 'practice' },
  { id: 'somatic-map', label: 'Marcadores somáticos', kind: 'reflection' },
  { id: 'interpretation-hold', label: 'Percepção · imagem · interpretação', kind: 'review' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Mahasiah 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'breathing_comfortable', 'axis_visualization_completed'],
  minimums: { presence_rating: 0, somatic_regions_logged: 3 },
});

export const MAHASIAH_DAY_022 = mahasiah(22, 2, [
  { id: 'threshold', label: 'Limiar do Símbolo', kind: 'threshold' },
  { id: 'symbol-study', label: 'Referência canônica Dai Ko Myo', kind: 'instruction' },
  { id: 'memory-trace', label: 'Traçado de memória', kind: 'practice' },
  { id: 'air-trace', label: 'Traçado no ar', kind: 'practice' },
  { id: 'visualization', label: 'Sustentação por três respirações', kind: 'practice' },
  { id: 'grounding', label: 'Três elementos concretos', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Mahasiah 2/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'reference_studied', 'air_trace_completed', 'visualization_hold_completed'],
  minimums: { visual_clarity: 0 },
});

export const MAHASIAH_DAY_023 = mahasiah(23, 3, [
  { id: 'threshold', label: 'Limiar da Coroa', kind: 'threshold' },
  { id: 'active', label: 'Condição A · Ativa', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control', label: 'Condição B · Controle', kind: 'comparison' },
  { id: 'comparison', label: 'Comparação sem vencedor', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Mahasiah 3/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'active_condition_completed', 'control_condition_completed', 'comparison_logged', 'protocol_adjustment_defined'],
});

export const MAHASIAH_DAY_024 = mahasiah(24, 4, [
  { id: 'threshold', label: 'Limiar do Circuito', kind: 'threshold' },
  { id: 'active-circuit', label: 'Circuito ativo superior', kind: 'practice' },
  { id: 'neutral-reset', label: 'Retorno neutro', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'control-circuit', label: 'Circuito controle', kind: 'comparison' },
  { id: 'regional-map', label: 'Mapa regional comparativo', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Mahasiah 4/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'active_circuit_completed', 'control_circuit_completed', 'regional_comparison_completed'],
  minimums: { regions_logged: 5 },
});

export const MAHASIAH_DAY_025 = mahasiah(25, 5, [
  { id: 'threshold', label: 'Limiar do Espaço', kind: 'threshold' },
  { id: 'environment-baseline', label: 'Baseline ambiental', kind: 'review' },
  { id: 'ar-anchor', label: 'Âncora AR Dai Ko Myo', kind: 'practice' },
  { id: 'active-map', label: 'Percurso A · Ativo', kind: 'practice' },
  { id: 'control-map', label: 'Percurso B · Controle', kind: 'comparison' },
  { id: 'comparison', label: 'Comparação ambiental', kind: 'review' },
  { id: 'grounding', label: 'Orientação ao espaço real', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo do Fragmento V', kind: 'seal' },
  { id: 'complete', label: 'Mahasiah 5/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed', 'return_confirmed', 'ar_anchor_created', 'active_map_completed', 'control_map_completed', 'comparison_logged'],
  minimums: { environment_points_logged: 4 },
});

export const KETHER_MAHASIAH_DEFINITIONS = [
  MAHASIAH_DAY_021,
  MAHASIAH_DAY_022,
  MAHASIAH_DAY_023,
  MAHASIAH_DAY_024,
  MAHASIAH_DAY_025,
] as const;

export function getMahasiahDefinition(day: number): DayDefinition | null {
  return KETHER_MAHASIAH_DEFINITIONS.find((definition) => definition.day === day) ?? null;
}
