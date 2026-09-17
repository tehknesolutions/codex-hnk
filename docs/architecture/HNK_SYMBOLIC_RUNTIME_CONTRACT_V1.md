# HNK Symbolic Runtime Contract V1

Status: `IMPLEMENTED_CONTRACT`

Authority: `HNK_AUTHORED`

Upstream authority: `@hnk/canon-contract` / Human Gate Research 001 Batch 001.

## Purpose

`@hnk/symbolic-runtime-contract` turns the already approved HNK canonical architecture into a deterministic, typed runtime state machine. It does **not** add a new historical correspondence, metaphysical doctrine or automatic Human Gate decision.

The runtime records symbolic work as an auditable sequence:

`intention → specification → construction → context binding → action → observation → feedback → result record`

A result is a runtime/evidence record. The contract explicitly does not treat successful execution as proof of supernatural or metaphysical efficacy.

## Canon dependencies

The runtime requires the following already-approved HNK canon sources:

- `HNK-R001-039` — Force / Form
- `HNK-R001-041` — State / Path Architecture
- `HNK-R001-042` — Relational Semantics
- `HNK-R001-044` — Generator
- `HNK-R001-045` — Specifier / Constraint Engine
- `HNK-R001-046` — Constructor
- `HNK-R001-047` — Regulatory Operator
- `HNK-R001-048` — Pruning Operator
- `HNK-R001-049` — Choice Gate
- `HNK-R001-050` — Cycle
- `HNK-R001-051` — Feedback
- `HNK-R001-052` — Observation
- `HNK-R001-054` — Symbolic Key
- `HNK-R001-055` — Vessel / Runtime Context
- `HNK-R001-058` — Quest → Observation → Feedback
- `HNK-R001-062` — HNK Symbolic Runtime

The package fails closed if these dependencies are not present in `@hnk/canon-contract`.

## Runtime phases

1. `INTENTION_CAPTURED`
2. `SPECIFIED`
3. `CONSTRUCTED`
4. `ACTIVE`
5. `OBSERVED`
6. `FEEDBACK_RECORDED`
7. `CLOSED`
8. `ABORTED`

Transitions are event-driven and deterministic. IDs and timestamps are always supplied by the caller; the reducer does not manufacture them.

## Runtime events

- `GENERATE`
- `SPECIFY`
- `CONSTRUCT`
- `BIND`
- `ACTIVATE`
- `OBSERVE`
- `FEEDBACK`
- `REGULATE`
- `PRUNE`
- `CHOOSE`
- `CYCLE`
- `COMPLETE`
- `ABORT`

The state machine blocks invalid shortcuts. In particular, a session cannot `COMPLETE` before specification, construction, activation, observation and feedback have occurred.

## Epistemic boundary

Observation is stored separately from interpretation. Completion records one of the declared evidence scopes:

- `OBSERVED`
- `SELF_REPORTED`
- `SYSTEM_MEASURED`
- `MIXED`

Every completed result carries the boundary:

`RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF`

This preserves the project rule that tradition, interpretation, subjective experience and objective evidence remain distinguishable.

## Integration

Quest Engine re-exports the shared runtime contract instead of implementing a parallel reducer. Web and Mobile already consume Quest Engine and may therefore adopt this state machine without creating a second canonical runtime implementation.

## Validation locks

`validate-hnk-symbolic-runtime-contract.mjs` enforces:

- valid upstream Canon Contract;
- exact required canon dependency set;
- deterministic reducer declaration;
- caller-supplied IDs and timestamps;
- evidence-scoped results;
- no metaphysical-efficacy implementation claim;
- complete happy-path lifecycle;
- rejection of completion bypass;
- Quest Engine delegation to the shared contract.
