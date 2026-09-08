# HNK Theta/432 Binaural Profile — Freeze V1

**Preset:** `HNK-THETA432-BINAURAL-V1`  
**Status:** published product mapping  
**Purpose:** provide one reusable technical interpretation for Canon QR references that say `Theta / 432Hz base` without inventing a different mapping per Day.

## Source boundary

The Canon supplies two pieces of information:

- target/source label: `Theta`;
- base/carrier reference: `432 Hz`.

The Canon does **not** define the binaural difference.

The product therefore freezes the following engineering mapping as an HNK product decision V1:

```text
left carrier   432 Hz
right carrier  438 Hz
beat/difference  6 Hz
```

The `6 Hz` value is not retroactively attributed to the Canon and is not presented as proof that playback causes or guarantees a neurological Theta state.

## Relationship to Day 002

Day 002 keeps its existing composite preset:

`HNK-KETHER-D002-AUDIO-V1`

which contains:

- the same 432/438 → 6 Hz binaural layer;
- an additional ritual 528 Hz layer required by the Day 002 source.

The reusable `HNK-THETA432-BINAURAL-V1` profile contains **no 528 Hz layer**.

This prevents a QR reference such as `Theta / 432Hz base` from silently inheriting 528 Hz when the source does not say so.

## Deterministic render

Reference render:

- PCM16 stereo
- 44.1 kHz
- 1 second loop
- sine carriers
- per-channel gain: `0.06`

SHA-256:

`381e06f1ae0ef4a97c063635d8d80d387b4c009ff604b7b188ffcdabcc902785`

## Safety / product language

- autoplay forbidden;
- explicit user gesture required;
- user volume control required;
- immediate stop required;
- headphones are required to perceive the stereo binaural difference;
- no diagnostic, therapeutic or neurological-state guarantee;
- significant discomfort => stop.

## Reuse

This profile may be referenced by multiple Days only when their source explicitly carries the same `Theta / 432Hz base` reference and no additional source-specific audio layer is silently added.

Current intended reuse:

- Day 001 QR — optional audio;
- Day 003 QR — optional audio;
- future Days only after source-by-source reconciliation.
