# HNK MANIFESTATION MATRIX — 10 × 11 — V0

**Status:** HNK_APPROVED_BY_TW — architectural candidate for implementation
**Parent:** `HNK_MANIFESTATION_CORE_V0.md`
**Purpose:** map the 10 Sephiroth across the 11 systems of the HNK Manifestation Core.

> The Kabbalistic Tree is not a cosmetic skill tree. It is a deep organization and progression architecture of HNK.

## 1. Axes

### Kabbalistic progression

`MALKUTH → YESOD → HOD / NETZACH → TIPHERETH → GEVURAH / CHESED → BINAH / CHOKHMAH → KETHER`

### Manifestation scale

`HOME → VILLAGE → CITY → REGION → WORLD → WORLDS → VERSE`

The first axis describes increasing integration/operation of HNK architecture. The second describes the scale of the executable world. They are related but not identical.

## 2. The 11 systems

1. `WORLD` — terrain, regions, cities, buildings and spaces.
2. `LIFE` — avatar, needs, relationships, skills, professions and cycles.
3. `CREATION` — creation of objects, houses, worlds, agents and systems.
4. `CODEX_BRIDGE` — living Codex knowledge accessible in the world.
5. `LANGUAGE_BRIDGE` — HNK language operating in the world.
6. `LUCIDITY` — distinction among experience, interpretation, evidence and canon.
7. `SIMULATION` — economy, time, agriculture, crafting and ecosystems.
8. `AGENTS` — persistent NPCs and AI agents.
9. `SOCIAL` — players, groups, schools, temples, companies and communities.
10. `TELEMETRY` — history, provenance and observability of events.
11. `CREATOR` — creation/governance tools for TW and delegated users.

## 3. Matrix 10 × 11

| Sephirah | WORLD | LIFE | CREATION | CODEX BRIDGE | LANGUAGE BRIDGE | LUCIDITY | SIMULATION | AGENTS | SOCIAL | TELEMETRY | CREATOR |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Malkuth** | physical/digital terrain and place | embodied avatar and daily needs | concrete objects/buildings | applied knowledge | practical vocabulary/commands | observable event vs interpretation | resources, inventory, crafting, day cycle | embodied NPC presence | household/local interaction | action/event log | place/object authoring |
| **Yesod** | world-state foundation | memory, identity and internal state | reusable patterns/templates | knowledge links and memory | symbolic interface and command substrate | experience/testimony layer | persistence and state transitions | persistent memory/context | bonds and persistent groups | provenance/event correlation | template/prefab system |
| **Hod** | maps, labels and systemic representation | skills/study/cognition | rule-based construction | structured study and retrieval | grammar, symbols, naming and formal commands | classification and explicit epistemic status | formulas, markets, schedules and rules | reasoning/tool interfaces | institutions and formal coordination | structured metrics/querying | rule/schema editors |
| **Netzach** | aesthetic/experiential spaces | desire, emotion, creativity and relationships | expressive/artistic creation | experiential learning | expressive speech, art and performance | subjective experience preserved without automatic canonization | attraction, preference and behavioral loops | personality/expression | community, affinity and culture | experience/engagement signals | creative authoring tools |
| **Tiphereth** | coherent inhabited world | integrated identity and purpose | coherent works joining form and meaning | knowledge → wisdom → practice integration | meaningful communication in context | integrated self-map without erasing uncertainty | balanced system loops | coherent agent identity | cooperation around shared purpose | integrated player/world profile | orchestration across systems |
| **Gevurah** | boundaries, permissions and constraints | discipline, limits and consequences | validation/rejection constraints | source/evidence gates | syntax/permission constraints | contradiction, challenge and falsification paths | scarcity, costs, cooldowns and enforcement | policy/safety constraints | moderation and sanctions | anomaly/audit controls | permission and approval gates |
| **Chesed** | expansion and shared territories | generosity, support and growth | sharing and generative abundance | accessible knowledge distribution | communication reach and teaching | charitable interpretation without suppressing evidence | abundance, grants and growth systems | helpful/cooperative agents | guilds, schools, care and collaboration | positive contribution signals | delegation and community creation |
| **Binah** | world architecture and durable structure | developmental structure | systems, blueprints and constraints | taxonomy/ontology and curricula | linguistic structure/model | evidence models and analytical frameworks | deep simulation models | agent architecture | institutional architecture | data models and longitudinal analysis | world/system schema design |
| **Chokhmah** | generative world potential | insight and emergent possibility | ideation/generative primitives | discovery and new hypotheses | generative linguistic possibility | hypothesis generation without premature truth claims | emergence and generative simulation | generative agent behavior | new social forms | discovery signals | generative creation primitives |
| **Kether** | unity of the manifested world model | integrated whole-person horizon | unification of creation layers | unified HNK knowledge horizon | unified communication horizon | highest integration target while preserving unknowns | whole-system orchestration | ecosystem-level agent coordination | whole-community horizon | global observability | root-level orchestration under HNK governance |

