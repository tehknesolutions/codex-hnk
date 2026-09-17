# HNK Experiment Attestation V1

Status: `IMPLEMENTED_CONTRACT`

Authority: `HNK_AUTHORED`

Upstream protocol: `HNK_EXPERIMENT_PROTOCOL_V1`

## Purpose

`HNK_EXPERIMENT_ATTESTATION_V1` adds a deterministic SHA-256 content-integrity layer to preregistered HNK experiments.

It is deliberately narrower than a digital signature, trusted timestamp or scientific causal claim.

The attestation answers:

- did the locked preregistration fields change?
- which runtime artifacts were attached, in which order and role?
- did an artifact fingerprint change?
- did the final report change?
- does the current protocol still reproduce the same integrity chain?

It does **not** answer:

- who authored or signed the file;
- whether a claimed timestamp is externally trusted;
- whether a result was caused by the intervention;
- whether any metaphysical mechanism is objectively real.

## Canonical hashing

All hashes use:

`SHA-256(canonical JSON)`

Canonical JSON recursively sorts object keys while preserving array order. UTF-8 encoding is used before SHA-256.

The implementation includes a standard-vector test:

`SHA-256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`

## Preregistration fingerprint

The preregistration digest includes only the fields that should remain fixed after the protocol is locked:

- protocol id/version and authority;
- experiment id;
- creation and lock timestamps as recorded values;
- `preregistration_locked`;
- title;
- question;
- hypothesis;
- complete plan;
- experiment claim boundary.

It excludes:

- runtime sessions;
- current lifecycle status;
- final report.

Therefore the preregistration digest must remain stable as valid sessions and a final report are appended.

## Artifact fingerprint chain

The integrity chain starts at the preregistration digest.

For every admitted session artifact:

```text
artifact_digest = SHA256(canonical artifact)

chain_entry = {
  ordinal,
  assignment_id,
  role,
  added_at,
  session_id,
  artifact_digest,
  previous_digest
}

chain_digest = SHA256(canonical chain_entry)
```

The next entry points to the previous `chain_digest`.

This makes content/order/role modifications detectable when the attestation is verified against the protocol.

## Report fingerprint

When the experiment is completed, the final report receives its own SHA-256 digest and a final chain entry.

The chain head therefore represents:

```text
PREREGISTRATION
    ↓
SESSION 1
    ↓
SESSION 2
    ↓
...
    ↓
FINAL REPORT (when present)
    ↓
CHAIN HEAD
```

## Full snapshot digest

In addition to the stable preregistration digest, every attestation records a digest of the complete experiment-protocol snapshot at the moment the attestation is generated.

This allows two distinct questions:

- `same_preregistration` — were the originally locked criteria preserved?
- `same_snapshot` — is the complete current protocol byte-structurally equivalent after canonicalization?

A completed experiment is expected to have a different full snapshot from its original preregistration while retaining the same preregistration digest.

## Verification

`verifyExperimentAttestation(attestation, protocol)` recomputes:

- preregistration digest;
- full protocol snapshot digest;
- every artifact fingerprint;
- every chain entry;
- report fingerprint;
- final chain head.

The attestation is valid only if all values match the supplied experiment protocol.

## Security boundary

V1 is a content-integrity mechanism, not identity infrastructure.

Every attestation carries:

```text
scope = CONTENT_INTEGRITY_ONLY
timestamp_authority = NONE
identity_signature = NONE
authorship_proof = false
trusted_timestamp_proof = false
causal_proof = false
metaphysical_proof = false
```

and the boundary:

`ATTESTATION_BINDS_CONTENT_NOT_AUTHORSHIP_TIME_CAUSALITY_OR_METAPHYSICAL_PROOF`

A malicious actor who can replace both an experiment file and its attestation can create a new internally consistent pair. V1 detects content drift against a retained attestation; it does not provide external identity or trusted-time anchoring.

## Privacy

Attestations are user-controlled JSON files.

The Research Lab does not automatically persist them to:

- a server;
- a database;
- `localStorage`;
- `sessionStorage`;
- IndexedDB.

## Integration

`@hnk/quest-engine` re-exports the shared attestation package. The private Experiment Lab can:

- generate a preregistration seal;
- export/import attestation JSON;
- verify an attestation against the current experiment;
- compare an original seal with a later/final attestation;
- display the stable preregistration digest and evolving chain head.

No new doctrine, correspondence, Human Gate decision or HNK canon item is created by this contract.
