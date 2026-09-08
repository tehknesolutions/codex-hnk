import { ketherGateForDay, type DayDefinition } from '@hnk/day-runtime';

/**
 * Production remains locked until Issue #7 freezes the three canonical Portal
 * operators (Sintonizador Angelical, transition Solfeggio and Kether sigil).
 */
export const PORTAL_036_OPERATORS_APPROVED = false as const;
export const PORTAL_036_CANONICAL_BLOCKER_ISSUE = 7;

export const KETHER_PORTAL_036: DayDefinition = {
  day: 36,
  chapter: 1,
  sephira: 'Kether',
  world: 'Atziluth',
  cycle: 'Portal de Transmutação',
  cycleIndex: 8,
  cycleDay: 1,
  cycleLength: 1,
  portal: true,
  gate: ketherGateForDay(36),
  phases: [
    { id: 'threshold', label: 'Coroa 7/7', kind: 'threshold' },
    { id: 'preflight', label: 'Pre-flight', kind: 'instruction' },
    { id: 'operator-gate', label: 'Operadores canônicos', kind: 'instruction' },
    { id: 'portal-active', label: 'Condition A · Portal', kind: 'practice' },
    { id: 'return-a', label: 'Return Gate A', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'base', label: 'Condition B · Sessão-base', kind: 'comparison' },
    { id: 'return-b', label: 'Return Gate B', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'comparison', label: 'Portal × Base', kind: 'review' },
    { id: 'review', label: 'Review 001–035', kind: 'review' },
    { id: 'attributes', label: 'Evidence Cards · 7 atributos', kind: 'review' },
    { id: 'synthesis', label: 'Síntese de Kether', kind: 'reflection' },
    { id: 'promotion-review', label: 'Promotion Review', kind: 'review' },
    { id: 'seal', label: 'Selo do Portal', kind: 'seal' },
    { id: 'complete', label: 'Level 2 · Iniciado', kind: 'complete' },
  ],
  evidence: {
    requiredPresent: ['safety_blocking_state'],
    requiredTrue: [
      'portal_condition_completed',
      'base_condition_completed',
      'portal_base_comparison_completed',
      'return_confirmed',
      'review_001_035_completed',
      'premature_promotion_criterion_declared',
      'kether_synthesis_completed',
      'journal_update_confirmed',
      'safety_clear',
    ],
    minimums: {
      consolidated_competencies_count: 3,
      fragile_competencies_count: 3,
      attribute_evidence_count: 7,
    },
  },
};
