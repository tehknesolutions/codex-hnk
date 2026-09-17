export * from "./types.js";
export * from "./datasets.js";
export * from "./tarot-lineage-datasets.js";
export * from "./registry.js";
export * from "./invariants.js";

import { RESEARCH_001_DATASETS } from "./datasets.js";
import { TAROT_LINEAGE_DATASETS } from "./tarot-lineage-datasets.js";
import { CorrespondenceRegistry } from "./registry.js";

export function createResearch001Registry(): CorrespondenceRegistry {
  return new CorrespondenceRegistry([
    ...RESEARCH_001_DATASETS,
    ...TAROT_LINEAGE_DATASETS,
  ]);
}
