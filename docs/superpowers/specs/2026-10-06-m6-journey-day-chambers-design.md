# M6 — Journey / Day Chambers — Design Specification

Date: 2026-10-06
Status: DESIGN APPROVED — WRITTEN SPEC FOR REVIEW
Roadmap: #379 M6 — Journey / 109 Days

## 1. Intent

Transform the existing Day journey into a first-class Living Book subsystem without rewriting or silently changing the confirmed Day content. A Day becomes a **Chamber** inside the Codex, with one shared identity across desktop/mobile and one fail-closed authority for whether the Day is actually executable.

M6 must support the roadmap horizon of 109 Days structurally while preserving the current executable frontier: only Days backed by confirmed repository content/routes are available. Structural capacity is not content authority.

## 2. Non-negotiable invariants

1. Existing Golden V2 Day content is preserved through an adapter, not rewritten as a prerequisite.
2. AVAILABLE means the repository can prove an executable Day; a numeric slot alone never creates a route.
3. Days 073–109 remain DORMANT/UNAVAILABLE until repository-backed content is explicitly registered.
4. No automatic generation of missing Day content.
5. Personal progress never changes canon, source authority, claims, evidence, or Day availability.
6. Desktop and mobile share the same Day ID, chamber contract, navigation semantics, and progress state.
7. Unknown or unregistered Days fail closed.
8. The M5 Living Knowledge Lens and M4/M5 map selection remain independent consumers of shared structural authority; M6 must not fork the tree/day frontier.
9. Local environment is not a product gate. Verification is repository/CI-first.

## 3. Recommended architecture

M6 is split into five bounded units.

### 3.1 Journey Registry

A read-only registry is the executable authority for the Journey. It exposes registered Day descriptors and the structural 001–109 horizon.

A descriptor contains at minimum:

- `day_id` — canonical zero-padded ID such as `001`;
- `status` — `AVAILABLE` or `DORMANT`;
- `href` — present only for AVAILABLE Days;
- `source_kind` — identifies the repository-backed Day implementation/adapter;
- optional confirmed metadata already available from the Day source.

The registry MUST derive or verify availability against repository-backed Day data. It MUST NOT infer availability because a Day number falls inside 001–109.

### 3.2 Day Chamber Contract

Every available Day projects into the same chamber shape:

- **VISÃO** — orientation/context for the Day;
- **MANUSCRITO** — the confirmed Day content;
- **ARTEFATO** — confirmed interactive/visual artifact when present, otherwise explicit UNAVAILABLE;
- **PRÁTICA** — confirmed executable practice when present, otherwise explicit UNAVAILABLE;
- **DIÁRIO** — personal/private reflection surface, separate from canon.

Each chamber section has an explicit availability/status. The adapter may map legacy Golden V2 structures into these slots, but absence is represented as absence; it is never synthesized.

### 3.3 Journey Navigator

Navigation is computed from the Journey Registry, not arithmetic alone.

It provides:

- previous AVAILABLE Day;
- next AVAILABLE Day;
- return to Journey/Map;
- direct deep-link to an AVAILABLE Day;
- dormant/unavailable response for unregistered targets.

The navigator must never make `/day-073` executable merely because `/day-072` exists.

### 3.4 Progress Ledger

Progress is a separate user-state layer with states:

- `NOT_STARTED`;
- `IN_PROGRESS`;
- `COMPLETED`.

Progress records reference a Day ID but do not modify the Day descriptor. Completing a Day has no effect on canon or availability.

M6 initially defines the contract and a safe persistence adapter. Existing repository persistence patterns should be reused if a proven compatible store exists; otherwise the first implementation may use a local/private adapter behind the same interface rather than introducing a new backend dependency.

### 3.5 Resume Pointer

Resume is derived from progress/user interaction, not canon. It identifies the last resumable AVAILABLE Day and optionally the last chamber section.

A stale pointer to a Day that is no longer executable must fail closed and fall back to the nearest safe Journey entry point; it must not resurrect an unavailable route.

## 4. 109-slot structural model

The Journey UI may render slots `001–109` so the roadmap horizon is visible.

The semantics are strict:

- repository-backed registered Day → `AVAILABLE`;
- structural slot without registered content → `DORMANT`;
- malformed/unknown ID → `UNAVAILABLE`.

At the time of this spec, the established executable frontier is 001–072. M6 does not promote 073–109.

