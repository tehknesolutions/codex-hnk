# HNK Audio Preset Contract V1

Status: **TECHNICAL CONTRACT FROZEN / PRESETS REQUIRE EXPLICIT PER-PRESET FREEZE**

Scope: HNK audio architecture for Web/Native. This document defines software vocabulary and publication gates. It does **not** decide unresolved ritual meaning of 528 Hz, 432 Hz, Theta or later ritual labels by itself and does not claim therapeutic, neurological or mystical effects.

## 1. Editorial state

The Kether Freeze audit established that audio references cannot be represented by one generic `frequency` field.

Current Kether state:

- Day 006 `52 Hz` was removed from the canonical Day because the source plan supports silent environmental listening rather than a specified frequency;
- Day 001/002 still contain source-level references that require reconciliation between `528 Hz` and `Theta / 432 Hz base` contexts;
- Day 004 uses Theta language without an explicitly frozen binaural difference;
- Day 030 still requires an approved active/control ASMR pair;
- Portal 036 still requires an approved transition preset.

No preset is authorized **by this generic contract alone**. A specific preset may be approved by a dedicated freeze that resolves its source references and provides `approvalRef` + `provenanceRef`.

Successor-canon state:

- Haziel Day 045 has a dedicated canonical audio freeze at `docs/audio/HNK_HAZIEL_D045_AUDIO_FREEZE_V1.md`;
- Nelchael Day 107 remains unresolved pending a Saturn-specific source reconciliation;
- Portal 109 remains unresolved pending its specific transition operators.

## 2. Vocabulary

The platform distinguishes:

- **carrier/base** — a tone used as a base/carrier when explicitly supported by the approved preset;
- **binaural difference** — the absolute difference between left/right carriers; it is never inferred from the word `Theta` or another state label alone;
- **stereo control** — equal left/right carriers used as a comparison condition with no active binaural difference;
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
- optional fixed `durationSeconds` when a source/product freeze defines session duration;
- approval/provenance references;
- optional deterministic render SHA-256;
- mandatory safety controls.

Contract version `1.1.0` adds an explicit `stereo-control` layer and optional fixed duration. A neutral comparison condition is therefore not misrepresented as a zero-Hz binaural layer.

## 4. Approval and publication gates

`approved` or `published` presets are invalid when:

- unresolved references remain;
- `approvalRef` is absent;
- `provenanceRef` is absent.

A `published` preset additionally requires a render/checksum SHA-256.

`approved` means the source/product mapping is frozen. `published` means the preset is additionally cleared for production playback after runtime/device QA. Canonical reference work and G7 runtime publication are therefore separate gates.

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

1. preserve/reconcile Day 001/002 source roles;
2. resolve remaining Theta numeric semantics where required;
3. define Day 030 active/control assets;
4. approve Portal 036 transition audio;
5. finish Web/Native publication QA for Haziel Day 045 ACTIVE/CONTROL;
6. reconcile Nelchael Day 107 Saturn audio;
7. reconcile Portal 109 transition audio;
8. render/version approved presets and register checksums + provenance;
9. implement Web/Native engines against this contract;
10. run device/listening QA before changing an approved preset to published state.
