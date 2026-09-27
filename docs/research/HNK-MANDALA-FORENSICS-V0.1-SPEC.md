# HNK MANDALA FORENSICS V0.1

Status: APPROVED RESEARCH DIRECTION
Authority: CODEX-HNK ROOT CANON research
Date: 2026-09-26

## Kether

Dissect the HNK cabalistic Mandala source assets into an auditable mathematical and symbolic knowledge model from which future HNK glyphs, pixel maps, isopixel maps, voxel forms, colors, sounds and encodings can be derived.

## Prime Rule — MANDALA FIRST

The Mandala is the geometric authority. Glyphs and render surfaces are projections of addressable Mandala fields; the process MUST NOT begin from an arbitrary Cartesian pixel grid.

`SOURCE -> MANDALA FIELD -> AK -> RELATIONS/PATH -> GLYPH -> PIXEL/ISOPIXEL/VOXEL`

No future glyph inventory is canonized by this document.

## Source Lock

Every original Mandala asset MUST be preserved byte-for-byte and identified by source ID and cryptographic hash before annotation or transformation. Derived overlays and reconstructions never replace the source.

## Evidence Layers

Every datum MUST declare its epistemic layer:

- OBSERVED: directly visible/readable in the source asset.
- MEASURED: obtained from calibrated geometry/color/image measurement.
- DERIVED: deterministic mathematical consequence of declared measurements/rules.
- EXTERNAL_REFERENCE: correspondence documented by an identified external tradition/source.
- HYPOTHESIS: research proposal.
- HNK_CANDIDATE: authored HNK correspondence awaiting validation.
- HNK_CANONICAL: explicitly promoted HNK meaning/rule.
- UNRESOLVED: insufficient/conflicting evidence.

Observation, mathematics and symbolic interpretation MUST remain distinguishable.

## Addressable Hierarchy

Research hierarchy:

`MANDALA -> MACROSTRUCTURE -> REGION -> RING x SECTOR -> BLOCK -> MICROBLOCK -> AK`

The existing candidate measurement of 441 AK (`9 + 6x72`) and central `3 + 7 + 12 = 22` structure are hypotheses/evidence targets to verify against source assets, not axioms.

## Atomic-Kode Research Record

Each addressable field should be representable with at least:

```json
{
  "id": "AK-XXXX",
  "parent": null,
  "children": [],
  "source": {"assetId": null, "regionId": null},
  "polar": {"ring": null, "sector": null, "rMin": null, "rMax": null, "thetaStart": null, "thetaEnd": null, "thetaCenter": null},
  "cartesian": {"x": null, "y": null},
  "topology": {"neighbors": [], "symmetryClass": null},
  "observed": {"colors": [], "symbols": [], "text": []},
  "authority": "UNRESOLVED"
}
```

Schema fields are research contracts until validated.

## Topology Before Raster

An AK is identified by Mandala topology/geometry, not by a screen pixel. A raster pixel may reference one AK (or, if required by sampling, a declared weighted/set relation to AKs), but the raster coordinate never becomes the canonical identity.

## HNK Pixel Projection

A canonical glyph is fundamentally defined by its Mandala field set plus ordered relations/path/state, not by a bitmap.

Research glyph identity:

`GLYPH = { AK_SET, PATH, FIELD_STATE, RELATIONS }`

A pixel projection MUST retain provenance to its source Mandala field(s):

```json
{
  "pixelId": "PX-...",
  "x": 0,
  "y": 0,
  "akRefs": ["AK-XXXX"],
  "state": 1,
  "role": "structural",
  "projectionVersion": "..."
}
```

Grid resolution is NOT fixed in advance. It must emerge from the verified Mandala topology and the requirements for lossless/reproducible projection.

## IsoPixel / Voxel Projection

IsoPixel is not independently drawn artwork. It is a deterministic spatial projection of the same Mandala-addressed structure.

Research chain:

`AK -> mandala coordinates -> spatial coordinates (x,y,z) -> isometric projection (isoX,isoY)`

Voxel and isopixel records MUST preserve AK provenance. Extrusion/depth rules must be versioned and deterministic if classified as encoding.

## Encoding Surfaces

Where a surface is declared an encoding, reversibility is a design target:

`AK/PATH/STATE <-> discrete map <-> bits <-> HEX`

BIN/HEX values do not acquire spiritual meaning merely by encoding an object. Symbolic correspondences are separately governed relations.

## Color Model

Color identities MUST distinguish:

- observed source color;
- measured color value;
- canonical HNK color (if later promoted);
- render/display color.

Color is not structural identity. `CHOIR-ID != COLOR-ID` remains a research invariant unless explicitly superseded by evidence and governance.

## Number Model

Do not overload numbers. Distinguish at least:

- SOURCE_NUMBER;
- ORDINAL;
- AK_ID;
- HNK_NUMBER;
- CABALISTIC_VALUE;
- DECIMAL_ENCODING;
- BINARY_ENCODING;
- HEX_ENCODING.

Shared numeric values do not prove semantic equivalence.

## Cabalistic Knowledge Graph

Correspondences MUST be modeled as typed edges with provenance rather than flattened spreadsheet equivalences.

Example relation types:

- LOCATED_IN
- ADJACENT_TO
- CONTAINS
- ROTATES_TO
- MIRRORS
- OBSERVED_AS
- MEASURED_AS
- CORRESPONDS_TO
- DERIVED_FROM
- ENCODES
- TRANSFORMS_TO
- USES

Each relation records source, tradition/domain, authority/evidence layer and confidence where applicable.

Conflicting external traditions may coexist. HNK Canon, when explicitly decided, is a separate relation/state rather than silent replacement of source traditions.

## Glossary Target

The HNK Cabalistic Glossary is a computable knowledge graph connecting, when evidence/governance permits:

- Mandala fields/AKs;
- geometry and topology;
- numbers;
- colors;
- symbols;
- Hebrew letters and Cabalistic structures;
- Sefirot/paths where source-supported;
- planets, zodiac, elements and other documented correspondences;
- phonological/sound surfaces;
- HNK semantic concepts;
- glyph components;
- pixel/isopixel/voxel projections;
- BIN/HEX/matrix encodings.

## Forensic Pipeline

1. SOURCE LOCK
2. ASSET INVENTORY
3. GEOMETRIC CALIBRATION
4. CENTER/AXIS DETECTION
5. RING CENSUS
6. SECTOR CENSUS
7. FIELD/AK CENSUS
8. TOPOLOGY GRAPH
9. COLOR CENSUS
10. SYMBOL CENSUS
11. TEXT/HEBREW CENSUS
12. NUMERICAL ANALYSIS
13. EXTERNAL CABALISTIC CORRESPONDENCE LAYER
14. HNK INTERPRETATION/CANDIDATE LAYER
15. PIXEL PROJECTION MODEL
16. ISOPIXEL/VOXEL PROJECTION MODEL
17. REVERSIBILITY TESTS
18. GLYPH GENESIS — only after prior gates

## Immediate Gate — V0.1A Source Census

Before geometric inference, locate every Mandala source asset currently present in CODEX-HNK/project evidence and create a manifest containing:

- stable asset ID;
- repository/path or evidence reference;
- file type;
- dimensions where measurable;
- cryptographic hash where bytes are available;
- provenance/source note;
- duplicate/variant relationship;
- research priority;
- SOURCE_LOCK status.

No 441-AK assumption, pixel-grid resolution, symbolic assignment or new glyph may be promoted before this gate.

## Governing Maxim

**No pixel without geometry. No geometry without coordinates. No coordinates without identity. No correspondence without provenance. No HNK meaning without authority.**
