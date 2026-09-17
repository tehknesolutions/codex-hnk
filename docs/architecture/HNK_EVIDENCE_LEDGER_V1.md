# HNK Evidence Ledger V1

Status: HNK-authored infrastructure contract.

## Purpose

The Evidence Ledger links one preregistered experiment to its verified content attestation and typed measurement contract. It creates an auditable evidence index and lets a researcher declare explicit requirements for a claim without converting evidence coverage into truth, causality, clinical efficacy, supernatural efficacy, or metaphysical proof.

## Boundary

`EVIDENCE_LEDGER_TRACKS_COVERAGE_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF`

The ledger answers questions such as:

- Which source records are linked to this experiment?
- Are their SHA-256 bindings consistent?
- Are the declared evidence requirements present?
- Which requirements remain missing?

It does **not** answer automatically:

- Is the claim true?
- Did the intervention cause the result?
- Is a therapeutic or clinical effect established?
- Is a supernatural mechanism established?
- Is a metaphysical proposition proven?

## Bound source layers

One ledger binds:

1. `HNK_EXPERIMENT_PROTOCOL_V1`
2. `HNK_EXPERIMENT_ATTESTATION_V1`
3. `HNK_MEASUREMENT_CONTRACT_V1`

The bindings preserve:

- preregistration digest;
- protocol snapshot digest;
- attestation chain head;
- measurement plan digest;
- SHA-256 digest of the measurement contract.

## Evidence entries

V1 indexes four evidence kinds:

- `PREREGISTRATION`
- `SESSION_ARTIFACT`
- `MEASUREMENT_RECORD`
- `FINAL_REPORT`

Measurement records retain their assignment, CONTROL/EXPERIMENT role, runtime session, metric, evidence source, timepoint, value metadata, and record digest.

## Claims and requirements

Claims are HNK-authored ledger records. Their scope is explicitly one of:

- `DESCRIPTIVE`
- `PROCESS_INTEGRITY`
- `EXPLORATORY_INTERPRETATION`

A claim must declare at least one requirement. V1 supports:

- `ATTESTATION_INTEGRITY`
- `SESSION_ROLE_COUNT`
- `METRIC_ROLE_RECORDS`
- `METRIC_ANY_RECORDS`
- `REPORT_PRESENT`

The evaluator returns only coverage:

- `COMPLETE_FOR_DECLARED_REQUIREMENTS`
- `PARTIAL`
- `INSUFFICIENT`

Even a complete result carries:

```
truth_assessed = false
causal_claim_permitted = false
metaphysical_proof_permitted = false
```

Complete coverage means only that the evidence explicitly required by that claim exists in the ledger.

## Integrity model

The full ledger receives a SHA-256 digest over its canonical content excluding the digest field itself. Any mutation to evidence entries, claims, requirements, or bindings invalidates the digest.

```
EXPERIMENT
   ↓
CONTENT ATTESTATION
   ↓
TYPED MEASUREMENTS
   ↓
EVIDENCE LEDGER
   ↓
EXPLICIT CLAIM REQUIREMENTS
   ↓
COVERAGE / INSUFFICIENCY
```

The ledger's SHA-256 integrity is still content integrity. It does not establish external identity or trusted timestamp authority.

## Persistence

V1 is file-controlled:

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab may import and export JSON but does not automatically write experiment evidence or claims to a server, database, localStorage, sessionStorage, or IndexedDB.

## Non-goals

V1 deliberately does not implement:

- automatic truth scoring;
- p-values or inferential tests;
- causal inference;
- clinical efficacy claims;
- supernatural efficacy scoring;
- automatic canon promotion;
- deletion or rewriting of source research.

The Evidence Ledger is an audit and evidence-coverage layer, not a truth engine.
