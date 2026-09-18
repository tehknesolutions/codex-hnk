# HNK Research Workspace Snapshot V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1` freezes the current research workspace under one root SHA-256 digest.

V1 binds exactly three governed components:

- `HNK_RESEARCH_ARTIFACT_LIBRARY_V1`;
- `HNK_REVIEWED_CLAIM_REGISTRY_V1`;
- `HNK_CLAIM_REEVALUATION_QUEUE_V1`.

The result is a portable checkpoint of the state needed to continue the evidence/claim maintenance workflow.

## Boundary

`WORKSPACE_SNAPSHOT_FREEZES_RESEARCH_STATE_NOT_TRUTH_REVIEW_DECISION_OR_CANON`

A workspace checkpoint proves what validated component state was frozen. It does not prove that any claim is objectively true, causally established, metaphysically proven, or canonical.

## Root digest

The snapshot embeds all three complete components and records their existing digests:

```
artifact_library.library_digest
reviewed_claim_registry.registry_digest
claim_reevaluation_queue.queue_digest
```

Those digests are copied into `component_digests`.

The complete snapshot then receives:

`snapshot_digest = SHA-256(canonical snapshot projection)`

The root digest therefore binds:

- snapshot identity;
- label and timestamp;
- optional parent digest;
- complete embedded components;
- exact component digests;
- state-summary counts;
- authority locks.

Any nested mutation invalidates either the component contract, the component digest binding, the root digest, or more than one of those checks.

## State summary

For operational visibility, each checkpoint stores derived counts:

- total research artifacts;
- latest artifacts;
- reviewed claim records;
- active reviewed claims;
- REVIEW_DUE queue items.

These values are validated against the embedded component state and cannot drift independently.

## Parent lineage

A snapshot may reference one direct predecessor:

`parent_snapshot_digest`

The field is optional.

V1 comparison recognizes:

- `SAME`;
- `LEFT_PARENT_OF_RIGHT`;
- `RIGHT_PARENT_OF_LEFT`;
- `UNRELATED_OR_INDIRECT`.

V1 does not attempt to discover an arbitrary historical ancestry graph because it only receives two checkpoint files at comparison time.

## Comparison

`compareResearchWorkspaceSnapshots(left, right)` compares component digests and reports changes independently for:

- `ARTIFACT_LIBRARY`;
- `REVIEWED_CLAIM_REGISTRY`;
- `CLAIM_REEVALUATION_QUEUE`.

It also reports deltas for the derived state counts.

Comparison is structural. It does not interpret whether the change is good, bad, supportive, contradictory, true, or canonical.

## Exact restore

`restoreResearchWorkspaceSnapshot(snapshot)` validates the root checkpoint and returns exact deep-cloned copies of the three embedded components.

Restore in V1 means **recovering exact component JSON state**.

It does not automatically write to:

- a server;
- a database;
- browser storage;
- HNK_CANON.

The private lab lets the user export the recovered component files for explicit re-import into the corresponding modules.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

A checkpoint is a portable JSON file.

## Immutability

```
immutable_checkpoint = true
```

A checkpoint is never edited in place.

To capture a later state:

1. restore/import or continue from the earlier component files;
2. make legitimate component changes through their own contracts;
3. create a new workspace snapshot;
4. optionally set the previous snapshot digest as `parent_snapshot_digest`.

This creates a checkpoint lineage without rewriting history.

## Pipeline

```
ARTIFACT LIBRARY
        +
REVIEWED CLAIM REGISTRY
        +
CLAIM RE-EVALUATION QUEUE
        ↓
RESEARCH WORKSPACE SNAPSHOT
        ↓
ROOT SHA-256
        ├── EXPORT
        ├── COMPARE
        └── EXACT COMPONENT RESTORE
```

The snapshot is a cross-cutting checkpoint layer. It does not replace the evidence pipeline beneath it.

## Authority locks

```
automatic_truth_inference = false
machine_can_decide_review = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from a Research Workspace Snapshot to HNK_CANON.

## Non-goals

V1 does not:

- determine truth;
- decide a Human Evidence Review Gate;
- change a reviewed claim classification;
- resolve REVIEW_DUE;
- infer evidence relevance;
- perform causal inference;
- establish therapeutic, supernatural, or metaphysical efficacy;
- promote any object into HNK_CANON;
- automatically persist restored components.

Research Workspace Snapshot V1 is an integrity, portability, comparison, and checkpoint mechanism.
