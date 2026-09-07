export type PracticeMode = "first_completion" | "revisit";

export type PracticeSessionState =
  | "active"
  | "interrupted"
  | "evidence_pending"
  | "complete";

export type SafeScalar = number | boolean | null;
export type SafeMetricRecord = Record<string, SafeScalar>;

export interface PracticeSessionIdentity {
  day: number;
  clientSessionId: string;
  questDefinitionId: string;
  canonicalSourceSha: string;
  mode: PracticeMode;
}

export interface PracticeSessionSnapshot<TEvidence = unknown> {
  id: string;
  identity: PracticeSessionIdentity;
  state: PracticeSessionState;
  startedAt: string;
  endedAt?: string | null;
  durationSeconds?: number | null;
  metrics: SafeMetricRecord;
  evidence: TEvidence;
  localRecordHash?: string | null;
}

export interface StartPracticeCommand {
  identity: PracticeSessionIdentity;
  appVersion?: string | null;
  startedAt: string;
}

export interface SavePracticeCommand<TEvidence> {
  sessionId: string;
  durationSeconds?: number | null;
  metrics: SafeMetricRecord;
  evidence: TEvidence;
  readyForCompletion: boolean;
  localRecordHash?: string | null;
  endedAt?: string | null;
}

export interface PracticePersistencePort<TEvidence> {
  start(command: StartPracticeCommand): Promise<PracticeSessionSnapshot<TEvidence>>;
  save(command: SavePracticeCommand<TEvidence>): Promise<PracticeSessionSnapshot<TEvidence>>;
}

export type SyncOperation = "START_SESSION" | "SAVE_RECORD";

export interface PracticeSyncQueueItem<TPayload> {
  idempotencyKey: string;
  operation: SyncOperation;
  payload: TPayload;
  createdAt: string;
  attempts: number;
}

export interface PracticeSyncQueuePort {
  enqueue<TPayload>(item: PracticeSyncQueueItem<TPayload>): Promise<void>;
  remove(idempotencyKey: string): Promise<void>;
}
