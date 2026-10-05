# M4 — Total Map / Visão Kether — Design

Date: 2026-10-05
Status: APPROVED DESIGN / SPEC REVIEW
Depends on: M3 Interactive Living Book Map (PR #381)

## Intent

Evolve the hybrid Living Book navigation into a coherent macro view of the HNK Knowledge Tree without replacing the progressive M3 journey. M4 gives the reader a "Visão Total" first, then allows the same canonical descent into sphere, range, Day, and chamber.

Target flow:

`Visão Total → Esfera → estado/faixa → Days → Câmara`

The total map is an additional representation of the same structural truth, not a second navigation engine.

## Canonical constraints

- `packages/visual-contract/src/tree.ts` remains the structural authority.
- KETHER is executable only for Day 001–036.
- CHOKHMAH is executable only for Day 037–072.
- BINAH 073+ remains structurally visible and dormant until confirmed repository content exists.
- No M4 component may manufacture `/day-073` or later routes.
- Existing Golden V2 Day 001–072 implementations remain content authority.
- M4 does not silently reinterpret HNK canon, sphere names, ranges, or states.

## Selected model

M4 uses one responsive semantic map implemented with React/HTML/CSS over the existing visual contract.

Desktop emphasizes the macro map and spatial relationship between spheres. Mobile preserves M3 progressive disclosure as the primary usable interaction and presents the total map as a compact overview.

No graph engine, canvas renderer, WebGL/3D system, physics layout, or new visualization dependency is introduced in M4.

## Experience architecture

### 1. Total-map surface

Add a focused `LivingBookTotalMap` presentation that consumes the same level/node contract used by M3.

It renders:
- the known spheres in canonical order;
- structural connectors between the known levels;
- state and range for each sphere;
- clear distinction between executable and dormant territory;
- selection affordance that hands the selected sphere back to the progressive map flow.

The total map is orientation, not a replacement for chamber navigation.

### 2. One selection model

M3 and M4 must not maintain competing selected-sphere state when rendered together.

The Living Book MAPA host owns or coordinates the selected sphere. Total-map selection and progressive-map selection converge on the same `HnkTreeLevelId` value.

Selecting KETHER or CHOKHMAH reveals its real executable Days through the existing shared derivation. Selecting BINAH reveals its dormant explanation and zero executable Days.

### 3. Progressive descent remains authoritative

The actual chamber-entry surface remains the progressive M3 flow:

`selected sphere → getExecutableDays(levelId) → /day-NNN`

The total map never independently calculates Day URLs or maintains another range table.

### 4. Desktop behavior

Desktop may display the macro map and progressive detail within the same MAPA opening when space allows.

The hierarchy should read visually as:

1. Total system orientation.
2. Current sphere/state.
3. Available range.
4. Executable Day choices.

The map should feel like part of the Codex/Living Book rather than a dashboard widget.

### 5. Mobile behavior

Mobile prioritizes clarity over showing every detail simultaneously.

- total map becomes a compact vertical/stacked overview;
- sphere controls remain touch accessible;
- selection scrolls/reveals progressive detail naturally;
- no mandatory horizontal pan/zoom interaction;
- no 72-item wall before a sphere is selected;
- chamber links remain normal semantic links.

## Data flow

1. `tree.ts` exposes canonical structural metadata.
2. MAPA renders the total map from that metadata.
3. User selects a sphere in either total or progressive representation.
4. One shared selected-level state is updated.
5. Progressive detail derives executable Days via `getExecutableDays`.
6. Existing Next.js Day route opens the selected chamber.
7. Dormant structure produces no executable route.

## Component boundaries

- `packages/visual-contract/src/tree.ts` — canonical structural truth and executable-Day derivation.
- `apps/web/app/_components/LivingBookTotalMap.tsx` — macro semantic visualization; no route authority.
- `apps/web/app/_components/LivingBookMap.tsx` — progressive sphere/range/Day detail; adapted to controlled selection if needed.
- `apps/web/app/_components/LivingBook.tsx` — MAPA composition and shared selection coordination.
- `apps/web/app/living-book-map.css` (or the existing M3 map stylesheet path) — visual extension for macro map using existing tokens.
- `KnowledgeTree.tsx` / `PortalHome.tsx` — continue consuming shared structural truth; not duplicated as M4 engines.

## Interaction contract

Total-map sphere controls expose:
- semantic button behavior;
- `aria-pressed` or equivalent current-selection state;
- visible label, range, and structural state;
- dormant semantics without fake links.

Keyboard and pointer selection must reach the same state transition.

## Visual language

Reuse the existing dark/gold Living Book visual system and M3 state vocabulary.

- `acquired`: visibly established territory;
- `active`: current/available territory;
- `dormant`: visible but restrained, never styled as executable;
- selection: stronger than state alone and not communicated by color only;
- connectors: structural, subdued, and non-interactive unless later canon explicitly assigns meaning.

M4 should create a stronger "map" impression through composition, hierarchy, lines, rings/frames, spacing, and typography rather than adding a heavy rendering engine.

## Accessibility

- all selectable spheres are reachable by keyboard;
- selection has programmatic and visible state;
- dormant nodes communicate unavailability textually;
- connectors are decorative unless they carry explicit semantic content;
- DOM order remains meaningful without CSS;
- reduced-motion preferences are respected;
- mobile zoom is not required to understand or operate the map.

## Gap and error handling

- unknown/non-executable sphere: fail closed with no Day links;
- missing range metadata: display neutral unavailable metadata rather than inventing a range;
- future sphere/range additions must enter `tree.ts` first;
- M4 rendering follows contract updates rather than encoding future canon itself.

## Testing strategy

Extend the focused Living Book map validator or add a narrowly scoped M4 validator to assert:

1. Total map consumes `hnkTreeLevels`/`hnkTreeNodes` rather than local structural tables.
2. Total map does not contain literal `/day-073` or later executable routes.
3. KETHER/CHOKHMAH/BINAH are represented from shared metadata.
4. Total and progressive maps share one selected-level state path.
5. BINAH selection yields no executable Days.
6. Accessible selection semantics exist.
7. Responsive/reduced-motion visual contracts are present.
8. Existing M3 progressive navigation remains intact.

## Non-goals

M4 does not:
- author Day 073+;
- implement a full ten-Sephirot tree unless canonical data exists in the structural contract;
- invent paths/connectors with new doctrinal meaning;
- replace the progressive M3 map;
- introduce WebGL, Three.js, graph libraries, canvas physics, or 3D navigation;
- rewrite Golden V2 Day content;
- require local-only tooling to continue development.

## Success criteria

M4 is successful when a reader can enter MAPA and immediately understand the known HNK structure as one coherent visual system, select an available sphere from that macro view, descend into the same progressive Day navigation, and open an existing chamber — while dormant territory remains visible but impossible to mistake for executable canon.

The result must feel like one Living Book navigation system at two scales: Kether-like overview and progressive descent.

## Self-review

- M4 reuses, rather than replaces, M3.
- `tree.ts` remains the only structural authority.
- No Day 073+ route is introduced.
- Desktop and mobile behavior are explicitly distinct without creating separate engines.
- Accessibility and fail-closed behavior are specified.
- Heavy visualization dependencies are intentionally deferred.
- Scope remains compatible with the project's policy of not blocking progress on local/external tooling.
