# HNK Evidence Snapshot Catalog & Research Artifact Library V1

Status: HNK-authored research infrastructure.

## Purpose

`HNK_RESEARCH_ARTIFACT_LIBRARY_V1` gives the Research Lab a user-controlled, append-only catalog for validated research snapshots needed by downstream governance workflows.

V1 supports two artifact kinds:

- `CLAIM_DOSSIER`
- `EVIDENCE_SYNTHESIS`

The immediate operational purpose is to stop requiring the Re-evaluation Batch Scanner to receive every dossier and synthesis as separate manual files on every run.

The library remains a catalog and resolver. It does not interpret claims.

## Boundary

`ARTIFACT_LIBRARY_CATALOGS_VALIDATED_RESEARCH_SNAPSHOTS_WITHOUT_INTERPRETING_TRUTH_RELEVANCE_OR_CANON`

## Artifact identity

Every artifact is validated through its source contract before admission.

For Claim Dossier:

```
logical_key = claim_id
content_digest = dossier_digest
source_created_at = dossier.created_at
```

For Evidence Synthesis:

```
logical_key = synthesis_key
content_digest = synthesis_digest
source_created_at = synthesis.created_at
```

The content digest remains the exact SHA-256 identity of the source artifact.

The library never rewrites the embedded payload.

## Revision history

A logical lineage is identified by:

```
artifact kind
+
logical_key
```

The first admitted snapshot is revision 1.

Later snapshots with the same kind and logical key receive contiguous revisions:

```
r1 → r2 → r3 → ...
```

Each later revision stores `supersedes_artifact_id` pointing to the immediately previous revision.

Older revisions are retained.

```
immutable_history = true
```

Duplicate content digests for the same artifact kind are rejected.

## Latest snapshot rule

The library deliberately does not infer "latest" from wall-clock timestamps.

The selection rule is:

`HIGHEST_LIBRARY_REVISION_PER_KIND_AND_LOGICAL_KEY`

This makes candidate selection deterministic and auditable according to library admission order.

## Re-evaluation bundle resolver

Given a valid Reviewed Claim Registry, the library can build the input bundle required by the Re-evaluation Batch Scanner.

For every active reviewed claim:

1. resolve its exact original Claim Dossier by `record.dossier_digest`;
2. resolve the highest library revision for `record.synthesis_key`;
3. return explicit coverage metadata.

The resolver returns:

- `original_dossiers[]`;
- `candidate_syntheses[]`;
- per-claim resolution records;
- dossier coverage;
- synthesis coverage;
- `coverage_complete`.

Candidate selection is:

`HIGHEST_LIBRARY_REVISION_PER_SYNTHESIS_KEY`

The resolver does not decide whether a new synthesis group is relevant to the claim.

```
machine_inferred_relevance = false
```

Human relevance remains a Claim Dossier responsibility.

## Integrity

Each artifact record receives an SHA-256 `artifact_digest`.

The complete library receives an SHA-256 `library_digest`.

The library digest binds the full append-only catalog, including revision and supersession history.

## Query

V1 supports in-memory queries by:

- artifact kind;
- logical key;
- content digest;
- free text;
- latest-only or full revision history.

The default query is latest-only.

## Batch Scanner integration

The private Re-evaluation Batch Scanner can now import a Research Artifact Library and a Reviewed Claim Registry, then resolve:

```
ARTIFACT LIBRARY
+
REVIEWED CLAIM REGISTRY
        ↓
EXACT ORIGINAL DOSSIERS
+
LATEST CANDIDATE SYNTHESIS PER KEY
        ↓
RE-EVALUATION BATCH SCANNER
```

Manual multi-file dossier/synthesis import remains available as a transparent fallback.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The library is exported/imported as JSON.

No automatic database, localStorage, sessionStorage, or IndexedDB persistence is introduced.

## Authority locks

```
automatic_truth_inference = false
automatic_relevance_inference = false
automatic_canon_promotion = false
canon_promotion_permitted = false
```

There is no automatic path from the Artifact Library to HNK_CANON.

## Non-goals

V1 does not:

- determine truth;
- infer evidence relevance;
- alter Claim Dossier human relevance classifications;
- decide Evidence Review Gates;
- alter Reviewed Claim Registry classifications;
- infer causal, therapeutic, supernatural, or metaphysical effects;
- promote anything into HNK_CANON.

The library solves artifact identity, history, retrieval, and deterministic workflow input assembly.
