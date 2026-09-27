# HNK40 V1.3 — Assisted Human Review Recommendations

Status: **NON-AUTHORITATIVE / CANONICAL DECISIONS STILL PENDING**

This pass converts the Human Gate evidence into recommendations only. It does **not** promote, reject or freeze any G-ID.

## Result

- KEEP recommended: **26**
- HOLD recommended: **7**
- REVISE recommended: **7**
- REJECT recommended: **0**

## Scale gate

All 40 glyphs remain raster-distinct at **8 px, 10 px, 12 px, 16 px and 24 px** in the current centerline test.

At **6 px**, only 30/40 raster patterns remain unique, producing 7 collision groups.

Therefore **8 px is the current provisional collision-free raster floor**, not a canonical font-size rule.

## REVISE recommended

- **G03** — 11-step PATH collapses to 5 unique visible segments (6 retraced traversals); stroke economy should be improved.
- **G07** — 11-step PATH collapses to 5 unique visible segments (6 retraced traversals); stroke economy should be improved.
- **G10** — 11-step PATH collapses to 5 unique visible segments (6 retraced traversals); stroke economy should be improved.
- **G13** — 11-step PATH collapses to 5 unique visible segments (6 retraced traversals); stroke economy should be improved.
- **G32** — 11-step PATH collapses to 5 unique visible segments (6 retraced traversals); stroke economy should be improved.
- **G33** — 11-step PATH collapses to 4 unique visible segments (7 retraced traversals); stroke economy should be improved.
- **G35** — 11-step PATH collapses to 5 unique visible segments (6 retraced traversals); stroke economy should be improved.

## HOLD recommended

- **G02** — Only 6 unique visible segments with exact orientation-equivalent peer and 6px raster collision.
- **G06** — Only 6 unique visible segments with exact orientation-equivalent peer.
- **G23** — Only 6 unique visible segments with 6px raster collision.
- **G37** — Only 6 unique visible segments with exact orientation-equivalent peer.
- **G38** — Only 6 unique visible segments with exact orientation-equivalent peer and 6px raster collision.
- **G39** — Only 6 unique visible segments with exact orientation-equivalent peer.
- **G40** — Only 6 unique visible segments with exact orientation-equivalent peer.

## KEEP recommended

G01, G04, G05, G08, G09, G11, G12, G14, G15, G16, G17, G18, G19, G20, G21, G22, G24, G25, G26, G27, G28, G29, G30, G31, G34, G36

## Important distinction

The closest structural pairs G12/G19 and G32/G39 do **not** collapse under the raster tests, including 6 px. G12 and G19 therefore receive KEEP recommendations.

G32, however, receives **REVISE** because its 11-step PATH produces only 5 unique visible segments. The issue is stroke economy, not pair identity.

Every canonical decision remains **PENDING / HNK_CANDIDATE** until explicit human KEEP / REVISE / REJECT / HOLD approval.
