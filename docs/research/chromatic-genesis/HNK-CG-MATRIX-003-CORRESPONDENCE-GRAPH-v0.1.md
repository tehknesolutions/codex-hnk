# HNK Chromatic Genesis — Matrix 003: Provenance-Safe Correspondence Graph v0.1

Status: RESEARCH / HNK:CANDIDATE
Parent: `HNK-CHROMATIC-GENESIS-ROOT-SPEC-v0.1.md`
Issue: #373

## 1. Purpose

Convert Chromatic Genesis from narrative correspondence into a graph-ready research model while preserving HNK identity/provenance gates.

This matrix does **not** canonize symbolic equivalences. It defines how candidate edges are represented, tested, rejected, or promoted.

## 2. Edge contract

Every proposed correspondence MUST carry:

```text
EDGE {
  source_identity
  target_identity
  relation_type
  source_system
  source_version_or_lineage
  evidence[]
  authority_state
  resolution_status
  rationale
  conflicts_with[]
  creator_gate_required
}
```

### Authority states

- `SOURCE:HISTORICAL`
- `SOURCE:MODERN`
- `SOURCE:FICTION`
- `HNK:OBSERVED`
- `HNK:DERIVED`
- `HNK:HYPOTHESIS`
- `HNK:CANDIDATE`
- `HNK:VALIDATED`
- `HNK:CANONICAL`
- `UNRESOLVED`

### Resolution states

- `DIRECT`
- `DERIVED_UNIQUE`
- `DERIVED_AMBIGUOUS`
- `NO_MAPPING`
- `NO_E5_PROJECTION`
- `PENDING_RULE`
- `REJECTED`

## 3. Identity rule imported from HNK40 E5 research

The HNK40 Legacy→E5 V7 Identity-Provenance Gate established that valid semantic data does not automatically authorize identity binding. It explicitly refused to choose between G17 and G20 from phonetics, transliteration, visual similarity, numerology, PUA, glyph meaning, or ungoverned semantic relation.

Chromatic Genesis adopts the same principle:

> Correspondence is not identity. Similarity is not authority. Semantic resonance is not a binding.

## 4. Structural graph — currently supported HNK nodes

| Node | Identity | Current status | Notes |
|---|---|---:|---|
| `MHCM` | Mandala-HNK computational foundation | HNK observed/canonical dependency | Structural foundation used by haKodan |
| `MF432` | 6 layers × 72 sectors | HNK observed | Manifestation-field addressing structure |
| `CG9` | 9 outer Choir/Sefirah group cells | HNK observed | Must not be silently converted into 10 sefirot |
| `CR_T3` | Central Rose Triad | HNK observed | 3 fields |
| `CR_H7` | Central Rose Heptad | HNK observed | 7 fields |
| `CR_D12` | Central Rose Dodecad | HNK observed | 12 fields |
| `CR22` | `3 + 7 + 12` Central Rose | HNK derived from observed structure | 22 fields |
| `HC` | Hierarchical Core | HNK observed / semantically unresolved | Kept outside major-field count |
| `HNK40` | 40 Genesis glyph/path candidates | HNK candidate family | Semantic assignment not assumed |
| `PATH` | ordered Mandala traversal | HNK observed architecture | Computational glyph substrate |
| `GLYPH` | start + ordered path + edge sequence + transform profile | HNK observed architecture | Machine-readable symbolic object |
| `VESSEL` | runtime/representation context | HNK canonical concept | Candidate bridge for Auric Frame |

## 5. Yetziratic source nodes

These are external historical research nodes and MUST retain textual-lineage provenance in implementation.

| Node | Research identity | Authority |
|---|---|---|
| `SY10` | 10 sefirot belimah | SOURCE:HISTORICAL |
| `SY22` | 22 foundational Hebrew letters | SOURCE:HISTORICAL |
| `SY_M3` | 3 Mothers | SOURCE:HISTORICAL |
| `SY_D7` | 7 Doubles | SOURCE:HISTORICAL |
| `SY_S12` | 12 Simples | SOURCE:HISTORICAL |
| `SY32` | 10 + 22 composite path count | SOURCE:HISTORICAL / lineage-sensitive interpretation |

Exact element/planet/zodiac/body/direction mappings are deliberately absent from this matrix until recension/lineage records are ingested.

## 6. First correspondence edges

