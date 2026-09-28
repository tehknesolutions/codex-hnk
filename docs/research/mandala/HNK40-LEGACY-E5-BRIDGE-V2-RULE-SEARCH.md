# HNK40 Legacy → E5 Bridge — V2 Rule Search

Status: RESEARCH_RESULT / NON-CANONICAL
Branch: `research/hnk40-legacy-e5-bridge`

## Question
Can the 36 legacy HNK40 walks with repeated addresses be projected into an E5 N=12 simple path while preserving their encoded geometry?

## V2-A — exact directed edge sequence
Rule under test:
- preserve the exact 11-edge sequence, including ANGULAR_NEXT vs ANGULAR_PREV and RADIAL_OUT vs RADIAL_IN;
- preserve the first address;
- require 12 unique addresses.

Result: **4/40 have exactly one admissible simple path**; these are G01, G11, G21 and G31. The other 36 have zero admissible paths.

This reproduces the V1 direct set and proves that simply replacing revisits while retaining every directed edge instruction cannot solve the remaining 36.

## V2-B — edge-class sequence only
Rule under test:
- preserve only ANGULAR vs RADIAL at each of the 11 positions;
- allow the angular direction (NEXT/PREV) to change;
- allow radial direction (OUT/IN) to change;
- preserve the first address;
- require 12 unique addresses.

Result: **all 40 have candidates, but none is unique**.

Candidate-count distribution:
- 34 candidates: 10 glyphs
- 58 candidates: 10 glyphs
- 68 candidates: 10 glyphs
- 92 candidates: 10 glyphs

Therefore V2-B is too permissive to select an identity without introducing an additional independently justified rule.

## Conclusion
The search establishes a clean boundary:

`EXACT LEGACY EDGE DIRECTIONS + SIMPLE PATH` → 4 direct / 36 impossible.

`EDGE CLASSES ONLY + SIMPLE PATH` → 40 possible / 0 unique.

No candidate is promoted to HNK40 canon by this experiment. No semantic, phonetic, numerological, visual, PUA or transliteration criterion was used.

## Next research gate
Test only **source-derived structural invariants** already present in the HNK40 records, such as endpoint constraints, E1 ordinal continuity, radial-layer profile, angular displacement profile, reversal equivalence, and other explicitly encoded packet fields. Each constraint must be evaluated independently and must not be used as a hidden semantic selector.

A future rule may be accepted only if it is deterministic, reproducible, documented, and does not alter the legacy source.
