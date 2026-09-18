# HNK Claim Re-evaluation Batch Scanner V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_CLAIM_REEVALUATION_BATCH_SCANNER_V1` automates the repetitive part of claim re-evaluation without automating the human decision.

Instead of checking one reviewed claim at a time, the scanner:

1. enumerates **all active claims** in a valid `HNK_REVIEWED_CLAIM_REGISTRY_V1`;
2. finds the exact original Claim Dossier by `dossier_digest`;
3. finds one candidate Evidence Synthesis snapshot by exact `synthesis_key`;
4. delegates claim-level drift analysis to `HNK_CLAIM_REEVALUATION_QUEUE_V1`;
5. classifies scan coverage as CURRENT, REVIEW_DUE, or an explicit missing-input state;
6. can materialize REVIEW_DUE results into an existing re-evaluation queue.

It never changes a reviewed classification.

## Boundary

`BATCH_SCANNER_AUTOMATES_CHANGE_DETECTION_COVERAGE_NOT_HUMAN_REVIEW_RECLASSIFICATION_TRUTH_OR_CANON`

## Inputs

A batch scan requires:

- one Reviewed Claim Registry;
- zero or more original Claim Dossiers;
- zero or more candidate Evidence Synthesis snapshots;
- a scan timestamp.

The scanner accepts incomplete collections so that missing coverage remains visible rather than being silently ignored.

## Exact matching rules

### Original dossier

An active reviewed record expects the exact original dossier by:

`record.dossier_digest === dossier.dossier_digest`

If the digest is absent from the supplied dossier set:

`MISSING_ORIGINAL_DOSSIER`

If a supplied dossier uses that digest but its claim identity, statement, scope, or synthesis binding does not match the active reviewed record, the scan fails as an integrity error.

### Candidate synthesis

Candidate syntheses are indexed by exact `synthesis_key`.

Only one candidate snapshot per synthesis key is allowed in a batch. Duplicate candidate keys are rejected as ambiguous input.

If an active claim's synthesis key has no candidate:

`MISSING_CANDIDATE_SYNTHESIS`

## Scan statuses

Every active reviewed claim receives exactly one status:

- `CURRENT`
- `REVIEW_DUE`
- `MISSING_ORIGINAL_DOSSIER`
- `MISSING_CANDIDATE_SYNTHESIS`

`CURRENT` and `REVIEW_DUE` are delegated to the existing claim-level re-evaluation contract.

The scanner does not invent new evidence semantics.

## Coverage

The scan exposes:

- number of active claims;
- number of dossier inputs;
- number of synthesis inputs;
- status counts;
- unused dossier digests;
- unused candidate synthesis keys.

`coverage_complete = true` only when no active claim is missing its original dossier or candidate synthesis.

Unused inputs remain visible for cleanup/audit.

## Queue materialization

A scan may be materialized into an existing `HNK_CLAIM_REEVALUATION_QUEUE_V1`.

Only `REVIEW_DUE` results are added.

Queue item identity is deterministic from:

```
reviewed_record_id
+
candidate_synthesis_digest
```

If the same pair already exists in the target queue, materialization skips it rather than duplicating it.

This makes repeated batch materialization idempotent for the same reviewed-record/candidate-snapshot pair.

## Human authority lock

For every scan and every materialized queue item:

```
machine_can_decide_review = false
machine_can_change_classification = false
automatic_truth_inference = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

A REVIEW_DUE result still points to:

`CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW`

The batch scanner cannot complete that workflow.

## New synthesis groups

If a candidate synthesis contains metric groups that were not linked by the original dossier, the underlying claim-level assessment records them as unclassified new groups.

The batch scanner preserves that result.

It does not infer that a new metric group is relevant to the claim.

## Integrity

Each scan receives an SHA-256 `scan_digest`.

The digest binds:

- registry identity;
- scan timestamp;
- all per-claim statuses;
- linked assessments;
- coverage counts;
- unused inputs;
- authority locks.

Any mutation invalidates the digest.

## Pipeline

```
REVIEWED CLAIM REGISTRY
        +
ORIGINAL DOSSIER COLLECTION
        +
CANDIDATE EVIDENCE SYNTHESIS COLLECTION
        ↓
RE-EVALUATION BATCH SCANNER
        ↓
CURRENT / REVIEW_DUE / COVERAGE GAP
        ↓
REVIEW_DUE ONLY
        ↓
CLAIM RE-EVALUATION QUEUE
        ↓
NEW CLAIM DOSSIER
        ↓
HUMAN EVIDENCE REVIEW
```

There is no automatic reclassification and no automatic transition to HNK_CANON.

## Persistence

```
server_persistence = false
browser_persistence = false
```

The private Research Lab imports and exports user-controlled JSON.

## Non-goals

V1 does not:

- decide whether changed evidence supports or weakens a claim;
- infer relevance for newly appearing metric groups;
- modify Reviewed Claim Registry records;
- resolve REVIEW_DUE items;
- create a new Claim Dossier automatically;
- perform the human Evidence Review Gate decision;
- infer truth, causality, therapeutic efficacy, supernatural efficacy, or metaphysical proof;
- promote anything into HNK_CANON.

The scanner automates coverage and change detection, not judgment.
