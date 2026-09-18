# HNK Release Verification Registry & Human Release Gate V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_RELEASE_VERIFICATION_REGISTRY_V1` stores immutable Reproducibility Verification Reports and records explicit human release decisions over specific report digests.

The registry closes the gap between:

```
REPRODUCIBILITY VERIFIER
        ↓
MATCH / DRIFT / MISSING / UNVERIFIED
```

and an operational human decision:

```
RELEASE_ACCEPTED
RELEASE_REJECTED
RELEASE_HELD
```

A verification status is evidence. A release decision is a human governance act.

## Boundary

`VERIFICATION_REGISTRY_PRESERVES_REPORT_HISTORY_AND_EXPLICIT_HUMAN_RELEASE_DECISIONS_NOT_TRUTH_READINESS_OR_CANON`

The registry does not infer scientific truth, production readiness, authorship, trusted time, causal efficacy, supernatural efficacy, metaphysical proof or HNK canon status.

## Report identity

Every report is identified by:

`report_digest`

Duplicate report digests are rejected.

Each registry record preserves:

- release key;
- manifest digest;
- report digest;
- overall verifier status;
- registration time;
- complete Verification Report;
- SHA-256 record digest.

Reports are append-only.

```
immutable_report_history = true
```

## MATCH is not approval

The most important lock is:

```
match_auto_accepts_release = false
human_release_gate_required = true
machine_can_accept_release = false
```

A report with:

`overall_status = MATCH`

still leaves the release pending until a human explicitly registers a decision over that exact `report_digest`.

## Human Release Gate

Allowed human decisions are:

```
RELEASE_ACCEPTED
RELEASE_REJECTED
RELEASE_HELD
```

Every decision must bind:

- release key;
- exact registered report digest;
- report status;
- reviewer;
- decision time;
- explicit human signal;
- rationale.

Every decision records:

```
human_decision = true
machine_can_decide = false
```

## Non-MATCH acceptance

Human agency is preserved without hiding risk.

A human may accept a non-MATCH report only when:

```
non_match_override_acknowledged = true
```

This creates an explicit exception record rather than silently treating DRIFT, MISSING or UNVERIFIED as MATCH.

The override is legal only for `RELEASE_ACCEPTED` on a non-MATCH report.

## Latest report reopens the gate

A release may receive multiple Verification Reports over time.

Example:

```
REPORT A · MATCH
        ↓
RELEASE_ACCEPTED
        ↓
REPORT B · MATCH
```

After REPORT B is registered, the historical acceptance of REPORT A is preserved, but the release is no longer derived as currently accepted.

The gate is reopened because the latest report has no human decision yet.

Therefore:

```
accepted = true
```

only when the current human decision targets the latest registered report and is `RELEASE_ACCEPTED`.

This prevents stale approval from silently carrying forward across new verification evidence.

## Decision history

Human decisions are append-only and release-scoped.

A later decision supersedes the previous decision for that release through:

`supersedes_decision_id`

Example:

```
RELEASE_ACCEPTED
        ↓
RELEASE_HELD
        ↓
RELEASE_REJECTED
```

All three events remain in history.

```
immutable_decision_history = true
```

## Index

The derived index reports, per release:

- report count;
- latest report digest/status;
- decision count;
- current decision;
- report bound to current decision;
- whether current decision targets latest report;
- accepted state;
- human-gate pending state.

Registry-level metrics include:

- releases;
- reports;
- decisions;
- accepted releases;
- pending human gates;
- MATCH reports without acceptance.

## Integrity

Each report record receives SHA-256 `record_digest`.

Each human decision receives SHA-256 `decision_digest`.

The complete registry receives SHA-256 `registry_digest`.

Validation checks:

- embedded report validity;
- metadata parity;
- report digest uniqueness;
- decision target existence;
- release/report identity parity;
- report status parity;
- supersession chain;
- non-MATCH override rule;
- human-only decision locks;
- registry digest.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

No automatic server/database/browser persistence is introduced.

## Pipeline

```
RELEASE MANIFEST
        ↓
REPRODUCIBILITY VERIFIER
        ↓
VERIFICATION REPORT
        ↓
VERIFICATION REGISTRY
        ↓
HUMAN RELEASE GATE
        ├── RELEASE_ACCEPTED
        ├── RELEASE_REJECTED
        └── RELEASE_HELD
```

## Authority locks

```
human_release_gate_required = true
match_auto_accepts_release = false
non_match_acceptance_requires_explicit_override = true
machine_can_accept_release = false
automatic_truth_inference = false
production_readiness_inferred = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from MATCH, RELEASE_ACCEPTED, or the Verification Registry to HNK_CANON.

## Non-goals

V1 does not:

- convert MATCH into automatic approval;
- make the machine accept a release;
- erase prior reports or decisions;
- silently carry old acceptance onto a newer report;
- equate RELEASE_ACCEPTED with scientific truth;
- certify deployment readiness by itself;
- infer causality, therapeutic efficacy, supernatural efficacy or metaphysical proof;
- promote a release or report into HNK_CANON.

Verification Registry V1 preserves evidence history and human release authority.
