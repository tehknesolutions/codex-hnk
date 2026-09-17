# HNK HUMAN GATE PROTOCOL — V1

Status: **IMPLEMENTED / GOVERNANCE CORE**

Scope: promotion, retention, quarantine or operational exclusion of HNK research candidates.

## Purpose

The Human Gate is the only path from `CANDIDATE` research material to `HNK_CANON`.

Research similarity, historical prestige, repeated correspondence, model confidence, aesthetic fit, numerological fit, source authority, or machine recommendation are insufficient by themselves.

## Source boundary

The Human Gate consumes candidates already classified by `CODEX_ADMISSION_PROTOCOL_V1`.

For Research 001, the source catalogs remain:

- `canon/references/research-001-kabbalah-hermetica/catalog.json`
- `canon/references/research-001-kabbalah-hermetica/comparative-pass-004/catalog.json`

The gate does not rewrite those source records.

## Allowed outcomes

Each candidate may receive exactly one active human decision:

- `PROMOTE_TO_HNK_CANON`
- `KEEP_AS_CANDIDATE`
- `RECLASSIFY_AS_REFERENCE`
- `MOVE_TO_RESEARCH_ONLY`
- `EXCLUDE_OPERATIONALLY`

Every outcome preserves the original research record.

## Required decision record

A Human Gate decision must contain:

```text
gate_id
source_item_id
outcome
approved_by
approved_at
rationale
source_item_version
resulting_status
```

Recommended fields:

```text
constraints[]
conflicts_acknowledged[]
dependencies_acknowledged[]
notes
```

`approved_by` must identify the human authority that explicitly made the decision. It may never be inferred from model output or from an automated workflow.

## Canon promotion rule

`PROMOTE_TO_HNK_CANON` is valid only when:

1. the source item exists;
2. its current admission decision is `CANDIDATE`;
3. the Human Gate decision is explicit and attributable to a human authority;
4. the rationale is non-empty;
5. the source candidate version is recorded;
6. conflicts and dependencies remain traceable;
7. the resulting canonical record is authored as HNK material and does not impersonate historical authority.

## Non-destructive history

Human review changes operational authority, not historical provenance.

```text
SOURCE RECORD -> preserved
HUMAN GATE DECISION -> appended
HNK CANON RECORD -> separately authored when approved
```

A rejected, quarantined or blocked item remains searchable in research history.

## Machine boundary

Machines may:

- enumerate candidates;
- summarize evidence and provenance;
- surface conflicts and dependencies;
- validate record structure;
- generate implementation proposals marked as proposals.

Machines may not:

- approve themselves;
- infer approval from silence;
- promote `CANDIDATE` to `HNK_CANON`;
- overwrite the historical source record;
- hide conflicting evidence.

## Research 001 registry

Human Gate decisions for Research 001 are stored at:

`canon/governance/human-gates/research-001.json`

The registry begins with an empty `decisions` array. This is intentional: no candidate is considered approved until an explicit Human Gate decision is recorded.

## Operational consequence

Until a Human Gate decision exists, every Research 001 candidate remains:

```text
status: AWAITING_HUMAN_GATE
runtime authority: NONE
canon import: NONE_AUTOMATIC
```
