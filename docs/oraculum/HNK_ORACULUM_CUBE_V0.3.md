# HNK ORACULUM CUBE — SPEC V0.3

**ID:** `HOC-CUBE40-ORACLE-REGISTRY-V0.3`  
**Status:** `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`  
**Runtime identity authority:** `@hnk/glyphs` (`G01–G40`)  
**Oracle semantics authority:** this authored HNK Oraculum layer only

## 1. Goal

V0.3 creates an oracle-specific semantic layer for the 40 authoritative HNK glyph IDs without changing HNK phonology, transliteration, visual identity, lexicon, grammar or comparative-language mappings.

The registry is deliberately separate from the HNK40 comparative language matrix. It is a symbolic/product-system layer, not linguistic evidence and not a historical claim.

## 2. Hard governance

1. `G01–G40` identity comes only from `@hnk/glyphs`.
2. Oracle roles never redefine phonemes or glyph visuals.
3. No correspondence is selected from glyph appearance, PUA, numerology or resemblance to Hebrew/Greek/kana/Esperanto.
4. Geometry assignments below are explicit `HNK_AUTHORED_CANDIDATE` design decisions.
5. Oracle output is a symbolic reflection system; the runtime must not claim infallible supernatural prediction.
6. Promotion to `HNK_CANON` requires explicit human approval.

## 3. CUBE40 geometry

The cube receives exactly 40 operational positions:

`1 CORE + 3 PRINCIPAL_AXES + 6 FACES + 12 EDGES + 8 VERTICES + 4 BODY_DIAGONALS + 6 OPPOSITE_EDGE_AXES = 40`

Coordinate convention:

- `RIGHT = +X`, `LEFT = -X`
- `FRONT = +Y`, `BACK = -Y`
- `UP = +Z`, `DOWN = -Z`

The final six positions are lines joining the midpoints of each pair of opposite parallel edges:

- `UF ↔ DB`
- `UB ↔ DF`
- `UR ↔ DL`
- `UL ↔ DR`
- `FR ↔ BL`
- `FL ↔ BR`

This gives a closed 40-position authored geometry without introducing a second glyph alphabet.

## 4. Registry map

| G-ID | Runtime world | Geometry class | Position | Oracle role | Sigil function |
|---|---:|---|---|---|---|
| G01 | W1 | CORE | `CENTER` | Source | CENTERING |
| G02 | W1 | PRINCIPAL_AXIS | `LEFT_RIGHT` | Choice | DISCERNMENT |
| G03 | W1 | PRINCIPAL_AXIS | `FRONT_BACK` | Continuity | CONTINUITY |
| G04 | W1 | PRINCIPAL_AXIS | `DOWN_UP` | Alignment | ALIGNMENT |
| G05 | W1 | FACE | `UP` | Vision | VISION |
| G06 | W1 | FACE | `DOWN` | Ground | GROUNDING |
| G07 | W1 | FACE | `FRONT` | Emergence | EMERGENCE |
| G08 | W1 | FACE | `BACK` | Memory | MEMORY |
| G09 | W1 | FACE | `RIGHT` | Action | ACTION |
| G10 | W1 | FACE | `LEFT` | Reception | RECEPTION |
| G11 | W2 | EDGE | `UP_FRONT` | Declaration | DECLARATION |
| G12 | W2 | EDGE | `UP_BACK` | Reflection | REFLECTION |
| G13 | W2 | EDGE | `UP_RIGHT` | Initiative | INITIATIVE |
| G14 | W2 | EDGE | `UP_LEFT` | Inspiration | INSPIRATION |
| G15 | W2 | EDGE | `DOWN_FRONT` | Embodiment | EMBODIMENT |
| G16 | W2 | EDGE | `DOWN_BACK` | Foundation | FOUNDATION |
| G17 | W2 | EDGE | `DOWN_RIGHT` | Execution | EXECUTION |
| G18 | W2 | EDGE | `DOWN_LEFT` | Care | CARE |
| G19 | W2 | EDGE | `FRONT_RIGHT` | Advance | ADVANCE |
| G20 | W2 | EDGE | `FRONT_LEFT` | Listening | LISTENING |
| G21 | W3 | EDGE | `BACK_RIGHT` | Strategy | STRATEGY |
| G22 | W3 | EDGE | `BACK_LEFT` | Integration | INTEGRATION |
| G23 | W3 | VERTEX | `UP_FRONT_RIGHT` | Breakthrough | BREAKTHROUGH |
| G24 | W3 | VERTEX | `UP_FRONT_LEFT` | Revelation | REVELATION |
| G25 | W3 | VERTEX | `UP_BACK_RIGHT` | Mastery | MASTERY |
| G26 | W3 | VERTEX | `UP_BACK_LEFT` | Wisdom | WISDOM |
| G27 | W3 | VERTEX | `DOWN_FRONT_RIGHT` | Manifestation | MANIFESTATION |
| G28 | W3 | VERTEX | `DOWN_FRONT_LEFT` | Sustenance | SUSTENANCE |
| G29 | W3 | VERTEX | `DOWN_BACK_RIGHT` | Stewardship | STEWARDSHIP |
| G30 | W3 | VERTEX | `DOWN_BACK_LEFT` | Root | ROOT |
| G31 | W4 | BODY_DIAGONAL | `UFR_DBL` | Transmutation | TRANSMUTATION |
| G32 | W4 | BODY_DIAGONAL | `UFL_DBR` | Reversal | REVERSAL |
| G33 | W4 | BODY_DIAGONAL | `UBR_DFL` | Reconciliation | RECONCILIATION |
| G34 | W4 | BODY_DIAGONAL | `UBL_DFR` | Renewal | RENEWAL |
| G35 | W4 | OPPOSITE_EDGE_AXIS | `UF_DB` | Balance | BALANCE |
| G36 | W4 | OPPOSITE_EDGE_AXIS | `UB_DF` | Calibration | CALIBRATION |
| G37 | W4 | OPPOSITE_EDGE_AXIS | `UR_DL` | Reciprocity | RECIPROCITY |
| G38 | W4 | OPPOSITE_EDGE_AXIS | `UL_DR` | Coordination | COORDINATION |
| G39 | W4 | OPPOSITE_EDGE_AXIS | `FR_BL` | Feedback | FEEDBACK |
| G40 | W4 | OPPOSITE_EDGE_AXIS | `FL_BR` | Synthesis | SYNTHESIS |

