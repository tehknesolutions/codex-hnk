# HNK Replication Registry V1

Status: HNK-authored infrastructure contract.

## Purpose

The Replication Registry groups multiple independent HNK Evidence Ledgers under one replication key and compares the **descriptive direction** of the same frozen metric signature across runs.

It is designed to answer:

- Was the metric measured in both CONTROL and EXPERIMENT?
- Is the metric definition compatible across runs?
- Does the same descriptive direction repeat across independent experiment IDs?
- Are runs missing enough data to be comparable?
- Are the observed directions mixed?

It does **not** automatically answer:

- Is a claim true?
- Is an effect statistically significant?
- Did the intervention cause the difference?
- Is a clinical or therapeutic effect established?
- Is a supernatural or metaphysical mechanism established?

## Boundary

`REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF`

## Independence rule

Each admitted run must have:

- a unique `run_id`;
- a unique `experiment_id`;
- a unique Evidence Ledger digest.

Re-importing the same experiment or the same ledger does not count as replication.

## Frozen metric signature

The seed Evidence Ledger defines the metric signature. V1 freezes:

- `metric_id`;
- metric type;
- label;
- unit;
- evidence source;
- timepoint;
- preregistered evaluation criterion.

The signature receives its own SHA-256 digest. Later runs must match the complete signature exactly.

V1 supports metrics whose CONTROL × EXPERIMENT aggregate is directly descriptive:

- `NUMBER`
- `COUNT`
- `SCALE`
- `BOOLEAN`

For numeric/count/scale metrics the aggregate is the arithmetic mean. For boolean metrics it is the true-rate.

Category and free-text replication require a later contract because V1 deliberately avoids inventing a similarity metric.

## Per-run direction

For each eligible run:

```
CONTROL aggregate
vs
EXPERIMENT aggregate
```

produces exactly one descriptive direction:

- `HIGHER` — EXPERIMENT aggregate > CONTROL aggregate
- `LOWER` — EXPERIMENT aggregate < CONTROL aggregate
- `EQUAL` — aggregates equal within numeric tolerance
- `INSUFFICIENT` — CONTROL or EXPERIMENT measurements are absent

No p-value, confidence interval, significance test, effect-size threshold, causal score, or metaphysical score is generated in V1.

## Registry status

The registry exposes:

- `INSUFFICIENT` — zero eligible runs
- `SINGLE_RUN` — exactly one eligible run
- `REPLICATED` — at least two eligible runs and all eligible runs share the same descriptive direction
- `MIXED` — at least two eligible runs and more than one descriptive direction is present

`REPLICATED` therefore means:

> the same descriptive direction occurred in at least two eligible independent experiment IDs under an exact metric signature.

It does not mean that a hypothesis is true or that causality has been demonstrated.

Insufficient runs remain visible and are never silently discarded or imputed.

## Integrity

The registry stores:

- each Evidence Ledger digest;
- the frozen metric signature digest;
- run-level descriptive summaries;
- the full registry SHA-256 digest.

Changing a run summary, experiment identity, direction, metric signature, or registry metadata invalidates the registry digest.

## Pipeline

```
EVIDENCE LEDGER A ─┐
EVIDENCE LEDGER B ─┼─→ EXACT METRIC SIGNATURE
EVIDENCE LEDGER C ─┘             ↓
                       DESCRIPTIVE DIRECTION
                                ↓
                     REPLICATION REGISTRY
                                ↓
           INSUFFICIENT / SINGLE_RUN / REPLICATED / MIXED
```

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab can import and export registry JSON. It does not automatically write replication data to the server, database, localStorage, sessionStorage, or IndexedDB.

## Non-goals

V1 deliberately does not implement:

- inferential statistics;
- statistical significance;
- causal inference;
- automatic truth scoring;
- automatic clinical or therapeutic claims;
- supernatural efficacy scoring;
- automatic canon promotion.

Replication Registry V1 is a repeatability ledger, not a truth engine.
