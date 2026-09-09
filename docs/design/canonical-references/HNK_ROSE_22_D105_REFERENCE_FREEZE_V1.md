# HNK Rose of 22 Petals — Day 105 Reference Freeze V1

Status: **CANONICAL HNK REFERENCE APPROVED / RUNTIME QA PENDING**

Scope: Binah · Day 105 · Nelchael · Engenharia do Sigilo Mestre.

Canonical asset:

`assets/canonical/binah/rose-22-regardie-hnk-master-v1.svg`

Git blob SHA-1:

`3df50d62afdfdcab2a654c9a3e780ff5c9fcd9e8`

Deterministic file SHA-256:

`67c36d79c3fc788ab0866fa7082655209880a6b6b81b7751ad47bf75106b84de`

## 1. Source/provenance boundary

The HNK reference is aligned to Israel Regardie's *The Golden Dawn* description of the Rose of 22 Petals and to the public-domain Wikimedia Commons `Rose Cross Lamen.svg` provenance record.

Normative external references:

- Israel Regardie, *The Complete Golden Dawn*, description of the Rose Cross and sigil formation;
- Wikimedia Commons: `https://commons.wikimedia.org/wiki/File:Rose_Cross_Lamen.svg`;
- Commons states that the modern SVG was created following Regardie's instructions and that the copyright holder released it into the public domain.

The HNK master is **not** represented as a byte-identical copy of the Commons SVG or of a historical Golden Dawn artifact. It is a project-owned computational layout for deterministic Day 105 sigil tracing.

## 2. Source-supported 22-letter topology

Regardie's text fixes the following structure.

### Twelve Simple letters — outer ring

Clockwise from the uppermost petal:

`HEH → VAV → ZAYIN → HET → TET → YOD → LAMED → NUN → SAMEKH → AYIN → TSADI → QOF`

Source orientation:

- HEH / Aries is uppermost;
- LAMED / Libra is lowermost.

The master freezes exactly that orientation; mirroring is forbidden.

### Seven Double letters — middle ring

Regardie gives:

`PE → RESH → BET → DALET → GIMEL → KAF → TAV`

with **DALET exactly over Libra / LAMED**.

The HNK master preserves that order and alignment.

### Three Mother letters — inner ring

The source identifies:

`ALEF / Air · MEM / Water · SHIN / Fire`

and describes their relation to the elemental arms of the full Rose Cross. Because Day 105 uses a standalone computational rose rather than the full lamen/cross, the exact standalone angular placement is an HNK product decision, not presented as a historical claim.

## 3. HNK computational layout decisions

To make sigil generation reproducible in the app, V1 freezes:

- viewBox `0 0 800 800`;
- three concentric petal rings: 3 / 7 / 12;
- outer ring: 30° equal angular spacing with HEH at -90° and LAMED at +90°;
- middle ring: equal `360/7` spacing rotated so DALET is on the +90° meridian directly above LAMED;
- inner ring: ALEF uppermost, MEM lower-right, SHIN lower-left;
- central fiducial point at `(400,400)` for line tracing;
- upright orientation and no mirroring;
- stable `id`, `data-ring`, `data-index`, `data-letter`, and `data-hebrew` metadata per petal.

Equal spacing, inner-ring angular placement, colors and graphical petal contours are HNK product decisions. They are not claims about a unique historical lamen rendering.

## 4. Font/runtime independence

The 22 Hebrew characters are converted into SVG vector paths.

The canonical SVG contains no `<text>` elements and therefore:

- does not depend on a Hebrew font being installed on Web or Native;
- cannot silently substitute tofu/missing-glyph squares;
- preserves the exact glyph shape used by the HNK master;
- does not redistribute a font file.

The paths were generated from a Hebrew-capable font in the build environment, but the font binary is not part of the canonical asset.

## 5. Day 105 semantics

The master exists to support deterministic sigil construction from a reduced phrase by connecting the canonical letter positions.

It does **not** assert that:

- a traced line has objective causal power;
- a symbol diagnoses a person or external force;
- an intense subjective response proves an external mechanism.

Those interpretations remain subject to HNK-EP-1.1 layer separation.

## 6. Runtime contract

A Day 105 renderer may:

- display the master directly;
- highlight a petal by stable letter ID;
- draw a user/generated line between letter anchor positions;
- preserve start/end and repeated-letter handling according to the future sigil algorithm contract;
- store the asset version and generated line metadata in structured evidence.

A renderer may not:

- mirror the master;
- reorder petals;
- replace Hebrew letters with runtime font glyphs and claim parity without visual proof;
- substitute a generic Rose Cross or a lookalike.

## 7. Promotion disposition

The former `REFERENCE_REVIEW` blocker for Day 105 is resolved at G4.

Day 105 may be reviewed and promoted to `content/canon` using this master. Web/Native rendering and interactive line-generation QA remain G7/G8 release work and do not reopen the canonical letter order unless a documented source contradiction is found.
