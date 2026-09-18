# HNK Deployment Candidate & Human Deployment Gate V1

Status: HNK-authored deployment-governance infrastructure.

## Purpose

`HNK_DEPLOYMENT_GATE_REGISTRY_V1` separates human release acceptance from human deployment authorization.

The critical boundary is:

```
RELEASE_ACCEPTED
        ≠
DEPLOYMENT_APPROVED
```

A currently accepted release may be nominated as a Deployment Candidate. It may only become currently approved for deployment after a second explicit human decision while its release/report/decision binding is still current.

## Boundary

`DEPLOYMENT_GATE_BINDS_EXPLICIT_HUMAN_DEPLOYMENT_AUTHORIZATION_TO_CURRENT_ACCEPTED_RELEASE_STATE_NOT_EXECUTION_READINESS_TRUTH_OR_CANON`

The registry records deployment governance. It does not execute deployment, infer production readiness, establish scientific truth, prove authorship/time, or promote anything into HNK_CANON.

## Candidate nomination

A Deployment Candidate may be created only when the source Release Verification Registry derives:

`accepted = true`

for that release.

Nomination binds:

- release key;
- target environment;
- source Release Verification Registry digest;
- latest report digest;
- report overall status;
- exact human Release Gate decision ID;
- exact human Release Gate decision digest;
- human nominator;
- nomination time;
- explicit human signal;
- rationale.

Every candidate records:

```
human_nomination = true
machine_can_nominate = false
automatic_deployment = false
deployment_executed = false
```

Nomination alone never authorizes deployment.

## Current-state eligibility

`evaluateDeploymentCandidate` compares a candidate against a current Release Verification Registry.

Possible states:

```
ELIGIBLE
STALE_RELEASE_STATE
RELEASE_NOT_ACCEPTED
RELEASE_NOT_FOUND
CANDIDATE_NOT_FOUND
```

### ELIGIBLE

The current release is accepted and both bindings still match:

- latest report digest;
- current human Release Gate decision ID/digest.

### STALE_RELEASE_STATE

The release still exists, but the report or Release Gate decision bound by the candidate is no longer current.

This is the normal result when new verification evidence arrives after nomination.

### RELEASE_NOT_ACCEPTED

The exact candidate binding still matches, but the release is not currently accepted.

This state is defensive and should be rare because nomination itself requires acceptance.

### RELEASE_NOT_FOUND / CANDIDATE_NOT_FOUND

The referenced governance object is unavailable.

Neither state can authorize deployment.

## Human Deployment Gate

Allowed decisions:

```
DEPLOYMENT_APPROVED
DEPLOYMENT_REJECTED
DEPLOYMENT_HELD
```

Every decision binds:

- candidate ID;
- release key;
- target environment;
- reviewer;
- decision time;
- explicit human signal;
- rationale;
- eligibility at decision;
- current Release Verification Registry digest;
- current latest report digest;
- current human Release Gate decision ID/digest;
- prior Deployment Gate decision, when superseding.

Every event records:

```
human_decision = true
machine_can_decide = false
deployment_executed = false
```

## Approval rule

`DEPLOYMENT_APPROVED` is legal only when:

`eligibility_at_decision = ELIGIBLE`

No override exists in V1 for approving a stale deployment candidate.

If the release evidence changes, the old candidate remains historical and a new candidate must be nominated from the newly accepted release state.

## Current authorization

A candidate is derived as:

`approved_for_deployment = true`

only when both conditions are true:

1. the candidate is currently `ELIGIBLE`;
2. its latest Deployment Gate decision is `DEPLOYMENT_APPROVED`.

Therefore a prior approval automatically ceases to be current authorization when the bound release state becomes stale.

The historical approval event is not deleted.

## New verification evidence

Example:

```
REPORT A
   ↓
RELEASE_ACCEPTED
   ↓
DEPLOYMENT CANDIDATE A
   ↓
DEPLOYMENT_APPROVED
   ↓
REPORT B arrives
```

Candidate A becomes:

```
eligibility_status = STALE_RELEASE_STATE
approved_for_deployment = false
```

Even if REPORT B is later accepted, Candidate A remains stale because it was bound to REPORT A and its Release Gate decision.

The correct flow is:

```
REPORT B
   ↓
RELEASE_ACCEPTED
   ↓
NEW DEPLOYMENT CANDIDATE B
   ↓
NEW HUMAN DEPLOYMENT GATE
```

This blocks stale authorization carry-forward.

## Decision history

Deployment decisions are append-only and candidate-scoped.

A later decision records:

`supersedes_deployment_decision_id`

Example:

```
DEPLOYMENT_APPROVED
        ↓
DEPLOYMENT_HELD
        ↓
DEPLOYMENT_REJECTED
```

All events remain preserved.

## No deployment execution

The registry does not call Vercel, GitHub Actions, shell commands, cloud APIs or any deployment provider.

```
deployment_execution_performed_by_registry = false
deployment_executed = false
```

A future deployment executor may consume a current human authorization, but execution is deliberately outside V1.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab imports/exports JSON explicitly.

## Pipeline

```
VERIFICATION REPORT
        ↓
HUMAN RELEASE GATE
        ↓
RELEASE_ACCEPTED
        ↓
HUMAN NOMINATION
        ↓
DEPLOYMENT CANDIDATE
        ↓ current-state check
HUMAN DEPLOYMENT GATE
        ├── DEPLOYMENT_APPROVED
        ├── DEPLOYMENT_REJECTED
        └── DEPLOYMENT_HELD
```

## Authority locks

```
human_deployment_gate_required = true
release_accepted_auto_approves_deployment = false
machine_can_nominate = false
machine_can_approve_deployment = false
deployment_execution_performed_by_registry = false
automatic_truth_inference = false
production_readiness_inferred = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from RELEASE_ACCEPTED or DEPLOYMENT_APPROVED to deployment execution, scientific truth, production readiness, or HNK_CANON.

## Non-goals

V1 does not:

- deploy software;
- let RELEASE_ACCEPTED auto-authorize deployment;
- let a machine nominate or approve a candidate;
- approve stale candidates;
- carry old deployment approval across new release evidence;
- infer production readiness;
- certify scientific truth;
- infer causality, therapeutic efficacy, supernatural efficacy or metaphysical proof;
- promote anything into HNK_CANON.

Deployment Gate V1 is a human-governed authorization boundary only.
