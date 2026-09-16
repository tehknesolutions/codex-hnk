# HNK Portal 073 — Chokmah→Binah Audio Freeze V1

Status: **APPROVED CANONICAL AUDIO DEFINITION / RUNTIME PUBLICATION QA PENDING**

Scope: Portal 073 · Chokmah → Binah.

Source reconciliation:

`docs/audio/source-locks/HNK_PORTAL073_SOLFEGGIO_SOURCE_RECONCILIATION_V1.md`

Preset pair:

- `HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1`
- `HNK-PORTAL073-CHOKMAH-BINAH-CONTROL-V1`

## Frozen mapping

### ACTIVE

```text
left carrier          528 Hz
right carrier         532 Hz
binaural difference     4 Hz
waveform                sine
gain per channel        0.06
duration              600 s
```

### CONTROL

```text
left carrier          528 Hz
right carrier         528 Hz
binaural difference     0 Hz (inactive by design)
waveform                sine
gain per channel        0.06
duration              600 s
```

CONTROL is represented as a stereo-control condition, not as a zero-Hz binaural claim.

## Source/product boundary

- The Chapter 2 plan supplies the ritual requirement `Solfeggio de Chokmah para Binah` but no number.
- The HNK app master supplies an existing `528 Hz` Solfeggio tone and the 4 Hz Theta synthesis rule.
- Portal 073 explicitly adopts these existing HNK audio primitives as a **new canonical product mapping**.
- The mapping is not represented as a frequency recovered from the Chapter 2 line itself.

## Safety freeze

- `maxOutputGain = 0.08`;
- fade-in `5 s`;
- fade-out `10 s`;
- autoplay forbidden;
- explicit start required;
- user volume control required;
- immediate stop required;
- headphones required only to perceive the ACTIVE stereo difference;
- discomfort, pain, tinnitus, irritation or malaise => stop;
- increased volume never means deeper practice.

## Deterministic render lock

Format: PCM16 stereo · 44.1 kHz · one-second deterministic reference loop.

ACTIVE SHA-256:

`c8cc0b02bd8c41479eeb5b2788cf26bb951a7ad4e7c6562f6eb88bfab5e8e43b`

CONTROL SHA-256:

`7c8c4fb511883ac4b17fc475d4303ee1a922b4b186fc204760bafe50b9b1fc7c`

## Publication boundary

This freeze authorizes the canonical numeric definition as `approved`.

Production playback remains G7/G8 and requires Web/Native integration, lifecycle behavior, device/listening QA and Portal E2E validation before status may become `published`.

## Epistemic boundary

UI may state what frequencies were reproduced. It must not state that playback measures, proves or guarantees neurological, medical, spiritual or angelic effects.
