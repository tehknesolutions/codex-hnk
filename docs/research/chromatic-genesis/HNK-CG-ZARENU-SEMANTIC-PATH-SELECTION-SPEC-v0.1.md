# HNK Chromatic Genesis — ZARENU Semantic Path Selection Spec v0.1

Status: RESEARCH / HNK:CANDIDATE
Subject: `CG-ENERGY-001 / ZARENU`
Depends on: E1 Address Registry, E2 Graph Topology, ZARENU Energy Object, Governed Energy Glyph Path Selection Spec

## 1. Decision

ZARENU path selection SHALL use a two-stage gate:

1. **Structural legality** — only E2-authorized graph traversal survives.
2. **Semantic morphology scoring** — ZARENU's Force Profile may rank legal paths only through topology-neutral structural metrics.

No Mandala address receives semantic meaning from this process.

## 2. Source semantics

The current ZARENU Energy Object supplies the intent vector:

`perceive → model → relate → orchestrate`

and two operator affinities:

- `OP_GENERATOR` — HNK:HYPOTHESIS / DERIVED_AMBIGUOUS
- `OP_SPECIFIER` — HNK:HYPOTHESIS / DERIVED_AMBIGUOUS

These affinities MAY alter weights in a research scoring profile. They MUST NOT select addresses directly.

## 3. Candidate path envelope v0.1

- Namespace: `MF` only for the first scored prototype.
- Allowed edges: `MF_ANGULAR`, `MF_RADIAL`.
- Path length: 6–12 directed moves.
- HC: forbidden.
- MF↔CR: forbidden while E2 marks it unresolved.
- Repeated vertex: allowed at most once and penalized.
- Immediate `A→B→A`: rejected.
- One-edge-class-only path: rejected for ZARENU because `relate` requires structural plurality.

The MF-only restriction is methodological, not metaphysical: it uses the strongest fully connected frozen E2 substrate before experimenting with CG or CR components.

## 4. Metrics

Each legal path receives normalized metrics in `[0,1]`:

### P — Perception / variation

`P = uniqueLocalTurns / maxPossibleLocalTurns`

Operationally, a local turn occurs when consecutive moves change direction/class. This rewards sampling/variation without claiming any cell means perception.

### M — Model / recurrence coherence

`M = 1 - normalizedEdgePatternEntropyPenalty`

The target is neither pure repetition nor maximum randomness. Highest score occurs in a middle coherence band where motifs recur without degenerating into oscillation.

### R — Relation / edge-class diversity

For MF v0.1:

`R = usedAllowedEdgeClasses / 2`

A valid ZARENU path therefore reaches `R=1` only when both angular and radial movement participate.

### O — Orchestration / balance

Let `a` and `r` be angular/radial move counts:

`O = 1 - abs(a-r)/(a+r)`

Balanced coordination scores higher than domination by one move family.

### U — Uniqueness / collision distance

`U` measures structural distance from HNK40 benchmark paths and already selected Chromatic Genesis paths. Exact collision is rejection, not merely a low score.

### C — Compactness / bounded manifestation

`C` rewards paths that remain structurally coherent without collapsing into a tiny oscillation or expanding solely for visual spectacle.

## 5. Operator modulation

Operator affinity is explicitly secondary to the four Force dimensions.

`OP_GENERATOR` candidate affinity MAY add at most `+0.05` to paths with stronger P/M combination.

`OP_SPECIFIER` candidate affinity MAY add at most `+0.05` to paths with stronger M/C combination.

Combined operator modulation is capped at `0.08` so hypothetical runtime affinities cannot dominate the Energy Object semantics.

## 6. Base score

```text
BASE = 0.20P + 0.20M + 0.20R + 0.20O + 0.15U + 0.05C
SCORE = clamp(BASE + operatorModulation, 0, 1)
```

Rationale: the four declared ZARENU intent dimensions receive equal primary authority. Uniqueness is important but cannot rewrite semantics. Compactness is a small regularizer.

## 7. Deterministic generation

Candidate generation SHALL use a stable digest over:

- Semantic ID
- lexeme
- intent vector
- Force tendency
- path-selection spec version
- E1 registry digest
- E2 topology version

The digest controls enumeration order only. Digest bytes MUST NOT be interpreted numerologically.

For each start vertex, deterministic bounded walks are generated from legal E2 neighbors. Invalid paths are discarded before scoring.

## 8. Hard rejection gates

Reject any candidate with:

- invalid E1 address;
- illegal E2 transition;
- HC participation;
- unresolved MF↔CR edge;
- immediate A→B→A oscillation;
- fewer than two allowed edge classes;
- exact HNK40 path collision;
- exact collision with an already selected Energy Glyph;
- nondeterministic regeneration;
- missing provenance.

## 9. Shortlist

After hard rejection:

1. score all survivors;
2. sort by `SCORE DESC`;
3. tie-break by stable candidate digest ASC;
4. retain Top 12 as machine shortlist;
5. run pairwise structural-distance diversity selection;
6. retain Top 6 diverse candidates for rendered research preview;
7. nominate Top 3 as Human Gate candidates.

The machine may nominate. It cannot canonize.

## 10. Visual manifestation gate

Only Top 6 structurally valid candidates may be rendered.

Rendering MAY apply the ZARENU amethyst manifestation channel, Auric containment, Titanium structural accents and Obsidian substrate, but color/material treatment does not alter candidate score or path identity.

## 11. Human Gate packet

Each Top 3 candidate must present:

- start address;
- ordered path;
- edge sequence;
- P/M/R/O/U/C metrics;
- operator modulation;
- final score;
- collision report;
- E1/E2 provenance;
- deterministic seed digest;
- vector preview;
- explicit `HNK:CANDIDATE` authority state.

Allowed decisions:

`SELECT_RESEARCH_LEAD | REQUEST_NEW_CANDIDATES | REVISE_SCORING | REJECT_PATH_FAMILY | HOLD_UNRESOLVED`

## 12. Canon boundary

Selection of a research lead does not make the Energy Glyph canonical. Canon promotion requires a later explicit Creator/Human Gate after Composite Sigil, packet round-trip, rendering, collision and provenance evidence are complete.