| Source | Relation | Target | Status | Resolution | Rationale |
|---|---|---|---|---|---|
| `CR_T3` | structural-count resonance | `SY_M3` | HNK:CANDIDATE | DERIVED_AMBIGUOUS | Independent triadic structures; semantics not yet proven equivalent |
| `CR_H7` | structural-count resonance | `SY_D7` | HNK:CANDIDATE | DERIVED_AMBIGUOUS | Independent heptadic structures |
| `CR_D12` | structural-count resonance | `SY_S12` | HNK:CANDIDATE | DERIVED_AMBIGUOUS | Independent dodecad structures |
| `CR22` | structural decomposition resonance | `SY22` | HNK:CANDIDATE | DERIVED_AMBIGUOUS | Both resolve as 3+7+12=22; identity not authorized |
| `CG9` | possible sefirah-related vocabulary | `SY10` | UNRESOLVED | NO_MAPPING | Count mismatch; no forced tenth node |
| `HC` | possible missing/core relation | `SY10` | UNRESOLVED | PENDING_RULE | HC semantics/provenance unresolved; numerology prohibited |
| `HNK40` | possible glyph research carrier | `SY22` | UNRESOLVED | NO_MAPPING | 40 Genesis candidates are not 22 letters |

## 7. Chromatic Genesis nodes

The following are proprietary HNK candidate constructs, not historical Sefer Yetzirah claims.

### Operational Hexad

- `E_AMETHYST` — mind / arcane intelligence / orchestration; visual anchor `#130583` in TKN.
- `E_AZURE` — space / architecture / relation / infrastructure.
- `E_BLOOD` — power / action / execution / force.
- `E_EMERALD` — life / adaptation / growth / evolution.
- `E_SOLAR` — consciousness / knowledge / illumination / processing.
- `E_6` — unresolved sixth operational force.

### Meta-principles

- `META_AURIC` — manifestation / convergence / embodiment.
- `META_OCTARINE` — meta-chromatic transmutation / mapping transformation.
- `META_TITANIUM` — law / constraint / precision / form.
- `META_OBSIDIAN` — void / potential / unmanifest field.

`6 + 4 = 10` remains a structural HYPOTHESIS only. No edge to `SY10` is authorized at v0.1.

## 8. HNK runtime/operator nodes

Existing operator concepts to reconcile:

- `OP_GENERATOR`
- `OP_SPECIFIER`
- `OP_CONSTRUCTOR`
- `OP_REGULATOR`
- `OP_PRUNER`
- `OP_CHOICE_GATE`

### Candidate edges deliberately NOT promoted

| Source | Candidate relation | Target | Status |
|---|---|---|---|
| `E_*` | one-energy-per-operator | `OP_*` | REJECTED as default model |
| `META_AURIC` | manifestation affinity | `OP_CONSTRUCTOR` | HNK:HYPOTHESIS |
| `META_TITANIUM` | law/constraint affinity | `OP_SPECIFIER`, `OP_REGULATOR` | HNK:HYPOTHESIS |
| `META_OBSIDIAN` | possibility-field affinity | `OP_GENERATOR` | HNK:HYPOTHESIS |
| `META_OCTARINE` | mapping/context transformation | correspondence/compiler layer | HNK:HYPOTHESIS |

Runtime mapping is expected to be many-to-many.

## 9. Force/Form projection

Every Energy Object must project into both HNK poles:

```text
ENERGY_OBJECT
  ├─ FORCE_PROFILE
  │   ├─ tendency
  │   ├─ intensity
  │   ├─ transformation pressure
  │   └─ intent vector
  └─ FORM_PROFILE
      ├─ geometry
      ├─ constraints
      ├─ address
      ├─ vessel/context
      └─ manifestation boundary
```

A color alone can never instantiate a canonical Energy Object.

## 10. Alchemical graph layer

Alchemy enters as an external process/transformation correspondence set, kept separate from Yetziratic source identity.

Research nodes:

- `ALC_NIGREDO`
- `ALC_ALBEDO`
- `ALC_CITRINITAS`
- `ALC_RUBEDO`

No energy-to-stage binding is canonical. Candidate use is lifecycle/process annotation and transformation-state visualization.

## 11. Astrological graph layer

