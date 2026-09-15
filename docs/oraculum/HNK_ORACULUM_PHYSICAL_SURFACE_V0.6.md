# HNK ORACULUM — PHYSICAL CONSULTATION SURFACE V0.6

**Status:** `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`  
**Route:** `/oraculum`  
**Raw dependency:** `HNK-ORACULUM-CUBE/V0.4`  
**Interpretation dependency:** `@hnk/oraculum-engine@0.5.0-candidate`  
**Physical scan profile:** `HOC-FACELET-SCAN-V1`

## 1. Scope

V0.6 is the first human-facing surface for using a physical 3×3 cube with HNK Oraculum.

It does not introduce a new raw protocol. It captures physical input and forwards it to the locked V0.4 raw engine and V0.5 interpretation engine.

`PHYSICAL CUBE -> FACELET SCAN -> V0.4 RAW -> V0.5 INTERPRETATION -> AUDITABLE RESULT`

## 2. Capture workflow

1. Freeze U/R/F/D/L/B by center colors.
2. Digit-map center colors as `U=0, R=1, F=2, D=3, L=4, B=5`.
3. Scan each 3×3 using `HOC-FACELET-SCAN-V1`.
4. Require 54 completed cells and exactly nine occurrences of every digit.
5. Record Alef/intention.
6. Select `STATE` or `RITUAL_32`.
7. For `RITUAL_32`, require exactly 32 Singmaster moves.
8. POST the canonical input to the Node runtime API.

## 3. Server boundary

The browser does not reimplement SHA-256 or the oracle decoder.

`/api/oraculum` executes under the Node.js runtime and imports the canonical workspace engine. This prevents a browser-specific duplicate implementation from drifting from V0.4.

## 4. Result surface

The initial interface exposes:

- seed256 and raw protocol identity;
- selected HNK G-ID and Path-32;
- Tarot index/profile descriptor;
- I Ching primary/resulting hexagrams and moving lines;
- zodiac, classical planet and raw element;
- alchemical principle and phase;
- numerology;
- Essence / Shadow / Manifestation colors;
- independent convergences;
- HNK-authored tension axes;
- structural Malkuth action gate;
- expandable provenance/signals audit.

## 5. HNK40 guardrail

The surface shows the selected authoritative G-ID but does not consume the candidate G01–G40 oracle semantics by default. `HNK40-ORACLE-REGISTRY-V1` remains unpromoted.

## 6. Spiritual/epistemic boundary

The surface is designed for symbolic and contemplative use. It does not label generated output as infallible prophecy, guaranteed supernatural communication, or objective certainty.

Malkuth remains an observable-action gate with verification required.

## 7. Validation gates

Before promotion from candidate:

- web typecheck passes;
- engine tests remain green;
- golden V0.4 vector remains byte-identical;
- physical scan orientation is tested on desktop and mobile;
- incomplete and unbalanced 54-cell states fail closed;
- RITUAL_32 rejects move counts other than 32;
- server route rejects malformed raw input;
- profile changes do not alter seed256.

## 8. Next candidate gate

A later V0.7 may add camera-assisted color capture and saved consultation history. Camera recognition must remain optional and must always expose the final 54-cell transcript for human correction before hashing.