## 5. World overlay

The existing runtime grouping remains untouched:

- `W1 = G01–G10`
- `W2 = G11–G20`
- `W3 = G21–G30`
- `W4 = G31–G40`

V0.3 does **not** identify these runtime worlds with Atziluth/Briah/Yetzirah/Assiah. Any such bridge requires an independent authored profile and approval.

For oracle UX only, a non-canonical explanatory label may be displayed as:

- W1 — Orientation
- W2 — Formation
- W3 — Realization
- W4 — Integration

These labels are `UX_ALIAS_CANDIDATE`, not linguistic or historical identities.

## 6. Per-glyph oracle contract

Every oracle entry carries:

```json
{
  "glyph_id": "G01",
  "runtime_world_id": "W1",
  "oracle_authority": "HNK_AUTHORED_CANDIDATE",
  "geometry": {
    "class": "CORE",
    "position_id": "CENTER"
  },
  "oracle": {
    "role": "Source",
    "light": "presence",
    "shadow": "dispersion",
    "transformation": "...",
    "question": "...",
    "action": "...",
    "sigil_function": "CENTERING"
  }
}
```

## 7. Interpretation rule

A selected HNK glyph contributes one authored symbolic signal only.

It does not automatically inherit a Hebrew letter, Tarot trump, zodiac sign, planet, element, sefirah or language meaning.

Those systems remain independent correspondence profiles. Convergence is computed only when two separately governed sources produce comparable signals.

## 8. Independence/provenance

Every synthesized signal must preserve:

- `origin`
- `profile`
- `authority`
- `source_chain_id`
- `confidence`

Signals derived from one chain cannot masquerade as independent convergence.

## 9. CUBE40 functions

Geometry classes have runtime behavior:

- `CORE`: invariant / center query.
- `PRINCIPAL_AXIS`: polarity comparison.
- `FACE`: directional state.
- `EDGE`: interface between two directions.
- `VERTEX`: convergence of three directions.
- `BODY_DIAGONAL`: whole-cube polarity transformation.
- `OPPOSITE_EDGE_AXIS`: reconciliation of complementary interfaces.

These are authored computational semantics, not claims about ancient cube doctrine.

## 10. Sigil function

`sigil_function` is a deterministic design tag used to generate visual/operator behavior later.

It is **not** permission for the software to claim autonomous agency, occult causation, guaranteed manifestation, or control over users/events.

V0.3 keeps sigils within symbolic reflection, ritual UX, art, game mechanics and intentional action design.

## 11. Malkuth contract

A complete oracle result must eventually resolve symbolic output into a grounded action layer:

```json
{
  "core_message": "",
  "convergences": [],
  "tensions": [],
  "unknowns": [],
  "hnk_glyph": "G01",
  "question": "",
  "next_action": "",
  "verification": ""
}
```

`verification` states how the user can tell whether the suggested action produced a real-world result.

## 12. V0.3 checkpoint

- HNK40 runtime identity: **BOUND**
- Oracle layer isolation: **LOCKED**
- CUBE40 geometry cardinality: **40/40**
- G-ID → geometry map: **40/40 AUTHORED CANDIDATE**
- G-ID → oracle role: **40/40 AUTHORED CANDIDATE**
- Light/shadow/transformation/question/action: **40/40 AUTHORED CANDIDATE**
- Historical equivalence claims added: **0**
- HNK phoneme changes: **0**
- HNK lexeme changes: **0**
- HNK visual-canon promotions: **0**

## 13. Next gate — V0.4

V0.4 should implement the deterministic engine contract:

`SEED-256 → raw selectors → HNK glyph → CUBE40 position → independent correspondence profiles → convergence/tension engine → Malkuth`

and add tests proving:

- same seed => same result;
- profile changes cannot alter raw values;
- HNK oracle registry cannot alter `@hnk/glyphs`;
- source-chain deduplication blocks pseudo-convergence;
- unresolved correspondence remains unresolved rather than guessed.
