# M7 — Library, Sources & Provenance — Architecture Design

Date: 2026-10-06
Status: DESIGN APPROVED / SPEC REVIEW GATE

## 1. Purpose

M7 establishes the epistemological traceability layer of Codex HNK. It must make sources discoverable, preserve competing claims and their histories, expose provenance, and prevent unverified or experimental material from acquiring canonical authority by implication.

The architecture is:

`Source Registry → Claims → Provenance Graph → Authority Resolver → Library/Search → Knowledge Lens → Living Book`

Provenance answers **where did this come from?** Authority answers **what weight does it have in the Codex?** These concerns are deliberately separate.

## 2. Core invariants

1. Authority is explicit. It is never inferred upward from quantity, textual similarity, graph density, UI placement, or search ranking.
2. Missing evidence fails closed. Material may remain discoverable as UNVERIFIED or EXPERIMENTAL, but it cannot be represented as CANONICAL.
3. A Concept may contain multiple competing Claims. Canonical resolution never deletes alternative or historical Claims.
4. Surfaces project authority; they do not create it.
5. Provenance relations are directional and typed.
6. History is preserved whenever possible. Supersession changes governing state without erasing genealogy.
7. Search relevance never disguises epistemological status.

## 3. Source Registry

A Source is an independently identifiable origin/evidence record. The Registry supports at minimum:

- project files/documents;
- internal canonical records;
- bibliographic or external references;
- evidence/artifacts produced by the system.

Each Source has a stable `sourceId`, `sourceKind`, locator/reference, verification state, provenance metadata, and lifecycle metadata. Source identity and authority are distinct properties.

The Registry owns identity, validation and deduplication. It does not decide which Claim is canonical.

## 4. Concepts and Claims

A Concept is a stable semantic subject. It does not contain a single overwritable truth field.

A Claim is an independently addressable assertion about a Concept. Each Claim owns its own provenance edges, authority state and lifecycle. Multiple Claims may coexist for one Concept, including mutually incompatible Claims.

This preserves disagreement, revisions and intellectual genealogy instead of collapsing them into the latest write.

## 5. Authority model

Initial authority states:

- `CANONICAL` — explicitly governing HNK content;
- `DERIVED` — derived from identified material but not itself canonical authority;
- `EXPERIMENTAL` — intentionally exploratory/laboratory material;
- `UNVERIFIED` — origin/evidence is insufficiently established;
- `CONFLICTED` — unresolved incompatibility materially affects authoritative interpretation.

The Authority Resolver may identify a governing Claim only from explicit authority-bearing state/decision. It must never promote a Claim merely because many Sources support it.

When no explicit governing Claim can be resolved, the system returns no canonical Claim rather than guessing.

## 6. Provenance Graph

M7 uses a Registry plus an incremental provenance graph rather than a graph-only storage model.

Initial directional relations:

- `SUPPORTED_BY`
- `DERIVED_FROM`
- `CONTRADICTS`
- `SUPERSEDES`
- `PRODUCED_BY`

Relations explain genealogy and evidence. They do not mutate authority automatically.

The graph must support traversal in both user-facing directions:

`Concept → Claim → Source`

and

`Source → Claims → Concepts → Codex surfaces`

## 7. Library and Search

Library is the global discovery surface for Concepts, Claims and Sources.

Search supports filtering by source kind, authority state, verification state and provenance relationships. Every result preserves visible epistemological status.

Textual relevance may order results within a status/category, but ranking must not visually or semantically promote EXPERIMENTAL, UNVERIFIED or CONFLICTED material into CANONICAL representation.

A broken or missing source remains discoverable only with its degraded verification/authority state where applicable.

## 8. Knowledge Lens

Knowledge Lens is the contextual provenance view for a Concept.

It exposes:

- the governing Claim when one exists;
- Sources supporting that Claim;
- derivation chain;
- contradictions/conflicts;
- alternative Claims;
- authority and verification state.

The Lens explains why a Claim occupies its current position. It does not independently choose the canonical Claim.

## 9. Living Book

Living Book remains a narrative reading surface. It may display compact provenance/authority indicators and open the corresponding Knowledge Lens without turning reading into a technical graph interface.

A reader must be able to traverse:

`Living Book passage → Claim → Evidence → Source`

The reverse traversal must also reveal where a Source materially appears in the Codex.

## 10. Data flow

Ingestion follows:

`Source registration → validation/deduplication → Claim association → provenance edges → explicit authority resolution → searchable projection → Lens/Book projection`

Ingestion alone never grants canonical authority.

UI state is downstream from Registry, Graph and Resolver. UI components cannot persist authority decisions by themselves.

## 11. Fail-closed behavior

- Missing/broken Source: mark/degrade verification; do not infer evidence.
- Incomplete provenance: omit the unsupported relation; do not manufacture a path.
- Incompatible unresolved Claims: expose conflict; do not auto-select a winner.
- Superseded Source/Claim: preserve history and recalculate downstream projections.
- Resolver without explicit governing authority: return no canonical Claim.
- Unknown authority/status values: reject or represent as unverified; never default to CANONICAL.
- Search/index failure: degrade discovery without changing underlying authority.

## 12. Testing strategy

Contract tests must cover:

1. stable Source identity and deduplication;
2. typed/directional provenance relations;
3. multiple Claims per Concept;
4. impossibility of implicit authority promotion;
5. explicit governing-Claim resolution;
6. unresolved conflict behavior;
7. supersession with historical preservation;
8. search results retaining authority/verification state;
9. bidirectional Source ↔ Claim ↔ Concept traversal;
10. Knowledge Lens projection;
11. Living Book provenance projection;
12. regressions proving EXPERIMENTAL/UNVERIFIED/CONFLICTED cannot render as CANONICAL without an explicit authority transition.

Tests should use repository-first gates and deterministic fixtures. Infrastructure availability is tracked separately from product correctness; unavailable CI must not be misreported as a product PASS or FAIL.

## 13. Scope boundaries

M7 does not require a graph database. The provenance graph is a domain model and may initially use existing repository/database primitives.

M7 does not create automated truth adjudication, semantic consensus promotion, generalized citation crawling, or autonomous canonicalization.

M7 does not rewrite the canonical content itself. It supplies identity, provenance, authority resolution and user-facing traceability.

## 14. Acceptance criteria

M7 is complete when:

- Sources have stable identities and explicit verification metadata;
- Concepts support multiple Claims without destructive overwrite;
- provenance is typed, directional and traversable;
- canonical authority cannot be obtained implicitly;
- unresolved conflicts remain visibly unresolved;
- Library/Search exposes status rather than hiding it;
- Knowledge Lens traces Concept/Claim evidence;
- Living Book can reach provenance without becoming an authority source;
- Source-to-Codex reverse traversal is supported;
- automated contract/regression gates protect all authority invariants.

## 15. Self-review result

Placeholder scan: PASS — no TBD/TODO requirements.

Consistency: PASS — Registry owns Source identity; Claims own assertions; Graph owns relations; Resolver owns governing authority; UI owns projection only.

Scope: PASS — no graph database, autonomous canonicalization or unrelated content rewrite is required.

Ambiguity: PASS — absence of explicit authority always fails closed rather than selecting a governing Claim heuristically.
