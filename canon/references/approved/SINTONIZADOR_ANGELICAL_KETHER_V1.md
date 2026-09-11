# SINTONIZADOR ANGELICAL HNK — KETHER V1

**Status:** `CANONICAL_REFERENCE_APPROVED`  
**Scope:** Portal 036 and reusable Kether ritual-audio control surface  
**Canonical id:** `hnk.tuner.kether.v1`  
**Approval:** Kether Reference Approval Packet V1 + project-owner progression authorization, 2026-09-04  
**Protocol:** HNK-EP-1.1

## 1. Canonical meaning

The **Sintonizador Angelical HNK — Kether V1** is a deterministic HNK ritual-audio controller and contextual instrument.

It loads already-approved canonical metadata and published audio/sigil assets for a practice. It is not a detector of angels, spirits, entities, objective supernatural frequencies or measured brain states.

## 2. Minimum data contract

```yaml
id: string
version: integer
status: draft | review | approved | published
sephira: string
day: integer | null
cycle: string | null
angel: string | null
formula: string | null
audio_preset_id: string
sigil_asset_id: string | null
duration_seconds: integer
headphones_recommended: boolean
user_volume_control: true
stop_always_available: true
source_basis: []
checksum: string | null
```

Null remains null. The implementation may not infer a missing frequency, angel mapping or ritual operator at runtime.

## 3. Portal 036 fixed mode

Fixed context:

- Sephira: Kether;
- Day: 036;
- pre-completion level: `1 — Neófito`;
- transition target: Chokmah;
- valid completion result: `Level 2 — Iniciado`;
- no new angelic name is introduced by the tuner;
- audio preset must be the separately published Kether→Chokmah transition preset;
- sigil must be `hnk.kether.sigil.v1` or an explicitly approved successor.

Canonical phase sequence:

`READY → AUDIO_ARMED → INDUCTION → SIGIL_READY → GNOSIS → RETURN → RECORD → COMPLETE`

Playback ending does not equal Portal completion.

## 4. User control and safety

Always available:

- play/pause;
- stop;
- volume;
- restart current phase;
- return/grounding shortcut;
- reduced sensory mode.

Headphones may be recommended when a published binaural preset requires stereo separation. Stopping because of discomfort carries no progress penalty. No flashing/strobing is required.

## 5. Crown state

The tuner may visualize server-derived `Coroa 7/7` readiness. Fragment state cannot be manually toggled by the user.

## 6. Relationship to audio and sigils

The tuner is a controller, not the source of truth. It loads versioned preset and asset identifiers plus checksum/duration/safety metadata. It may reveal or animate an approved sigil but may not generate or mutate canonical sigil topology.

## 7. Evidence boundary

Portal evidence may record tuner/preset/sigil versions, timestamps, completed phases, stop/safety events, user-reported clarity/orientation, return confirmation and Portal gate result. Raw private journal text remains outside this evidence record.

## 8. Provenance

`HNK-original ritual-audio controller defined for the Kether Portal. It organizes approved canonical metadata and published audio/sigil assets; it does not claim entity detection or objective angel-frequency measurement.`
