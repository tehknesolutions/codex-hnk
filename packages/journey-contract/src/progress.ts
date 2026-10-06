import { resolveJourneyTarget } from "./navigation.js";
import type { DayId } from "./types.js";

export type JourneyProgressState = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type JourneyProgressRecord = Readonly<{
  dayId: DayId;
  state: JourneyProgressState;
  updatedAt: string;
}>;

export type ResumePointer = Readonly<{ dayId: string }>;

export interface ProgressLedgerPort {
  save(record: JourneyProgressRecord): Promise<void>;
}

function assertAvailable(dayId: string): DayId {
  const target = resolveJourneyTarget(dayId);
  if (target.status !== "AVAILABLE") {
    throw new Error(`Progress requires an AVAILABLE Day: ${dayId}`);
  }
  return target.dayId;
}

export function advanceJourneyProgress(
  current: JourneyProgressRecord | undefined,
  dayId: string,
  nextState: JourneyProgressState,
  now = new Date().toISOString(),
): JourneyProgressRecord {
  const availableDayId = assertAvailable(dayId);
  if (current && current.dayId !== availableDayId) throw new Error("Progress record Day mismatch");
  const rank: Record<JourneyProgressState, number> = { NOT_STARTED: 0, IN_PROGRESS: 1, COMPLETED: 2 };
  if (current && rank[nextState] < rank[current.state]) throw new Error("Journey progress cannot move backwards");
  return Object.freeze({ dayId: availableDayId, state: nextState, updatedAt: now });
}

export function resolveResumePointer(
  records: readonly JourneyProgressRecord[],
  pointer: ResumePointer | null | undefined,
): JourneyProgressRecord | null {
  if (!pointer) return null;
  const target = resolveJourneyTarget(pointer.dayId);
  if (target.status !== "AVAILABLE") return null;
  const record = records.find((item) => item.dayId === target.dayId && item.state !== "NOT_STARTED");
  return record ?? null;
}

export async function persistJourneyProgress(
  port: ProgressLedgerPort,
  record: JourneyProgressRecord,
): Promise<JourneyProgressRecord> {
  await port.save(record);
  return record;
}
