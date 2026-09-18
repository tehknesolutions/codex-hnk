# HNK Reproducibility Verifier V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_REPRODUCIBILITY_VERIFIER_V1` performs the inverse operation of the Research Release Manifest.

A Release Manifest says:

> these research, Git, contract, validator and runtime bindings were sealed together.

The verifier asks:

> does an observed project copy match those bindings?

V1 classifies each check as:

- `MATCH`
- `DRIFT`
- `MISSING`
- `UNVERIFIED`

## Boundary

`VERIFIER_CHECKS_MANIFEST_BOUND_STATE_AGAINST_OBSERVED_PROJECT_STATE_NOT_TRUTH_AUTHORSHIP_TIME_READINESS_OR_CANON`

The verifier checks reproducibility/integrity state. It does not decide truth, authorship, trusted time, scientific merit, production readiness, spiritual efficacy, metaphysical proof or HNK canon status.

## Verification targets

V1 verifies:

1. Release Manifest integrity;
2. embedded Workspace Snapshot Registry digest and HEAD binding;
3. observed Git repository;
4. observed Git commit;
5. observed Git ref;
6. observed Node engine;
7. observed package manager;
8. exact contract source SHA-256;
9. exact validator source SHA-256;
10. optionally re-observed validator execution results.

## Status semantics

### MATCH

The observed value exactly reproduces the manifest expectation.

For repository identity only, common GitHub HTTPS and SSH forms are normalized before comparison.

### DRIFT

The expected object exists but the observed value differs.

Examples:

- different Git commit;
- modified contract source;
- modified validator source;
- re-observed validator result differs from the historical manifest result.

### MISSING

A source file explicitly expected by the manifest was not supplied/found.

V1 uses MISSING for expected contract/validator source files.

### UNVERIFIED

No sufficient observation was supplied for a metadata or execution check.

Examples:

- Git ref unavailable in a detached checkout;
- runtime field not provided;
- validator was not re-run.

UNVERIFIED is never converted to MATCH.

## Overall status precedence

The report derives one overall status using:

```
DRIFT > MISSING > UNVERIFIED > MATCH
```

Therefore:

- any DRIFT → overall DRIFT;
- otherwise any MISSING → overall MISSING;
- otherwise any UNVERIFIED → overall UNVERIFIED;
- only complete matching evidence → overall MATCH.

## Source hashing

Contract and validator files use SHA-256 of the exact observed source text.

No trimming is performed.

The comparison is against the source digest sealed by the Release Manifest.

## Validator execution

Validator source verification and validator execution re-observation are separate checks.

The verifier does **not** run validators automatically.

If no validator execution observation is supplied:

`VALIDATOR_EXECUTION = UNVERIFIED`

If supplied, the observed result is compared to the historical manifest result.

This comparison describes reproduction drift. It does not rewrite the historical manifest evidence.

## Reproduction commands

The verifier preserves:

```
commands_executed = false
```

The pure contract never executes install, validation or build commands from a manifest.

This avoids converting a data-verification operation into arbitrary command execution.

## Filesystem adapter / CLI

The package contract is environment-neutral:

```
filesystem_scanned_by_contract = false
```

A separate user-invoked Node CLI exists:

```
node scripts/verify-hnk-research-release.mjs \
  --manifest <release.json> \
  --root <repo>
```

The CLI observes:

- Git remote;
- Git HEAD commit;
- current symbolic branch when available;
- Node major version;
- root package manager;
- expected contract/validator files.

It then passes those observations into the pure verifier contract.

The CLI does not automatically execute validator or build commands.

Optional flags:

```
--out <report.json>
--strict
```

Without `--strict`, DRIFT/MISSING fail the CLI process while UNVERIFIED remains reportable without pretending to be MATCH.

With `--strict`, any non-MATCH report is non-zero.

## Report integrity

Every verification report receives:

`report_digest = SHA-256(canonical report projection)`

The digest binds:

- release manifest digest;
- every verification check;
- expected/observed values;
- status counts;
- overall status;
- authority locks.

Any report mutation invalidates the digest.

## Private Research Lab

The private Web lab allows the user to:

- import a valid Research Release Manifest;
- enter observed Git/runtime state;
- upload the expected contract and validator files;
- optionally record re-observed validator results;
- generate/export the verification report.

No automatic server or browser persistence is introduced.

## Authority locks

```
commands_executed = false
filesystem_scanned_by_contract = false
content_integrity_scope = true
authorship_proof = false
trusted_timestamp_proof = false
truth_assessed = false
production_readiness_inferred = false
machine_can_decide_review = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from a MATCH verification report to production readiness or HNK_CANON.

## Non-goals

V1 does not:

- execute manifest commands automatically;
- certify deployment readiness;
- prove authorship or trusted timestamp;
- assess scientific truth;
- decide human evidence review;
- infer causality, therapeutic efficacy, supernatural efficacy or metaphysical proof;
- promote any release, report or checkpoint into HNK_CANON.

Reproducibility Verifier V1 verifies bounded project-state correspondence only.
