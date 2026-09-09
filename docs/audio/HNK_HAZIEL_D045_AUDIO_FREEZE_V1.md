# HNK Haziel Day 045 Audio Freeze V1

Status: **APPROVED CANONICAL AUDIO DEFINITION / RUNTIME PUBLICATION QA PENDING**

Preset pair:

- `HNK-HAZIEL-D045-ACTIVE-V1`
- `HNK-HAZIEL-D045-CONTROL-V1`

Provenance: `docs/audio/HNK_HAZIEL_D045_AUDIO_PROVENANCE_V1.md`

## Frozen mapping

### ACTIVE

```text
left carrier          432 Hz
right carrier         444 Hz
binaural difference    12 Hz
waveform                sine
gain per channel        0.06
duration              600 s
```

### CONTROL

```text
left carrier          432 Hz
right carrier         432 Hz
binaural difference     0 Hz (inactive by design)
waveform                sine
gain per channel        0.06
duration              600 s
```

The CONTROL is represented by the contract as `stereo-control`, not as a zero-Hz binaural layer.

## Safety freeze

- `maxOutputGain = 0.08`;
- fade-in `5 s`;
- fade-out `10 s`;
- autoplay forbidden;
- explicit start required;
- user volume control required;
- immediate stop required;
- headphones required only to perceive the ACTIVE stereo difference;
- significant discomfort, pain, irritation, tinnitus or malaise => stop;
- larger volume never represents deeper practice.

## Render lock

Format: PCM16 stereo · 44.1 kHz · one-second deterministic reference loop.

ACTIVE SHA-256:

`33b8e3567cba0ad1f05d080c437eecfe51e1993dba0d20ecfe6f600bb52f42a3`

CONTROL SHA-256:

`012100633f1548d00e62a79b0e7a0cd67a8121d198f38c1e758cf30bdaec3002`

## Approval boundary

This freeze resolves the **canonical audio definition** required by Day 045: carriers, difference, duration, control, loudness/safety envelope, provenance and deterministic checksums are no longer unresolved.

The preset pair is initially `approved`, not `published`. Publication still requires Web/Native playback integration, lifecycle/cache behavior and listening/device QA. Those G7/runtime tasks do not reopen the canonical numeric definition.

## Epistemic boundary

UI language must say what was reproduced. It must not claim that 12 Hz playback measured or guaranteed focus, brain-wave synchronization, therapy, healing or spiritual superiority.
