# HNK40 Legacy → E5 Bridge — V7 Identity-Provenance Gate

Status: RESEARCH_RESULT / NON-CANONICAL
Branch: research/hnk40-legacy-e5-bridge

## Purpose
Test whether G17 or G20 has an independently governed identity source that can resolve the V5 tie without violating the bridge specification.

## Sources inspected
- data/library/hnk40.oraculum-authored-candidate-relations.v1.json
- data/library/hnk40.approved-semantic-relations.v1.json
- packages/hnk-glyphs/reference/HNK40_REFERENCE_MATRIX_V1.json
- data/library/internal.batch-001.json
- data/library/internal.batch-002.json
- data/library/project-source-gap.batch-004.json
- data/library/hnk40.corpus-relation-recovery.001.json

## Findings
G17 and G20 have approved/source-asserted semantic records, including world, role, geometry, sigil, light and shadow.
G17 is W2_FORMATION / Execution / EDGE-DOWN-RIGHT.
G20 is W2_FORMATION / Listening / EDGE-FRONT-LEFT.
The reference matrix also records their phonemes, world IDs, columns and candidate PUA transport values.

However, the governing HNK40 evidence rules explicitly prohibit selecting an E5 identity from phonetic similarity, transliteration, visual similarity, numerology, PUA, glyph meaning or an ungoverned semantic relation.
The corpus-relation recovery record separately reports zero explicit G01-G40 bindings in the broader project-source corpus and requires an explicit G01-G40 or creator-approved relation source for a new binding.

## Decision
No independently governed G17→E5 or G20→E5 identity relation was located.
The semantic records therefore remain valid HNK40 semantic data, but they cannot legally function as the V5 bridge selector under the current specification.

## Research implication
The next useful experiment is not to force G17/G20 through semantics. It is to determine whether the E5 KODESCRIPT acquisition model should represent legacy ambiguity explicitly.

Candidate architecture:
- LEGACY_IDENTITY: immutable G17/G20 source record;
- E5_PROJECTION_SET: zero, one or multiple derived simple paths;
- RESOLUTION_STATUS: DIRECT / DERIVED_UNIQUE / DERIVED_AMBIGUOUS / NO_E5_PROJECTION / PENDING_RULE;
- ACQUISITION: learn/select only when a separately governed identity constraint exists.

No canonical promotion or semantic reinterpretation is made.