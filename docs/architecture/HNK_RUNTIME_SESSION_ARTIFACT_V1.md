# HNK Runtime Session Artifact V1

Status: `IMPLEMENTED_CONTRACT`

Authority: `HNK_AUTHORED`

Upstream runtime: `HNK_SYMBOLIC_RUNTIME_CONTRACT_V1`

## Purpose

`@hnk/runtime-session-artifact` makes an HNK symbolic-runtime session portable without introducing server persistence or a second runtime implementation.

The artifact is a user-controlled JSON file containing:

- explicit artifact/runtime versions;
- the initial session state required for replay;
- the complete validated runtime snapshot;
- the ordered event history;
- privacy/persistence locks;
- the epistemic claim boundary.

## Artifact contract

```text
HNK_RUNTIME_SESSION_ARTIFACT_V1
├─ artifact_version
├─ exported_at
├─ persistence = USER_CONTROLLED_FILE_ONLY
├─ server_persistence = false
├─ browser_persistence = false
├─ runtime_contract_id
├─ runtime_contract_version
├─ claim_boundary
├─ initial
│  ├─ session_id
│  ├─ created_at
│  ├─ intention
│  ├─ current_state
│  └─ target_state
└─ session
   └─ HNK_SYMBOLIC_RUNTIME_CONTRACT_V1 snapshot
```

## Deterministic replay

Replay never trusts only the stored final snapshot. It recreates the original runtime session from `initial`, then reapplies every stored event through the shared symbolic-runtime reducer.

```text
INITIAL
  ↓
EVENT 1
  ↓
EVENT 2
  ↓
...
  ↓
REPLAYED SNAPSHOT
  ↓
BYTE-STRUCTURAL JSON COMPARISON
  ↓
MATCH / MISMATCH
```

An artifact is invalid when the stored snapshot cannot be reproduced by its own event history.

This detects snapshot tampering or drift without asserting anything about the metaphysical meaning of the session.

## Import / export

Export is explicit and user-controlled. The browser creates a JSON download only after the artifact and deterministic replay validate.

Import reads a local JSON file, validates the contract, replays the event history and accepts the artifact only on `MATCH`.

The application does not automatically save imported/exported artifacts in:

- server storage;
- database;
- `localStorage`;
- `sessionStorage`;
- IndexedDB.

## Comparison

Two valid artifacts can be compared side-by-side. V1 compares:

- phase;
- cycle;
- event count;
- observation count;
- feedback count;
- initial state;
- target state;
- result state;
- evidence scope;
- event-type sequence.

Comparison is descriptive only. A difference between artifacts is **not** a causal conclusion and is **not** evidence that a symbol, ritual or other factor caused an outcome.

## Epistemic boundary

Every artifact carries:

`RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF`

Therefore:

`recorded runtime result ≠ automatic proof of metaphysical efficacy`.

## Integration

`@hnk/quest-engine` re-exports the artifact contract through a thin adapter. The private Symbolic Runtime Lab uses that adapter for export, import, replay and comparison, preserving one shared implementation.

## Validation locks

`validate-hnk-runtime-session-artifact.mjs` enforces:

- deterministic replay;
- exact snapshot/replay match;
- rejection of tampered snapshots;
- versioned artifact/runtime IDs;
- user-controlled file export;
- local file import;
- side-by-side comparison;
- no browser persistence;
- Quest Engine delegation;
- preserved `RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF` boundary.
