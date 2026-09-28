# HNK-KODESCRIPT — Family Expansion Corpus V1

Status: STRUCTURAL_ONLY / EXPERIMENTAL ACQUISITION CORPUS
Date: 2026-09-28

## Objective

Create the first controlled acquisition corpus outside the narrow HNK40 Genesis neighborhood while preserving a strict separation between geometry and linguistic meaning.

The corpus tests whether learners can generalize structural rules to unseen families instead of memorizing individual glyphs.

## Corpus size

Total: **96 representatives**

- TRAIN: **72**
- HOLDOUT: **24**
- train/holdout coarse-family overlap: **0**

The split is therefore a family-transfer split, not a random item split.

## Selection law

The generator is deterministic.

- mathematical seed: `2647892`
- PRNG: `MULBERRY32`
- discovered non-HNK40 coarse-family pool: 120
- deterministic ranking: `FNV1A32_THEN_LEXICOGRAPHIC`
- HNK40 Genesis coarse family excluded
- semantic selection: false

Training:

- 9 discovered pure-MF coarse families;
- 63 mixed MF+CG coarse families.

Holdout:

- 23 additional mixed MF+CG coarse families never seen in training;
- 1 CR:D/D12 representative.

The remaining discovered mixed coarse families are recorded as reserve.

## Structural diversity

Current materialized corpus:

### Train
- 72 coarse families
- 72 topological families
- 71 radial-angular families

### Holdout
- 24 coarse families
- 24 topological families
- 24 radial-angular families

No semantic binding is attached to any representative.

## Why HNK40 is excluded

The HNK40 benchmark remains a separate Genesis/regression corpus.

Its current E5 candidates occupy the coarse family:

`MF_CG|N:12-0-0|E:7-4-0-0-0`

Family Expansion V1 deliberately excludes that coarse family so that success cannot be explained only by exposure to HNK40-like forms.

## Acquisition protocol

Recommended experiment order:

1. teach the current governed language/HNK40 acquisition core;
2. teach structural primitives and family cues using the 72 TRAIN representatives;
3. test recognition and structural classification on TRAIN;
4. present the 24 HOLDOUT representatives without prior item exposure;
5. measure transfer to unseen coarse families;
6. compare performance against nearest-family distractors;
7. keep semantic and phonological binding tasks separate.

## Primary metrics

- component classification;
- coarse-family recognition;
- topological-feature inference;
- radial/angular-feature inference;
- valid-vs-invalid structural discrimination;
- response time;
- confusion pairs;
- delayed retention;
- transfer accuracy on HOLDOUT.

## Success criterion

Evidence for productive KODESCRIPT literacy requires above-baseline performance on HOLDOUT families that were absent from training.

Memorization of training identities alone is not sufficient.

## Canon boundary

Family Expansion V1 does not create:

- new HNK letters;
- new phonemes;
- new words;
- new morphemes;
- new grammatical operators;
- sacred correspondences;
- executable AST/IR bindings.

All representatives remain `STRUCTURAL_ONLY`.

## Machine artifacts

- `data/acquisition/hnk-family-expansion-corpus.v1.json`
- `spec/hnk-family-expansion-corpus.schema.json`
- `packages/kodescript/src/family-expansion-corpus.mjs`
- `packages/kodescript/test/family-expansion-corpus.test.mjs`
