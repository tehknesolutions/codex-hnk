# HNK Research Release Manifest / Reproducibility Pack V1

Status: HNK-authored research-governance infrastructure.

## Purpose

`HNK_RESEARCH_RELEASE_MANIFEST_V1` binds an explicitly selected Workspace Snapshot Registry HEAD to the exact code/research metadata needed to reproduce the state.

The manifest binds:

- complete Workspace Snapshot Registry;
- registry digest;
- current explicit human HEAD;
- HEAD record digest;
- HEAD event digest;
- Git repository, commit and ref;
- runtime versions;
- exact contract source digests;
- exact validator source digests;
- validator execution states;
- reproduction commands.

The result is a portable reproducibility pack, not a claim of production readiness.

## Boundary

`RELEASE_MANIFEST_BINDS_RESEARCH_STATE_CODE_CONTRACTS_AND_VALIDATION_EVIDENCE_NOT_TRUTH_AUTHORSHIP_TIME_OR_CANON`

A valid manifest proves that specific content was bound together under one manifest digest.

It does not prove authorship, trusted time, truth, causal efficacy, production readiness, supernatural effects, metaphysical claims, or canon status.

## Registry HEAD binding

Release creation fails closed unless the embedded Workspace Snapshot Registry has an explicit HEAD.

The manifest copies and validates:

```
workspace_registry_digest
head_snapshot_digest
head_record_digest
head_event_digest
```

These four values must match the embedded registry exactly.

A release therefore cannot silently choose a snapshot that the registry did not explicitly select through its human HEAD event history.

## Git provenance

The manifest records:

```
repository_full_name
commit_sha
ref
working_tree_status = NOT_ASSESSED
```

Git commit OIDs may be 40-character SHA-1 or 64-character SHA-256 hex.

V1 does not inspect a local working tree, so it explicitly preserves:

`working_tree_status = NOT_ASSESSED`

This prevents the manifest from pretending it proved a clean checkout.

## Runtime provenance

The manifest records the declared:

- Node engine;
- package manager/version.

Example:

```
node_engine = 22.x
package_manager = pnpm@12.1.0
```

## Contract source bindings

Each contract binding contains:

- contract ID;
- contract version;
- package name;
- source path;
- SHA-256 of the exact source text.

The helper hashes the exact source text without trimming leading or trailing bytes.

This lets a consumer cross-check critical contract files against the Git commit and release manifest.

## Validator source bindings

Each validator binding contains:

- validator ID;
- source path;
- exact source SHA-256;
- execution result;
- execution time when applicable;
- environment;
- evidence note.

Allowed results:

```
PASS
FAIL
NOT_EXECUTED
INFRASTRUCTURE_BLOCKED
```

`PASS` and `FAIL` require an execution timestamp.

`NOT_EXECUTED` and `INFRASTRUCTURE_BLOCKED` remain explicit non-PASS states.

The manifest never converts infrastructure failure or missing execution into success.

## Validator execution status

The manifest derives:

```
COMPLETE_PASS
HAS_FAILURE
INCOMPLETE
```

Rules:

- any `FAIL` → `HAS_FAILURE`;
- every validator `PASS` → `COMPLETE_PASS`;
- otherwise → `INCOMPLETE`.

This field is descriptive evidence state only.

It does not infer production readiness.

## Reproduction instructions

The pack records:

- install command;
- one or more validation commands;
- build command;
- optional notes.

These commands are preserved as instructions. The manifest does not claim they were executed merely because they are present.

## Integrity

The complete release receives:

`manifest_digest = SHA-256(canonical manifest projection)`

The digest binds:

- research timeline and HEAD;
- Git provenance;
- runtime versions;
- contract bindings;
- validator bindings;
- validator states;
- reproduction instructions;
- governance locks.

Mutation of any bound field invalidates the manifest digest.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab imports/exports the reproducibility pack as JSON.

No automatic database or browser persistence is introduced.

## Pipeline

```
WORKSPACE SNAPSHOT REGISTRY
        ↓ explicit human HEAD
RESEARCH RELEASE MANIFEST
        ├── GIT COMMIT
        ├── RUNTIME VERSIONS
        ├── CONTRACT SOURCE DIGESTS
        ├── VALIDATOR SOURCE DIGESTS
        ├── VALIDATOR EXECUTION STATE
        └── REPRODUCTION COMMANDS
                ↓
          MANIFEST SHA-256
```

## Authority locks

```
content_integrity_scope = true
authorship_proof = false
trusted_timestamp_proof = false
truth_assessed = false
production_readiness_inferred = false
machine_can_decide_review = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from Research Release Manifest to HNK_CANON.

## Non-goals

V1 does not:

- certify production readiness;
- invent PASS results;
- treat infrastructure blockage as PASS;
- prove that the bound Git checkout was clean;
- prove authorship or trusted timestamp;
- decide a Human Evidence Review Gate;
- infer truth, causality, therapeutic efficacy, supernatural efficacy, or metaphysical proof;
- promote any release or HEAD into HNK_CANON.

Research Release Manifest V1 is an integrity and reproducibility mechanism.
