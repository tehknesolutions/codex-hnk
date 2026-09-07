export type DayRuntimeStatus =
  | 'locked'
  | 'available'
  | 'active'
  | 'interrupted'
  | 'evidence_pending'
  | 'local_complete_pending_sync'
  | 'complete';

export type PracticeMode = 'first_completion' | 'revisit';

export type SafeEvidenceValue = boolean | number | string | null;
export type SafeEvidence = Record<string, SafeEvidenceValue>;

export interface DayGate {
  /** Standard sequential progression: Day N requires Day N-1. */
  requiresPrevious?: boolean;
  /** Boss/portal progression: every listed Day must already be canonically complete. */
  requiresAll?: readonly number[];
}

export interface DayPhaseDefinition {
  id: string;
  label: string;
  kind:
    | 'threshold'
    | 'instruction'
    | 'practice'
    | 'comparison'
    | 'integration'
    | 'grounding'
    | 'reflection'
    | 'review'
    | 'seal'
    | 'complete';
  requiresReturnConfirmation?: boolean;
}

export interface DayEvidenceContract {
  /** Fields that must exist in the evidence object, even when false/zero are valid observations. */
  requiredPresent?: readonly string[];
  /** Boolean flags that must be true before a first completion can be submitted. */
  requiredTrue?: readonly string[];
  /** Numeric fields that must meet a minimum value. */
  minimums?: Readonly<Record<string, number>>;
  /** Categorical fields and their accepted values. */
  categories?: Readonly<Record<string, readonly string[]>>;
}

export interface DayDefinition {
  day: number;
  chapter: number;
  sephira: string;
  world: string;
  cycle: string;
  cycleIndex: number;
  cycleDay: number;
  cycleLength: number;
  portal?: boolean;
  gate: DayGate;
  phases: readonly DayPhaseDefinition[];
  evidence: DayEvidenceContract;
}

export interface RuntimeProgressSnapshot {
  completedDays: readonly number[];
  currentDay: number;
  xpTotal: number;
  initiatoryGrade: number;
  initiatoryTitle: string;
}

export interface ServerCompletionResult {
  day: number;
  firstCompletion: boolean;
  xpAwarded: number;
  xpTotal: number;
  initiatoryGrade: number;
  initiatoryTitle: string;
}

export interface DayRuntimeState {
  day: number;
  status: DayRuntimeStatus;
  mode: PracticeMode;
  phaseIndex: number;
  clientSessionId: string | null;
  evidence: SafeEvidence;
  returnConfirmed: boolean;
  serverCompletion: ServerCompletionResult | null;
}

export interface EvidenceValidationResult {
  valid: boolean;
  missingPresent: string[];
  missingTrue: string[];
  belowMinimum: Array<{ key: string; expected: number; actual: number | null }>;
  invalidCategory: Array<{ key: string; actual: string | null; allowed: readonly string[] }>;
}

function uniqueDays(days: readonly number[]): Set<number> {
  return new Set(days.filter((day) => Number.isInteger(day) && day > 0));
}

export function isGateSatisfied(definition: DayDefinition, progress: RuntimeProgressSnapshot): boolean {
  const complete = uniqueDays(progress.completedDays);

  if (definition.gate.requiresPrevious && definition.day > 1 && !complete.has(definition.day - 1)) {
    return false;
  }

  if (definition.gate.requiresAll?.some((requiredDay) => !complete.has(requiredDay))) {
    return false;
  }

  return true;
}

export function resolveDayStatus(definition: DayDefinition, progress: RuntimeProgressSnapshot): DayRuntimeStatus {
  if (progress.completedDays.includes(definition.day)) return 'complete';
  return isGateSatisfied(definition, progress) ? 'available' : 'locked';
}

export function createDayRuntimeState(
  definition: DayDefinition,
  progress: RuntimeProgressSnapshot,
): DayRuntimeState {
  const status = resolveDayStatus(definition, progress);
  return {
    day: definition.day,
    status,
    mode: status === 'complete' ? 'revisit' : 'first_completion',
    phaseIndex: 0,
    clientSessionId: null,
    evidence: {},
    returnConfirmed: false,
    serverCompletion: null,
  };
}

export function startDayRuntime(state: DayRuntimeState, clientSessionId: string): DayRuntimeState {
  if (state.status === 'locked') throw new Error('day_locked');
  if (!clientSessionId.trim()) throw new Error('client_session_id_required');

  return {
    ...state,
    status: 'active',
    clientSessionId,
  };
}

export function advancePhase(state: DayRuntimeState, definition: DayDefinition): DayRuntimeState {
  if (state.status !== 'active' && state.status !== 'evidence_pending') {
    throw new Error('runtime_not_active');
  }

  const nextIndex = Math.min(definition.phases.length - 1, state.phaseIndex + 1);
  return { ...state, phaseIndex: nextIndex };
}

export function interruptDayRuntime(state: DayRuntimeState): DayRuntimeState {
  if (state.status === 'complete') return state;
  return { ...state, status: 'interrupted' };
}

export function mergeEvidence(state: DayRuntimeState, patch: SafeEvidence): DayRuntimeState {
  return {
    ...state,
    evidence: { ...state.evidence, ...patch },
  };
}

export function confirmReturn(state: DayRuntimeState): DayRuntimeState {
  return { ...state, returnConfirmed: true };
}

