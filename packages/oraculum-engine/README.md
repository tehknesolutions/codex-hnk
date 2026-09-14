# @hnk/oraculum-engine

Deterministic candidate runtime for **HNK Oraculum Cube V0.4** plus governed **V0.5 interpretation overlays**.

Status: `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`.

## Boundary

The root export computes reproducible raw oracle data. It does not promote symbolic meanings into HNK language canon and does not claim supernatural certainty or infallible prediction.

`@hnk/glyphs` remains authoritative for G01–G40 identity, phoneme, world ID and runtime visual state. The authored HNK40 oracle registry remains a separate governed layer under `docs/oraculum/registry/` and is not consumed by default.

Interpretation profiles are overlays. Changing `profileId` must never change the raw seed, I Ching state, Path-32, HNK glyph, Tarot index, astrology selectors, alchemy selectors, colors or sigil.

## V0.4 deterministic pipeline

`canonical input -> SHA-256 seed -> fixed bit fields -> unbiased bounded selections -> structured raw result`

Implemented raw fields:

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

## V0.5 interpretation pipeline

Subpath exports:

- `@hnk/oraculum-engine/profiles`
- `@hnk/oraculum-engine/interpretation`

Pipeline:

`raw V0.4 -> explicit profile -> provenance signals -> source/family independence -> convergence/tension report`

Profiles never participate in the V0.4 seed. Changing an interpretation profile therefore cannot mutate raw oracle data.

Current V0.5 convergence categories are `ELEMENT`, `PLANET` and `ZODIAC`. Repeated derivatives from one dependency chain do not become independent evidence. Resulting I Ching signals are phase-separated from the primary reading.

## Canonical state

The V0.4 engine accepts a 54-character base-6 facelet state in canonical `U R F D L B` face order and requires exactly nine instances of every symbol `0..5`.

`RITUAL_32` additionally requires exactly 32 standard face-turn tokens (`U R F D L B`, optional `2` or `'`).

## Locked raw vector

- intent: `Qual padrão precisa se manifestar?`
- solved canonical state: `000000000111111111222222222333333333444444444555555555`
- mode: `STATE`
- seed: `df6bcd1bfd58288fb8f7d7e0f22b69d7e305a24429ba4445c242efc000e3b6fc`

V0.5 must preserve this seed byte-for-byte.

## Locked interpretation expectations

With `HNK_ORACULUM_DEFAULT_V1`:

- Path 24 -> Nun / Death / Scorpio / Water under the Golden Dawn profile;
- Tarot 71 -> Seven of Pentacles / Earth;
- Sagittarius -> Fire;
- primary I Ching 30 -> Li over Li -> Fire;
- independent convergence: `ELEMENT:FIRE`, score `4`, families `ASTROLOGY + ICHING`;
- tensions: `FIRE<->WATER` and `AIR<->EARTH`;
- candidate HNK40 oracle semantics remain `NOT_CONSUMED`.

Any future change that intentionally changes the raw vector must increment the raw protocol/version rather than silently rewriting V0.4 history.
