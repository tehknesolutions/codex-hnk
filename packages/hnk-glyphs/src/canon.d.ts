import type { HnkCanonConsumerSnapshot, HnkCanonEntry, HnkCanonQuery, HnkCanonValidation } from "@hnk/canon-contract";

export const GLYPH_ENGINE_HNK_CANON: HnkCanonConsumerSnapshot;
export function queryGlyphHnkCanon(query?: HnkCanonQuery): HnkCanonEntry[];
export function validateGlyphHnkCanon(): HnkCanonValidation;
