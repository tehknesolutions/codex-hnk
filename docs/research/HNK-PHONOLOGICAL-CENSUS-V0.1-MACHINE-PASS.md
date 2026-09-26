# HNK PHONOLOGICAL CENSUS V0.1 — MACHINE PASS

Status: RESEARCH / NON-CANONICAL
Date: 2026-09-26

## Implemented

A machine-readable census module now consumes the governed linguistic registries and the current HNK40 runtime without promoting any phonological hypothesis.

It records per form:

- source ID and class;
- authority and certainty;
- transliteration;
- G-ID sequence;
- legacy runtime IPA sequence;
- CV shape using the current runtime vowel inventory;
- segment classification;
- Y-pronunciation review flag;
- bridge isolation flag.

It calculates:

- recovered-only coverage;
- recovered + governed-candidate coverage;
- bridge coverage;
- complete 40-slot runtime coverage;
- unattested runtime capacity;
- frequency by IPA and G-ID;
- Y-bearing forms requiring review.

## Invariants

1. The safe transliteration surface remains 20 units.
2. The legacy runtime remains 40 slots.
3. `KALIFORNIA` remains bridge evidence and `/f/` is not silently added to governed core coverage.
4. Every Y-bearing governed form is flagged for pronunciation review.
5. Glyph and IPA sequence lengths must remain identical per record.

## Important limitation

The CV shape is a mechanical segment-shape observation, not canonical syllabification. No universal syllable grammar, mora grammar, stress rule, phonotactic rule, or final Genesis phoneme inventory is asserted.

## Next gate

Run the module/tests in CI or a checked-out workspace, inspect actual aggregate counts/frequencies, then perform the human review of `Y`, codas/word edges, `TS`, and unattested HNK40 slots before proposing Genesis Core Phonology V0.2.
