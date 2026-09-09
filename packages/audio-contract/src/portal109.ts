import type { HnkAudioPreset } from './index.js';

export const HNK_PORTAL109_SATURN_JUPITER_ACTIVE_PRESET_ID = 'HNK-PORTAL109-SATURN-JUPITER-ACTIVE-V1' as const;
export const HNK_PORTAL109_SATURN_JUPITER_CONTROL_PRESET_ID = 'HNK-PORTAL109-SATURN-JUPITER-CONTROL-V1' as const;
export const HNK_PORTAL109_SATURN_JUPITER_ACTIVE_RENDER_SHA256 = '599116929d4dde21a9ff77a4d64b2d43a79f9947a69df3a08bcffec389c95e58' as const;
export const HNK_PORTAL109_SATURN_JUPITER_CONTROL_RENDER_SHA256 = '0deac19834d622bed5bd3aa6b16df8e1acabc7f3513b3a29377f02d73f1295e9' as const;
export const HNK_PORTAL109_DURATION_SECONDS = 600 as const;

const PORTAL109_SAFETY = Object.freeze({
  maxOutputGain: 0.08,
  fadeInSeconds: 5,
  fadeOutSeconds: 10,
  autoplay: false as const,
  userVolumeControl: true as const,
  immediateStop: true as const,
});

export const HNK_PORTAL109_SATURN_JUPITER_ACTIVE_PRESET_V1 = Object.freeze({
  id: HNK_PORTAL109_SATURN_JUPITER_ACTIVE_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Portal 109 ACTIVE · Saturn 147.85 Hz → Jupiter 183.58 Hz · Δ4 Hz',
  layers: [
    {
      kind: 'binaural-transition',
      startLeftHz: 147.85,
      endLeftHz: 183.58,
      differenceHz: 4,
      curve: 'linear',
      durationSeconds: HNK_PORTAL109_DURATION_SECONDS,
      gain: 0.06,
    },
  ],
  sourceReferences: [
    {
      id: 'HNK-P109-SATURN',
      rawLabel: 'Saturno',
      sourceRef: 'docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md',
      role: 'carrier-base',
      hz: 147.85,
      note: 'Cousto Cosmic Octave value explicitly adopted by HNK for the planetary-tone mapping.',
    },
    {
      id: 'HNK-P109-JUPITER',
      rawLabel: 'Júpiter',
      sourceRef: 'docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md',
      role: 'carrier-base',
      hz: 183.58,
      note: 'Cousto Cosmic Octave value explicitly adopted by HNK for the planetary-tone mapping.',
    },
    {
      id: 'HNK-P109-THETA-DIFFERENCE',
      rawLabel: 'Theta difference = 4 Hz',
      sourceRef: 'docs/audio/source-locks/HNK_APP_ONBOARDING_AUDIO_SOURCE_V1.md',
      role: 'binaural-difference',
      hz: 4,
      note: 'Technical HNK binaural layer; not a planetary property.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Portal 109 Saturn-to-Jupiter transition — symbolic/acoustic operator, not a neurological measurement',
  durationSeconds: HNK_PORTAL109_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_PORTAL109_SATURN_JUPITER_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md',
  renderChecksumSha256: HNK_PORTAL109_SATURN_JUPITER_ACTIVE_RENDER_SHA256,
  safety: PORTAL109_SAFETY,
} satisfies HnkAudioPreset);

export const HNK_PORTAL109_SATURN_JUPITER_CONTROL_PRESET_V1 = Object.freeze({
  id: HNK_PORTAL109_SATURN_JUPITER_CONTROL_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Portal 109 CONTROL · Saturn 147.85 Hz → Jupiter 183.58 Hz',
  layers: [
    {
      kind: 'stereo-control-transition',
      startHz: 147.85,
      endHz: 183.58,
      curve: 'linear',
      durationSeconds: HNK_PORTAL109_DURATION_SECONDS,
      gain: 0.06,
    },
  ],
  sourceReferences: [
    {
      id: 'HNK-P109-CONTROL-TRANSITION',
      rawLabel: 'Saturno → Júpiter control without active binaural difference',
      sourceRef: 'docs/audio/HNK_PORTAL109_SATURN_JUPITER_AUDIO_FREEZE_V1.md',
      role: 'carrier-base',
      note: 'Product control preserves the same planetary carrier transition while removing the active 4 Hz stereo difference.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Portal 109 control transition — no active binaural difference',
  durationSeconds: HNK_PORTAL109_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_PORTAL109_SATURN_JUPITER_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md',
  renderChecksumSha256: HNK_PORTAL109_SATURN_JUPITER_CONTROL_RENDER_SHA256,
  safety: PORTAL109_SAFETY,
} satisfies HnkAudioPreset);
