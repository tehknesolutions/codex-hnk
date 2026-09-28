# HNK40 Legacy → E5 Bridge — V4 Source-Internal Lift Search

Status: RESEARCH_RESULT / NON-CANONICAL
Branch: `research/hnk40-legacy-e5-bridge`

## V4-A — endpoint-preserving candidates + geometric distance

Using the exact endpoint constraint from V3 and Manhattan distance on the Mandala coordinates, the 18 glyphs with candidates each resolve to a unique minimum; the other 18 have no candidate. This confirms that endpoint preservation is informative but insufficient for 40/40.

## V4-B — direction agreement + geometric distance, without endpoint preservation

This test searches the full V2-B candidate space:

1. preserve the legacy start address;
2. preserve ANGULAR vs RADIAL class at every edge position;
3. require a simple N=12 path;
4. score each candidate first by the number of direction mismatches against the legacy edge directions (NEXT/PREV and OUT/IN);
5. break equal direction scores by total cyclic Mandala Manhattan distance to the legacy path.

This is deliberately treated as a **research heuristic**, not as a canonical rule.

### Result

- **40/40** receive at least one candidate.
- **38/40** receive a unique minimum under the two-stage score.
- **2/40** remain tied: **G17 and G20**.
- **4/40** have score 0/0: G01, G11, G21 and G31; their original simple paths are recovered.
- No semantic, phonetic, numerological, visual, PUA or transliteration information is used.
- The legacy source is not mutated.

This is the first tested structural search that reaches 40/40 coverage while reducing the solution space to a single candidate for 95% of the corpus.

## Interpretation

This does **not** prove that direction-mismatch + Manhattan distance is the HNK40 acquisition rule. It proves that the existing geometric data contain enough structure to nearly determine an E5 simple path under a reproducible optimization model.

The remaining G17/G20 tie is valuable: it gives a controlled falsification target for V5. We should not invent a tie-breaker merely to reach 40/40.

## V5 target

Inspect only source-internal invariants that can distinguish the G17/G20 tied candidates, in this order:

1. occurrence-index correspondence;
2. repeated-address role and first/last occurrence state;
3. radial depth at repeated occurrences;
4. local turn/reversal state;
5. accumulated angular displacement between radial transitions;
6. family-level invariants shared by the 10-glyph block.

A V5 rule is acceptable only if it distinguishes G17/G20 without creating new ambiguity elsewhere and remains deterministic, reproducible and non-semantic.
