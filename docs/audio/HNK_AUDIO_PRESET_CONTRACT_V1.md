# HNK Audio Preset Contract V1

Status: **TECHNICAL CONTRACT FROZEN**

This contract separates carrier/base, binaural difference, ritual tone, ambient layers and target-state labels. A source label such as `Theta` never defines a numeric beat by itself.

## Epistemic rule

Audio presets reproduce an approved product waveform. They do **not** prove neurological entrainment, therapeutic effect, mystical effect or spiritual state.

## Preset fields

- stable id/version/status;
- source references and raw labels;
- carrier/base layers;
- binaural difference when explicitly approved;
- ritual-tone layer when explicitly approved;
- optional ambient layers;
- approval/provenance reference;
- safety controls: no autoplay, explicit start, user volume, bounded gain, immediate stop, fades.

## Publication gate

An approved/published preset cannot contain unresolved references. Published rendered assets additionally require deterministic checksum provenance.

## Day 002 decision boundary

The Day 002 Canon contains two distinct source references:

1. Jachin Ordália: `áudio binaural em frequência Solfeggio de 528Hz`;
2. QR section: `ondas Theta / 432Hz base`.

The product does not equate a single 528 Hz tone with a binaural beat. `HNK-KETHER-D002-AUDIO-V1` therefore treats:

- `528 Hz` as a separate ritual-tone layer;
- `432 Hz` as the left/base carrier;
- `6 Hz` as a **new HNK product mapping decision** for the Theta-labeled binaural difference;
- `438 Hz` as the derived right carrier (`432 + 6`).

The 6 Hz choice is not claimed to be encoded in the Canon and is not a claim of superior efficacy. It is a versioned product interpretation selected inside the broadly used theta-frequency range, while the scientific literature on binaural-beat entrainment remains inconsistent.

Any future change to carrier, difference, duration or layer semantics requires a new preset version.
