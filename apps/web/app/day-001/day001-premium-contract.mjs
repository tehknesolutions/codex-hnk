export const DAY001_PREMIUM_STAGES = Object.freeze([
  'threshold', 'revelation', 'doctrine', 'kavanah', 'ordeal', 'mirror', 'seal',
]);

const REDUCED_MOTION_LABELS = Object.freeze({
  threshold: 'Limiar disponível', revelation: 'Revelação disponível', doctrine: 'Doutrina disponível',
  kavanah: 'Kavanah disponível', ordeal: 'Ordália disponível', mirror: 'Espelho e Vault disponíveis', seal: 'Selo disponível',
});

export function resolveDay001PremiumJourney({ unlockedThrough, authoritativeComplete }) {
  const unlockedIndex = DAY001_PREMIUM_STAGES.indexOf(unlockedThrough);
  if (unlockedIndex < 0) throw new TypeError(`Unknown Day 001 premium stage: ${String(unlockedThrough)}`);
  return DAY001_PREMIUM_STAGES.map((id, index) => ({
    id,
    available: index <= unlockedIndex,
    complete: id === 'seal' ? authoritativeComplete === true : index < unlockedIndex,
    reducedMotionLabel: REDUCED_MOTION_LABELS[id],
  }));
}
