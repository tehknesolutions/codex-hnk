import {
  createHnkCanonConsumerSnapshot,
  queryHnkCanon,
  validateHnkCanonContract,
  type HnkCanonQuery,
} from "@hnk/canon-contract";

export const QUEST_ENGINE_HNK_CANON = createHnkCanonConsumerSnapshot("@hnk/quest-engine");

export function queryQuestHnkCanon(query: HnkCanonQuery = {}) {
  return queryHnkCanon(query);
}

export function validateQuestHnkCanon() {
  return validateHnkCanonContract();
}
