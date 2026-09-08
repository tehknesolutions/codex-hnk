# HNK Day 002 Audio Freeze V1

Status: **FROZEN / PUBLISHED PRESET**

Preset: `HNK-KETHER-D002-AUDIO-V1`

## 1. Source boundary

The canonical Day 002 contains the wording `áudio binaural em frequência Solfeggio de 528Hz`, but it does not define left/right carriers, binaural difference, gain, waveform engineering or a neurologically verified target state.

This freeze preserves the canonical 528 Hz reference as a **ritual-tone layer**. It does not reinterpret 528 Hz as the binaural difference.

## 2. HNK product mapping V1

- left carrier/base: **432 Hz**
- right carrier: **438 Hz**
- binaural difference: **6 Hz**
- ritual-tone layer: **528 Hz** on both channels
- waveform: sine
- binaural layer gain: **0.06**
- ritual layer gain: **0.04**
- maximum product gain ceiling: **0.12**
- fade in: **5 s**
- fade out: **10 s**
- autoplay: forbidden
- user volume control: required
- immediate stop: required

The 6 Hz difference is an explicit **HNK product decision**, chosen inside the broad Theta-label range used by the source architecture. It is not presented as a scientifically proven optimum and playback must not claim that the user's brain entered a Theta state.

## 3. Deterministic offline render

At 44.1 kHz, 432 Hz, 438 Hz and 528 Hz all close phase over a one-second loop. The reference stereo WAV is therefore synthesized locally as a deterministic one-second loop and repeated by the runtime.

Reference render SHA-256:

`f2d62825612af7e79b62965dbc28d9066dfb032e71c59d2973706d329f84cf46`

## 4. Channel synthesis

Left:

`sin(432 Hz) × 0.06 + sin(528 Hz) × 0.04`

Right:

`sin(438 Hz) × 0.06 + sin(528 Hz) × 0.04`

The 6 Hz binaural difference is created by the 432/438 carrier pair. The 528 Hz layer is equal in both channels and remains a separate ritual layer.

## 5. Epistemic rule

Allowed product language: `preset binaural HNK com diferença de 6 Hz e camada ritual de 528 Hz`.

Forbidden product claims include statements that the preset proves, guarantees or medically induces a neurological, therapeutic or spiritual state.

## 6. Activation gate

The Day 002 Completion Contract may become `active` only after:

1. the shared audio contract exports this exact preset;
2. Web can synthesize/play/pause/stop it from a user gesture;
3. Expo can render/play/pause/stop the deterministic stereo loop offline;
4. Day 002 Evidence requires profile id `HNK-KETHER-D002-AUDIO-V1`;
5. the database preset row matches 432/438/6/528 and the reference checksum;
6. the V2 completion dispatcher supports `day002_v1`.

This document is the approval reference for Audio V1. Canon provenance remains separate.
