# M3 — Interactive Living Book Map — Design

Date: 2026-10-05
Status: APPROVED DESIGN / SPEC REVIEW

## Intent

Transform the HNK Codex knowledge tree from a set of entry links into an explorable surface inside the Living Book, while preserving canonical content, existing Golden V2 Day implementations, and the real repository boundary at Day 072.

The target experience is a living Codex rather than a slideshow or detached dashboard: the reader explores structure and then crosses directly into an available chamber.

## Canonical constraints

- Do not invent Day 073 or later content.
- Preserve existing Day 001–072 Golden V2 implementations.
- Preserve the shared DayLivingBook adapter.
- The visual/navigation layer must not silently promote placeholders into canon.
- Unavailable areas remain visible as dormant/locked structure rather than broken links.
- Current executable ranges are KETHER 001–036 and CHOKHMAH 037–072. BINAH 073+ is dormant until repository content exists.

## Selected interaction model

Hybrid model (C): progressive exploration is the primary interaction, with a future-expandable total-map mode.

Primary flow:

`Sphere → available range → Days → selected Day → chamber`

This avoids exposing every Day at once on small screens while keeping the architecture capable of a later full-map view.

## Architecture

### 1. Source of truth

`packages/visual-contract/src/tree.ts` remains the structural source for sphere identity, state, ranges, and valid entry routes. Interactive UI must derive availability from data instead of hardcoding routes in multiple components.

A dormant node has no executable href. UI may display it but must not manufacture navigation.

### 2. Interactive map surface

Create a focused client component for the Living Book map. It owns only interaction state: selected sphere, progressive disclosure, and optional expanded-map state.

It consumes structural tree data and renders:

- sphere selector;
- current state (`acquired`, `active`, `dormant`, etc.);
- available Day range;
- Day choices for executable ranges;
- dormant messaging for unavailable ranges;
- chamber-entry links only for Days known to exist.

It does not own Day content and does not duplicate Golden V2 implementations.

### 3. Living Book integration

The `MAPA` spread in `LivingBook.tsx` becomes the host for the interactive map surface rather than static explanatory links.

The book remains the navigation frame. Selecting a sphere updates the spread locally; selecting an available Day crosses into its existing `/day-NNN` chamber.

The `PRÁTICA` spread remains a concise journey overview and entry surface. It must not become a second competing map.

### 4. KnowledgeTree relationship

`KnowledgeTree.tsx` remains useful as the large landing-page representation of the same structural data. It should not maintain a separate range model.

Both the landing tree and Living Book map consume the same visual-contract data. The interactive map adds progressive exploration; the landing tree provides macro orientation.

### 5. Future total-map mode

The component boundary must permit an expanded total-map presentation later, but M3 does not need to implement a complex graph engine, canvas renderer, physics layout, or new dependency.

The first implementation may expose an `expanded` state/button only if it can reuse the same data and DOM structure cleanly. YAGNI: no second navigation engine.

## Data flow

1. `tree.ts` exposes structural levels/nodes and availability.
2. Living Book map receives/reads those structures.
3. User selects an available sphere.
4. Component derives its range and valid Day choices.
5. User selects a Day.
6. Normal Next.js navigation opens the existing Day chamber.
7. Dormant spheres never produce invalid Day routes.

No canonical mutations occur in this flow.

## Component boundaries

- `packages/visual-contract/src/tree.ts`: structural truth and availability.
- `apps/web/app/_components/LivingBookMap.tsx`: client-side exploration state and map UI.
- `apps/web/app/_components/LivingBook.tsx`: book/spread composition and insertion point.
- `apps/web/app/_components/KnowledgeTree.tsx`: macro landing tree using shared structural truth.
- existing Day routes and `DayLivingBook`: unchanged content authority.

## Day generation rule

For the current repository state, valid interactive Day links are exactly 001–072.

The UI may derive Day numbers from executable range metadata, but must never render a link outside the confirmed available boundary. If future repository content extends the boundary, the structural contract should be updated first and the UI should follow it.

## Responsive behavior

Desktop:
- sphere choices and current range can coexist within the spread;
- Day choices may use a compact grid/list;
- the book visual hierarchy remains dominant.

Mobile:
- progressive disclosure becomes vertical;
- no giant 72-item wall before a sphere is selected;
- controls remain keyboard/touch accessible;
- horizontal overflow is not required for core navigation.

## Accessibility

- sphere controls expose selected/current state;
- dormant structures expose disabled/unavailable semantics;
- Day links have explicit accessible labels;
- keyboard navigation remains usable;
- visual state is never communicated by color alone;
- reduced-motion preferences remain respected by existing Living Book behavior.

## Error and gap handling

- Missing href/availability: render dormant state, not a guessed URL.
- Unknown sphere state: fail visually neutral and non-navigable rather than assuming active.
- No available Days: explanatory empty state.
- Existing Day page errors remain the responsibility of the Day route; the map does not swallow them.

## Testing strategy

Add focused tests around structural and navigation invariants where the repository's current test setup supports them:

1. available ranges generate only Day 001–072 links;
2. BINAH 073+ produces no executable Day links;
3. selecting KETHER exposes 001–036;
4. selecting CHOKHMAH exposes 037–072;
5. selected sphere state is reflected accessibly;
6. Living Book MAPA hosts the interactive surface;
7. no regression to existing DayLivingBook/Golden V2 routes.

If UI test infrastructure is absent, keep pure range/day derivation in a testable helper and use build/typecheck as the integration gate.

## Non-goals

M3 does not:

- author Day 073+;
- rewrite Golden V2 Day content;
- introduce a graph/3D engine;
- add a database;
- create a second canonical hierarchy;
- implement the final visual target in one leap;
- require local-only tooling to keep the project moving.

## Success criteria

M3 map integration is successful when a user can open the Codex, enter MAPA, choose an available sphere, see only its real available Days, and enter an existing chamber without leaving the Living Book mental model or encountering fabricated/broken routes.

The resulting component architecture must also be ready to grow toward the final total-map visual target without replacing the progressive navigation system.

## Self-review

- No TBD/TODO placeholders.
- Repository boundary is explicitly Day 072.
- BINAH is visible but non-navigable.
- One structural source of truth is required.
- Progressive and future expanded modes share one architecture rather than competing implementations.
- Scope is limited to M3 interactive map integration.