export function validateEvidence(
  evidence: SafeEvidence,
  contract: DayEvidenceContract,
): EvidenceValidationResult {
  const missingPresent = (contract.requiredPresent ?? []).filter((key) => !Object.prototype.hasOwnProperty.call(evidence, key));
  const missingTrue = (contract.requiredTrue ?? []).filter((key) => evidence[key] !== true);

  const belowMinimum = Object.entries(contract.minimums ?? {}).flatMap(([key, expected]) => {
    const value = evidence[key];
    const actual = typeof value === 'number' && Number.isFinite(value) ? value : null;
    return actual === null || actual < expected ? [{ key, expected, actual }] : [];
  });

  const invalidCategory = Object.entries(contract.categories ?? {}).flatMap(([key, allowed]) => {
    const value = evidence[key];
    const actual = typeof value === 'string' ? value : null;
    return actual === null || !allowed.includes(actual) ? [{ key, actual, allowed }] : [];
  });

  return {
    valid: missingPresent.length === 0 && missingTrue.length === 0 && belowMinimum.length === 0 && invalidCategory.length === 0,
    missingPresent,
    missingTrue,
    belowMinimum,
    invalidCategory,
  };
}

export function markEvidencePending(state: DayRuntimeState, definition: DayDefinition): DayRuntimeState {
  if (!state.clientSessionId) throw new Error('practice_session_required');

  const validation = validateEvidence(state.evidence, definition.evidence);
  if (!validation.valid) throw new Error('evidence_incomplete');

  const requiresReturn = definition.phases.some((phase) => phase.requiresReturnConfirmation);
  if (requiresReturn && !state.returnConfirmed) throw new Error('return_confirmation_required');

  return { ...state, status: 'evidence_pending' };
}

/**
 * Used only when the user completed a supported practice while offline.
 * This is deliberately not equivalent to canonical `complete`.
 */
export function markLocalCompletionPendingSync(
  state: DayRuntimeState,
  definition: DayDefinition,
): DayRuntimeState {
  const pending = markEvidencePending(state, definition);
  return { ...pending, status: 'local_complete_pending_sync' };
}

/**
 * Canonical completion is applied only from an authoritative server response.
 * XP/grade are never derived locally by this package.
 */
export function applyServerCompletion(
  state: DayRuntimeState,
  result: ServerCompletionResult,
): DayRuntimeState {
  if (result.day !== state.day) throw new Error('completion_day_mismatch');
  if (result.xpAwarded < 0 || result.xpTotal < 0) throw new Error('invalid_server_completion');

  return {
    ...state,
    status: 'complete',
    serverCompletion: result,
  };
}

export function currentPhase(
  state: DayRuntimeState,
  definition: DayDefinition,
): DayPhaseDefinition {
  const phase = definition.phases[state.phaseIndex];
  if (!phase) throw new Error('phase_out_of_range');
  return phase;
}

export function createClientSessionId(day: number, userId: string, now = Date.now(), entropy = Math.random()): string {
  if (!Number.isInteger(day) || day < 1 || day > 365) throw new Error('invalid_day');
  if (!userId.trim()) throw new Error('user_id_required');
  const random = Math.abs(entropy).toString(36).replace('.', '').slice(0, 10).padEnd(6, '0');
  return `hnk-d${String(day).padStart(3, '0')}-${userId}-${now}-${random}`;
}

export const KETHER_CYCLES = [
  { fragment: 1, name: 'Vehuiah', start: 1, end: 5 },
  { fragment: 2, name: 'Jeliel', start: 6, end: 10 },
  { fragment: 3, name: 'Sitael', start: 11, end: 15 },
  { fragment: 4, name: 'Elemiah', start: 16, end: 20 },
  { fragment: 5, name: 'Mahasiah', start: 21, end: 25 },
  { fragment: 6, name: 'Lelahel', start: 26, end: 30 },
  { fragment: 7, name: 'Achaiah', start: 31, end: 35 },
] as const;

export interface KetherCrownFragment {
  fragment: number;
  angel: string;
  start: number;
  end: number;
  completedDays: number;
  lit: boolean;
}

export interface KetherCrownState {
  daysCompleted: number;
  fragmentsLit: number;
  fragmentsTotal: 7;
  portalUnlocked: boolean;
  ketherComplete: boolean;
  fragments: KetherCrownFragment[];
}

export function deriveKetherCrown(completedDays: readonly number[]): KetherCrownState {
  const complete = uniqueDays(completedDays);
  const fragments = KETHER_CYCLES.map((cycle) => {
    let count = 0;
    for (let day = cycle.start; day <= cycle.end; day += 1) {
      if (complete.has(day)) count += 1;
    }
    return {
      fragment: cycle.fragment,
      angel: cycle.name,
      start: cycle.start,
      end: cycle.end,
      completedDays: count,
      lit: count === 5,
    } satisfies KetherCrownFragment;
  });

  let daysCompleted = 0;
  for (let day = 1; day <= 36; day += 1) {
    if (complete.has(day)) daysCompleted += 1;
  }

  const fragmentsLit = fragments.filter((fragment) => fragment.lit).length;
  const portalUnlocked = Array.from({ length: 35 }, (_, index) => index + 1).every((day) => complete.has(day));
  const ketherComplete = portalUnlocked && complete.has(36);

  return {
    daysCompleted,
    fragmentsLit,
    fragmentsTotal: 7,
    portalUnlocked,
    ketherComplete,
    fragments,
  };
}

export function ketherCycleForDay(day: number) {
  return KETHER_CYCLES.find((cycle) => day >= cycle.start && day <= cycle.end) ?? null;
}

export function ketherGateForDay(day: number): DayGate {
  if (day === 1) return {};
  if (day >= 2 && day <= 35) return { requiresPrevious: true };
  if (day === 36) return { requiresAll: Array.from({ length: 35 }, (_, index) => index + 1) };
  throw new Error('day_outside_kether');
}
