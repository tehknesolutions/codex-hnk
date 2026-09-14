# @hnk/oraculum-engine

Deterministic candidate runtime for **HNK Oraculum Cube V0.4**.

Status: `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`.

## Boundary

This package computes reproducible oracle data. It does not promote symbolic meanings into HNK language canon and does not claim supernatural certainty or infallible prediction.

`@hnk/glyphs` remains authoritative for G01–G40 identity, phoneme, world ID and runtime visual state. The authored oracle registry remains a separate governed layer under `docs/oraculum/registry/`.

## Deterministic pipeline

`canonical input -> SHA-256 seed -> fixed bit fields -> unbiased bounded selections -> structured raw result`

Implemented fields:

- 6 I Ching line states from B000–B011, bottom to top;
- Path-32 from B012–B016;
- G01–G40 from B017–B022 with rejection sampling;
- Tarot index 1–78 from B023–B029 with rejection sampling;
- Zodiac 1–12 and seven classical planets;
- four-element computational current;
- Tria Prima selector and four-phase selector;
- numerology raw value 1–256;
- Essence / Shadow / Manifestation HEX colors;
- reserved synthesis vector and derivation reservoir;
- 16-point 16×16 raw sigil path from B128–B255.

## Canonical state

The V0.4 engine accepts a 54-character base-6 facelet state in canonical `U R F D L B` face order and requires exactly nine instances of every symbol `0..5`.

`RITUAL_32` additionally requires exactly 32 standard face-turn tokens (`U R F D L B`, optional `2` or `'`).

## Reproducibility

The locked test vector is:

- intent: `Qual padrão precisa se manifestar?`
- solved canonical state: `000000000111111111222222222333333333444444444555555555`
- profile: `HNK_ORACULUM_DEFAULT_V1`
- mode: `STATE`
- seed: `147a32d82ac5d72d65b9e0e912db069e42c03ca98c47f17d76cd7162fbd02b4a`

Any future change that intentionally changes this vector must increment the protocol/version rather than silently rewriting V0.4 history.
