# HNK40 Comparative Reference Layer

This directory hosts comparative research artifacts for the 40 authoritative HNK glyph IDs (`G01`–`G40`). It does **not** replace the runtime authority in `../src/index.mjs` and does not independently promote visual, phonological, lexical, grammatical, semantic, or initiatic canon.

## Current artifact

`HNK40_REFERENCE_MATRIX_V1.json` is a governed scaffold for comparing HENUVOKODAN with selected reference systems while preserving category boundaries.

The initial reference systems are:

- Biblical Hebrew;
- Koine Greek;
- Japanese kana;
- Esperanto.

They are reference/comparison systems for HNK language research. Their presence here does not create or imply separate SimpleWay courses.

## Five distinct comparison layers

1. **Phonetic nearest-neighbor** — compare attested sounds through IPA or an explicitly documented approximation.
2. **Graphemic/orthographic reference** — record how another writing system represents the relevant sound or sound sequence.
3. **Semantic reference** — only where a semantic comparison is actually relevant and evidenced; phonetic similarity never creates semantic equivalence.
4. **Symbolic/initiatic correspondence** — maintained separately from linguistic evidence and subject to its own governance.
5. **Digital encoding** — candidate PUA, transport transliteration, hexadecimal and binary representation. These are encodings, not language equivalents.

## Governance

- `@hnk/glyphs` remains authoritative for glyph IDs, IPA assignment, candidate PUA and safe transliteration.
- Reference mappings begin as `PENDING_RESEARCH` and may not be guessed merely to complete the table.
- A reference-language form never becomes an HNK form by similarity.
- Approximation must be labeled as approximation; exact and nearest-neighbor matches must not be conflated.
- Symbolic or initiatic readings must never overwrite phonetic or historical evidence.
- Numerology and glyph appearance may be recorded in a separate symbolic layer but may not select phonemes or linguistic mappings.
- The candidate PUA range is transport-only and is not an official Unicode allocation.
- HNK lexical authority remains under `@hnk/linguas`; this reference layer must not silently create lexemes.

## Intended research flow

`HNK40 runtime → reference evidence → reviewed mapping → comparative matrix → downstream HNK language research`

A future mapping record should preserve at minimum: source language, form/script, IPA or pronunciation evidence, match type (`EXACT`, `NEAREST`, `SEQUENCE`, `NONE`), confidence, source/provenance, and notes on historical pronunciation where relevant.

The matrix is intentionally incomplete until those mappings are researched and reviewed.
