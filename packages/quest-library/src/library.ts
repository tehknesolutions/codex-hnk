import type { QuestDefinition, QuestDefinitionLoader } from '@hnk/quest-engine';
import day001QuestJson from '../../../docs/experience/kether/day-001/day-001.quest.json';
import day001CanonJson from '../../../docs/experience/kether/day-001/day-001.canon-blocks.json';
import day001PackJson from '../../../docs/experience/kether/day-001/day-001.quest-pack.json';
import day002QuestJson from '../../../docs/experience/kether/day-002/day-002.quest.json';
import day002CanonJson from '../../../docs/experience/kether/day-002/day-002.canon-blocks.json';
import day002PackJson from '../../../docs/experience/kether/day-002/day-002.quest-pack.json';
import type { RuntimeCanonManifest, RuntimeQuestBundle, RuntimeQuestBundleLoader } from './types.js';

function asQuest(value: unknown): QuestDefinition {
  return value as QuestDefinition;
}

function asCanon(value: unknown): RuntimeCanonManifest {
  return value as RuntimeCanonManifest;
}

function asPack(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>;
}

const BUNDLES = new Map<number, RuntimeQuestBundle>([
  [1, {
    day: 1,
    quest: asQuest(day001QuestJson),
    canon: asCanon(day001CanonJson),
    pack: asPack(day001PackJson),
  }],
  [2, {
    day: 2,
    quest: asQuest(day002QuestJson),
    canon: asCanon(day002CanonJson),
    pack: asPack(day002PackJson),
  }],
]);

function validateBundle(bundle: RuntimeQuestBundle): RuntimeQuestBundle {
  if (bundle.quest.day !== bundle.day) throw new Error(`quest_library_day_mismatch:${bundle.day}`);
  if (bundle.canon.source.day !== bundle.day) throw new Error(`quest_library_canon_day_mismatch:${bundle.day}`);
  if (bundle.quest.canonical.source_sha !== bundle.canon.source.blob_sha) {
    throw new Error(`quest_library_source_sha_mismatch:${bundle.day}`);
  }
  return bundle;
}

export class BundledQuestLibrary implements RuntimeQuestBundleLoader, QuestDefinitionLoader {
  async loadBundle(day: number): Promise<RuntimeQuestBundle | null> {
    const bundle = BUNDLES.get(day);
    return bundle ? validateBundle(bundle) : null;
  }

  async loadDay(day: number): Promise<QuestDefinition | null> {
    return (await this.loadBundle(day))?.quest ?? null;
  }

  listAvailableDays(): number[] {
    return [...BUNDLES.keys()].sort((a, b) => a - b);
  }
}

export function createBundledQuestLibrary(): BundledQuestLibrary {
  return new BundledQuestLibrary();
}
