# HNK40 Visual Migration Diff v1

Status: `VISUAL_SOURCE_BLOCKED`  
Date: `2026-09-08`

## Decision

The current HNK40 structural namespace is locked as `G01–G40`. The visual layer is **not** canonized yet.

A frozen HENUVOKODAN Lesson 1 product proves that a real **HNK INPUT SYSTEM / Sacred 10×4** UI existed and loaded `./hnk-runtime.js`. However, the runtime, font/SVG/path source, and verified PUA mapping have not been recovered.

Therefore:

- `HNK40_STRUCTURAL_IDS = LOCKED`
- `HNK40_VISUAL_REGISTRY = BLOCKED`
- `HNK40_PUA_MAPPING = UNVERIFIED`
- `OFFICIAL_GLYPH_DRAWINGS = NOT_RECOVERED`
- `SAFE_RENDERING = Gxx_IDS_ONLY`

## Non-invention rule

No Unicode/PUA character, font glyph, SVG, path, or drawn symbol may be labeled as the official HNK40 visual glyph until the source is recovered and a 1:1 mapping to the current `G01–G40` registry is proven.

## Migration targets

1. Recover `hnk-runtime.js`.
2. Search for `HNK_SACRED_10X4_KEYMAP.csv`.
3. Search for `HNK40_INPUT_MAP.json`.
4. Search for `HNK_INPUT_SYSTEM_SPEC.json`.
5. Search for `hnk-input.mjs`.
6. Search for the historical `HenuvokodanSimpleAlpha-Regular` source/metadata.
7. Extract any recovered font cmap / SVG IDs / path IDs.
8. Diff recovered order and phonemes against current `G01–G40`.
9. Require bijection: exactly one visual asset per root ID and exactly one root ID per visual asset.
10. Record source hash and migration decision before any `VISUAL-CANON` promotion.

## Promotion gates

- physical source recovered;
- exactly 40 unique root glyph assets;
- bijective `G01–G40 ↔ visual asset` binding;
- 40/40 phoneme compatibility or explicit versioned migration exceptions;
- verified PUA/cmap mapping before assigning codepoints;
- source hashes and provenance;
- cross-render validation;
- explicit human visual-canon approval.

## Governance alignment

This follows the existing `HNK_VISUAL_CONTRACT_V1` principle: presentation geometry or an asset appearing in an older experience does not automatically make it canon. Provenance and explicit promotion are required.