Astrological mappings require lineage-specific records. Planetary/zodiacal correspondences attributed to Sefer Yetzirah must be stored under the relevant recension/tradition; later Hermetic systems receive separate source IDs.

No direct Chromatic Energy ↔ planet/sign binding is approved in this matrix.

## 12. Tarot / later occult adapters

Tarot correspondences are optional later-occult adapter nodes. They are not represented as native Sefer Yetzirah content.

Potential graph relation:

`LATER_OCCULT_ADAPTER → correspondence edge → SY/HNK nodes`

with explicit provenance and conflict support.

## 13. Genius Signature integration surface

No specific Genius mapping is created until the existing Dilts-derived corpus is located/imported.

Graph contract:

```text
GENIUS_SIGNATURE {
  genius_id
  source_model
  cognitive_strategy[]
  energy_vector[]
  operator_pattern[]
  glyph_pattern[]
  domain_affinity[]
  evidence[]
  authority_state
}
```

Energy vector is multi-dimensional; no `genius = one color` shortcut is permitted.

## 14. Tehkné domain graph

Initial domain nodes:

- `TKN_AI_ORCHESTRATION`
- `TKN_SOFTWARE_ARCHITECTURE`
- `TKN_PRODUCT`
- `TKN_UX_UI`
- `TKN_GAME_WORLD_DESIGN`
- `TKN_AUTOMATION_OPERATIONS`
- `TKN_GROWTH_SEO_MARKETING`
- `TKN_EDUCATION`
- `TKN_GOVERNANCE_SECURITY`

All domain↔energy mappings start many-to-many and `HNK:HYPOTHESIS` until validated through actual products/components/workflows.

## 15. Auric Frame as Vessel hypothesis

Candidate edge:

`META_AURIC --material/manifestation expression--> AURIC_FRAME --implements visual containment--> VESSEL`

Status: `HNK:CANDIDATE / DERIVED_AMBIGUOUS`.

The Auric Frame may visually use articulated gold structural plates, channels, inscriptions, nodes, Titanium joints and Obsidian substrate. It must remain proprietary HNK/TKN geometry and must not reproduce Marvel's Infinity Gauntlet silhouette/topology.

## 16. Glyph-generation rule for Energy Objects

Energy glyphs MUST NOT be arbitrary logos and MUST NOT automatically reuse G01–G06.

Target pipeline:

```text
SEMANTIC_ID
→ FORCE/FORM PROFILE
→ LICENSED MANDALA ADDRESS/REGION
→ ORDERED PATH
→ EDGE SEQUENCE
→ TRANSFORM PROFILE
→ MULTI-LAYER GLYPH
→ PACKET/TRANSPORT
→ RENDERING
→ HUMAN GATE
```

Selection/generation requires governed semantic constraints. Visual attractiveness alone cannot bind identity.

## 17. Golden Prototype contract

Working prototype ID: `CG-ENERGY-001 / AMETHYST-MIND`.

This is a research ID, not the final HNK-KODE lexeme.

Required proof:

```text
ALEF / INTENT
→ Semantic ID
→ Energy Object
→ Force/Form
→ governed glyph path
→ operator binding(s)
→ HNK-KODE expression
→ Canonical AST/HOM/HNK-IR
→ haKodan execution
→ TKN rendering
→ MALKUTH artifact
→ Observation/Evidence
```

Promotion gate: every arrow must be inspectable and provenance-bearing.

## 18. Matrix 004 targets

1. Ingest explicit Sefer Yetzirah recension/source records for 3/7/12 and associated correspondences.
2. Inspect HNK Mandala source/provenance gaps without inventing HC semantics.
3. Locate the Dilts/Genius corpus in project repositories/Drive.
4. Audit HNK-KODE phonology and morphology to derive candidate energy lexemes.
5. Define machine-readable JSON schema for this graph.
6. Generate the first Energy Object as non-canonical research data.
7. Test whether a governed Mandala path can be selected/generated from semantic constraints.

## 19. Current conclusion

The strongest currently justified bridge is structural:

`CR_T3 + CR_H7 + CR_D12 = CR22`

and externally:

`SY_M3 + SY_D7 + SY_S12 = SY22`.

The edge between these decompositions is worth formal research but remains `DERIVED_AMBIGUOUS / HNK:CANDIDATE`.

Chromatic Genesis therefore advances as a graph of provenance-bearing correspondences rather than a table of asserted equivalences.
