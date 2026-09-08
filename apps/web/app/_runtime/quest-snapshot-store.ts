'use client';

import { decodeQuestSnapshot, encodeQuestSnapshot, type QuestSnapshotStore } from '@hnk/quest-engine';

export function createWebQuestSnapshotStore(): QuestSnapshotStore {
  return {
    async load(key) {
      if (typeof window === 'undefined') return null;
      const value = window.localStorage.getItem(key);
      return value ? decodeQuestSnapshot(value) : null;
    },
    async save(key, snapshot) {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, encodeQuestSnapshot(snapshot));
    },
    async remove(key) {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    },
  };
}
