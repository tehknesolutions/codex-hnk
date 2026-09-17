# HNK CODEX DECISION LAYER — V1

Status: **IMPLEMENTED / PRIVATE RESEARCH INFRASTRUCTURE**

Protocol: `CODEX_ADMISSION_PROTOCOL_V1`

Canon import: `NONE_AUTOMATIC`

## Purpose

The Decision Layer turns the approved admission catalogs into a queryable operational policy without duplicating or rewriting their historical/source records.

Its source of truth remains:

- `canon/references/research-001-kabbalah-hermetica/catalog.json`
- `canon/references/research-001-kabbalah-hermetica/comparative-pass-004/catalog.json`

Current Research 001 footprint: **84 admission items**.

## Derived operational policies

| Admission decision | Decision Layer policy | Human Gate |
| --- | --- | --- |
| `CORE` | `ADMITTED_GOVERNANCE` | no pending promotion |
| `REFERENCE` | `REFERENCE_ONLY` | no |
| `CANDIDATE` | `AWAITING_HUMAN_GATE` | **required** |
| `RESEARCH_ONLY` | `QUARANTINED_RESEARCH` | no automatic promotion |
| `EXCLUDE_OPERATIONALLY` | `BLOCKED_FROM_RUNTIME` | no |

All records use `PRESERVE_RESEARCH_RECORD`: operational exclusion never means historical deletion.

## HNK candidates

For `CANDIDATE` items the runtime may expose a derived proposal object marked explicitly as:

```text
origin: HNK_CANDIDATE_FROM_RESEARCH
status: AWAITING_HUMAN_GATE
```

The proposal reuses the catalog description and admission rationale. It does not rewrite the candidate as a historical-source claim and does not promote it to `HNK_CANON`.

## Private API

`GET /api/research/decisions`

Filters:

- `q`
- `item_id`
- `decision`
- `hnk_value`

The endpoint shares the Research Lab server gate:

- `HNK_RESEARCH_LAB_ENABLED=true`
- server-side Bearer token from `HNK_RESEARCH_LAB_TOKEN`
- `private, no-store`
- 404 while disabled
- `NONE_AUTOMATIC` canon lock

## Private UI

`/research/decisions`

The page is server-gated, `noindex, nofollow`, and exposes:

- why an element enters or remains in the Codex;
- its limiting/risk reason;
- operational policy;
- provenance and historical layer;
- Human Gate state;
- explicit archive-not-delete state for excluded material;
- HNK candidate proposal only when the underlying catalog decision is `CANDIDATE`.

## Deterministic gate

`scripts/validate-research-decision-layer.mjs` verifies the two Research 001 catalogs, their protocol and canon lock, unique IDs, valid decisions/value levels, required rationales and the expected 84-item footprint.

Vercel runs this validator before the normal Web production build.

## Boundary

This layer makes **Codex governance decisions**, not metaphysical truth judgments. Historical occult correspondences and supernatural claims remain scoped to their documented sources/traditions. HNK adoption remains a separate explicit decision.
