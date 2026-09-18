# HNK Workspace Snapshot Registry V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1` catalogs immutable `HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1` checkpoints by `snapshot_digest`, validates parent → child lineage, detects forks, maintains an explicit human-controlled HEAD pointer, and compares any registered pair.

The registry is a timeline and navigation layer over already-valid checkpoints.

## Boundary

`SNAPSHOT_REGISTRY_CATALOGS_CHECKPOINT_LINEAGE_AND_HEAD_POINTER_NOT_TRUTH_REVIEW_DECISION_OR_CANON`

The registry does not decide whether one checkpoint is scientifically better, truer, more canonical, or more spiritually authoritative than another.

## Snapshot identity

The canonical registry identity is:

`snapshot_digest`

A snapshot may be registered only once.

The complete validated snapshot payload is retained inside the registry record together with:

- snapshot key;
- label;
- snapshot creation time;
- parent digest;
- registry admission time;
- record SHA-256 digest.

## Parent validation

A non-root snapshot may enter only when its declared parent digest is already registered.

This creates an explicit admission order:

```
register root
   ↓
register child
   ↓
register grandchild
```

Orphan checkpoints are not silently accepted.

```
orphan_snapshots_permitted = false
```

Because every parent must pre-exist and each embedded snapshot has only one parent, registry admission cannot manufacture a cycle.

## Roots, tips, and forks

A root has:

`parent_snapshot_digest = null`

A tip has no registered children.

A fork exists when one registered parent has more than one registered child:

```
        parent
       /      \
   child A   child B
```

Forks are permitted because independent research branches can be legitimate.

They are never silently resolved.

The registry reports:

- root count;
- tip count;
- fork count;
- exact child digests for every fork.

## HEAD

HEAD is an operational pointer to the checkpoint the human currently wants to treat as the active research workspace reference.

Registration does **not** choose HEAD automatically.

```
machine_can_choose_head = false
explicit_head_move_required = true
```

A HEAD move requires:

- registered target snapshot digest;
- timestamp;
- non-empty reason;
- explicit human signal.

Every move is appended as an immutable HEAD event containing:

- from digest;
- to digest;
- reason;
- explicit human signal;
- event SHA-256 digest.

The current `head_snapshot_digest` must always equal the target of the last HEAD event.

## HEAD history

HEAD history is non-destructive.

A human may explicitly move HEAD:

- forward to a child;
- backward to an ancestor;
- across a fork;
- to a checkpoint in another registered root lineage.

The registry records the move but does not judge it.

## Ancestry

`workspaceSnapshotAncestry(registry, digest)` returns:

- requested snapshot digest;
- root digest;
- root → snapshot path;
- depth.

Ancestry follows exact embedded parent digests.

## Comparison

`compareRegisteredWorkspaceSnapshots` delegates structural comparison to the Workspace Snapshot contract.

Any two registered checkpoints may be compared, including checkpoints from separate roots or forks.

Comparison reports component changes and count deltas but preserves:

```
truth_assessed = false
canon_promotion_permitted = false
```

## Integrity

Each registry snapshot record receives a SHA-256 `record_digest`.

Each HEAD move receives a SHA-256 `event_digest`.

The complete registry receives a SHA-256 `registry_digest`.

Validation checks:

- embedded snapshot validity;
- snapshot digest identity;
- metadata parity;
- record digests;
- parent existence;
- cycle absence;
- HEAD event chain continuity;
- registered HEAD targets;
- current HEAD parity;
- registry root digest.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab imports and exports registry JSON.

No automatic database or browser persistence is introduced.

## Pipeline

```
RESEARCH WORKSPACE SNAPSHOT
        ↓
SNAPSHOT REGISTRY
        ├── TIMELINE
        ├── ROOT / TIP DETECTION
        ├── FORK DETECTION
        ├── ANCESTRY
        ├── COMPARE ANY PAIR
        └── EXPLICIT HUMAN HEAD
```

The registry is a checkpoint-management layer, not a new evidence or canon authority.

## Authority locks

```
machine_can_choose_head = false
automatic_truth_inference = false
machine_can_decide_review = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from Snapshot Registry HEAD to HNK_CANON.

## Non-goals

V1 does not:

- choose the scientifically preferred branch;
- automatically resolve forks;
- delete old checkpoints;
- rewrite snapshot history;
- infer truth or causality;
- decide evidence review;
- change reviewed-claim classifications;
- infer supernatural or metaphysical proof;
- promote a checkpoint or HEAD into HNK_CANON.

Workspace Snapshot Registry V1 is a verifiable timeline, lineage, fork, comparison, and human HEAD mechanism.
