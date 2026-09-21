# HNK40 KG Visual Provenance Fix V1

The HNK40 structural node materializer reads `HNK40_REFERENCE_MATRIX_V1.json`.

That matrix declares its own visual authority state as `PREPRODUCTION_NOT_OFFICIAL`. It does not itself establish `VISUAL-CANON-V2`.

Therefore matrix-derived HNK_GLYPH nodes must preserve the matrix field as `structural_visual_state` rather than hard-code a separate visual authority.

The independent Visual Canon V2 artifact remains authoritative in its own provenance chain and is not downgraded by this correction.

## Boundary

This change does not alter glyph IDs, phonemes, transliteration, PUA transport, approved compact semantics, visual SVG forms, or HNK40/HENUVOKODAN separation. It only prevents cross-source provenance conflation in the integrated Knowledge Graph.
