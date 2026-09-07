import type { Json } from '@hnk/database';

export type VehuiahDay = 1 | 2 | 3 | 4 | 5;

export interface VehuiahFragmentState {
  fragment: 1;
  angel: 'Vehuiah';
  completedDays: number;
  lit: boolean;
}

export interface VehuiahRouteState {
  activeDay: VehuiahDay | null;
  cycleComplete: boolean;
  nextCycleDay: number | null;
}

export function resolveVehuiahRoute(currentDay: number | null | undefined): VehuiahRouteState {
  const safeDay = Number.isInteger(currentDay) ? Number(currentDay) : 1;
  if (safeDay <= 1) return { activeDay: 1, cycleComplete: false, nextCycleDay: null };
  if (safeDay >= 2 && safeDay <= 5) {
    return { activeDay: safeDay as VehuiahDay, cycleComplete: false, nextCycleDay: null };
  }
  return { activeDay: null, cycleComplete: true, nextCycleDay: 6 };
}

export function parseVehuiahFragment(crown: Json): VehuiahFragmentState {
  if (typeof crown !== 'object' || crown === null || Array.isArray(crown)) {
    throw new Error('invalid_kether_crown_state');
  }
  const cycles = (crown as Record<string, Json | undefined>).cycles;
  if (!Array.isArray(cycles)) throw new Error('invalid_kether_crown_state');

  for (const cycle of cycles) {
    if (typeof cycle !== 'object' || cycle === null || Array.isArray(cycle)) continue;
    const row = cycle as Record<string, Json | undefined>;
    if (row.fragment !== 1 || row.angel !== 'Vehuiah') continue;
    if (typeof row.completed_days !== 'number' || typeof row.lit !== 'boolean') {
      throw new Error('invalid_vehuiah_fragment_state');
    }
    return {
      fragment: 1,
      angel: 'Vehuiah',
      completedDays: row.completed_days,
      lit: row.lit,
    };
  }

  throw new Error('vehuiah_fragment_missing');
}

export function assertVehuiahFragmentLit(crown: Json): VehuiahFragmentState {
  const fragment = parseVehuiahFragment(crown);
  if (!fragment.lit || fragment.completedDays !== 5) {
    throw new Error('vehuiah_fragment_not_lit');
  }
  return fragment;
}
