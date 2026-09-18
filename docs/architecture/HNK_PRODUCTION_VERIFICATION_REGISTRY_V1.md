# HNK Deployment Receipt Registry, Post-Deployment Verification & Human Production Gate V1

Status: HNK-authored production-governance infrastructure.

## Purpose

`HNK_PRODUCTION_VERIFICATION_REGISTRY_V1` preserves Deployment Execution Receipts, binds post-deployment observations to those receipts, and records explicit human production decisions.

The critical boundary is:

```
DEPLOYMENT_EXECUTED
        ≠
PRODUCTION_ACCEPTED
```

A deployment receipt records an observed execution. It does not automatically establish that the environment should be accepted as production.

## Boundary

`PRODUCTION_REGISTRY_PRESERVES_DEPLOYMENT_RECEIPTS_POST_DEPLOYMENT_OBSERVATIONS_AND_EXPLICIT_HUMAN_PRODUCTION_DECISIONS_NOT_GLOBAL_READINESS_TRUTH_OR_CANON`

The registry preserves operational evidence and human governance. It does not infer scientific truth, global production readiness, causality, spiritual efficacy or HNK canon status.

## Append-only Deployment Receipt Registry

Valid `HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1` objects may be registered by exact `receipt_digest`.

Each record preserves:

- release key;
- target environment;
- receipt digest;
- provider result;
- registration time;
- complete receipt;
- SHA-256 record digest.

Duplicate receipt digests are rejected.

```
immutable_receipt_history = true
```

A newly registered receipt becomes the latest execution for its release/environment pair.

## Post-Deployment Verification

A post-deployment verification targets one registered receipt.

It requires:

- exact receipt digest;
- observed Git commit;
- observed URL;
- human observer;
- observation time;
- one or more explicit checks.

Allowed check kinds:

```
URL
HEALTH
SMOKE
CUSTOM
```

Allowed check results:

```
PASS
FAIL
UNVERIFIED
```

The contract does not perform HTTP/network requests itself:

`network_checks_executed_by_contract = false`

It records observations supplied to it.

## Exact Git commit check

The observed post-deployment commit must equal the Git commit bound by the execution receipt.

```
observed_git_commit_sha
    =
receipt.expected_git_commit_sha
```

A different commit blocks creation of the post-deployment verification.

## Check evidence integrity

Each check includes:

- check ID;
- kind;
- expected value;
- observed value;
- result;
- evidence note;
- SHA-256 evidence digest.

Exact evidence text is hashed:

`evidence_digest = SHA-256(exact evidence text)`

The raw evidence does not need to be embedded in the registry.

## Verification overall status

Overall status is derived deterministically:

```
any FAIL
  → FAIL

else any UNVERIFIED
  → UNVERIFIED

else
  → PASS
```

No check result is silently upgraded.

## PASS is not production acceptance

The following locks are invariant:

```
deployment_succeeded_auto_accepts_production = false
post_deployment_pass_auto_accepts_production = false
human_production_gate_required = true
machine_can_accept_production = false
```

Therefore both:

`provider.result = SUCCEEDED`

and:

`post_deployment.overall_status = PASS`

still leave the environment unaccepted until a human decision is recorded.

## Human Production Gate

Allowed decisions are:

```
PRODUCTION_ACCEPTED
PRODUCTION_REJECTED
PRODUCTION_HELD
```

Every decision binds:

- release key;
- target environment;
- latest receipt digest;
- latest verification digest;
- verification status;
- human reviewer;
- decision time;
- explicit human signal;
- rationale;
- prior decision when superseding.

Every event preserves:

```
human_decision = true
machine_can_decide = false
```

## Acceptance rule

`PRODUCTION_ACCEPTED` is legal only when:

1. the decision targets the latest verification for the latest receipt;
2. the latest receipt has `provider.result = SUCCEEDED`;
3. the latest post-deployment verification is `PASS`.

There is no override in V1 for accepting a FAILED or UNVERIFIED production state.

This rule establishes eligibility for a human decision. It does not auto-create the decision.

## New verification reopens the Human Production Gate

Example:

```
RECEIPT A · SUCCEEDED
        ↓
VERIFY A · PASS
        ↓
PRODUCTION_ACCEPTED
        ↓
VERIFY B · PASS
```

After VERIFY B is registered:

```
production_accepted = false
human_production_gate_pending = true
```

The historical decision remains preserved, but it does not silently carry forward to new post-deployment evidence.

## New receipt reopens verification and production acceptance

Example:

```
RECEIPT A
  ↓
VERIFY A
  ↓
PRODUCTION_ACCEPTED
  ↓
RECEIPT B
```

After RECEIPT B:

```
verification_required = true
production_accepted = false
```

The new deployment execution must receive its own post-deployment verification and its own Human Production Gate decision.

## Derived current production state

For each release/environment pair the index reports:

- receipt count;
- latest receipt digest/result;
- verification count for the latest receipt;
- latest verification digest/status;
- current production decision;
- whether that decision targets the latest verification;
- current `production_accepted`;
- human-gate pending;
- verification required.

Registry metrics include:

- total receipts;
- total verifications;
- total human decisions;
- current production-accepted environments;
- pending Human Production Gates;
- environments awaiting verification;
- PASS states without human acceptance.

## Integrity

Each receipt record receives a SHA-256 record digest.

Each post-deployment verification receives:

`verification_digest = SHA-256(canonical verification projection)`

Each Human Production Gate event receives:

`decision_digest = SHA-256(canonical decision projection)`

The complete registry receives:

`registry_digest = SHA-256(canonical registry projection)`

Mutation is detected.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

No automatic server, database or browser persistence is introduced.

## Pipeline

```
DEPLOYMENT_APPROVED
        ↓
EXTERNAL DEPLOYMENT
        ↓
DEPLOYMENT EXECUTION RECEIPT
        ↓
POST-DEPLOYMENT OBSERVATIONS
        ├── URL
        ├── HEALTH
        ├── SMOKE
        └── CUSTOM
        ↓
POST-DEPLOYMENT VERIFICATION
        ↓
HUMAN PRODUCTION GATE
        ├── PRODUCTION_ACCEPTED
        ├── PRODUCTION_REJECTED
        └── PRODUCTION_HELD
```

## Authority locks

```
immutable_receipt_history = true
immutable_verification_history = true
immutable_decision_history = true
human_production_gate_required = true
deployment_succeeded_auto_accepts_production = false
post_deployment_pass_auto_accepts_production = false
latest_receipt_and_verification_required = true
production_accept_requires_succeeded_receipt_and_pass_verification = true
machine_can_accept_production = false
network_checks_executed_by_registry = false
automatic_truth_inference = false
production_readiness_inferred = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from DEPLOYMENT_EXECUTION_RECORDED, SUCCEEDED, PASS or PRODUCTION_ACCEPTED to global production readiness, scientific truth or HNK_CANON.

## Non-goals

V1 does not:

- execute network checks automatically;
- execute deployment;
- auto-accept SUCCEEDED deployments;
- auto-accept PASS post-deployment checks;
- accept stale receipt/verification evidence;
- accept FAIL or UNVERIFIED as production;
- certify global production readiness;
- prove authorship or trusted time;
- infer scientific, therapeutic, supernatural or metaphysical truth;
- promote anything into HNK_CANON.

Production Verification Registry V1 is the final explicit human production-acceptance boundary for this pipeline.
