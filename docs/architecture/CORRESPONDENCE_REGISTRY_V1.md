# HNK Correspondence Registry V1

Status: **IMPLEMENTED / REFERENCE INFRASTRUCTURE**

The registry is the first executable layer over `@hnk/correspondence-contract`.
It stores multiple historical correspondence systems side-by-side without collapsing disagreements or promoting them into HNK doctrine.

## Included datasets

1. `SEFER_YETZIRAH_REFERENCE_A`
   - 3 Mothers / 7 Doubles / 12 Simples classification
   - elements for Aleph/Mem/Shin
   - one explicitly recension-sensitive 7-planet reference set
   - 12 zodiacal correspondences

2. `GOLDEN_DAWN_STANDARD`
   - elemental, planetary and zodiacal attributions
   - Tarot trump mappings
   - 22 path placements on the standard Golden Dawn/Kircher-style Tree

3. `DEL_DEBBIO_KABBALAH_HERMETICA`
   - only the correspondences actually recovered in Research 001
   - 21 available Tarot/path sheets
   - explicit Aleph source gaps instead of inferred values

## Non-negotiable rules

- Historical data remains `REFERENCE` and `SOURCE_SCOPED`.
- No stored correspondence becomes HNK canon by ingestion.
- `tradition_id` and `system_version` are mandatory identities.
- Disagreement is represented as multiple records, never silently harmonized.
- Missing source material is represented as a gap, not filled from a neighboring tradition.
- HNK-authored correspondences must use the authorship/provenance gate from `@hnk/correspondence-contract`.

## Current deterministic footprint

- Sefer Yetzirah reference set: 44 records
- Golden Dawn set: 66 records
- Del Debbio PDF audit set: 63 records
- Total: 173 correspondence records
- Explicit source gaps: 3

## Query examples

```ts
import { createResearch001Registry } from '@hnk/correspondence-registry';

const registry = createResearch001Registry();

registry.compare('HEBREW_BETH', 'PLANET');
// Preserves Beth→Saturn in the consulted Sefer Yetzirah reference set
// alongside Beth→Mercury in Golden Dawn and Del Debbio.

registry.compare('HEBREW_ALEPH', 'TAROT_TRUMP');
// Golden Dawn value is returned, while Del Debbio reports an explicit source gap.
```

## Boundary

This package is a research and provenance runtime. It does **not** assert that occult correspondences are objective physical facts, and it does **not** activate ritual or metaphysical claims. It stores what a documented tradition/source says and keeps HNK-authored decisions separate.
