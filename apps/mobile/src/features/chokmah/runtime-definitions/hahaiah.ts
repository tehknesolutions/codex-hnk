import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;

function hahaiah(day: number, cycleDay: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']): DayDefinition {
  return { day, chapter: 2, sephira: 'Chokmah', world: 'Atziluth', cycle: 'Hahaiah', cycleIndex: 5, cycleDay, cycleLength: 5, gate: sequential, phases, evidence };
}

export const HAHAIAH_DAY_057 = hahaiah(57, 1, [
  { id: 'threshold', label: 'Limiar do Teste Relacional', kind: 'threshold' },
  { id: 'setup', label: 'Consentimento + conjunto fechado', kind: 'practice' },
  { id: 'target-seal', label: 'Alvo pré-registrado', kind: 'review' },
  { id: 'receiver-seal', label: 'Resposta pré-feedback', kind: 'review' },
  { id: 'reveal', label: 'Feedback e correspondência', kind: 'comparison' },
  { id: 'control', label: 'Rodada controle sem ritual', kind: 'comparison' },
  { id: 'compare', label: 'Acertos · erros · pistas', kind: 'review' },
  { id: 'grounding', label: 'Encerrar expectativa relacional', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hahaiah 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','partner_consent','closed_set_defined','target_preregistered','receiver_response_preregistered','feedback_after_response','control_completed','errors_included','possible_cues_logged','telepathy_not_claimed','high_impact_not_used','vault_saved','safety_clear'],
  requiredPresent: ['active_match','control_match'],
  minimums: { target_set_size: 2 },
});

export const HAHAIAH_DAY_058 = hahaiah(58, 2, [
  { id: 'threshold', label: 'Limiar da Linguagem com Escolha', kind: 'threshold' },
  { id: 'scripts', label: 'Três roteiros autoaplicados', kind: 'practice' },
  { id: 'direct', label: 'Formulação direta equivalente', kind: 'comparison' },
  { id: 'compare', label: 'Pressão · clareza · autonomia', kind: 'review' },
  { id: 'grounding', label: 'Retorno e liberdade de recusa', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault dos roteiros', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hahaiah 2/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','self_use_only','three_scripts_completed','real_refusal_option_present','direct_comparison_completed','comparison_completed','autonomy_preserved','no_clinical_promise','no_covert_command','no_high_impact_use','vault_saved','safety_clear'],
  minimums: { scripts_logged: 3 },
});

export const HAHAIAH_DAY_059 = hahaiah(59, 3, [
  { id: 'threshold', label: 'Limiar da Pérola Azul', kind: 'threshold' },
  { id: 'blue', label: 'Pérola Azul · até 15 min', kind: 'practice' },
  { id: 'gray', label: 'Ponto cinza · controle', kind: 'comparison' },
  { id: 'compare', label: 'Retornos · nitidez · esforço', kind: 'review' },
  { id: 'grounding', label: 'Três objetos e orientação', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hahaiah 3/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','blue_completed','gray_completed','comparison_completed','interpretation_separated','clarivoyance_not_claimed','reason_preserved','safety_clear'],
  requiredPresent: ['blue_image_present','gray_image_present'],
  minimums: { blue_seconds: 1, gray_seconds: 1 },
});

export const HAHAIAH_DAY_060 = hahaiah(60, 4, [
  { id: 'threshold', label: 'Limiar da Descrição Social', kind: 'threshold' },
  { id: 'public', label: 'Cinco observações não identificáveis', kind: 'practice' },
  { id: 'partner', label: 'Comparação com parceiro consentido', kind: 'comparison' },
  { id: 'compare', label: 'Visto · inferido · desconhecido', kind: 'review' },
  { id: 'grounding', label: 'Encerrar monitoramento', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault de interpretações', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hahaiah 4/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','five_public_observations_completed','camera_not_used','identity_not_stored','partner_consent','partner_comparison_completed','diagnosis_not_claimed','mind_reading_not_claimed','vulnerable_people_not_targeted','vault_saved','safety_clear'],
  minimums: { public_observations_count: 5 },
});

export const HAHAIAH_DAY_061 = hahaiah(61, 5, [
  { id: 'threshold', label: 'Limiar da Governança Digital', kind: 'threshold' },
  { id: 'baseline', label: 'Inventário e janela habitual', kind: 'practice' },
  { id: 'reorganize', label: 'Reorganização manual', kind: 'practice' },
  { id: 'after', label: 'Janela comparativa pós-mudança', kind: 'comparison' },
  { id: 'compare', label: 'Interrupções · urgência · retorno', kind: 'review' },
  { id: 'grounding', label: 'Configuração sustentável', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Hahaiah 5/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','baseline_completed','manual_reorganization_completed','after_window_completed','comparison_completed','critical_alerts_preserved','security_auth_preserved','family_emergency_preserved','no_automatic_critical_change','sustainable_configuration_selected','review_time_selected','safety_clear'],
  requiredPresent: ['interruptions_before','interruptions_after','unlocks_before','unlocks_after'],
});

export const HAHAIAH_CANON_RUNTIME = [HAHAIAH_DAY_057,HAHAIAH_DAY_058,HAHAIAH_DAY_059,HAHAIAH_DAY_060,HAHAIAH_DAY_061] as const;
