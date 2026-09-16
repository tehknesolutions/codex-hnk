# HNK Chokmah — Portal 073 Operator Freeze V1

Status: **CANONICAL OPERATORS APPROVED / RUNTIME PUBLICATION QA PENDING**

Scope: Day 073 · Chokmah → Binah · Iniciado → Teurgo.

## 1. Source boundary

The Chapter 2 plan requires:

- Angelic Psalm Tuner;
- Chokmah→Binah Solfeggio;
- Dave Elman induction;
- primary Magician sigil;
- encrypted synchronicity-note upload;
- +500 XP and transition to Level 3 — Teurgo.

The source plan does not define a numeric Solfeggio frequency, a specific Psalm binding for this Portal, or a pre-existing graphical Magician sigil asset.

This freeze resolves those gaps through explicit HNK editorial/product decisions. It does not pretend they were present in the source-plan line.

## 2. Angelic Tuner

Canonical operator ID:

`HNK-ANGELIC-TUNER-D073-V1`

Manifest:

`assets/canonical/chokmah/portal073-angelic-tuner-v1.json`

The operator controls the approved Portal 073 procedural audio pair. No Psalm number is invented in V1 because the source does not specify one.

## 3. Chokmah→Binah Solfeggio audio

ACTIVE preset:

`HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1`

CONTROL preset:

`HNK-PORTAL073-CHOKMAH-BINAH-CONTROL-V1`

Audio freeze:

`docs/audio/HNK_PORTAL073_CHOKMAH_BINAH_AUDIO_FREEZE_V1.md`

Source reconciliation:

`docs/audio/source-locks/HNK_PORTAL073_SOLFEGGIO_SOURCE_RECONCILIATION_V1.md`

Frozen mapping:

```text
ACTIVE  L=528 Hz · R=532 Hz · Δ4 Hz · 600 s
CONTROL L=528 Hz · R=528 Hz · 600 s
```

528 Hz comes from the existing HNK app Solfeggio definition; 4 Hz comes from the HNK player Theta architecture. Their use for Portal 073 is an explicit new HNK mapping.

## 4. Primary Magician sigil

Canonical ID:

`HNK-REF-MAGICIAN-MERCURY-V1`

Asset:

`assets/canonical/chokmah/magician-mercury-sigil-hnk-v1.svg`

SHA-256:

`8c7b95f81aee0689ec3497380c4c3841634ca311dbfa09eed50c757809a97209`

Traditional anchor adopted by HNK:

- Golden Dawn / Israel Regardie attribution: **Magician = Mercury**;
- Unicode canonical symbol identity: `U+263F MERCURY`.

The SVG is project-authored geometry. It does not copy a Tarot card, internet sigil or third-party vector.

Orientation:

- upright;
- no mirror;
- canonical HNK black/red rendering.

This is an explicit HNK canonical Magician-sigil decision, not a recovered historical drawing.

## 5. Server evidence contract

Portal operator-set values:

```text
portal_day            73
evidence_schema       HNK-PORTAL-073-EVIDENCE-V1
tuner_preset_id       HNK-ANGELIC-TUNER-D073-V1
transition_preset_id  HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1
sigil_asset_id        HNK-REF-MAGICIAN-MERCURY-V1
```

The server set may advance to `approved` after this freeze.

It must remain **not published** until G7/G8 proves runtime binding, encrypted Vault path, Dave Elman checkpoint, Return Gate, idempotency/concurrency and Day 074 no-auto-start.

## 6. Promotion boundary

This freeze resolves G4 canonical-reference blockers for storage promotion of Day 073.

It does not authorize production ritual completion. The server remains fail-closed until the operator set is explicitly changed from `approved` to `published` after runtime QA.
