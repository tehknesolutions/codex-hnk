# HNK-VERSE ZERO — RUNTIME V0

**Status:** ARCHITECTURAL PROPOSAL — awaiting TW approval
**Codename:** HNK-VERSE
**Parent specs:** HNK Manifestation Core V0; Matrix 10×11 V0; First 10 Minutes V0

## 1. Runtime goal

Turn the approved ZERO loop into the smallest production-shaped executable architecture.

The runtime must support:

`PLAYER → AVATAR → LAND → HOME → TIME → INVENTORY → CODEX → HNK LANGUAGE → PRACTICE → AGENT → TELEMETRY → PROGRESSION → PERSISTENCE`

without pretending to implement the future full Verse.

## 2. Recommended product stack

### Primary client

**Web-first PWA** for the first playable vertical slice.

Rationale:
- fastest iteration and shareable QA;
- desktop + mobile browser coverage;
- installable path through PWA;
- preserves later native/mobile options;
- fits the existing Tehkné web delivery workflow.

### Application/runtime

- TypeScript end-to-end where practical.
- React-based application shell.
- Dedicated 2D game/rendering layer isolated behind an adapter.
- Server-authoritative persistence for canonical user/world state where required.
- Local cache for responsiveness and offline-tolerant development.

The renderer must not own domain truth. `world`, `inventory`, `practice`, `progression` and telemetry remain independent of rendering technology.

## 3. Rendering strategy

ZERO should begin as a **2D top-down/isometric-capable world**, not mandatory 3D.

Rendering requirements:
- tile/world scene;
- avatar movement;
- interactable objects;
- stateful visual changes;
- lightweight effects for manifestation events;
- camera/viewport abstraction;
- touch + keyboard input adapters.

A renderer adapter contract allows later replacement/expansion without rewriting HNK domain rules.

## 4. Repository topology proposal

```text
apps/
  web/                 # playable PWA
packages/
  domain/              # pure HNK-VERSE domain rules
  world/               # world state + interactions
  simulation/          # time/resources/cycles
  codex-bridge/        # versioned Codex contract
  language-bridge/     # versioned HNK-Idioma contract
  practice/            # practice orchestration
  agents/              # agent context/runtime adapter
  telemetry/           # event schemas + emitters
  progression/         # progression rules
  persistence/         # repositories/sync contracts
  renderer/            # renderer abstraction
  ui/                  # shared UI primitives
  fixtures/            # deterministic ZERO fixtures
  contracts/           # cross-core schemas
supabase/
  migrations/
  seed/
docs/
tests/
```

This is a modular monorepo, not microservices. Packages are boundaries first; services are extracted only when runtime evidence justifies them.

## 5. Persistence

Recommended initial backend: **PostgreSQL/Supabase-style stack** already familiar to the wider HNK ecosystem.

Minimum durable entities:

- `players`
- `avatars`
- `worlds`
- `lands`
- `world_objects`
- `inventories`
- `inventory_items`
- `practice_sessions`
- `agent_state`
- `progression_state`
- `telemetry_events`
- `content_refs`

Rules:
- every user-owned entity has explicit ownership;
- RLS/authorization is tested, not assumed;
- canonical content references store source/version/hash when available;
- telemetry is append-oriented for meaningful events;
- optimistic concurrency protects mutable persistent world state;
- migrations are versioned in Git.

## 6. State model

Separate four state classes:

1. `CANON_STATE` — approved/versioned HNK source references.
2. `WORLD_STATE` — persistent executable world facts.
3. `SESSION_STATE` — transient client/runtime state.
4. `INTERPRETATION_STATE` — user/agent/system interpretations that must not silently become world fact or canon.

The renderer consumes state; it does not define truth.

## 7. Codex Bridge contract

The Verse must not silently duplicate Codex truth.

Minimum reference shape:

```ts
type CodexRef = {
  source: 'codex-hnk'
  canonicalId: string
  version: string
  hash?: string
  status: 'approved' | 'candidate' | 'fixture'
}
```

ZERO may use a deterministic fixture only when clearly marked `fixture`. Production canonical content must resolve to an approved source/version.

## 8. HNK-Idioma Bridge contract

No gameplay requirement may force invention of linguistic canon.

```ts
type LanguageRef = {
  source: 'hnk-idioma'
  canonicalId: string
  surface: string
  version: string
  hash?: string
  status: 'approved' | 'candidate' | 'fixture'
}
```

The runtime may display/use only the authority level explicitly attached to the entry.

## 9. Practice contract

A practice is an executable orchestration, not merely text.

