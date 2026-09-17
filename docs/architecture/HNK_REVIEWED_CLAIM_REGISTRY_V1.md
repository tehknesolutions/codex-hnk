# HNK Reviewed Claim Registry V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_REVIEWED_CLAIM_REGISTRY_V1` is the searchable, versioned registry for claims that have already crossed an explicit `HNK_EVIDENCE_REVIEW_GATE_V1`.

It is deliberately separate from HNK_CANON.

The registry answers:

- Which claims have received a completed human evidence review?
- What classification did that human review produce?
- Which version of a claim is currently active?
- Which older versions were superseded?
- What dossier, synthesis snapshot, reviewer, gaps, conflicts, and unresolved questions belong to each reviewed version?

It does **not** answer:

- Is the claim objectively true?
- Did an intervention cause the observed result?
- Is a supernatural or metaphysical proposition proven?
- Is the reviewed claim canonical HNK doctrine?

## Boundary

`REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON`

## Admission rule

A registry record may be created only from:

1. a valid `HNK_CLAIM_DOSSIER_V1`;
2. a valid `HNK_EVIDENCE_REVIEW_GATE_V1`;
3. an exact dossier ↔ gate binding;
4. a gate whose status is `REVIEWED`;
5. `human_decision = true`.

Pending gates are not admissible.

## Review classification mapping

The registry does not invent a new machine judgment. It deterministically maps the already-recorded human review outcome:

| Evidence Review Gate outcome | Reviewed Claim classification |
| --- | --- |
| `ACCEPT_AS_DESCRIPTIVE_SUMMARY` | `DESCRIPTIVE_SUMMARY` |
| `KEEP_AS_HYPOTHESIS` | `HYPOTHESIS` |
| `REQUEST_MORE_EVIDENCE` | `MORE_EVIDENCE_REQUIRED` |
| `REJECT_AS_UNSUPPORTED_AT_SCOPE` | `UNSUPPORTED_AT_SCOPE` |

These are workflow classifications, not truth labels.

Every record remains:

```
human_review_derived = true
truth_assessed = false
canon_status = NOT_CANON
causal_claim_permitted = false
metaphysical_proof_permitted = false
```

## Versioning and supersession

`claim_id` is the stable lineage key.

The first registered reviewed version is:

```
claim_version = 1
supersedes_record_id = null
```

If a later reviewed dossier uses the same `claim_id`, admission requires an explicit `supersedes_record_id` pointing to the **current active version**.

The new record receives the next contiguous version:

```
v1 → v2 → v3 → ...
```

Old records are never deleted or rewritten. Active/superseded state is derived from the backward supersession chain.

This makes history non-destructive.

## Record snapshot

Each record preserves:

- claim ID and claim version;
- exact reviewed statement and scope;
- mapped review classification;
- original Evidence Review Gate outcome;
- dossier SHA-256 digest;
- review-gate SHA-256 digest;
- synthesis key and SHA-256 digest;
- reviewer and review timestamp;
- explicit human signal;
- review rationale;
- unresolved questions;
- dossier gaps and conflicts;
- registration timestamp;
- supersession pointer;
- record SHA-256 digest.

The complete registry also receives a SHA-256 `registry_digest`.

## Search

V1 supports in-memory queries by:

- free text;
- review classification;
- claim scope;
- claim ID;
- active-only or complete history.

The default query view is active claims only.

Search does not alter records.

## Pipeline

```
EVIDENCE SYNTHESIS
       ↓
CLAIM DOSSIER
       ↓
EVIDENCE REVIEW GATE
       ↓
EXPLICIT HUMAN REVIEW
       ↓
REVIEWED CLAIM REGISTRY
       ├── active reviewed claims
       └── superseded immutable history
```

There is intentionally **no automatic arrow from Reviewed Claim Registry to HNK_CANON**.

Any future canonical admission remains a separate Human Gate process with separate authority.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab can import and export registry JSON. No automatic database, localStorage, sessionStorage, or IndexedDB persistence is introduced.

## Non-goals

V1 does not:

- establish truth;
- perform causal inference;
- establish clinical efficacy;
- establish supernatural efficacy;
- establish metaphysical proof;
- auto-promote reviewed claims to canon;
- erase superseded claim history;
- let machine review replace human evidence review.

Reviewed Claim Registry V1 is a governed research index, not a truth engine or canon registry.
