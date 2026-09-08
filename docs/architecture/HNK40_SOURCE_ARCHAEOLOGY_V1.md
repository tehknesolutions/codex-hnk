# HNK40 Source Archaeology v1

**Document:** `HNK40-SOURCE-ARCHAEOLOGY-V1`  
**Date:** 2026-09-08  
**State:** `LEGACY_RUNTIME_MISSING_BUT_EXISTENCE_PROVEN`

## 1. Canon decision

The current structural alphabet remains:

- `G01–G40 = LOCKED`
- `HNK40_VISUAL_SOURCE = NOT_RECOVERED`
- `HNK40_PUA_MAPPING = UNVERIFIED`
- `OFFICIAL_VISUAL_CANON = BLOCKED`
- `SAFE_RENDERING = Gxx_IDS_ONLY`

No Unicode/PUA character, font glyph, SVG, path, sigil, or historical drawing is promoted to an official HNK40 root glyph without direct 1:1 evidence.

## 2. What is proven

### EVID-001 — Sacred 10×4 existed

The frozen HENUVOKODAN Lesson 1 product contains a real **HNK INPUT SYSTEM / Sacred 10×4** UI with:

- world controls;
- a keyboard grid;
- HNK output;
- transliteration output;
- `./hnk-runtime.js` loaded as a dedicated script.

This proves the existence of a physical runtime lineage for the HNK input system. It does **not** expose the runtime contents or the 40 official drawings.

### EVID-002 — Drive language folder has no physical alphabet assets

The current Drive path:

`HENUVOKODAN / PROJETO IDIOMA HNK`

contains only the Google Doc **Criação de Idiomas HNK**.

The document preserves conceptual lineage — phonetic inventory, phonetic grids, IPA, binary encoding and combinatorial language architecture — but it does not provide:

- HNK40 SVGs;
- font outlines;
- PUA codepoints;
- a 40-key map;
- a G01–G40 visual mapping.

### EVID-003 — Public migration upstreams are known

The migration workflow freezes:

- `Tehkne-Solutions/codex-hnk-app@4b63e2916ca2b0c9f654718d27e344851f9718d1`
- `Tehkne-Solutions/hnk-codex-365@4a5a88cc014308d3d2e27b581dd26be70b9d7cf4`

Those public snapshots were inspected and do not expose the legacy HNK40 visual runtime.

### EVID-004 — PACK-00 is a different visual system

`Tehkne-Solutions/hnk-cronicas-obra-viva` contains a HENUVOKODAN PACK-00 candidate visual foundation for the game runtime.

It includes elemental/UI sigils and visual assets. Those are **not evidence of the 40 linguistic alphabet roots**.

Classification:

`PACK00_SIGILS = NON_ALPHABET_VISUAL_LINEAGE`

No PACK-00 elemental sigil may be mapped to `G01–G40` by resemblance or association.

### EVID-005 — Current Flutter packaging is not the legacy static runtime

The inspected HNK English Flutter builds do not expose the legacy Henuvokodan font/runtime as a current standalone asset. This supports the conclusion that the Sacred 10×4 static product belonged to a parallel/legacy packaging lineage.

## 3. Search completed

The following targets were searched across connected sources:

- `hnk-runtime.js`
- `HNK_INPUT_SYSTEM_SPEC.json`
- `HNK_SACRED_10X4_KEYMAP.csv`
- `HNK40_INPUT_MAP.json`
- `hnk-input.mjs`
- `HenuvokodanSimpleAlpha-Regular`
- `Sacred 10x4`
- `HNK INPUT SYSTEM`
- HENUVOKODAN alphabet/glyph/font/runtime variants.

Surfaces checked:

1. ChatGPT File Library.
2. Google Drive HENUVOKODAN folders.
3. `tehknesolutions/codex-hnk` main.
4. Migration and recovery branches.
5. Frozen public upstream repositories.
6. Global public GitHub commit/repository search.
7. `hnk-cronicas-obra-viva`.
8. Vercel `hnk-english-app`.
9. Vercel `codex-hnk-app`.
10. Older Vercel HNK/Shimokodan projects.

## 4. Negative-evidence boundary

The search result is:

`PHYSICAL_VISUAL_SOURCE_NOT_FOUND_IN_CURRENTLY_CONNECTED_SOURCES`

This **does not mean** the source never existed.

Still plausible locations include:

- private `thales-da-vinci/hnk-english-app` Git history;
- a local computer/download/backup;
- an expired CI artifact;
- a ZIP generated in an older ChatGPT execution environment;
- a source archive not currently connected.

## 5. Historical recovery pointers

These names remain recovery targets, not canon:

| Target | State | Priority |
|---|---|---|
| `hnk-runtime.js` | reference proven, physical file missing | P0 |
| `HNK_SACRED_10X4_KEYMAP.csv` | historical metadata only | P0 |
| `HNK40_INPUT_MAP.json` | historical metadata only | P0 |
| `HNK_INPUT_SYSTEM_SPEC.json` | historical metadata only | P1 |
| `hnk-input.mjs` | historical metadata only | P1 |
| `HenuvokodanSimpleAlpha-Regular` | historical metadata only | P0 |

## 6. Explicit exclusions

### Old 12-token HENUVOKODAN PUA

The older 12 portal-token PUA system is a different identifier layer.

**Rule:** never transplant its codepoints onto HNK40.

### PACK-00 sigils

Elemental/game sigils belong to a different visual lineage.

**Rule:** never use them as substitute alphabet glyphs.

## 7. Visual-canon promotion gate

Promotion remains blocked until all conditions pass:

1. Physical source recovered.
2. Exactly 40 unique visual root assets identified.
3. Bijective `G01–G40 ↔ visual asset` mapping proven.
4. 40/40 phoneme compatibility verified or migration exceptions explicitly versioned.
5. PUA/cmap verified from source evidence.
6. Hash and provenance stored for every promoted asset.
7. Cross-render identity test passes.
8. Explicit human visual-canon approval.

Current result:

`0 / 8 promotion gates complete`

## 8. Next recovery order

### P0-A — private repository recovery

Restore source access to `thales-da-vinci/hnk-english-app` and inspect full Git history, tags, deleted paths and build artifacts around the static HENUVOKODAN Lesson 1 product.

### P0-B — local backup search

Search the local machine/backups/downloads for the exact historical filenames and the font family name.

### P1 — recovered font/runtime analysis

If any runtime/font is recovered:

1. hash it;
2. preserve an immutable copy;
3. extract mapping metadata;
4. diff against current `G01–G40`;
5. reject silent renumbering;
6. promote only proven 1:1 identities.

## 9. Final archaeological classification

`LEGACY_RUNTIME_MISSING_BUT_EXISTENCE_PROVEN`

The alphabet structure is not lost. What is missing is the **physical visual implementation source** that once rendered the Sacred 10×4 system.