The UI must distinguish dormant slots textually/iconographically and not rely on color alone.

## 5. Golden V2 compatibility

A `GoldenDayAdapter` (name may follow existing repository naming conventions) wraps the existing Day implementation into the chamber contract.

The adapter is intentionally anti-migration-risk:

- original content remains authoritative;
- original route behavior is preserved where compatible;
- chamber metadata is projected around existing content;
- missing chamber facets remain `UNAVAILABLE`;
- migration can happen Day-by-Day without a flag day.

M6 is therefore an integration layer first, not a content rewrite project.

## 6. Data flow

Primary flow:

`Journey Registry → selected Day → Day Chamber projection → Living Book Chamber UI`

Navigation flow:

`current Day → Registry → previous/next AVAILABLE descriptor → route`

Progress flow:

`user action → Progress Ledger → Resume Pointer / progress presentation`

Authority boundary:

`Progress Ledger` MUST NOT feed mutations into `Journey Registry`, canon, claims, evidence, or correspondence registries.

## 7. UI behavior

### Desktop

The Day is presented as a Codex chamber/spread. Chamber sections behave as integrated book surfaces rather than dashboard cards. Navigation remains inside the Living Book shell.

### Mobile

The same chamber becomes a vertical reading flow. No parallel mobile data model or alternate Day semantics are introduced.

### Dormant Day

Selecting a dormant 073–109 slot may show a non-route informational state such as “Câmara ainda não materializada”. It must not expose fabricated content or an executable Day route.

### Resume

The Journey entry surface may expose “Continuar” only when a valid resumable AVAILABLE Day exists.

## 8. Error and fail-closed behavior

- invalid Day ID → unavailable/not-found behavior;
- structurally valid but unregistered Day → dormant state, no executable route;
- registered descriptor missing required executable metadata → invalid registry entry, not AVAILABLE;
- chamber section without source → section UNAVAILABLE;
- stale progress/resume record → ignored or safely downgraded;
- persistence failure → Day content remains readable; progress mutation reports failure without affecting canon;
- duplicate Day registrations → registry validation failure.

## 9. Testing strategy

Implementation follows TDD.

Required contract tests:

1. Registry proves current AVAILABLE Days and keeps 073–109 dormant.
2. Unknown IDs fail closed.
3. Golden V2 adapter preserves existing content identity/route.
4. Chamber exposes exactly the five semantic surfaces and never invents missing facets.
5. Previous/next navigation skips non-executable slots and never crosses into dormant Days.
6. Progress state cannot alter availability/canon.
7. Resume accepts only an AVAILABLE Day.
8. Desktop/mobile presentation consume the same chamber projection.
9. Existing Day 001–072 validators remain regression gates.
10. M3/M4/M5 Living Book/Map/Lens contracts remain green.

## 10. Delivery slices

### Slice A — Journey authority
Journey Registry + 109-slot structural projection + validation.

### Slice B — Chamber contract
Day Chamber projection + Golden V2 adapter + fail-closed section availability.

### Slice C — Navigation
Previous/next/deep-link behavior based only on executable registry entries.

### Slice D — Progress and resume
Progress Ledger + Resume Pointer with strict authority separation.

### Slice E — Living Book integration
Desktop spread + mobile vertical chamber + Journey entry/resume UI.

### Slice F — Regression/CI gate
Focused M6 validator plus existing Day and M3–M5 regression gates; no Vercel/local dependency as the sole authority.

## 11. Definition of Done

M6 is complete when a user can:

1. enter the Journey from the Codex;
2. see the 001–109 structural horizon with real availability distinguished from dormant capacity;
3. open an existing Day as a Chamber;
4. traverse VISÃO, MANUSCRITO, ARTEFATO, PRÁTICA and DIÁRIO with explicit unavailable states where necessary;
5. navigate previous/next across executable Days without fabricating routes;
6. record progress independently from canon;
7. leave and resume a valid Day;
8. encounter a missing/dormant Day safely;
9. use the same semantic flow on desktop and mobile;
10. pass the focused M6 and relevant regression gates with repository/CI evidence.

## 12. Explicitly out of scope

- authoring Days 073–109;
- rewriting Golden V2 content;
- promoting experimental content into canon;
- cloud sync/account architecture unless an existing compatible repository service is already proven and reusable;
- M7 Library/Provenance expansion;
- M8 Labs redesign;
- unrelated visual polish.
