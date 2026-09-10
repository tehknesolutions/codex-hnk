import type { DayDefinition } from '@hnk/day-runtime';

export const PORTAL073_SCHEMA_VERSION = 'HNK-PORTAL-073-EVIDENCE-V1' as const;
export const PORTAL073_TUNER_ID = 'HNK-ANGELIC-TUNER-D073-V1' as const;
export const PORTAL073_TRANSITION_PRESET_ID = 'HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1' as const;
export const PORTAL073_SIGIL_ID = 'HNK-REF-MAGICIAN-MERCURY-V1' as const;

// Deliberately false until G7/G8 publication QA is complete and the server
// operator set is promoted from approved -> published.
export const PORTAL073_PRODUCTION_ENABLED = false as const;

export const CHOKMAH_PORTAL_073: DayDefinition = {
  day: 73,
  chapter: 2,
  sephira: 'Chokmah',
  world: 'Atziluth',
  cycle: 'Portal Chokmah→Binah',
  cycleIndex: 8,
  cycleDay: 2,
  cycleLength: 2,
  gate: { requiresPrevious: true },
  phases: [
    { id: 'threshold', label: 'Portal 073 · pre-flight', kind: 'threshold' },
    { id: 'audio', label: 'Sintonizador Angelical · 10 minutos', kind: 'practice' },
    { id: 'induction', label: 'Checkpoint Dave Elman', kind: 'practice' },
    { id: 'sigil', label: 'Sigilo canônico do Mago', kind: 'practice' },
    { id: 'return', label: 'Return Gate', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'vault', label: 'Upload cifrado do diário de sincronicidades', kind: 'review' },
    { id: 'seal', label: 'Conclusão autoritativa', kind: 'seal' },
    { id: 'complete', label: 'Chokmah concluída · Teurgo', kind: 'complete' },
  ],
  evidence: {
    requiredTrue: [
      'protocol_completed',
      'tuner_completed',
      'transition_audio_completed',
      'induction_completed',
      'sigil_completed',
      'operator_ids_verified',
      'volume_control_available',
      'immediate_stop_available',
      'return_confirmed',
      'vault_saved',
      'safety_clear',
    ],
    minimums: { audio_seconds: 600 },
  },
};
