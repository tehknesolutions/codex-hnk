# HNK Haziel Day 045 Audio Provenance V1

Status: **PROVENANCE RECONCILED / NO UNRESOLVED NUMERIC REFERENCES**

Scope: Chokmah · Atziluth · Haziel · Day 045.

## Source A — HNK app audio architecture

Source lock: `docs/audio/source-locks/HNK_APP_ONBOARDING_AUDIO_SOURCE_V1.md`  
Original source SHA-256: `b2c80d7985767b48b043f698e946bfe42afe136d02b2c6d43c9f70d0303f7a2e`

Supports:

- carrier/base = `432 Hz`;
- left channel carries the base;
- right channel = base + binaural difference;
- sine oscillator implementation.

## Source B — Day 045 Haziel

Canonical candidate: `content/editorial/chokmah-drafts/dia-045.md`  
Candidate blob at reconciliation: `75abeaeea7caae03c2e8e4e745379e21c61d09d9`

Supports:

- target binaural difference = `12 Hz`;
- practice duration = `10 minutes`;
- ACTIVE and equivalent CONTROL comparison;
- user-controlled comfortable volume;
- stop on discomfort;
- playback must not be represented as neurological measurement.

## Reconciliation

Applying the source-locked HNK player rule to the Day 045 difference:

```text
left carrier   = 432 Hz
right carrier  = 432 Hz + 12 Hz = 444 Hz
ACTIVE beat    = 12 Hz
CONTROL        = 432 Hz left / 432 Hz right
practice time  = 600 seconds
```

The CONTROL preserves carrier, stereo context, gain and duration while removing the active left/right difference.

## Product-only parameters

The following values are engineering decisions reused from the already frozen HNK 432 binaural runtime profile on the repository `main` line; they are **not** retroactively attributed to the ritual source:

- waveform: sine;
- sample rate: `44,100 Hz`;
- deterministic reference loop: `1 second`, PCM16 stereo;
- per-channel gain: `0.06`;
- maximum output gain: `0.08`;
- fade in: `5 seconds`;
- fade out: `10 seconds`;
- autoplay: forbidden;
- user volume control: required;
- immediate stop: required.

Reference product document: `docs/audio/HNK_THETA432_BINAURAL_FREEZE_V1.md` on `main`.

## Deterministic reference renders

ACTIVE `432/444` PCM16 stereo, 44.1 kHz, one-second sine loop, gain `0.06`:

`33b8e3567cba0ad1f05d080c437eecfe51e1993dba0d20ecfe6f600bb52f42a3`

CONTROL `432/432` with identical render settings:

`012100633f1548d00e62a79b0e7a0cd67a8121d198f38c1e758cf30bdaec3002`

## Epistemic boundary

The 12 Hz value is a playback difference in the approved HNK stimulus definition. It is not evidence that a brain state was produced, measured or synchronized.
