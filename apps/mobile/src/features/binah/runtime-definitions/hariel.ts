import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;
function hariel(day: number, cycleDay: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']): DayDefinition {
  return { day, chapter: 3, sephira: 'Binah', world: 'Atziluth', cycle: 'Hariel', cycleIndex: 1, cycleDay, cycleLength: 5, gate: sequential, phases, evidence };
}

export const HARIEL_DAY_074 = hariel(74, 1, [
  { id: 'threshold', label: 'Limiar da Precisão', kind: 'threshold' },
  { id: 'vault', label: 'Três auto-acusações · Vault', kind: 'practice' },
  { id: 'review', label: 'Fonte · certeza · evidência · reformulação', kind: 'review' },
  { id: 'grounding', label: 'Responsabilidade sem condenação', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hariel 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','three_accusations_recorded','three_reformulations_recorded','fact_inference_separated','uncertainty_preserved','false_memory_not_claimed','diagnosis_not_claimed','responsibility_preserved','vault_saved','safety_clear'],
  minimums: { accusations_count: 3, reformulations_count: 3 },
});

export const HARIEL_DAY_075 = hariel(75, 2, [
  { id: 'threshold', label: 'Limiar dos Verbos Vagos', kind: 'threshold' },
  { id: 'vault', label: 'Cinco verbos · definições · critérios', kind: 'practice' },
  { id: 'review', label: 'Critério · contexto · ação proporcional', kind: 'review' },
  { id: 'grounding', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hariel 2/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','five_verbs_recorded','five_operational_definitions_recorded','five_criteria_recorded','unknowns_allowed','next_action_defined','productivity_compulsion_avoided','personal_value_not_scored','vault_saved','safety_clear'],
  minimums: { verbs_count: 5, operational_definitions_count: 5, criteria_count: 5 },
});

export const HARIEL_DAY_076 = hariel(76, 3, [
  { id: 'threshold', label: 'Limiar da Comparação Oculta', kind: 'threshold' },
  { id: 'vault', label: 'Cinco comparações · referências · critérios', kind: 'practice' },
  { id: 'review', label: 'Manter · revisar · abandonar', kind: 'review' },
  { id: 'grounding', label: 'Valor sem ranking', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hariel 3/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','five_comparisons_recorded','references_identified','criteria_identified','useful_comparison_defined','one_comparison_abandoned','third_party_inner_state_not_inferred','no_spiritual_ranking','third_party_identity_not_sent','vault_saved','safety_clear'],
  minimums: { comparisons_count: 5, references_count: 5, criteria_count: 5 },
});

export const HARIEL_DAY_077 = hariel(77, 4, [
  { id: 'threshold', label: 'Limiar da Comunicação Externa', kind: 'threshold' },
  { id: 'monitor', label: 'Janela contínua de 3 horas', kind: 'practice' },
  { id: 'review', label: 'Precisão + silêncio legítimo', kind: 'review' },
  { id: 'vault', label: 'Regra ética · Vault', kind: 'review' },
  { id: 'grounding', label: 'Encerrar monitoramento', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hariel 4/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','three_hour_window_completed','own_language_only','no_recording_of_third_parties','privacy_preserved','interrogation_avoided','legitimate_silence_identified','ethical_rule_defined','vault_saved','monitoring_ended','safety_clear'],
  minimums: { monitoring_seconds: 10800, reformulations_count: 0 },
});

export const HARIEL_DAY_078 = hariel(78, 5, [
  { id: 'threshold', label: 'Limiar do Véu Silencioso', kind: 'threshold' },
  { id: 'silence', label: 'Silêncio com retorno atencional', kind: 'practice' },
  { id: 'review', label: 'Pensamento não é falha', kind: 'review' },
  { id: 'grounding', label: 'Abrir os olhos · mãos · pés · ambiente', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault opcional de conteúdo importante', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hariel 5/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','silence_practice_completed','thought_suppression_not_required','zero_thought_goal_rejected','natural_breath_preserved','important_content_not_ignored','anti_compulsion_rule_confirmed','orientation_restored','safety_clear'],
  minimums: { practice_seconds: 1, attention_returns: 0 },
});

export const HARIEL_CANON_RUNTIME = [HARIEL_DAY_074,HARIEL_DAY_075,HARIEL_DAY_076,HARIEL_DAY_077,HARIEL_DAY_078] as const;
