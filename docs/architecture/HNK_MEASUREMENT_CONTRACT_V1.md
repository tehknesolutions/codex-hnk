# HNK Measurement Contract V1

Status: `IMPLEMENTED_CONTRACT`

## Purpose

`HNK_MEASUREMENT_CONTRACT_V1` turns preregistered `observed_variables` into typed, auditable metric definitions before any experiment session is admitted.

It does **not** alter `HNK_EXPERIMENT_PROTOCOL_V1`. It is a separate overlay bound to that protocol through the experiment preregistration SHA-256 digest.

## Invariants

- measurement plan is created only while the experiment is `PREREGISTERED` and has zero sessions;
- each preregistered observed variable maps to exactly one typed metric in V1;
- metric definitions are frozen into a `measurement_plan_digest`;
- later experiment states must preserve the same preregistration digest;
- measurement records reference real experiment assignments and runtime session IDs;
- one record per `assignment_id + metric_id` in V1;
- values are validated according to metric type;
- summaries are descriptive only;
- no automatic server, database or browser persistence.

## Metric types

- `NUMBER` — finite numeric value, optional bounds;
- `BOOLEAN` — `true` / `false`;
- `CATEGORY` — value from a preregistered finite option set;
- `TEXT` — non-empty textual observation;
- `COUNT` — integer `>= 0`, optional bounds;
- `SCALE` — numeric scale with fixed min, max and step plus optional labeled anchors.

## Required metric metadata

Each metric stores:

```text
metric_id
source_variable
label
type
unit
collection_method
evidence_source
timepoint
timepoint_label
evaluation_criterion
```

Type-specific metadata is stored separately (`numeric_bounds`, `category_options`, `scale`).

## Evidence sources

```text
RUNTIME_DERIVED
SELF_REPORT
OBSERVER_RECORDED
INSTRUMENT
EXTERNAL_RECORD
```

This field describes the source of a recorded value. It does not increase evidentiary strength automatically.

## Timepoints

```text
PRE
DURING
POST
FOLLOW_UP
EVENT_BOUNDARY
```

`FOLLOW_UP` and `EVENT_BOUNDARY` require an explicit `timepoint_label` so timing is not silently inferred.

## Measurement matrix

The matrix is keyed by experiment assignment and includes:

```text
assignment_id
role
session_id
values[metric_id]
missing_metrics[]
```

Missing data stays missing. The contract never silently imputes values.

## Descriptive summaries

For `NUMBER`, `COUNT` and `SCALE`:

```text
n
min
max
mean
missing
```

For `BOOLEAN` and `CATEGORY`:

```text
n
counts
missing
```

For `TEXT`:

```text
n
non_empty
missing
```

No inferential statistical test is performed in V1.

## Epistemic boundary

Every contract carries:

```text
MEASUREMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF
```

and keeps:

```text
inferential_statistics_performed = false
causal_claim_permitted = false
metaphysical_proof_permitted = false
```

Typed measurement improves structure and auditability. It does not by itself establish causality, clinical efficacy, supernatural efficacy or metaphysical truth.
