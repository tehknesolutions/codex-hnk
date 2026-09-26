# HNK Mandala — Computable V1 Final Analysis

Status: **STRUCTURAL ANALYSIS SUBSTANTIALLY COMPLETE / COMPUTABLE V1 CANDIDATE FREEZE**

## Executive result

The analysis no longer treats the source as an arbitrary raster. The P0 Mandala resolves into three addressable domains:

1. **Outer 72-sector machine** — 72 numbered sectors, 5° each.
2. **Six per-sector radial data layers + nine choir/sefirah group cells** — this yields the source-layout count **6×72 + 9 = 441**.
3. **Central Rose** — a distinct **3 + 7 + 12 = 22** petal topology.

Therefore the current major-field address space is **441 + 22 = 463 fields**, excluding the hierarchical central core and separator strokes. This is an address-space count, **not yet a canonical AK count**.

## Geometric lock

P0 source: `HNK-MANDALA-SRC-0002`
SHA-256: `7ebf953481cdc0e09de44755bfae45044cb391c799a8ddb0d571ed43e0621ac9`
Dimensions: 900×900.
Measured center: (449.5, 449.5).
Outer radius: ~449 px.

Angular convention: 0° East, positive counterclockwise.
Sector 01 starts at 90°; every sector spans 5°.
Each choir contains 8 sectors = 40°.

## The 441 outer-layout result

Measured sectorized boundaries (px):
168.5 → 190.5 → 208.5 → 231.5 → 310.5 → 387.5 → 419.5.

These produce **six per-sector radial layers**. A direct occupancy test against the measured group background found non-background content in **all 72 ideal sector windows in all six layers** (>10% occupancy for every sector in every layer).

The outer band 419.5–449 px resolves into **nine 40° choir/sefirah cells**.

Derived layout count:
`6 × 72 + 9 = 441`.

**H-441 is promoted to SUPPORTED_AS_OUTER_LAYOUT_BLOCK_COUNT.**
It must not be misread as “441 canonical Atomic-Kodes”.

## Outer ring semantics

- L01 — inner symbolic band A — geometry locked; exact symbol semantics unresolved.
- L02 — inner symbolic band B — geometry locked; exact symbol semantics unresolved.
- L03 — numeric 01–72 band.
- L04 — Latin/transliterated angel-name band.
- L05 — Hebrew angel-name band.
- L06 — outer symbolic/astrological band — partially resolved.
- G — 9 choir + sefirah + meaning cells.

The nine group labels are:
Serafins/Keter/Coroa; Querubins/Chokhmah/Sabedoria; Tronos/Binah/Inteligência; Dominações/Chesed/Misericórdia; Potestades/Gevurah/Julgamento; Virtudes/Tiphereth/Beleza; Principados/Netzach/Vitória; Arcanjos/Hod/Verdade; Anjos/Yesod/Fundamento.

## The 22-petal Rose result

The earlier “wedge closure” test was too restrictive because the source petals are curved compositional regions, not rectangular annular wedges.

Independent evidence now converges on:
- 3 inner primary-color regions;
- 7 middle regions;
- 12 outer chromatic regions.

The source also matches the known Hermetic Rose-Cross / Sefer Yetzirah 3 Mothers + 7 Doubles + 12 Simples framework.

**H-22 is promoted to SUPPORTED_AS_CENTRAL_ROSE_COMPOSITION.**

The 3 Mothers have a strong source-color match:
- red → Shin / Fire;
- yellow → Aleph / Air;
- cyan-blue → Mem / Water.

The exact rotational assignment of the 7 Doubles and 12 Simples to SRC-0002 petal IDs remains correspondence-layer work; it does not block geometry.

## Central core

The raster visibly contains:
- white central field;
- red five-petal rose;
- four green diagonal rays;
- a gold cross with four visible arms.

Golden Dawn Rose-Cross descriptions identify the corresponding central construction as a white center bearing a red five-petal rose, a golden cross of six squares, and four green rays. Because the raster is occluded by the rose, the core remains hierarchical instead of being forced into the 463-field major grid.

## Final hypothesis adjudication

- H-72: **SUPPORTED** — source-numbered 72 sectors, 5° each, plus cross-source periodic confirmation.
- H-441: **SUPPORTED_AS_OUTER_LAYOUT_BLOCK_COUNT** — 6×72+9.
- H-22: **SUPPORTED_AS_CENTRAL_ROSE_COMPOSITION** — 3+7+12.
- 463: **DERIVED_MAJOR_ADDRESS_SPACE** — 441 outer blocks +22 rose petals, core excluded.
- Canonical AK count: **NOT YET FROZEN** — requires a governance decision on whether every layout block, rose petal, and/or core primitive becomes an AK.

## What is truly unfinished

No major geometric question remains blocking.

The remaining work is semantic/correspondence extraction:
exact identities of L01/L02/L06 symbols, exact source spellings/transliterations, exact petal-letter rotation for 7/12, core sub-addressing policy, and any sound/frequency system. None of these should be fabricated from the image.

## Next state

G3 Structural Census: **PASS FOR COMPUTABLE V1**.
G4 Atomic-Kode Assignment: **OPEN FOR CANDIDATE ADDRESSING**.

The next project phase can now legitimately build:
Mandala Field → AK candidate → path → HNK glyph → Pixel → IsoPixel/Voxel → BIN/HEX → QR transport → I-Ching/trigram candidate layer → color/sound/correspondence graph.