```ts
type PracticeEvent = {
  practiceId: string
  actorId: string
  worldId: string
  action: unknown
  observation: unknown
  result: unknown
  interpretation?: unknown
  evidenceRefs: string[]
  canonRefs: string[]
  occurredAt: string
}
```

The fields preserve the Lucidity invariant:

`ACTION ≠ OBSERVATION ≠ RESULT ≠ INTERPRETATION ≠ EVIDENCE ≠ CANON`.

## 10. Agent runtime

ZERO needs one constrained persistent agent, not an autonomous society.

Agent context should be assembled from explicit sources:
- allowed world facts;
- player-visible state;
- approved Codex refs;
- approved/declared Language refs;
- recent permitted interaction history;
- agent identity/configuration.

Agent output is not automatically world truth. Mutating actions pass through domain commands and authorization.

Required guardrail: no claim of remembered event unless that event exists in permitted state/history.

## 11. Telemetry schema

Every meaningful event uses a common envelope:

```ts
type HnkEvent<T> = {
  eventId: string
  eventType: string
  schemaVersion: number
  actorId?: string
  worldId?: string
  sessionId?: string
  occurredAt: string
  causationId?: string
  correlationId?: string
  payload: T
}
```

ZERO minimum event families:

`player.*`
`avatar.*`
`world.*`
`inventory.*`
`codex.*`
`language.*`
`practice.*`
`manifestation.*`
`lucidity.*`
`agent.*`
`progression.*`
`persistence.*`

Telemetry must be useful for debugging, audit and product learning without treating every private user datum as necessary telemetry.

## 12. Progression

Progression is event-driven.

ZERO grants progression for demonstrated actions/practices and state transitions, not passive page opening alone.

A progression record must identify:
- trigger event(s);
- rule/version;
- granted result;
- previous/new state.

Kabbalistic progression is not equivalent to XP. A Sephirah gate requires actual capabilities/criteria defined by the HNK progression model.

## 13. Local/offline strategy

ZERO should support:
- local development without production dependencies where possible;
- deterministic seed world;
- cached static/canonical references;
- queued telemetry/state writes during temporary connectivity loss where safe;
- explicit conflict handling on reconnect.

Offline mode must not fabricate server confirmation or canonical authority.

## 14. Security/governance

- authenticated identity for durable cloud saves;
- least-privilege database access;
- RLS/authorization tests;
- no client-side TW/root authority token;
- Creator permissions separated from epistemic/canonical authority;
- server-side validation for privileged mutations;
- provenance for imported canonical content;
- rate/cost boundaries around AI agents.

## 15. Testing pyramid

### Contract tests
Codex, Language, telemetry and persistence schemas.

### Domain tests
Pure deterministic rules for inventory, world transitions, practice and progression.

### Integration tests
Database ownership/RLS, persistence, concurrency and bridge resolution.

### Runtime smoke
The complete ZERO loop through deterministic fixtures.

### Human playtest
First 10 minutes on desktop and mobile viewport.

The release gate requires both automated evidence and human playability evidence.

## 16. Deployment

Initial target: preview deployments per PR + production web deployment after gates pass.

Environment classes:

`local → preview → staging/production`

Secrets remain server-side. Database migrations are applied through an auditable release path.

## 17. Architecture invariants

1. Domain truth is renderer-independent.
2. Canon references are versioned/provenanced.
3. HNK language is consumed, not invented by the Verse runtime.
4. Agent speech is not canon.
5. User interpretation is not automatically evidence.
6. Telemetry records meaningful transitions and provenance.
7. Creator authority and canonical/evidentiary status remain separate dimensions.
8. ZERO stays small enough for deterministic end-to-end verification.
9. Web-first does not mean web-only forever.
10. 2D-first does not prohibit future 3D/spatial clients.

## 18. Proposed implementation order

`R0 — repo/bootstrap/contracts`

`R1 — identity + avatar + persistence`

`R2 — land + world object + movement/interactions`

`R3 — time + inventory + first persistent state change`

`R4 — Codex Bridge + HNK-Idioma Bridge`

`R5 — practice + manifestation + Lucidity record`

`R6 — first persistent AI agent`

`R7 — progression + first-loop summary`

`R8 — full ZERO deterministic smoke`

`R9 — mobile/desktop human QA + release candidate`

## 19. Repository creation gate

A dedicated third repository can be initialized after TW approves:

- the runtime direction in this document;
- the temporary/final repository name;
- the initial stack implementation choices.

Until naming is approved, `HNK-VERSE` remains a codename and this architecture remains inside `codex-hnk` as the canonical design source.