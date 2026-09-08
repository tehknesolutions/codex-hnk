export type RealWorldActionState = 'active' | 'qualified' | 'stopped';

export interface RealWorldActionSnapshot {
  id: string;
  day: number;
  action_contract_id: string;
  action_key: string;
  state: RealWorldActionState;
  started_at: string;
  qualified_at: string | null;
  last_check_in_at: string | null;
  restart_count: number;
  target_elapsed_seconds: number;
  remaining_seconds: number;
  consecutive: boolean;
  server_now: string;
}

export interface RealWorldActionPort {
  start(actionContractId: string, clientActionId: string): Promise<RealWorldActionSnapshot>;
  refresh(actionId: string): Promise<RealWorldActionSnapshot>;
  restart(actionId: string): Promise<RealWorldActionSnapshot>;
  stop(actionId: string): Promise<RealWorldActionSnapshot>;
}

export const DAY003_REAL_WORLD_ACTION = Object.freeze({
  actionContractId: 'HNK-KETHER-D003-BOAZ-24H-V1',
  questDefinitionId: 'HNK-KETHER-D003-V1',
  phaseId: 'boaz_24h_action',
  actionKey: 'NO_COMPLAINT_24H',
  targetElapsedSeconds: 86_400,
  consecutive: true,
  lapsePolicy: 'RESTART_WINDOW_WITHOUT_PUNISHMENT',
  serverClockAuthoritative: true,
} as const);

function requireString(value: unknown, key: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`real_world_action_invalid_${key}`);
  return value;
}

function requireNumber(value: unknown, key: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`real_world_action_invalid_${key}`);
  return value;
}

export function parseRealWorldActionSnapshot(value: unknown): RealWorldActionSnapshot {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('real_world_action_invalid_payload');
  const row = value as Record<string, unknown>;
  const state = row.state;
  if (state !== 'active' && state !== 'qualified' && state !== 'stopped') throw new Error('real_world_action_invalid_state');
  const qualified = row.qualified_at;
  const lastCheck = row.last_check_in_at;
  if (qualified !== null && typeof qualified !== 'string') throw new Error('real_world_action_invalid_qualified_at');
  if (lastCheck !== null && typeof lastCheck !== 'string') throw new Error('real_world_action_invalid_last_check_in_at');
  if (typeof row.consecutive !== 'boolean') throw new Error('real_world_action_invalid_consecutive');

  return {
    id: requireString(row.id, 'id'),
    day: requireNumber(row.day, 'day'),
    action_contract_id: requireString(row.action_contract_id, 'action_contract_id'),
    action_key: requireString(row.action_key, 'action_key'),
    state,
    started_at: requireString(row.started_at, 'started_at'),
    qualified_at: qualified as string | null,
    last_check_in_at: lastCheck as string | null,
    restart_count: requireNumber(row.restart_count, 'restart_count'),
    target_elapsed_seconds: requireNumber(row.target_elapsed_seconds, 'target_elapsed_seconds'),
    remaining_seconds: requireNumber(row.remaining_seconds, 'remaining_seconds'),
    consecutive: row.consecutive,
    server_now: requireString(row.server_now, 'server_now'),
  };
}

export function isRealWorldActionQualified(snapshot: RealWorldActionSnapshot): boolean {
  return snapshot.state === 'qualified' && snapshot.remaining_seconds === 0 && snapshot.qualified_at !== null;
}
