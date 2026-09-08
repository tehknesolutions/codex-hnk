# HNK40 V2 — Visual Freeze Pass 1

**Date:** 2026-09-08  
**Source:** `Candidate D`  
**State:** `VISUAL_FROZEN_CANDIDATE_40_OF_40`  
**Official visual canon:** **NO — final human promotion remains required**

## Result

All 40 glyphs pass Freeze Pass 1.

- G01–G40 structural binding unchanged.
- IPA binding unchanged.
- Maximum measured pair similarity: `0.549`
- High-risk similarity pairs: `0`
- Medium-risk similarity pairs: `0`
- 16/24/32/48 px uniqueness/legibility machine gate: `PASS`
- Frozen glyphs: **40/40**
- Failed glyphs: **0**

## Integrity lock

Candidate D's SVG sprite is frozen by SHA-256.

- Sprite SHA-256: `87ee43f3785165397752a21eaceffcda8b3240748125062ca275bf8d46234ca4`
- Ordered G01–G40 set SHA-256: `78668df0f707952b7c280de52526abaa2b7900597fb8ff362a3a08641fd1bce5`

Every G-ID also has an individual SHA-256 in `HNK40_V2_VISUAL_FREEZE_PASS1.json`. Any edit to a frozen symbol invalidates its Freeze Pass 1 state until re-audited.

## Meaning of VISUAL_FROZEN_CANDIDATE

The exact vector forms are stable enough for final visual promotion, font engineering and renderer work.

This does **not** mean:

- recovered legacy glyph;
- assigned Unicode/PUA;
- official font cmap;
- semantic meaning encoded in the shape;
- final official visual canon.

## Next gate

`FINAL_HUMAN_VISUAL_PROMOTION`

After explicit promotion:

1. promote the approved SVG hashes to `VISUAL-CANON-V2`;
2. assign a versioned PUA range;
3. build the HNK40 font;
4. add Web/Expo renderer adapters;
5. render the Master Lexicon with real visual glyphs;
6. run corpus-wide rendering regression.
