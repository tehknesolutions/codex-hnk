# M5 — Living Knowledge Lens — Design

Date: 2026-10-06
Status: APPROVED CONCEPT / SPEC REVIEW
Base: `main` after M3/M4 integration

## Intent

Turn the Living Book map from navigation-only orientation into a read-only knowledge projection over confirmed HNK infrastructure.

Target flow:

`Tree Selection → Knowledge Lens Adapter → { Canon Status | Claims | Evidence Coverage | Correspondences | Gaps / Conflicts } → Living Book → Day / Câmara`

M5 does not create a second knowledge base. It projects existing contracts into one stable UI-facing representation.

## Source contracts discovered

M5 must build on existing repository domains rather than recreate them:

- `packages/visual-contract/src/tree.ts` — selected HNK structural context and executable Day boundary.
- `@hnk/evidence-ledger` — evidence entries, declared claim requirements, coverage evaluation, validation and verification. Its boundary tracks coverage and explicitly does not infer truth, causality, or metaphysical proof.
- `@hnk/claim-dossier` — organizes evidence relevance, gaps, conflicts and relations (`CONSISTENT_WITH`, `INCONSISTENT_WITH`, `CONTEXT_ONLY`, `UNRESOLVED`). It does not automatically infer truth or promote canon.
- `@hnk/correspondence-registry` — query, resolve, compare, conflicts, coverage and validation over registered correspondence datasets.
- existing canon contracts/resolvers — canon authority/status where a stable public API is available and verified during implementation discovery.

## Core decision

Create one adapter/contract boundary between domain packages and React.

The Living Book must not import four or more domain registries directly and independently interpret them. The adapter normalizes source results into a conservative, immutable projection that React can render without becoming an authority layer.

Recommended package boundary:

`packages/knowledge-lens`

The package is read-only and deterministic. It receives already available/validated source inputs or source projections and returns a `HnkKnowledgeLensProjection`.

## Projection contract

```ts
type HnkKnowledgeLensStatus =
  | 'CONFIRMED'
  | 'PARTIAL'
  | 'UNRESOLVED'
  | 'UNAVAILABLE';

interface HnkKnowledgeLensProjection {
  subject: {
    level_id: HnkTreeLevelId;
    label: string;
    day_range: string | null;
    executable_days: number;
    structural_state: string;
  };
  canon: {
    status: HnkKnowledgeLensStatus;
    authority: string | null;
    note: string | null;
  };
  claims: {
    count: number;
    items: ReadonlyArray<{
      claim_id: string;
      statement: string;
      scope: string;
      status: HnkKnowledgeLensStatus;
      gaps: readonly string[];
      conflicts: readonly string[];
    }>;
  };
  evidence: {
    status: HnkKnowledgeLensStatus;
    coverage_label: string | null;
    evidence_count: number;
    missing_requirements: readonly string[];
    truth_assessed: false;
    causal_claim_permitted: false;
    metaphysical_proof_permitted: false;
  };
  correspondences: {
    status: HnkKnowledgeLensStatus;
    record_count: number;
    domains: readonly string[];
    traditions: readonly string[];
    gaps: readonly string[];
    conflicts: readonly string[];
  };
  limitations: readonly string[];
}
```

Exact field naming may be tightened in the implementation plan, but the semantic boundary is fixed: source facts, coverage, gaps and conflicts may be projected; truth/canon promotion may not be inferred.

## Status semantics

### CONFIRMED

The source contract explicitly supports the displayed fact/status and no unresolved requirement blocks that specific projection.

### PARTIAL

Some source coverage exists, but declared requirements, domains, traditions or evidence are incomplete.

### UNRESOLVED

The source explicitly reports unresolved links, conflicts, or an unresolved resolution state.

### UNAVAILABLE

No verified source data is available for the requested projection. UI must say so rather than synthesize an answer.

These statuses are presentation normalization only. They do not replace native domain statuses or alter their stored meaning.

## Fail-closed rules

1. No source data → `UNAVAILABLE`, never generated prose presented as fact.
2. Evidence coverage is not truth.
3. `CONSISTENT_WITH` is not proof.
4. `INCONSISTENT_WITH` is not automatic falsification.
5. Correspondence is not identity or causal relation.
6. A registry gap remains a gap.
7. A conflict remains visible; the adapter does not silently choose a winner.
8. Canon status is projected only from an existing canon authority API; absent verified canon binding → `UNAVAILABLE`.
9. BINAH remains structurally visible/dormant and must not gain executable Day 073+ content through the Lens.
10. The adapter never writes to ledgers, dossiers, registries or canon sources.

## Selection and subject binding

M5 initially binds to the same `HnkTreeLevelId` selected by M4. This preserves one orientation state across Total Map, progressive map and Knowledge Lens.

The adapter must use explicit subject bindings. It must not assume that a sphere label automatically equals a correspondence-registry `subject_id`, claim id, experiment id, or canon id.