## 4. 110-cell rule

The 110 cells are architectural intersections, not 110 independent features. A runtime feature may implement multiple cells, but every implementation must declare which intersections it touches.

Minimum feature metadata:

```yaml
feature_id: HNK-MANIFEST-...
sephiroth: []
systems: []
progression_stage: ZERO
codex_refs: []
language_refs: []
telemetry_events: []
authority_scope: USER|DELEGATED|TW_ROOT
status: CANDIDATE
```

## 5. ZERO lock

The first executable vertical slice remains intentionally small:

`1 PLAYER → 1 AVATAR → 1 LAND → 1 HOME → 1 DAY CYCLE → 1 INVENTORY → CODEX → HNK LANGUAGE → 1 PRACTICE → 1 AI AGENT → TELEMETRY → PROGRESSION`

ZERO begins operationally in **Malkuth**, while using foundation services from Yesod and minimum bridges into Hod/Netzach. Higher Sephiroth must not be simulated merely by labels; capabilities are unlocked only when their corresponding systems actually exist.

## 6. Fundamental loop

`KNOW → NAME → CREATE → LIVE → OBSERVE → RECORD → LEARN → KNOW MORE`

This connects the three HNK cores:

- **CODEX-HNK:** knowledge · wisdom · practice.
- **HNK-IDIOMA:** language · symbol · communication.
- **MANIFESTATION CORE:** world · life · creation · executable experience.

## 7. Architectural invariants

1. Kabbalistic terminology must correspond to system behavior, not decoration alone.
2. Spatial scale does not automatically imply initiatory/knowledge progression.
3. Player level does not equal human value.
4. Experience does not automatically become evidence or canon.
5. User-generated content does not automatically become HNK canon.
6. `CREATOR` permissions and epistemic authority are separate concerns.
7. TW root governance does not fabricate competence or evidence.
8. Telemetry must preserve provenance for meaningful state transitions.
9. Codex and Language bridges use canonical/versioned sources rather than silent copies whenever technically possible.
10. The world may expand fractally, but ZERO must remain independently testable.
11. Love, Truth and Lucidity remain constitutional constraints inherited from the HNK Codex governance layer.

## 8. Product consequence

The Manifestation Core is not a game with a Kabbalistic theme placed on top. The Tree organizes progression, systems, constraints, expression, integration and manifestation.

The world grows horizontally:

`HOME → VILLAGE → CITY → REGION → WORLD → WORLDS → VERSE`

The player/system grows vertically through the Tree.

The two axes meet in executable practice: knowledge from the Codex is named/communicated through HNK language and manifested as actions, creations and consequences in the world.

## 9. Next gate

Before creating the dedicated third repository, close:

1. ZERO first-10-minutes playable loop.
2. Minimum technical stack and runtime topology.
3. Canonical integration contract with CODEX-HNK.
4. Canonical integration contract with HNK-IDIOMA.
5. Identity/name of the third core and repository.

Until item 5 is approved, `HNK-VERSE` remains a functional codename and `MANIFESTATION CORE` remains the architectural name.
