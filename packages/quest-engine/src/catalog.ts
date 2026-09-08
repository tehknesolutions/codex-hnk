import { QuestRegistry } from "./registry.js";
import type { QuestDefinition } from "./types.js";

export interface QuestDefinitionLoader {
  loadDay(day: number): Promise<QuestDefinition | null>;
}

export class QuestCatalog {
  constructor(
    private readonly loader: QuestDefinitionLoader,
    private readonly registry = new QuestRegistry(),
  ) {}

  async getDay(day: number): Promise<QuestDefinition | null> {
    const cached = this.registry.resolveDay(day);
    if (cached) return cached;

    const loaded = await this.loader.loadDay(day);
    if (!loaded) return null;
    if (loaded.day !== day) {
      throw new Error(`quest_loader_day_mismatch:${day}:${loaded.day}`);
    }

    this.registry.register(loaded);
    return loaded;
  }

  async requireDay(day: number): Promise<QuestDefinition> {
    const definition = await this.getDay(day);
    if (!definition) throw new Error(`quest_not_found:${day}`);
    return definition;
  }

  resolveId(id: string): QuestDefinition | undefined {
    return this.registry.resolveId(id);
  }

  listLoaded(): QuestDefinition[] {
    return this.registry.list();
  }
}

export function createQuestCatalog(loader: QuestDefinitionLoader): QuestCatalog {
  return new QuestCatalog(loader);
}
