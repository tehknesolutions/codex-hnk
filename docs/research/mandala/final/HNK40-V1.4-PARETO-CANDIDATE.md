# HNK40 V1.4 — Pareto Candidate

Status: **EXPERIMENTAL / HUMAN COMPARISON REQUIRED**

V1.4 does not replace V1.3 automatically.

## Structural comparison

| Metric | V1.3 | V1.4 |
|---|---:|---:|
| Static-visible unique shapes | 40 | 40 |
| Minimum edge distance | 3 | **3** |
| Minimum visible segments | 4 | **6** |
| Total visible segments | 313 | **361** |
| Exact orientation-equivalent pairs | **10** | 12 |
| Raster unique at 8px | 40 | 40 |

V1.4 eliminates every 4–5 segment high-retrace case and preserves 40/40 raster identities at 8px. The cost is two additional exact mirror/rotation relationships.

## Current 6-segment floor

- G13
- G23
- G33

## Governance

No semantic assignment. No glyph promotion. V1.3 remains the current preferred structural family until the Human Gate explicitly chooses V1.4 or keeps V1.3.
