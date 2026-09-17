# HNK Claim Dossier + Evidence Review Gate V1

Status: HNK-authored infrastructure contracts.

## Purpose

This layer sits above `HNK_EVIDENCE_SYNTHESIS_V1`.

It separates four different questions:

1. What is the claim being made?
2. Which synthesis groups are relevant to that claim?
3. What gaps or conflicts remain?
4. Has a human explicitly reviewed the dossier?

The system deliberately prevents a machine from turning descriptive convergence into truth, causality, metaphysical proof, or canon.

## Claim Dossier

Contract:

`HNK_CLAIM_DOSSIER_V1`

Boundary:

`CLAIM_DOSSIER_ORGANIZES_EVIDENCE_RELEVANCE_GAPS_AND_CONFLICTS_NOT_TRUTH_OR_CANON`

A dossier binds one claim to one exact Evidence Synthesis snapshot by:

- synthesis key;
- synthesis SHA-256 digest.

Each selected metric group stores:

- metric signature digest;
- metric id and label;
- synthesis group status;
- convergent direction when available;
- source questions;
- a human relevance relation;
- a written rationale.

### Human relevance relations

V1 supports:

- `CONSISTENT_WITH`
- `INCONSISTENT_WITH`
- `CONTEXT_ONLY`
- `UNRESOLVED`

These relations are not auto-inferred by the runtime. The UI requires a human-authored rationale for every selected link.

The dossier also preserves:

- `gaps[]`
- `conflicts[]`
- `notes[]`

Nothing is silently reconciled.

### Claim scopes

V1 supports:

- `DESCRIPTIVE`
- `PROCESS_INTEGRITY`
- `EXPLORATORY_INTERPRETATION`

No scope authorizes causal, clinical, supernatural, or metaphysical proof.

## Evidence Review Gate

Contract:

`HNK_EVIDENCE_REVIEW_GATE_V1`

Boundary:

`HUMAN_REVIEW_MAY_CLASSIFY_CLAIM_STATUS_BUT_CANNOT_AUTO_ESTABLISH_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON`

A new gate opens only from a valid Claim Dossier and begins as:

`PENDING_HUMAN_REVIEW`

The machine cannot decide it:

```
machine_can_decide = false
```

A human review requires:

- reviewer identity label;
- review timestamp;
- explicit human signal;
- rationale;
- selected review outcome;
- optional unresolved questions.

### Review outcomes

V1 supports:

- `ACCEPT_AS_DESCRIPTIVE_SUMMARY`
- `KEEP_AS_HYPOTHESIS`
- `REQUEST_MORE_EVIDENCE`
- `REJECT_AS_UNSUPPORTED_AT_SCOPE`

These outcomes classify how the claim may be handled inside the research workflow. They do **not** establish objective truth.

Even after review:

```
automatic_truth_inference = false
automatic_canon_promotion = false
canon_promotion_permitted = false
causal_claim_permitted = false
metaphysical_proof_permitted = false
```

Canon promotion, if ever appropriate, remains a separate HNK Human Gate process.

## Integrity

Both artifacts receive SHA-256 content digests:

- `dossier_digest`
- `gate_digest`

The review gate also binds the exact `dossier_digest`.

Changing claim wording, evidence links, gaps, conflicts, review outcome, reviewer, signal, rationale, or unresolved questions invalidates the corresponding digest.

## Pipeline

```
EVIDENCE SYNTHESIS
       ↓
CLAIM DOSSIER
       ↓
HUMAN RELEVANCE CLASSIFICATION
       ↓
GAPS / CONFLICTS / UNRESOLVED LINKS
       ↓
EVIDENCE REVIEW GATE
       ↓
EXPLICIT HUMAN REVIEW
       ↓
DESCRIPTIVE USE / HYPOTHESIS / MORE EVIDENCE / UNSUPPORTED
```

No path from this layer automatically reaches HNK_CANON.

## Persistence

The private Research Lab uses user-controlled JSON files.

```
server_persistence = false
browser_persistence = false
```

No automatic database, localStorage, sessionStorage, or IndexedDB persistence is introduced.

## Non-goals

V1 does not:

- determine truth;
- perform causal inference;
- establish clinical efficacy;
- establish supernatural efficacy;
- prove metaphysical claims;
- promote claims into canon;
- override Evidence Synthesis conflicts or insufficiency;
- replace explicit human review.

This is an evidence-governance layer, not a truth engine or canon engine.
