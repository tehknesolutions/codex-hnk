# HNK App Onboarding Audio Source Lock V1

Status: **SOURCE LOCKED**

Source file: `hnk_app_onboarding_manual.md`  
SHA-256: `b2c80d7985767b48b043f698e946bfe42afe136d02b2c6d43c9f70d0303f7a2e`

Relevant source section: **5.2. O Sintonizador de Áudio Binaural (Web Audio API)**.

## Supported facts

The source architecture explicitly defines:

- two sine oscillators, one per stereo ear/channel;
- left channel as the carrier/base channel;
- **432 Hz** as the base frequency;
- the right channel as **base + binaural difference**;
- worked example: `432 Hz + 4 Hz = 436 Hz`.

This source therefore supports the engineering rule:

```text
left_hz  = 432
right_hz = 432 + binaural_difference_hz
```

## Boundary

This source does **not** itself define the Haziel Day 045 binaural difference. The Day 045 source independently supplies the `12 Hz` target.

The combination `432 + 12 = 444` is therefore a source-reconciled HNK product mapping, not a value silently backfilled into either source document.

No neurological, therapeutic or mystical effect is asserted by this source lock.
