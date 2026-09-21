# HNK-40 Knowledge Graph Nodes V1

The integrated graph builder now materializes the 40 source-backed entries from `packages/hnk-glyphs/reference/HNK40_REFERENCE_MATRIX_V1.json` as first-class `HNK_GLYPH` nodes.

Each node carries only evidence already present in that registry: `glyph_id`, IPA phoneme, W1–W4 world, protoglyph column, safe transliteration when present, candidate PUA transport value, and the recovered `VISUAL-CANON-V2` authority marker.

This pass deliberately creates **no semantic edges** from glyphs to HNK domains, concepts, sources, Sephirot, paths, languages, or initiatic correspondences. Those links require separately governed evidence.

Invariant:

`40 glyph nodes ≠ 40 inferred correspondences`

HNK-40 remains distinct from HENUVOKODAN.
