import * as SecureStore from 'expo-secure-store';
import { decodeQuestSnapshot, encodeQuestSnapshot, type QuestSnapshotStore } from '@hnk/quest-engine';

export function createMobileQuestSnapshotStore(): QuestSnapshotStore {
  return {
    async load(key) {
      const value = await SecureStore.getItemAsync(key);
      return value ? decodeQuestSnapshot(value) : null;
    },
    async save(key, snapshot) {
      await SecureStore.setItemAsync(key, encodeQuestSnapshot(snapshot));
    },
    async remove(key) {
      await SecureStore.deleteItemAsync(key);
    },
  };
}
