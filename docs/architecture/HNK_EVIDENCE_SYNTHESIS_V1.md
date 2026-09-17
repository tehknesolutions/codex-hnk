# HNK Evidence Synthesis V1

Status: HNK-authored infrastructure contract.

## Purpose

Evidence Synthesis groups multiple Replication Registries without flattening incompatible metrics. Registries are clustered by exact metric-signature SHA-256 digest, then summarized as convergence, divergence, mixed evidence, single-registry signal, or insufficiency.

## Boundary

`EVIDENCE_SYNTHESIS_MAPS_CONVERGENCE_DIVERGENCE_AND_INSUFFICIENCY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF`

The synthesis answers:

- Which replication registries share an exact metric signature?
- Which questions were asked under that signature?
- Which registries were replicated, mixed, single-run, or insufficient?
- Do replicated registries converge on one descriptive direction?
- Do replicated registries diverge?
- Is any source registry internally mixed?

It does not automatically answer whether a hypothesis is true, whether an effect is statistically significant, whether a cause has been established, or whether a clinical, supernatural, or metaphysical claim is proven.

## Source admission

Each source is one `HNK_REPLICATION_REGISTRY_V1`.

A synthesis rejects duplicate:

- `source_id`;
- `registry_digest`;
- `replication_key`.

A second snapshot of the same replication key is therefore not counted as independent synthesis evidence.

## Metric grouping

Registries are grouped only by exact `metric_signature_digest`.

Different metric signatures remain separate even if their labels look similar.

This preserves differences in:

- metric id;
- type;
- unit;
- evidence source;
- timepoint;
- evaluation criterion.

Heterogeneous metric groups are allowed inside one synthesis file, but they are never merged into a single numeric score.

## Group statuses

For each metric-signature group:

- `INSUFFICIENT` — no source registry has replicated evidence and no source registry is MIXED;
- `SINGLE_REGISTRY_SIGNAL` — exactly one source registry is `REPLICATED`;
- `CONVERGENT` — at least two source registries are `REPLICATED`, all share the same repeated direction, and no source registry is `MIXED`;
- `DIVERGENT` — at least two source registries are `REPLICATED` with more than one repeated direction, and no source registry is `MIXED`;
- `MIXED` — at least one source registry is itself `MIXED`.

`SINGLE_RUN` and `INSUFFICIENT` source registries remain visible in each group and are never silently promoted to replicated evidence.

## Question matrix

Every group keeps the source question next to:

- replication key;
- source replication status;
- repeated direction, when one exists.

This creates a matrix across metric and question without pretending that differently phrased questions are automatically the same construct.

## Integrity

The synthesis stores each source registry digest and receives its own SHA-256 `synthesis_digest`.

Any mutation to source identity, question, status, metric signature, direction, or synthesis metadata invalidates the digest.

## Pipeline

```
REPLICATION REGISTRY A ─┐
REPLICATION REGISTRY B ─┼─→ GROUP BY EXACT METRIC SIGNATURE
REPLICATION REGISTRY C ─┘                  ↓
                               QUESTION / STATUS MATRIX
                                          ↓
                    INSUFFICIENT / SINGLE_REGISTRY_SIGNAL
                    CONVERGENT / DIVERGENT / MIXED
```

## Methodological lock

V1 deliberately keeps:

```
truth_assessed = false
inferential_statistics_performed = false
causal_claim_permitted = false
metaphysical_proof_permitted = false
```

No p-values, confidence intervals, significance thresholds, causal scores, therapeutic-efficacy scores, supernatural-efficacy scores, or automatic canon promotions are generated.

## Persistence

```
persistence = USER_CONTROLLED_FILE_ONLY
server_persistence = false
browser_persistence = false
```

The private Research Lab imports and exports JSON without automatic database or browser persistence.

Evidence Synthesis V1 is an accumulated evidence-map layer, not a truth engine.
