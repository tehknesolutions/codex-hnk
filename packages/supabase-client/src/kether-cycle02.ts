import type { Json } from '@hnk/database';

export type JelielDay = 6 | 7 | 8 | 9 | 10;

export interface JelielFragmentState {
  fragment: 2;
  angel: 'Jeliel';
  completedDays: number;
  lit: boolean;
}

export interface JelielRouteState {
  activeDay: JelielDay | null;
  cycleComplete: boolean;
  nextCycleDay: number | null;
}

export function resolveJelielRoute(currentDay: number | null | undefined): JelielRouteState {
  const safeDay = Number.isInteger(currentDay) ? Number(currentDay) : 6;
  if (safeDay <= 6) return { activeDay: 6, cycleComplete: false, nextCycleDay: null };
  if (safeDay >= 7 && safeDay <= 10) return { activeDay: safeDay as JelielDay, cycleComplete: false, nextCycleDay: null };
  return { activeDay: null, cycleComplete: true, nextCycleDay: 11 };
}

export function parseJelielFragment(crown: Json): JelielFragmentState {
  if (typeof crown !== 'object' || crown === null || Array.isArray(crown)) throw new Error('invalid_kether_crown_state');
  const cycles = (crown as Record<string, Json | undefined>).cycles;
  if (!Array.isArray(cycles)) throw new Error('invalid_kether_crown_state');
  for (const cycle of cycles) {
    if (typeof cycle !== 'object' || cycle === null || Array.isArray(cycle)) continue;
    const row = cycle as Record<string, Json | undefined>;
    if (row.fragment !== 2 || row.angel !== 'Jeliel') continue;
    if (typeof row.completed_days !== 'number' || typeof row.lit !== 'boolean') throw new Error('invalid_jeliel_fragment_state');
    return { fragment: 2, angel: 'Jeliel', completedDays: row.completed_days, lit: row.lit };
  }
  throw new Error('jeliel_fragment_missing');
}

export function assertJelielFragmentLit(crown: Json): JelielFragmentState {
  const fragment = parseJelielFragment(crown);
  if (!fragment.lit || fragment.completedDays !== 5) throw new Error('jeliel_fragment_not_lit');
  return fragment;
}
