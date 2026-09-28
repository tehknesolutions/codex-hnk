# HNK-KODE — Acquisition Curriculum V1

Status: EXPERIMENTAL / EVIDENCE-BASED
Date: 2026-09-28

## Goal

Reduce acquisition cost while preserving the separation between:

- linguistic authority;
- corpus frequency;
- geometric family;
- structural ambiguity;
- semantic binding.

Frequency determines exposure priority only. It does not determine meaning or canon.

## Stage A — shared 90% corpus core

There is exactly **one minimum set of 16 HNK40 glyph identities** that reaches at least 90% token coverage in both:

1. recovered master lexicon;
2. authored candidate registry.

The set is:

`G01 G02 G03 G04 G05 G11 G12 G14 G15 G18 G19 G21 G23 G31 G32 G40`

Coverage:

- recovered master lexicon: **92.31%**
- authored candidates: **90.14%**

Structural coverage inside HNK40:

- 1 coarse family
- 4 topological families
- 5 radial-angular families

This set contains neither G17 nor G20.

## Stage B — complete observed lexicon surface

Expand from 16 to the full **21 CORE_OBSERVED** identities used by the recovered master lexicon.

The remaining observed identities are introduced because they occur in governed language data, not because of geometric novelty.

## Stage C — resolved HNK40 expansion

Add the **17 EXPANSION_RESOLVED** identities:

`G06 G08 G09 G10 G13 G16 G24 G27 G28 G29 G33 G34 G35 G36 G37 G38 G39`

These have resolved E5 structure but are not observed in the recovered master lexicon.

They are suitable for controlled structural/acquisition experiments. They do not automatically receive linguistic meaning.

## Stage D — ambiguous holdout

Keep:

`G17 G20`

as `AMBIGUOUS_HOLDOUT`.

Their candidate sets may be used in experiments, but no single E5 target is fabricated.

## Stage E — family transfer beyond HNK40

HNK40 occupies only:

- 1 / 256 coarse families
- 4 / 11,492 topological families
- 6 / 3,041 radial-angular families

Therefore productive literacy must eventually test forms outside the Genesis neighborhood.

Expansion should sample:

1. new coarse families;
2. new topological families;
3. radial-angular nearest-neighbor contrasts;
4. entire held-out families for transfer tests.

## Exact frequency frontier

Across both corpora simultaneously:

- 80% threshold: minimum 14 glyphs; 700 minimal solutions
- 90% threshold: minimum 16 glyphs; **1 unique minimal solution**
- 95% threshold: minimum 18 glyphs; 7 minimal solutions

The 90% core is therefore a particularly strong non-arbitrary acquisition baseline.

## Evaluation

Measure:

- recognition accuracy;
- production accuracy;
- response time;
- confusion pairs;
- delayed retention;
- transfer to unseen forms;
- family-level generalization;
- rule use vs memorization.

## Canon boundary

This curriculum does not change:

- lexeme authority;
- HNK40 visual authority;
- phoneme authority;
- semantic bindings;
- grammar governance;
- sacred-name governance.

It changes only experimental teaching order.

## Machine artifacts

- `data/acquisition/hnk-language-math-family-coverage.v1.json`
- `data/acquisition/hnk40-language-eligibility.v1.json`
- `data/acquisition/hnk40-acquisition-curriculum-bands.v1.json`
- `data/acquisition/hnk-acquisition-frequency-frontier.v1.json`
- `packages/kodescript/src/acquisition-frequency-frontier.mjs`
