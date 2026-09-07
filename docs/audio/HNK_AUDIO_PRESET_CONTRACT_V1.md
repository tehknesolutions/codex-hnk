# HNK Audio Preset Contract V1

Status: **TECHNICAL CONTRACT FROZEN / RITUAL PRESETS NOT APPROVED**

Scope: Kether audio architecture for Web/Native. This document defines software vocabulary and publication gates. It does **not** decide the unresolved ritual meaning of 528 Hz, 432 Hz or Theta and does not claim therapeutic, neurological or mystical effects.

## 1. Editorial state

The Kether Freeze audit established that audio references cannot be represented by one generic `frequency` field.

Current state:

- Day 006 `52 Hz` was removed from the canonical Day because the source plan supports silent environmental listening rather than a specified frequency;
- Day 001/002 still contain source-level references that require reconciliation between `528 Hz` and `Theta / 432 Hz base` contexts;
- Day 004 uses Theta language without an explicitly frozen binaural difference;
- Day 030 still requires an approved active/control ASMR pair;
- Portal 036 still requires an approved transition preset.

No production preset is authorized by this document.

## 2. Vocabulary

The platform distinguishes:

- **carrier/base** — a tone used as a base/carrier when explicitly supported by the approved preset;
- **binaural difference** — the absolute difference between left/right carriers; it is never inferred from the word `Theta` alone;
- **ritual tone** — an explicitly approved tone layer associated with the ritual preset;
- **ambient layer** — a non-carrier audio asset used for atmosphere;
- **target-state label** — a source/product label such as `Theta`; a label does not by itself define a numeric beat;
- **unresolved source reference** — source material that must remain visible to editorial review rather than being silently interpreted by code.

## 3. Shared schema

`@hnk/audio-contract` is the platform contract.

A preset contains:

- id + version;
- status: `draft | proposal | approved | published | retired`;
- layered audio definition;
- source references preserving raw labels;
- unresolved references;
- approval/provenance references;
- optional deterministic render SHA-256;
- mandatory safety controls.

## 4. Publication gate

`approved` or `published` presets are invalid when:

- unresolved references remain;
- `approvalRef` is absent;
- `provenanceRef` is absent.

A `published` preset additionally requires a render/checksum SHA-256.

No Day 001 or Portal 036 preset is seeded by this contract.

## 5. Playback safety baseline

Ritual playback requires:

- no autoplay;
- explicit user gesture to start;
- user-controlled volume;
- bounded output gain;
- immediate stop;
- pause/resume where technically applicable;
- non-negative fade-in/fade-out;
- lifecycle interruption handling before production release.

These are product safety/UX requirements, not medical guarantees.

## 6. Epistemic boundary

The engine may reproduce an approved waveform/preset. It must not describe that reproduction as proof that a user entered a neurological, spiritual or therapeutic state.

Source labels, subjective reports and traditional/ritual meanings remain distinct under HNK-EP.

## 7. UI cues are separate

Ordinary interface feedback audio (open/close/confirm) is a separate product-sound domain from ritual audio. It may not masquerade as Solfeggio, binaural therapy or a spiritual operator. No UI cue is authorized by this document either; it only establishes the separation.

## 8. Next approval work

1. reconcile Day 001/002 source roles;
2. resolve Theta numeric semantics where required;
3. define Day 030 active/control assets;
4. approve Portal 036 transition audio;
5. render/version approved presets;
6. register checksum + provenance;
7. implement Web/Native engines against this contract;
8. run device/listening QA before changing `PRESET_PENDING` to published state.
