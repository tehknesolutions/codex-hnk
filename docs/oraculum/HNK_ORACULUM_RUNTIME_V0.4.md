# HNK ORACULUM — DETERMINISTIC RUNTIME V0.4

**ID:** `HOC-RUNTIME-V0.4`  
**Status:** `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`  
**Runtime package:** `@hnk/oraculum-engine`  
**Glyph identity authority:** `@hnk/glyphs`

## 1. Purpose

V0.4 turns the authored HNK Oraculum specification into a reproducible computational core. It produces structured symbolic data; it does not make an infallible supernatural-prediction claim.

## 2. Raw / profile separation

The raw consultation must be invariant under interpretation-profile changes.

Pipeline:

`INTENT + CUBE + MODE/MOVES -> RAW COMMIT -> SHA-256 -> RAW ORACLE -> PROFILE OVERLAY -> INTERPRETATION`

`profileId` is metadata and is deliberately excluded from the raw commit.

This supersedes the earlier candidate serialization that placed `PROFILE_ID` inside the seed input. That older candidate behavior is not promoted to canon.

## 3. Raw commit

Canonical format:

`HNK-ORACULUM-CUBE/V0.4|MODE|INTENT|CUBE_STATE|MOVES`

- `INTENT`: Unicode NFKC, trim, whitespace collapsed.
- `CUBE_STATE`: 54 base-6 facelet digits in `U R F D L B` face order, exactly nine of each digit `0..5`.
- `STATE`: `MOVES = NULL`.
- `RITUAL_32`: exactly 32 standard `U R F D L B` Singmaster face turns, optional `2` or `'`.

The separator `|` is reserved and therefore forbidden inside the V0.4 normalized intent.

## 4. Seed

`SEED256 = SHA256(RAW_COMMIT)`

Output forms:

- 256 binary bits;
- 32 bytes;
- 64 hexadecimal digits.

## 5. Locked bit map

| Bits | Field |
|---|---|
| B000–B011 | six 2-bit I Ching line states |
| B012–B016 | Path-32 |
| B017–B022 | HNK G01–G40 selector |
| B023–B029 | Tarot 1–78 selector |
| B030–B033 | Zodiac 1–12 selector |
| B034–B036 | Classical planet 1–7 selector |
| B037–B038 | computational element |
| B039–B040 | Tria Prima selector |
| B041–B042 | alchemical phase selector |
| B043–B050 | numerology raw 1–256 |
| B051–B074 | Essence HEX color |
| B075–B079 | reserved HNK synthesis vector |
| B080–B127 | derivation reservoir |
| B128–B255 | 16-point 16×16 raw sigil |

## 6. Rejection sampling

Selectors whose target cardinality is not a power of two never use `% target` modulo reduction.

If the master-bit candidate is outside the legal range, V0.4 derives:

`SHA256(SEED256 + "|RETRY|" + FIELD_NAME + "|" + COUNTER)`

and consumes the same field width from the retry digest until a legal value appears.

This applies to 40 glyphs, 78 Tarot cards, 12 zodiac fields, 7 planets and 3 alchemical principles.

## 7. I Ching encoding

Line order is bottom to top.

- `00` = Yin moving
- `01` = Yin static
- `10` = Yang static
- `11` = Yang moving

The lower trigram uses lines 1–3; the upper trigram uses lines 4–6.

The runtime keeps the 6-bit binary state and King Wen number as distinct fields. King Wen numbering is a lookup over the lower/upper trigram pair; it is not treated as the binary index itself.

## 8. HNK boundary

The selected G-ID is resolved through `@hnk/glyphs`.

The runtime may expose the authoritative glyph ID, IPA, runtime world and current visual-state flag, but oracle semantics remain in the separate authored registry. V0.4 cannot rewrite phonology, transliteration, lexicon, grammar or glyph identity.

## 9. Colors

Essence is the raw 24-bit RGB value from B051–B074.

- `SHADOW = 0xFFFFFF XOR ESSENCE`
- `MANIFESTATION = RGB -> GBR` byte rotation

These transforms are integer/byte exact and portable across runtimes.

## 10. Source-chain independence

The engine exposes `dedupeSourceChains(signals)` for later convergence scoring.

Multiple claims derived from the same dependency chain contribute at most one independent chain signal. This prevents a single Hermetic mapping chain from being counted as several independent confirmations.

## 11. Locked golden vector

Input:

- intent: `Qual padrão precisa se manifestar?`
- cube: `000000000111111111222222222333333333444444444555555555`
- mode: `STATE`

Raw commit:

`HNK-ORACULUM-CUBE/V0.4|STATE|Qual padrão precisa se manifestar?|000000000111111111222222222333333333444444444555555555|NULL`

Seed:

`df6bcd1bfd58288fb8f7d7e0f22b69d7e305a24429ba4445c242efc000e3b6fc`

Locked decoded checks include:

- Path-32 = `24`
- HNK = `G39`
- Tarot index = `71`
- Zodiac = `SAGITTARIUS` after 1 rejection retry
- Planet = `MARS` after 1 rejection retry
- Element = `AIR`
- Alchemical principle = `SALT`
- Alchemical phase = `CITRINITAS`
- Numerology raw = `194`
- Essence = `#447DC7`
- Shadow = `#BB8238`
- Manifestation = `#7DC744`
- I Ching primary = Li over Li = King Wen `30`
- Moving lines = `1, 3, 4`
- I Ching resulting = Gen over Kun = King Wen `23`

Changing only `profileId` must leave every raw value above unchanged.

## 12. Validation gates

### CODE GATE

Package contract includes tests for:

- byte-for-byte reproducibility;
- locked golden vector;
- intent/cube/move validation;
- profile isolation;
- rejection sampling;
- source-chain deduplication;
- 40/40 HNK runtime identity alignment;
- prevention of oracle-registry linguistic redefinition.

### GITHUB RUNNER INFRA GATE

The repository currently reports workflow jobs with no assigned runner (`runner_id = 0`) and no executed steps. This same infrastructure state affects pre-existing workflows on `main`, so a no-runner failure must not be classified as an Oraculum code-test failure.

V0.4 must not be marked CI-green until a runner actually executes its steps.

## 13. Version rule

Any future intentional change to raw serialization, bit allocation, retry derivation, I Ching line encoding, color transform or sigil coordinate decoding requires a new protocol version. The V0.4 golden vector remains immutable.
