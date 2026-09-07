import type { CompleteDayRequestV1, CompletionResult } from "./types.js";

export interface QueuedCompletion {
  request: CompleteDayRequestV1;
  queuedAt: string;
  attempts: number;
}

export interface CompletionQueueStore {
  put(item: QueuedCompletion): Promise<void>;
  remove(clientCompletionId: string): Promise<void>;
  list(): Promise<QueuedCompletion[]>;
}

export function shouldKeepQueued(result: CompletionResult): boolean {
  return !result.ok && result.retryable;
}

export function shouldRemoveFromQueue(result: CompletionResult): boolean {
  return result.ok || (!result.ok && !result.retryable);
}
