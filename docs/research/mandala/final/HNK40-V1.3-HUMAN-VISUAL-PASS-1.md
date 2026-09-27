# HNK40 V1.3 — Human Visual Pass 1

Status: **PENDING HUMAN DECISION**

The V1.3 machine gate is complete: 40 ordered PATHs, 40 edge signatures, 40 static-visible shapes, minimum edge distance 3.

This pass is intentionally visual. It does not assign language or meaning.

## Review order

### A. Structural nearest pairs
1. G12 / G19 — CRITICAL — score 34
2. G32 / G39 — CRITICAL — score 34
3. G22 / G29 — HIGH — score 38
4. G35 / G37 — HIGH — score 40
5. G36 / G38 — HIGH — score 40

### B. Exact transform-equivalent pairs
1. G02 / G06 — mx, my
2. G03 / G13 — r180, mx
3. G07 / G10 — r180, mx
4. G08 / G09 — mx
5. G17 / G20 — mx
6. G18 / G19 — mx
7. G27 / G30 — mx
8. G28 / G29 — mx
9. G37 / G40 — mx
10. G38 / G39 — mx

## Human checks for each pair

- Can the two be identified instantly at normal reading size?
- Does either collapse when reduced?
- Is identity concentrated in a tiny terminal feature?
- Does mirror/rotation create a plausible reading error?
- Is stroke economy acceptable?
- Does the glyph remain balanced as a standalone mark?
- Does the form survive Pixel / IsoPixel / Voxel projection?

Allowed decisions: **KEEP / REVISE / REJECT / HOLD**.

Until an explicit human decision is recorded, every G-ID remains **PENDING / HNK_CANDIDATE**.
