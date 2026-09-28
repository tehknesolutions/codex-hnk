# HNK-KODESCRIPT — Language Eligibility V1

Status: EXPERIMENTAL POLICY / NO AUTOMATIC SEMANTICS
Date: 2026-09-28

## Objective

Separate two questions that must not be conflated:

1. Can a geometric identity safely participate in language/acquisition experiments?
2. Is that identity authorized to carry a linguistic binding?

Geometry can answer the first only at the structural level. The second requires explicit HNK-KODE authority and provenance.

## Structural eligibility

### STRUCTURAL_EXPERIMENT_READY
Use when an N=12 identity has exactly one resolved structural projection suitable for experiment.

### AMBIGUOUS_EXPERIMENT_SET
Use when multiple structurally valid candidates remain. The candidate set may be tested, but a single canonical target must not be fabricated.

### BLOCKED_STRUCTURAL
Use when no usable structural projection exists.

## Binding readiness

Independent from structural eligibility:

- NO_BINDING
- EXPERIMENTAL_BINDING_CANDIDATE
- HUMAN_REVIEW_REQUIRED
- CANON_BINDING

A CANON_BINDING additionally requires:

- resolved structural identity;
- explicit linguistic source or author decision;
- provenance source/decision/version;
- promotable namespace;
- non-empty linguistic payload;
- conflict check;
- tests.

## HNK40 result

Current HNK40 E5 acquisition data produces:

- 38 STRUCTURAL_EXPERIMENT_READY
- 2 AMBIGUOUS_EXPERIMENT_SET — G17 and G20
- 0 BLOCKED_STRUCTURAL
- 0 automatic canonical bindings
- 0 automatic semantic assignments

## Current language dependency

The recovered master lexicon and authored candidate registry use neither G17 nor G20.

Therefore current HENUVOKODAN development is not blocked by the two ambiguous HNK40 E5 identities.

## Curriculum bands

Evidence-based HNK40 partition:

- CORE_OBSERVED: 21
- EXPANSION_RESOLVED: 17
- AMBIGUOUS_HOLDOUT: 2
- BLOCKED: 0

CORE_OBSERVED means resolved E5 identity + actual use in the recovered master lexicon.

EXPANSION_RESOLVED means structurally resolved but not observed in the recovered master lexicon.

AMBIGUOUS_HOLDOUT preserves G17/G20 for controlled testing rather than force-resolution.

## Canon boundary

Eligibility is not meaning.

A structurally eligible identity does not automatically become:

- a letter;
- a phoneme;
- a lexeme;
- a morpheme;
- a grammar marker;
- a sacred name;
- an AST/IR operation.

Those require separate governed bindings.

## Machine artifacts

- `spec/kodescript-language-eligibility.v1.json`
- `spec/kodescript-language-eligibility.schema.json`
- `packages/kodescript/src/language-eligibility.mjs`
- `data/acquisition/hnk40-language-eligibility.v1.json`
- `data/acquisition/hnk40-acquisition-curriculum-bands.v1.json`
- `data/acquisition/hnk-language-math-family-coverage.v1.json`
