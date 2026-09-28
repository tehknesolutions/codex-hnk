# Day 001 — Visual State Authority Audit

Branch: `docs/visual-source-dissection-v1`

## Scope

Audit of the active Day 001 route after Visual Target V1 integration.

Active composition:

`page.tsx` → `DayChamber` → `Day001GoldenV2Web` → runtime-driven `Day001VisualContractLayer`.

## Findings

### A01 — First Spark authority

**Status: LOCKED**

The visual layer receives `firstSpark` only from `sealed?.first_completion`, which is produced by the authoritative `sealDay001V2` response.

The Kether node uses this value for its lit state.

Rule:

`server seal → firstSpark → visual state`

No local UI action directly lights the node.

### A02 — Geometry authority

**Status: LOCKED**

Origin Cosmos, Boaz Axis, Convergence and Tree Field geometry are read from `packages/visual-contract/src/day001.ts`.

The visual layer no longer repeats the geometry constants.

Rule:

`visual contract → render geometry`

### A03 — Active route duplication

**Status: PASS**

The active `day-001/page.tsx` renders `Day001GoldenV2Web` inside `DayChamber`. The contract layer is rendered by the Golden runtime, not independently by the page.

This prevents two competing contract layers.

### A04 — Legacy immersive implementation

**Status: LEGACY / NOT ACTIVE**

`Day001ImmersiveExperience.tsx` contains a separate older act model, fallback canon and practice implementation. It is not referenced by the active `day-001/page.tsx` route.

It must not become a second source of truth.

Recommended policy: keep for historical comparison until a deliberate deletion/archive decision is made; do not import it into the active route.

### A05 — Legacy relic implementation

**Status: LEGACY / NOT ACTIVE**

`KetherOriginRelicLayer.tsx` contains its own three-layer Origin instrument and reads `data-act` from the DOM.

The active contract layer now renders Origin Cosmos from the visual contract.

Policy: do not introduce the relic layer into the active route without migrating its geometry/state to the contract first.

### A06 — CSS visual authority

**Status: PARTIAL**

`day001-art-pass-v2.module.css` still contains extensive presentation values for each act. These values are presentation treatment, not the canonical geometry contract, but they can visually compete with the new semantic primitives.

Next refactor should migrate only values that define component geometry/state into semantic tokens. Atmospheric/material treatment can remain in the art pass.

### A07 — Canon content authority

**Status: LOCKED IN GOLDEN V2**

The active Golden runtime imports `DAY001_CANON` and `DAY001_CANON_SOURCE_SHA`, validates the live source before canonical sealing, and separates the private mirror from evidence.

The older immersive fallback must not be used to update the active canonical dataset.

## Authority matrix

| Concern | Authority |
|---|---|
| Canonical text | `DAY001_CANON` / canonical source SHA |
| Server completion | `sealDay001V2` response |
| First Spark state | authoritative completion response |
| Geometry | `visual-contract/src/day001.ts` |
| UI composition | active Golden V2 |
| Material styling | art pass / semantic CSS |
| Private mirror | browser-local Vault boundary |
| Legacy immersive | historical reference only |

## Next implementation gate

Before adding new Day 001 visuals:

1. Check the authority matrix.
2. Add geometry to the visual contract if it is canonical/structural.
3. Render state from runtime data.
4. Keep artwork decorative.
5. Add a presentation test when the state transition is user-visible.
6. Do not import legacy immersive/relic implementations into the active route.

## Result

No competing First Spark state was found in the active route.

The remaining architectural risk is presentation duplication in the legacy/immersive CSS and inactive components. This is now explicitly classified rather than silently mixed into the active CODEX surface.
