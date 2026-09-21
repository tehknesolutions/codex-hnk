# HNK-VERSE ZERO — FIRST 10 MINUTES V0

**Status:** HNK_APPROVED_BY_TW — product specification candidate
**Codename:** HNK-VERSE
**Architectural core:** HNK Manifestation Core
**Entry Sephirah:** Malkuth

## 1. Objective

The first ten minutes must prove three things simultaneously:

1. this is a playable world, not only a Codex UI;
2. this world is recognizably HNK;
3. knowledge, language and practice can produce observable changes in the executable world.

The player must reach the first complete HNK loop before minute 10:

`KNOW → NAME → ACT → MANIFEST → OBSERVE → RECORD → PROGRESS`

## 2. ZERO promise

The player enters with almost nothing and receives a small world capable of growth.

ZERO contains only the minimum DNA:

`1 PLAYER → 1 AVATAR → 1 LAND → 1 HOME → 1 DAY CYCLE → 1 INVENTORY → 1 CODEX ENTRY → 1 HNK LANGUAGE ELEMENT → 1 PRACTICE → 1 AI AGENT → TELEMETRY → 1 PROGRESSION EVENT`

No city, economy empire, multiplayer metaverse or huge content catalog is required to validate ZERO.

## 3. Minute-by-minute experience

### 00:00–01:00 — ARRIVAL / MALKUTH

The player enters a small persistent terrain.

Visible immediately:
- avatar;
- land boundary;
- one unfinished/basic shelter location;
- one interactable world object;
- day/time indicator;
- minimal inventory;
- subtle Codex access point.

No long exposition. Movement and interaction begin immediately.

Telemetry:
- `player.arrived`
- `avatar.spawned`
- `land.entered`

### 01:00–02:00 — IDENTITY

The player establishes the minimum identity of the avatar: name and one lightweight presentation choice. Deep character creation is deferred.

The system creates the first persistent player/avatar/world relationship.

Telemetry:
- `avatar.identity_set`
- `profile.zero_initialized`

### 02:00–03:30 — FIRST NEED / FIRST ACTION

A concrete Malkuth-level need appears: the player must interact with the land/object to obtain or prepare one material resource.

The action teaches:
- movement;
- interaction;
- inventory;
- world consequence.

The environment visibly changes after the action.

Telemetry:
- `world.object_interacted`
- `inventory.item_acquired`
- `world.state_changed`

### 03:30–05:00 — CODEX BRIDGE

The first Codex fragment becomes relevant because it helps solve the current situation. The player is not forced to read a chapter.

The fragment contains:
- one concept;
- one practical meaning;
- one immediate action/use;
- provenance/version reference.

The design rule is:

> CODEX KNOWLEDGE MUST ARRIVE WHEN IT CAN BE USED.

Telemetry:
- `codex.entry_opened`
- `codex.entry_acknowledged`

### 05:00–06:30 — LANGUAGE BRIDGE

The player receives one canonical HNK language element linked to the current action.

ZERO does not invent vocabulary. The runtime must consume an approved/versioned HNK-Idioma source or a locked fixture explicitly marked for development.

The player uses the language element through a simple interaction/command interface.

The world responds visibly.

Telemetry:
- `language.element_presented`
- `language.element_used`
- `language.world_response`

### 06:30–08:00 — FIRST PRACTICE / MANIFESTATION

Knowledge + language + player action combine into one practice.

The practice changes something concrete in the world: completes, activates, arranges, builds, reveals or transforms a small world state.

This is the first Manifestation moment.

The system records separately:
- what the player did;
- what the runtime observed;
- what result occurred;
- any interpretation attached by player/system.

Telemetry:
- `practice.started`
- `practice.completed`
- `manifestation.state_changed`
- `lucidity.observation_recorded`

### 08:00–09:00 — FIRST AGENT

One persistent AI/NPC agent enters or becomes available.

Its ZERO responsibilities are intentionally narrow:
- recognize a small set of world facts;
- refer to the player's first action;
- expose that the world has memory;
- offer one next possibility.

It must not pretend to know facts absent from world state or canonical sources.

Telemetry:
- `agent.encountered`
- `agent.context_loaded`
- `agent.interaction_completed`

### 09:00–10:00 — REFLECTION / PROGRESSION

The player sees a compact summary of the first loop:

- what was discovered;
- what was learned;
- what HNK element was used;
- what changed in the world;
- what was recorded;
- what became available next.

The first progression event is granted for completed action/practice, not merely for opening text.

The next horizon appears: improve HOME and continue Malkuth.

Telemetry:
- `progression.zero_loop_completed`
- `progression.reward_granted`
- `next_goal.presented`

## 4. First-loop acceptance criteria

ZERO passes only if a fresh user can, without developer intervention:

1. enter the world;
2. control an avatar;
3. interact with a persistent world object;
4. acquire/use an inventory item;
5. open one relevant Codex unit;
6. encounter one approved HNK language element;
7. use that element in a world interaction;
8. complete one practice producing a visible state change;
9. interact with one state-aware agent;
10. produce an auditable telemetry trail;
11. receive one progression event;
12. leave and return with the essential state preserved.

## 5. Malkuth lock

ZERO is Malkuth-first:
- concrete action before abstraction;
- place before cosmology;
- object before complex system;
- consequence before lore dump;
- practice before mastery claim.

Yesod provides persistence/foundation. Hod provides the minimum symbolic/language/system interface. Netzach provides expression and experiential quality. These supporting layers do not mean the player has progressed to those Sephiroth.

## 6. Lucidity contract

For meaningful practice events, runtime data should distinguish:

```text
ACTION       = what input/action occurred
OBSERVATION  = what the runtime can directly record
RESULT       = resulting state transition
INTERPRETATION = meaning assigned to the event
EVIDENCE_REF = relevant logs/artifacts
CANON_REF    = canonical source, when applicable
```

`EXPERIENCE ≠ INTERPRETATION ≠ EVIDENCE ≠ CANON` remains invariant.

## 7. Product constraints

- Mobile-first interaction must remain possible even if desktop web is the fastest development target.
- No mandatory multiplayer for ZERO.
- No open economy for ZERO.
- No procedurally generated universe for ZERO.
- No requirement for 3D; representation is a stack decision, not a metaphysical requirement.
- No invented HNK linguistic canon to unblock implementation.
- No fake AI memory: agent claims must derive from available state/context.
- No progression based solely on passive reading.

## 8. Required runtime domains

The first implementation must expose at least these bounded domains:

`identity`
`world`
`avatar`
`time`
`inventory`
`codex_bridge`
`language_bridge`
`practice`
`agent`
`telemetry`
`progression`
`persistence`

These are domain boundaries, not necessarily independent services.

## 9. Definition of done — FIRST 10 MINUTES V0

The specification is implemented when one automated/smoke path and one human playthrough can demonstrate the complete first-loop acceptance criteria with persisted state and inspectable telemetry.

Passing the document review does not mean the game exists. The states remain distinct:

`SPECIFIED → IMPLEMENTED → TESTED → PLAYABLE → VERIFIED`

## 10. Next technical gate

After approval of this product loop, define **HNK-VERSE ZERO RUNTIME V0**:

- target platform;
- rendering strategy;
- monorepo/application topology;
- persistence/database;
- agent runtime;
- Codex contract;
- HNK-Idioma contract;
- telemetry schema;
- deployment path;
- local/offline strategy;
- testing and deterministic fixtures.

Only after that gate should the dedicated third repository be initialized with production structure.