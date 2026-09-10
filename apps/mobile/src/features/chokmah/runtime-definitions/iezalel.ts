import type { DayDefinition } from '@hnk/day-runtime';

const sequential = { requiresPrevious: true } as const;

function iezalel(day: number, cycleDay: number, phases: DayDefinition['phases'], evidence: DayDefinition['evidence']): DayDefinition {
  return { day, chapter: 2, sephira: 'Chokmah', world: 'Atziluth', cycle: 'Iezalel', cycleIndex: 6, cycleDay, cycleLength: 5, gate: sequential, phases, evidence };
}

export const IEZALEL_DAY_062 = iezalel(62, 1, [
  { id: 'threshold', label: 'Limiar da Escuta Interior', kind: 'threshold' },
  { id: 'active', label: 'Escuta com redução acústica opcional', kind: 'practice' },
  { id: 'control', label: 'Escuta sem tampões', kind: 'comparison' },
  { id: 'compare', label: 'Som · pensamento · interpretação', kind: 'review' },
  { id: 'grounding', label: 'Três sons externos', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Iezalel 1/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','interpretation_separated','external_message_not_claimed','ear_safety_respected','risk_context_avoided','persistent_voice_not_reinforced','safety_clear'],
  requiredPresent: ['earplugs_used','active_sound_present','control_sound_present'],
  minimums: { active_seconds: 1, control_seconds: 1 },
});

export const IEZALEL_DAY_063 = iezalel(63, 2, [
  { id: 'threshold', label: 'Limiar da Crítica Interna', kind: 'threshold' },
  { id: 'preregister', label: 'Crítica e intensidade', kind: 'practice' },
  { id: 'caricature', label: 'Submodalidades auditivas', kind: 'practice' },
  { id: 'neutral', label: 'Fato · julgamento · ação', kind: 'comparison' },
  { id: 'compare', label: 'Intensidade · clareza · utilidade', kind: 'review' },
  { id: 'grounding', label: 'Resposta proporcional', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault cifrado', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Iezalel 2/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','criticism_preregistered','caricature_completed','neutral_reframe_completed','comparison_completed','action_reviewed','external_voice_not_reinforced','self_insult_not_added','vault_saved','safety_clear'],
  requiredPresent: ['action_needed'],
});

export const IEZALEL_DAY_064 = iezalel(64, 3, [
  { id: 'threshold', label: 'Limiar da Fluência Criativa', kind: 'threshold' },
  { id: 'vocalize', label: 'Glossolália confortável · até 10 min', kind: 'practice' },
  { id: 'write-active', label: 'Escrita contínua · 5 min', kind: 'practice' },
  { id: 'control', label: 'Escrita livre sem vocalização · 5 min', kind: 'comparison' },
  { id: 'review', label: 'Imagem · emoção · hipótese · ação · fato', kind: 'review' },
  { id: 'grounding', label: 'Crítica consciente e retorno', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'vault', label: 'Vault do texto integral', kind: 'review' },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Iezalel 3/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','vocalization_completed','active_writing_completed','control_writing_completed','comparison_completed','content_classified','automatic_authority_not_claimed','high_impact_decision_suspended','threatening_content_not_reinforced','vault_saved','safety_clear'],
  minimums: { vocal_seconds: 1, active_write_seconds: 300, control_write_seconds: 300 },
});

export const IEZALEL_DAY_065 = iezalel(65, 4, [
  { id: 'threshold', label: 'Limiar da Intercessão Responsável', kind: 'threshold' },
  { id: 'active', label: 'Oração + visualização compassiva', kind: 'practice' },
  { id: 'control', label: 'Oração simples sem foto/luz', kind: 'comparison' },
  { id: 'compare', label: 'Experiência própria · cuidado real', kind: 'review' },
  { id: 'grounding', label: 'Entregar resultado a Deus', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Iezalel 4/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','photo_not_uploaded','third_party_identity_not_stored','third_party_symptoms_not_collected','cure_not_claimed','remote_effect_not_claimed','professional_care_not_replaced','concrete_care_considered','safety_clear'],
  requiredPresent: ['photo_used_locally','consent_applicable','consent_confirmed_if_applicable','active_effect_present','control_effect_present'],
  minimums: { active_seconds: 1, control_seconds: 1 },
});

export const IEZALEL_DAY_066 = iezalel(66, 5, [
  { id: 'threshold', label: 'Limiar do Cockpit Gneo Geo', kind: 'threshold' },
  { id: 'active', label: 'Master Gneo Geo aprovado', kind: 'practice' },
  { id: 'control', label: 'Espaço mental neutro', kind: 'comparison' },
  { id: 'compare', label: 'Profundidade · orientação · retorno', kind: 'review' },
  { id: 'grounding', label: 'Localização e horário', kind: 'grounding', requiresReturnConfirmation: true },
  { id: 'seal', label: 'Selo', kind: 'seal' },
  { id: 'complete', label: 'Iezalel 5/5', kind: 'complete' },
], {
  requiredTrue: ['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','master_verified','pearl_centered','eight_nodes_preserved','nodes_circuits_kept_distinct','no_route_invented','external_travel_not_claimed','orientation_restored','safety_clear'],
  requiredPresent: ['gneo_master_id'],
  minimums: { active_seconds: 1, control_seconds: 1 },
});

export const IEZALEL_CANON_RUNTIME = [IEZALEL_DAY_062,IEZALEL_DAY_063,IEZALEL_DAY_064,IEZALEL_DAY_065,IEZALEL_DAY_066] as const;
