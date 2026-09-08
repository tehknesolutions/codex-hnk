import type { QuestDefinition } from "./types.js";

export class QuestRegistryError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "QuestRegistryError";
  }
}

export interface QuestRegistryEntry {
  definition: QuestDefinition;
}

export class QuestRegistry {
  readonly #byDay = new Map<number, QuestDefinition>();
  readonly #byId = new Map<string, QuestDefinition>();

  constructor(definitions: Iterable<QuestDefinition> = []) {
    for (const definition of definitions) this.register(definition);
  }

  register(definition: QuestDefinition): void {
    if (!Number.isInteger(definition.day) || definition.day < 1 || definition.day > 365) {
      throw new QuestRegistryError("invalid_day", `Invalid quest day: ${definition.day}`);
    }
    if (!definition.id.trim()) {
      throw new QuestRegistryError("quest_id_required", "Quest id is required");
    }

    const currentDay = this.#byDay.get(definition.day);
    if (currentDay && currentDay.id !== definition.id) {
      throw new QuestRegistryError(
        "day_collision",
        `Day ${definition.day} is already registered as ${currentDay.id}`,
      );
    }

    const currentId = this.#byId.get(definition.id);
    if (currentId && currentId.day !== definition.day) {
      throw new QuestRegistryError(
        "id_collision",
        `Quest ${definition.id} is already registered for day ${currentId.day}`,
      );
    }

    this.#byDay.set(definition.day, definition);
    this.#byId.set(definition.id, definition);
  }

  resolveDay(day: number): QuestDefinition | undefined {
    return this.#byDay.get(day);
  }

  requireDay(day: number): QuestDefinition {
    const definition = this.resolveDay(day);
    if (!definition) {
      throw new QuestRegistryError("quest_not_registered", `No quest registered for day ${day}`);
    }
    return definition;
  }

  resolveId(id: string): QuestDefinition | undefined {
    return this.#byId.get(id);
  }

  requireId(id: string): QuestDefinition {
    const definition = this.resolveId(id);
    if (!definition) {
      throw new QuestRegistryError("quest_not_registered", `No quest registered with id ${id}`);
    }
    return definition;
  }

  hasDay(day: number): boolean {
    return this.#byDay.has(day);
  }

  list(): QuestDefinition[] {
    return [...this.#byDay.values()].sort((a, b) => a.day - b.day);
  }
}

export function createQuestRegistry(definitions: Iterable<QuestDefinition>): QuestRegistry {
  return new QuestRegistry(definitions);
}
