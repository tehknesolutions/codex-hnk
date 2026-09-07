export type HnkCanonicalReferenceState = 'approved' | 'review';

export type HnkCanonicalReference = {
  id: string;
  assetId: string | null;
  label: string;
  state: HnkCanonicalReferenceState;
  canonicalRepo: 'Tehkne-Solutions/hnk-codex-365';
  canonicalSourceSha: string;
  canonicalSourcePath: string;
  checksumSha256: string | null;
  metadata: Readonly<Record<string, string | number | boolean | null>>;
};

export const HNK_KETHER_CANON_SOURCE_SHA = '2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8' as const;

export const ketherCanonicalReferences = Object.freeze({
  daiKooMyo: {
    id: 'reiki-usui-dai-ko-myo-v1',
    assetId: 'oracle-dai-ko-myo-usui-hnk-master-v1',
    label: 'Dai Koo Myo Usui — HNK V1',
    state: 'approved',
    canonicalRepo: 'Tehkne-Solutions/hnk-codex-365',
    canonicalSourceSha: HNK_KETHER_CANON_SOURCE_SHA,
    canonicalSourcePath: 'canon/references/approved/DAI_KOO_MYO_USUI_HNK_V1.md',
    checksumSha256: '25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0',
    metadata: Object.freeze({ semanticMaster: '大光明', orientation: 'vertical', strokeOrderAssetSha256: '52cf6921ccd6ede63a6f83d05b31faf787d2881b99d5b8ce1ee6095a86b4fe6b' }),
  },
  gneoGeo: {
    id: 'hnk.gneo_geo.v1',
    assetId: 'hnk.gneo_geo.v1.master',
    label: 'Gneo Geo Astral — Estrela Dupla dos Oito Circuitos',
    state: 'approved',
    canonicalRepo: 'Tehkne-Solutions/hnk-codex-365',
    canonicalSourceSha: HNK_KETHER_CANON_SOURCE_SHA,
    canonicalSourcePath: 'canon/references/approved/GNEO_GEO_V1.md',
    checksumSha256: '2547d18241651980ed1668408b189ecfd1eb28acb400cdf6c1d96e7514d90436',
    metadata: Object.freeze({ fixedNorth: true, circuitCount: 8, traversal: '1>2>3>4>5>6>7>8>O' }),
  },
  ketherSigil: {
    id: 'hnk.kether.sigil.v1',
    assetId: 'hnk.kether.sigil.v1.master',
    label: 'Sigilo da Coroa de Kether — HNK V1',
    state: 'approved',
    canonicalRepo: 'Tehkne-Solutions/hnk-codex-365',
    canonicalSourceSha: HNK_KETHER_CANON_SOURCE_SHA,
    canonicalSourcePath: 'canon/references/approved/KETHER_SIGIL_V1.md',
    checksumSha256: '7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a',
    metadata: Object.freeze({ rings: 3, gates: 12, dayMarks: 36, fixedNorth: true }),
  },
  angelicTuner: {
    id: 'hnk.tuner.kether.v1',
    assetId: null,
    label: 'Sintonizador Angelical HNK — Kether V1',
    state: 'approved',
    canonicalRepo: 'Tehkne-Solutions/hnk-codex-365',
    canonicalSourceSha: HNK_KETHER_CANON_SOURCE_SHA,
    canonicalSourcePath: 'canon/references/approved/SINTONIZADOR_ANGELICAL_KETHER_V1.md',
    checksumSha256: null,
    metadata: Object.freeze({ entityDetector: false, fixedPortalSequence: 'READY>AUDIO_ARMED>INDUCTION>SIGIL_READY>GNOSIS>RETURN>RECORD>COMPLETE' }),
  },
  transitionAudio: {
    id: 'hnk.audio.kether_chokmah.transition.v1',
    assetId: null,
    label: 'Kether → Chokmah Transition V1',
    state: 'review',
    canonicalRepo: 'Tehkne-Solutions/hnk-codex-365',
    canonicalSourceSha: HNK_KETHER_CANON_SOURCE_SHA,
    canonicalSourcePath: 'canon/references/approved/KETHER_CHOKMAH_TRANSITION_AUDIO_V1.md',
    checksumSha256: '5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168',
    metadata: Object.freeze({ canonicalRecipeApproved: true, listeningQaPending: true, published: false, durationSeconds: 720, leftHz: 429, rightHz: 435, centerHz: 432, differenceHz: 6, ritualToneHz: 528 }),
  },
} satisfies Record<string, HnkCanonicalReference>);

export function getKetherCanonicalReference(key: keyof typeof ketherCanonicalReferences): HnkCanonicalReference {
  return ketherCanonicalReferences[key];
}
