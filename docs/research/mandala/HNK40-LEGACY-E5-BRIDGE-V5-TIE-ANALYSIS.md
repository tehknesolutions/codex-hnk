# HNK40 Legacy → E5 Bridge — V5 Tie Analysis

Status: RESEARCH_RESULT / NON-CANONICAL
Branch: research/hnk40-legacy-e5-bridge

## Target
Resolve the two residual V4 ties without introducing an external semantic selector.

Residual ties from V4:
- G17: two candidates, both direction-mismatch = 3 and geometric distance = 30.
- G20: two candidates, both direction-mismatch = 3 and geometric distance = 30.

## Source-internal checks
The following were inspected:
1. repeated-address occurrence positions;
2. first/last occurrence roles;
3. radial depth at repeated occurrences;
4. local turn/reversal state;
5. accumulated angular displacement between radial transitions;
6. four 10-glyph family/block structure;
7. start/end sector relationship.

### Result
No uniquely justified discriminator was established from these fields alone.

G17 tied candidates:
- 02:17 → 03:17 → 03:16 → 04:16 → 04:17 → 04:18 → 04:19 → 03:19 → 03:20 → 03:21 → 03:22 → 02:22
- 02:17 → 03:17 → 03:16 → 04:16 → 04:15 → 04:14 → 04:13 → 03:13 → 03:12 → 03:11 → 03:10 → 02:10

G20 tied candidates:
- 02:20 → 03:20 → 03:21 → 04:21 → 04:22 → 04:23 → 04:24 → 03:24 → 03:25 → 03:26 → 03:27 → 02:27
- 02:20 → 03:20 → 03:21 → 04:21 → 04:20 → 04:19 → 04:18 → 03:18 → 03:17 → 03:16 → 03:15 → 02:15

Both members of each pair satisfy the same V4 objective values.

## Important negative result
The V5 search does not authorize a tie-break by glyph ID ordinal, assumed semantic meaning, phonetics, transliteration, visual resemblance, numerology, PUA code point, or arbitrary lexicographic order.

Choosing one candidate merely to obtain 40 unique projections would be overfitting.

## Current mathematical boundary
- V1: 4 direct E5 / 36 requiring bridge.
- V2-A: exact directed edge preservation cannot bridge the 36.
- V2-B: edge-class preservation gives candidates for all 40 but is highly ambiguous.
- V3: exact endpoints remove candidates for 18 and leave 2 candidates for 18.
- V4: direction mismatch + geometric distance yields 40/40 coverage and 38 unique minima.
- V5: the remaining G17/G20 ties are not resolved by the inspected source-internal fields.

Therefore 38/40 is currently the strongest non-canonical deterministic projection result. The correct state for G17/G20 is DERIVED_AMBIGUOUS, not a guessed assignment.

## Next gate
V6 should inspect whether an independently encoded source field outside PATH geometry, but still part of the verified HNK40 packet/protocol, carries a legitimate identity constraint.

Candidates:
- HNKP2 packet fields beyond decoded path/edges;
- HNKP1 immutable payload fields;
- verified family/packet invariants;
- an existing versioned HNK40↔glyph identity mapping, if one exists.

Any such field must be shown to be identity-bearing independently of the proposed E5 bridge before it can be used as a selector.
