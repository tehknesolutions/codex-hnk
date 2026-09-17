# CODEX ADMISSION PROTOCOL — V1.0

Status: **APPROVED / GOVERNANCE CORE**  
Scope: research, references, symbolic systems, HNK candidates and future canon changes.

## Purpose

This protocol prevents source material, historical tradition, interpretation, HNK inference and HNK canon from being silently merged.

The rule is simple: **preserve everything as research; promote only what passes an explicit admission gate.**

## Mandatory epistemic layers

Every research item must distinguish at least:

1. `SOURCE_FACT` — directly supported by the source being studied.
2. `SOURCE_DOCTRINE` — a doctrinal/metaphysical assertion made by the source or tradition.
3. `SOURCE_CORRESPONDENCE` — a symbolic attribution used by a specific source/tradition.
4. `SOURCE_INTERPRETATION` — an interpretation presented by the source.
5. `UNVERIFIED_SOURCE_CLAIM` — an empirical/supernatural claim not independently established by the research.
6. `OUR_STRUCTURAL_INFERENCE` — a model inferred by HNK research from source structure.
7. `HNK_REFERENCE` — retained for study/comparison without becoming HNK doctrine.
8. `HNK_CANDIDATE` — proposed HNK architecture/content awaiting explicit Human Gate.
9. `HNK_CANON` — explicitly approved HNK canon.

## Admission decisions

Research items use one of these operational decisions:

- `CORE` — admitted as Codex governance/architecture.
- `REFERENCE` — retained for study/comparison; not HNK doctrine by itself.
- `CANDIDATE` — promising HNK adaptation awaiting Human Gate.
- `RESEARCH_ONLY` — retained for investigation only.
- `EXCLUDE_OPERATIONALLY` — documented if relevant, but prohibited from driving HNK runtime behavior unless separately re-approved.

A record may combine compatible purposes, e.g. `REFERENCE+CANDIDATE`, but the machine-readable catalog uses a primary decision plus tags.

## Mandatory provenance

No correspondence, doctrine or historical claim may be stored as a naked universal assertion.

Each item must record, when known:

- immediate source;
- earlier lineage / inherited source;
- tradition;
- recension / manuscript / edition when relevant;
- historical layer;
- uncertainty or source gap;
- conflicts with alternate traditions;
- HNK decision.

## Non-destructive removal rule

"Remove from Codex" means **remove from operational/core status**, not erase the research record.

Rejected or non-operational material remains traceable under references/research unless there is an independent reason to delete it.

## Evidence gate

Any claim of objective change, efficacy, health effect, physical effect, supernatural capability or measurable outcome requires an evidence record.

Traditional claims may still be preserved as `SOURCE_DOCTRINE`, `SOURCE_CORRESPONDENCE` or `UNVERIFIED_SOURCE_CLAIM`, but must not be rewritten as established fact.

## Source-gap rule

The Codex must be able to say `UNKNOWN`, `UNRESOLVED`, `SOURCE_GAP` or `SOURCE_ANOMALY`.

Gaps must never be silently filled from model knowledge or a different tradition. External reconstruction must be stored as a separate provenance layer.

## Versioned correspondence rule

There is no global field such as:

```text
BET.planet = MERCURY
```

Instead use a versioned relation:

```text
subject: BET
domain: PLANET
value: MERCURY
source: GOLDEN_DAWN
tradition: WESTERN_ESOTERICISM
status: REFERENCE
```

A conflicting mapping from another recension/tradition may coexist.

## Human Gate

Only an explicit approval can promote `CANDIDATE` to `HNK_CANON`.

Research similarity, historical prestige, repetition across sources, aesthetic fit, numerical fit or model confidence do **not** constitute canonical approval.

## Required catalog fields

Each catalog entry must provide:

```text
id
name
description
source_basis
historical_layer
classification
primary_decision
hnk_value
admission_reason
risk_or_limit
provenance_status
```

Recommended optional fields:

```text
tags
conflicts
dependencies
source_gap
notes
version
```

## Approved implementation rule

From this protocol onward, research work should produce implementation-ready catalog records rather than free-floating conclusions.

The canonical pipeline is:

```text
SOURCE
  -> PROVENANCE
  -> CLASSIFICATION
  -> STRUCTURAL ANALYSIS
  -> CODEX ADMISSION DECISION
  -> HNK HUMAN GATE
  -> CANON / REFERENCE / RESEARCH
```

## Research 001 lock

The Kabbalah Hermetica research established the first accepted implementation of this protocol. Its catalog lives under:

`canon/references/research-001-kabbalah-hermetica/`

No entry in that directory is automatically HNK canon merely because it is stored below `canon/references`; `references` is a provenance-preserving research namespace.