# HNK Portal 109 Oracle Asset Set Freeze V1

Status: **CANONICAL REFERENCE APPROVED / RUNTIME QA PENDING**

Scope: Day 109 oracular/visual transition.

Canonical manifest:

`assets/canonical/binah/portal109-oracle-assetset-v1.json`

Canonical ID:

`HNK-PORTAL109-ORACLE-ASSETSET-V1`

Git blob SHA-1:

`fd8d164105ef5e83fe30b1432d0876585badb8fc`

Deterministic manifest SHA-256:

`4fe2b55e4a745b3b573cd696ec252509ec5d9dd5bcdbb9a7181a371c8473822c`

## 1. Source-supported transition

The Chapter 3 plan explicitly supplies:

- Rune: `Thurisaz → Ansuz`;
- Major Arcana: `A Sacerdotisa → A Imperatriz`.

V1 uses those operators exactly and does not invent an additional Portal sigil.

## 2. Rune assets

### From — Thurisaz

Reference:

`HNK-REF-THURISAZ-V1`

Asset:

`assets/canonical/binah/thurisaz-hnk-master-v1.svg`

SHA-256:

`c7e0967c30f084a9b57f864342613d1af6209de148bf9ae9b941896b6c3980ea`

### To — Ansuz

Reference:

`HNK-REF-ANSUZ-V1`

Asset:

`assets/canonical/shared/runes/ansuz-hnk-master-v1.svg`

SHA-256:

`79449e97af47e731f66155ca3ad4847e06fd937ef7953ed837323a02fae3f97a`

Ansuz is frozen separately in `HNK_ANSUZ_REFERENCE_FREEZE_V1.md`.

## 3. Tarot boundary

V1 freezes the Arcana identity only:

```text
TAROT-MAJOR-II  = A Sacerdotisa
TAROT-MAJOR-III = A Imperatriz
```

No Tarot artwork is required for canonical Day 109 completion. This prevents choosing a Rider-Waite, Marseille, Golden Dawn or generated illustration silently when the source plan specifies the Arcana identity but not the deck/artwork.

Runtime V1 may render these as text/identifier labels alongside the runic transition. If later product design requires card artwork, that artwork must receive its own provenance/version freeze.

## 4. Backend naming compatibility

The current Portal evidence schema uses the legacy field name `sigil_asset_id`. For Day 109, the exact canonical value is:

`HNK-PORTAL109-ORACLE-ASSETSET-V1`

The value identifies this **oracle asset set**, not an invented secret sigil. A future schema version may rename the field to a broader `visual_operator_id` without changing the canonical asset-set identity.

## 5. Epistemic boundary

The oracular transition communicates the reviewed symbolic progression of the Codex. Rendering runes or Arcana does not prove divination accuracy, external causation, prediction or spiritual rank.

## 6. Approval boundary

This freeze resolves the canonical visual/sigil G4 blocker for Day 109. Web/Native visual parity and transition animation remain G7/G8.
