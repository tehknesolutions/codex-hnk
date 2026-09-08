import type { SessionSnapshot } from './types.js';

export interface QuestSnapshotStore {
  load(key: string): Promise<SessionSnapshot | null>;
  save(key: string, snapshot: SessionSnapshot): Promise<void>;
  remove(key: string): Promise<void>;
}

export function encodeQuestSnapshot(snapshot: SessionSnapshot): string {
  return JSON.stringify({ version: 1, snapshot });
}

export function decodeQuestSnapshot(serialized: string): SessionSnapshot {
  const parsed = JSON.parse(serialized) as { version?: unknown; snapshot?: unknown };
  if (parsed.version !== 1 || typeof parsed.snapshot !== 'object' || parsed.snapshot === null) throw new Error('quest_snapshot_invalid_envelope');
  const row = parsed.snapshot as Record<string, unknown>;
  if (typeof row.runState !== 'string') throw new Error('quest_snapshot_invalid_state');
  if (!Array.isArray(row.completedPhaseIds) || !row.completedPhaseIds.every((value) => typeof value === 'string')) throw new Error('quest_snapshot_invalid_completed_phases');
  if (row.currentPhaseId != null && typeof row.currentPhaseId !== 'string') throw new Error('quest_snapshot_invalid_current_phase');
  if (row.checkpointPhaseId != null && typeof row.checkpointPhaseId !== 'string') throw new Error('quest_snapshot_invalid_checkpoint');
  return {
    runState: row.runState as SessionSnapshot['runState'],
    currentPhaseId: row.currentPhaseId as string | undefined,
    completedPhaseIds: row.completedPhaseIds as string[],
    checkpointPhaseId: row.checkpointPhaseId as string | undefined,
  };
}
