export const hnkRhythm = {
  r3: 3,
  r6: 6,
  r12: 12,
  r24: 24,
  r36: 36,
  r72: 72,
} as const;

export const ketherTokens = {
  status: 'direction-frozen-values-provisional',
  direction: 'HNK SACRED EDITORIAL FANTASY',
  color: {
    void: '#030405',
    surface: '#07080a',
    surfaceRaised: '#0a0b0f',
    textPrimary: '#f7f3e7',
    textSecondary: '#aaa89f',
    textMuted: '#77766f',
    goldMaterial: '#cbb06d',
    goldBright: '#d4b66a',
    originWhite: '#fffdf4',
  },
  typography: {
    sacredDisplay: {
      role: 'sacred-display',
      fallback: ['Iowan Old Style', 'Palatino Linotype', 'Palatino', 'Georgia', 'serif'],
    },
    editorialBody: {
      role: 'editorial-body',
      fallback: ['Iowan Old Style', 'Palatino Linotype', 'Palatino', 'Georgia', 'serif'],
    },
    system: {
      role: 'system',
      fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    },
  },
  rhythm: hnkRhythm,
  geometry: {
    hairline: 1,
    cycleNodeDesktop: 72,
    cycleNodeMobile: 54,
    originPoint: 18,
    primitives: ['axis', 'ring', 'node', 'threshold', 'origin-point'],
  },
  depth: {
    atmosphere: 0,
    architecture: 1,
    content: 2,
    artifact: 3,
    hud: 4,
    feedback: 5,
  },
  motion: {
    principle: ['orient', 'reveal', 'respond', 'transform', 'reward', 'breathe'],
    reducedMotion: {
      continuousAnimation: false,
      decorativeGlow: false,
    },
  },
} as const;

export type KetherTokens = typeof ketherTokens;
