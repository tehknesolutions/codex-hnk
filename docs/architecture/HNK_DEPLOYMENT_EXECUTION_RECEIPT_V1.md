# HNK Deployment Execution Receipt / Attestation V1

Status: HNK-authored deployment-attestation infrastructure.

## Purpose

`HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1` records an observed deployment execution only when the referenced Deployment Candidate is still currently authorized.

The critical boundary is:

```
DEPLOYMENT_APPROVED
        ≠
DEPLOYMENT_EXECUTED
```

The Deployment Gate grants authorization. The Receipt records an execution observation after that authorization.

## Boundary

`DEPLOYMENT_RECEIPT_ATTESTS_RECORDED_EXECUTION_METADATA_AGAINST_CURRENT_HUMAN_AUTHORIZATION_NOT_PROVIDER_SIGNATURE_READINESS_TRUTH_OR_CANON`

The receipt binds HNK-observed metadata and hashes. It is not a provider-signed attestation unless a future contract verifies such a signature.

## Creation requirements

Receipt creation requires:

1. valid current Deployment Gate Registry;
2. valid current Release Verification Registry;
3. referenced candidate exists;
4. candidate is currently `approved_for_deployment=true`;
5. latest Deployment Gate decision is `DEPLOYMENT_APPROVED`;
6. candidate release/report/decision bindings are still current;
7. observed Git commit exactly equals the approved release commit.

A stale candidate cannot produce a receipt.

## Exact Git commit binding

The expected commit is recovered from the current Verification Report check:

`GIT:COMMIT`

Receipt creation requires:

```
observed_git_commit_sha
    =
expected_git_commit_sha
```

Deploying another commit under an approved candidate is rejected.

## Provider metadata

The receipt records:

- provider name;
- deployment ID;
- optional deployment URL;
- normalized observed result.

Allowed results:

```
SUCCEEDED
FAILED
CANCELED
UNKNOWN
```

A failed or canceled execution is still a valid factual receipt.

`SUCCEEDED` does not imply production readiness.

## Provider payload integrity

Receipt creation requires exact provider payload text.

The raw payload is not stored by the receipt contract. Instead:

`provider_payload_digest = SHA-256(exact provider payload text)`

This allows an external payload/log/API response to be preserved separately and later compared without expanding the receipt itself.

No trimming occurs before hashing.

## Execution observation

The receipt records:

- optional start time;
- completion time;
- observer;
- observation time;
- evidence note;
- provider payload digest.

The receipt records an HNK observation of execution metadata.

It does not verify a provider signature:

`provider_signature_verified = false`

## Authorization binding

The receipt preserves:

- candidate ID/digest;
- current Deployment Gate decision ID/digest;
- current Deployment Gate Registry digest;
- current Release Verification Registry digest;
- current Verification Report digest;
- current Human Release Gate decision ID/digest;
- target environment.

This binds the execution observation to the exact governance state that authorized it.

## Receipt integrity

The complete receipt receives:

`receipt_digest = SHA-256(canonical receipt projection)`

Mutation of authorization bindings, commit, provider metadata, result, timing, evidence digest or governance locks invalidates the receipt digest.

## Authority locks

```
deployment_authorization_current_at_receipt_creation = true
deployment_execution_recorded = true
deployment_execution_performed_by_contract = false
provider_signature_verified = false
content_integrity_scope = true
production_readiness_inferred = false
truth_assessed = false
authorship_proof = false
trusted_timestamp_proof = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

## No deployment execution

This contract does not call:

- Vercel;
- GitHub Actions;
- shell commands;
- cloud providers;
- hosting APIs.

It consumes already observed execution metadata.

Therefore:

`deployment_execution_performed_by_contract = false`

A future Deployment Executor may perform an authorized action, but execution remains outside V1.

## Pipeline

```
HUMAN DEPLOYMENT GATE
        ↓
DEPLOYMENT_APPROVED
        ↓
EXTERNAL DEPLOYMENT EXECUTION
        ↓
OBSERVED PROVIDER METADATA
        ↓
DEPLOYMENT EXECUTION RECEIPT
        ├── exact Git commit
        ├── provider deployment ID
        ├── result
        ├── provider payload SHA-256
        └── receipt SHA-256
```

## Non-goals

V1 does not:

- execute deployment;
- treat DEPLOYMENT_APPROVED as proof that execution occurred;
- accept a stale authorization;
- accept a different Git commit;
- verify provider cryptographic signatures;
- turn SUCCEEDED into production readiness;
- infer scientific truth;
- infer causality, therapeutic efficacy, supernatural efficacy or metaphysical proof;
- promote anything into HNK_CANON.

There is no automatic path from DEPLOYMENT_APPROVED, DEPLOYMENT_EXECUTION_RECORDED or SUCCEEDED to production readiness or HNK_CANON.

Deployment Execution Receipt V1 is an integrity-bound execution observation record.
