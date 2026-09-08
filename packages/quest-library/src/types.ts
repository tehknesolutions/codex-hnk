import type { QuestDefinition } from '@hnk/quest-engine';

export interface RuntimeCanonBlock {
  id: string;
  kind: string;
  text: string;
  word_count?: number;
  target_words?: number;
  sha256?: string;
}

export interface RuntimeCanonManifest {
  id: string;
  source: {
    day: number;
    blob_sha: string;
    path: string;
    repository: string;
    [key: string]: unknown;
  };
  blocks: RuntimeCanonBlock[];
  [key: string]: unknown;
}

export interface RuntimeQuestBundle {
  day: number;
  quest: QuestDefinition;
  canon: RuntimeCanonManifest;
  pack: Record<string, unknown>;
}

export interface RuntimeQuestBundleLoader {
  loadBundle(day: number): Promise<RuntimeQuestBundle | null>;
}
