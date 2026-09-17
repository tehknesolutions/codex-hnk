# HNK Experiment Protocol V1

Status: `IMPLEMENTED_CONTRACT`

Authority: `HNK_AUTHORED`

Upstream contracts:

- `HNK_SYMBOLIC_RUNTIME_CONTRACT_V1`
- `HNK_RUNTIME_SESSION_ARTIFACT_V1`

## Purpose

`@hnk/experiment-protocol` groups validated runtime-session artifacts into a preregistered experiment without turning symbolic experience into automatic causal or metaphysical claims.

The protocol separates four layers:

```text
QUESTION / HYPOTHESIS
        ↓
PREREGISTERED PLAN
        ↓
CONTROL + EXPERIMENT ARTIFACTS
        ↓
DESCRIPTIVE REPORT
        ↓
INTERPRETATION + LIMITATIONS
```

## Preregistration lock

Before any artifact can be attached, the experiment records and locks:

- question;
- hypothesis;
- observed variables;
- controlled variables;
- intervention description;
- required control-session count;
- required experimental-session count;
- completion criteria;
- exclusion criteria.

`preregistration_locked = true`

The contract never rewrites those fields when sessions are added.

## Session roles

V1 defines exactly two roles:

- `CONTROL`
- `EXPERIMENT`

Every attached session must be a valid `HNK_RUNTIME_SESSION_ARTIFACT_V1` and must pass deterministic replay before admission.

The same runtime `session_id` cannot be assigned twice inside one experiment.

## Status machine

```text
PREREGISTERED
      ↓
IN_PROGRESS
      ↓
READY_TO_FINALIZE
      ↓
COMPLETED
```

`READY_TO_FINALIZE` is derived from the preregistered minimum counts. The software does not silently weaken the minimum after sessions already exist.

## Descriptive report versus interpretation

The final report stores two separate fields:

- `descriptive_summary` — what the records show;
- `interpretation` — the researcher's reading of those records.

It also requires an explicit limitations list or an explicitly empty list.

The report carries:

```text
conclusion_scope = DESCRIPTIVE_AND_INTERPRETIVE_ONLY
causal_claim_permitted = false
metaphysical_proof_permitted = false
```

## Epistemic boundary

Every experiment carries:

`EXPERIMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF`

Therefore:

```text
recorded difference
≠ causal proof
≠ supernatural proof
≠ therapeutic/medical efficacy proof
```

A stronger causal claim would require a research design and evidence standard appropriate to that claim outside this symbolic-runtime contract.

## Persistence

V1 uses user-controlled files only:

```text
server_persistence = false
browser_persistence = false
persistence = USER_CONTROLLED_FILE_ONLY
```

The private Experiment Lab may import/export JSON explicitly, but does not automatically save experiments in a database, `localStorage`, `sessionStorage` or IndexedDB.

## Runtime-artifact admission

For every attached artifact:

1. validate artifact structure;
2. recreate its initial runtime session;
3. replay every recorded event through the shared reducer;
4. require exact replay/snapshot equivalence;
5. reject duplicate session assignment.

This gives internal consistency, not cryptographic authorship proof.

## Descriptive summary

V1 can summarize each role by:

- session ID;
- phase;
- result state;
- evidence scope;
- observation count;
- feedback count;
- event count.

It does not calculate a winner or infer that an intervention caused a difference.

## Human agency

The software may structure and validate the experiment, but the human researcher remains responsible for:

- choosing the question;
- defining the hypothesis;
- choosing variables and criteria before execution;
- deciding what artifacts belong to which role;
- writing the interpretation and limitations.

No machine-generated result becomes HNK canon through this protocol.
