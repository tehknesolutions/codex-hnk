import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;

function lauviah(
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
    cycle: 'Lauviah',
    cycleIndex: 4,
    cycleDay,
    cycleLength: 5,
    gate: sequential,
    phases,
    evidence,
  };
}

export const LAUVIAH_DAY_052 = lauviah(52, 1, [
  { id: 'threshold', label: 'Limiar da Expansão Imaginativa', kind: 'threshold' },
  { id: 'expansion', label: 'Atenção ampliada à sala', kind: 'practice' },
  { id: 'control', label: 'Pontos de contato e respiração', kind: 'comparison' },
  { id: 'compare', label: 'Amplitude · contato · interpretação', kind: 'review' },
  { id: 'grounding', label: 'Orientação ambiental', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lauviah 1/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','expansion_completed','control_completed','comparison_completed',
    'interpretation_separated','outside_brain_claim_not_made','orientation_preserved','null_results_preserved','safety_clear',
  ],
  requiredPresent: ['expansion_effect_present','control_effect_present'],
  minimums: { expansion_seconds: 600, control_seconds: 600 },
});

export const LAUVIAH_DAY_053 = lauviah(53, 2, [
  { id: 'threshold', label: 'Limiar do Protocolo Cego', kind: 'threshold' },
  { id: 'preregister', label: 'ID lacrado · pré-registro', kind: 'practice' },
  { id: 'seal-preregister', label: 'Selar antes do feedback', kind: 'review' },
  { id: 'reveal', label: 'Revelação do alvo', kind: 'comparison' },
  { id: 'control', label: 'ID sem alvo ou envelopes embaralhados', kind: 'comparison' },
  { id: 'compare', label: 'Acertos · erros · coincidências', kind: 'review' },
  { id: 'grounding', label: 'Retorno e descompressão', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault cifrado', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lauviah 2/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','six_digit_id_used','preregistered_before_feedback','preregister_sealed',
    'feedback_after_preregister','control_completed','errors_included','coincidences_included','risk_decision_not_used',
    'paranormal_not_claimed','vault_saved','safety_clear',
  ],
  requiredPresent: ['target_identifier','control_identifier','target_effect_present','control_effect_present'],
});

export const LAUVIAH_DAY_054 = lauviah(54, 3, [
  { id: 'threshold', label: 'Limiar da Marcação Analógica', kind: 'threshold' },
  { id: 'script', label: 'Script curto e palavras-alvo', kind: 'practice' },
  { id: 'active-record', label: 'Gravação com marcação tonal', kind: 'practice' },
  { id: 'control-record', label: 'Prosódia neutra', kind: 'comparison' },
  { id: 'compare', label: 'Métricas acústicas locais', kind: 'review' },
  { id: 'grounding', label: 'Retorno vocal e corporal', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lauviah 3/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','script_prepared','targets_predeclared','active_recording_completed',
    'control_recording_completed','local_analysis_completed','raw_audio_not_uploaded','comparison_completed',
    'interpretation_separated','consent_only','subconscious_access_not_claimed','safety_clear',
  ],
  minimums: { target_words_marked: 1 },
});

export const LAUVIAH_DAY_055 = lauviah(55, 4, [
  { id: 'threshold', label: 'Limiar VAKOG', kind: 'threshold' },
  { id: 'preregister', label: 'Descrição VAKOG pré-feedback', kind: 'practice' },
  { id: 'seal-preregister', label: 'Selar descrição', kind: 'review' },
  { id: 'verify', label: 'Referências fixas do monumento', kind: 'comparison' },
  { id: 'control', label: 'Alvo aleatório ou fotografia lacrada', kind: 'comparison' },
  { id: 'compare', label: 'Correspondências · divergências · memória', kind: 'review' },
  { id: 'grounding', label: 'Retorno ambiental', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault cifrado', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lauviah 4/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','target_selected_before_practice','vakog_preregistered','preregister_sealed',
    'verification_after_preregister','control_completed','memory_prior_recognized','coincidence_kept_open',
    'nonlocal_perception_not_claimed','risk_decision_not_used','vault_saved','safety_clear',
  ],
  requiredPresent: ['primary_correspondence_present','control_correspondence_present'],
  minimums: { primary_seconds: 600 },
});

export const LAUVIAH_DAY_056 = lauviah(56, 5, [
  { id: 'threshold', label: 'Limiar do Encerramento Simbólico', kind: 'threshold' },
  { id: 'active', label: 'Expiração + gargalhada breve', kind: 'practice' },
  { id: 'control', label: 'Expiração confortável sem gargalhada', kind: 'comparison' },
  { id: 'compare', label: 'Humor · tensão · encerramento', kind: 'review' },
  { id: 'grounding', label: 'Respiração natural e retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Lauviah 5/5', kind: 'complete' },
], {
  requiredTrue: [
    'protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed',
    'interpretation_separated','no_hyperventilation','no_prolonged_retention','clinical_substitute_not_claimed',
    'entity_contamination_not_reinforced','null_results_preserved','safety_clear',
  ],
  requiredPresent: ['active_effect_present','control_effect_present'],
});

export const LAUVIAH_CANON_RUNTIME = [
  LAUVIAH_DAY_052,
  LAUVIAH_DAY_053,
  LAUVIAH_DAY_054,
  LAUVIAH_DAY_055,
  LAUVIAH_DAY_056,
] as const;
