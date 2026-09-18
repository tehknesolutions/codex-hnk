# HNK Claim Re-evaluation Queue V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_CLAIM_REEVALUATION_QUEUE_V1` detects when an **active reviewed claim** is still bound to an older `HNK_EVIDENCE_SYNTHESIS_V1` snapshot while a newer snapshot of the **same synthesis key** exists.

The queue creates a `REVIEW_DUE` work item. It does not alter the reviewed claim.

## Boundary

`REEVALUATION_QUEUE_DETECTS_EVIDENCE_SNAPSHOT_CHANGE_NOT_NEW_TRUTH_CLASSIFICATION_OR_CANON`

The queue may detect:

- synthesis SHA-256 digest changed;
- a linked metric group disappeared;
- linked group status changed;
- linked descriptive direction changed;
- source questions changed;
- new metric groups appeared that were not previously linked to the claim.

The queue does **not** decide whether those changes support or weaken the claim.

## Required inputs

A candidate assessment requires:

1. a valid `HNK_REVIEWED_CLAIM_REGISTRY_V1`;
2. the active reviewed `claim_id`;
3. the exact original `HNK_CLAIM_DOSSIER_V1` bound to that active reviewed record;
4. a valid candidate `HNK_EVIDENCE_SYNTHESIS_V1`;
5. the candidate synthesis must use the same `synthesis_key` as the reviewed claim.

The original dossier digest, statement, scope, synthesis key and synthesis digest must match the active Reviewed Claim Registry record.

## Trigger

The V1 trigger is intentionally conservative:

```
same synthesis_key
AND
candidate_synthesis_digest != reviewed_synthesis_digest
→ REVIEW_DUE
```

If the digest is unchanged:

```
review_due = false
next_workflow = NONE
```

A digest change is enough to require re-evaluation because the previous human review was bound to a specific synthesis snapshot.

## Linked-group diff

For each metric group linked by the original dossier, V1 compares:

- exact metric-signature digest;
- synthesis group status;
- convergent direction;
- source-question set.

Possible reasons include:

- `SYNTHESIS_SNAPSHOT_CHANGED`
- `LINKED_GROUP_MISSING`
- `LINKED_GROUP_STATUS_CHANGED`
- `LINKED_GROUP_DIRECTION_CHANGED`
- `SOURCE_QUESTIONS_CHANGED`
- `UNCLASSIFIED_NEW_GROUPS_PRESENT`

New groups are intentionally labeled **unclassified**. Their presence does not mean they are relevant to the claim.

Human relevance classification remains a Claim Dossier responsibility.

## Classification lock

A re-evaluation item carries the previous reviewed classification for context, but the machine cannot modify it:

```
previous_classification = <existing reviewed classification>
machine_changed_classification = false
machine_can_resolve = false
human_review_required = true
```

The only workflow transition emitted by a `REVIEW_DUE` item is:

```
CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW
```

That new workflow may eventually produce a new Reviewed Claim Registry version through explicit supersession, but only after a new human Evidence Review Gate decision.

## Queue semantics

Each queue item is unique by:

- reviewed record ID;
- candidate synthesis digest.

The queue rejects duplicate re-evaluation candidates.

Every item receives an SHA-256 `item_digest`; the complete queue receives an SHA-256 `queue_digest`.

## Pipeline

```
REVIEWED CLAIM REGISTRY
        ↓
ACTIVE CLAIM + ORIGINAL DOSSIER
        ↓
NEW EVIDENCE SYNTHESIS SNAPSHOT
        ↓
CHANGE DETECTION
        ↓
REVIEW_DUE
        ↓
NEW CLAIM DOSSIER
        ↓
NEW HUMAN EVIDENCE REVIEW GATE
        ↓
OPTIONAL EXPLICIT SUPERSESSION IN REVIEWED CLAIM REGISTRY
```

There is no automatic claim reclassification and no automatic HNK_CANON transition.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab imports and exports JSON without automatic database or browser persistence.

## Non-goals

V1 does not:

- infer whether new evidence confirms or falsifies a claim;
- change a reviewed classification;
- resolve a review item automatically;
- create a new reviewed claim version automatically;
- infer causal, therapeutic, supernatural, or metaphysical effects;
- promote anything into HNK_CANON.

Claim Re-evaluation Queue V1 is a change-detection and governance queue, not a truth or decision engine.