If no explicit binding exists for a selected level, the corresponding Lens section is `UNAVAILABLE` and records a limitation such as `NO_CONFIRMED_CORRESPONDENCE_BINDING`.

This prevents attractive but invented cross-domain joins.

## UI architecture

Add a `LivingKnowledgeLens` presentation beneath/alongside the selected MAPA context.

Recommended sections:

- **CÂNONE** — authority/status only when resolved from a verified canon source.
- **CLAIMS** — statements and their relevance status, with gaps/conflicts visible.
- **EVIDÊNCIA** — coverage, counts and missing requirements; always exposes the non-truth boundary.
- **CORRESPONDÊNCIAS** — registered domains/traditions, coverage, gaps and conflicts.
- **LIMITES** — explicit missing bindings/data and fail-closed reasons.

The Lens should be scannable first and expandable second. It must not dump raw ledger/dossier JSON into the Living Book.

## Relationship to M3/M4

M3 remains progressive chamber navigation.
M4 remains Kether-like macro orientation.
M5 adds epistemic/contextual depth to the same selected sphere.

The resulting flow is:

`Visão Total → Esfera → Knowledge Lens → faixa/Days → Câmara`

The Lens is contextual; it does not block navigation to an already confirmed executable Day.

## Accessibility

- Sections use semantic headings and status text, not color alone.
- Gaps/conflicts are textual and distinguishable.
- Expand/collapse controls, if introduced, use native buttons with `aria-expanded`.
- Empty/unavailable states are readable and do not disappear visually.
- No knowledge relation requires hover to discover.
- Reduced-motion behavior follows the existing Living Book contract.

## Data loading boundary

M5 should prefer server-side/read-only projection where practical. The client component should receive a serializable projection rather than instantiate mutable registries in React.

If repository architecture requires a client-safe static projection for the first slice, that projection must still originate through `packages/knowledge-lens` and preserve the same contract.

## Error handling

- invalid source object: reject or return an explicit invalid/unavailable section according to adapter API; never partially trust malformed data silently.
- registry validation failure: correspondence section becomes `UNRESOLVED` or `UNAVAILABLE` with the validation issue surfaced as a limitation.
- conflicting dossier links: retain conflict count/details; no automatic winner.
- evidence evaluation failure: no truth conclusion; section records insufficient/unresolved coverage.
- unknown level id: fail closed; no projection fabricated.

## Testing strategy

Create a focused `validate:knowledge-lens` gate plus package tests.

Required assertions:

1. adapter is read-only and exposes no mutation API;
2. projection preserves `truth_assessed: false`, `causal_claim_permitted: false`, and `metaphysical_proof_permitted: false` for evidence;
3. absent bindings produce `UNAVAILABLE` rather than guessed joins;
4. dossier gaps/conflicts survive projection;
5. correspondence gaps/conflicts survive projection;
6. invalid registry/source validation cannot become `CONFIRMED`;
7. M5 consumes the same M4 `selectedLevelId` rather than creating competing sphere state;
8. BINAH cannot gain executable Day 073+ routes;
9. UI renders explicit unavailable/partial/unresolved states;
10. existing M3/M4 navigation remains intact.

## First vertical slice

Do not attempt to populate every HNK domain in M5.1.

The first slice should prove the architecture with:

- selected sphere structural context from `tree.ts`;
- explicit binding registry with only verified bindings;
- correspondence projection where a verified binding exists;
- claim/evidence sections showing real data only where a verified source binding exists, otherwise explicit `UNAVAILABLE`;
- Living Book UI rendering all five sections and limitations.

This deliberately allows a visually complete Lens with sparse data. Sparse truth is preferable to fabricated completeness.

## Non-goals

M5 does not:

- author new canon;
- create Day 073+;
- infer metaphysical truth;
- infer causal claims;
- automatically promote claims to canon;
- invent correspondence subject mappings;
- replace evidence-ledger, claim-dossier or correspondence-registry;
- create a generic graph database;
- introduce AI-generated explanations as authoritative source content;
- block confirmed Day navigation because contextual evidence is sparse.

## Success criteria

M5 succeeds when selecting a sphere in the existing Living Book reveals a coherent epistemic/context panel built from repository authorities, clearly distinguishes confirmed/partial/unresolved/unavailable information, preserves source gaps and conflicts, and lets the reader continue into confirmed Days without the UI ever pretending that evidence coverage, correspondence, or a claim equals truth or canon.

## Self-review

- Existing repository packages remain authoritative.
- React is kept away from domain-specific mutation and interpretation logic.
- Cross-domain joins require explicit bindings.
- Missing data is first-class rather than hidden.
- Evidence/claim boundaries are preserved verbatim in semantics.
- M3/M4 navigation authority is untouched.
- Scope is deliberately a vertical slice, not a rewrite of the knowledge architecture.
