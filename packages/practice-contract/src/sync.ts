import type {
  PracticePersistencePort,
  PracticeSessionSnapshot,
  PracticeSyncQueueItem,
  PracticeSyncQueuePort,
  SavePracticeCommand,
  StartPracticeCommand,
} from "./types.js";

function nowIso(): string {
  return new Date().toISOString();
}

export class PracticeSyncService<TEvidence> {
  constructor(
    private readonly persistence: PracticePersistencePort<TEvidence>,
    private readonly queue: PracticeSyncQueuePort,
  ) {}

  async start(
    command: StartPracticeCommand,
    online: boolean,
  ): Promise<PracticeSessionSnapshot<TEvidence> | null> {
    const key = `practice:start:${command.identity.clientSessionId}`;
    if (!online) {
      const item: PracticeSyncQueueItem<StartPracticeCommand> = {
        idempotencyKey: key,
        operation: "START_SESSION",
        payload: command,
        createdAt: nowIso(),
        attempts: 0,
      };
      await this.queue.enqueue(item);
      return null;
    }

    const result = await this.persistence.start(command);
    await this.queue.remove(key);
    return result;
  }

  async save(
    command: SavePracticeCommand<TEvidence>,
    online: boolean,
  ): Promise<PracticeSessionSnapshot<TEvidence> | null> {
    const key = `practice:save:${command.sessionId}:${command.readyForCompletion ? "ready" : "draft"}`;
    if (!online) {
      const item: PracticeSyncQueueItem<SavePracticeCommand<TEvidence>> = {
        idempotencyKey: key,
        operation: "SAVE_RECORD",
        payload: command,
        createdAt: nowIso(),
        attempts: 0,
      };
      await this.queue.enqueue(item);
      return null;
    }

    const result = await this.persistence.save(command);
    await this.queue.remove(key);
    return result;
  }
}
