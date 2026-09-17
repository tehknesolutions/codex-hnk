import {
  createHnkCanonConsumerSnapshot,
  queryHnkCanon,
  validateHnkCanonContract,
} from "@hnk/canon-contract";

export const GLYPH_ENGINE_HNK_CANON = createHnkCanonConsumerSnapshot("@hnk/glyphs");
export const queryGlyphHnkCanon = queryHnkCanon;
export const validateGlyphHnkCanon = validateHnkCanonContract;
