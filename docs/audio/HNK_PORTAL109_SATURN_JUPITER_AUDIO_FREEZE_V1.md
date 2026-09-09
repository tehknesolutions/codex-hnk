# HNK Portal 109 Saturn→Jupiter Audio Freeze V1

Status: **APPROVED CANONICAL TRANSITION DEFINITION / RUNTIME PUBLICATION QA PENDING**

Scope: Day 109 · Binah / Atziluth closure → Chesed / Beriah boundary.

Preset pair:

- `HNK-PORTAL109-SATURN-JUPITER-ACTIVE-V1`
- `HNK-PORTAL109-SATURN-JUPITER-CONTROL-V1`

Planetary source lock:

`docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md`

HNK player source:

`docs/audio/source-locks/HNK_APP_ONBOARDING_AUDIO_SOURCE_V1.md`

## 1. Source-supported inputs

The Chapter 3 source plan explicitly requires a transition from Saturn to Jupiter but does not provide numeric Hz values or transition mechanics.

HNK already adopted the Cousto Cosmic Octave mapping as the normative numeric source for this planetary-tone family:

```text
Saturn  = 147.85 Hz
Jupiter = 183.58 Hz
```

The HNK app architecture independently supplies the Theta binaural difference:

```text
binaural difference = 4 Hz
```

The 4 Hz value is a technical HNK player layer. It is not a property attributed to Saturn or Jupiter.

## 2. HNK product transition decision

The original source says `Saturno → Júpiter` but does not specify how the audio moves between the two values. V1 freezes the following **product decision**, clearly distinguished from the source:

- duration: 600 seconds;
- instantaneous left-carrier frequency interpolates linearly from 147.85 Hz to 183.58 Hz;
- ACTIVE right carrier remains exactly +4 Hz above the instantaneous left carrier, therefore moves from 151.85 Hz to 187.58 Hz;
- CONTROL left/right carriers remain equal while following the same 147.85→183.58 Hz linear transition;
- phase is continuous across the complete render; no per-frame oscillator restart is allowed;
- waveform: sine;
- gain per channel: 0.06;
- max output gain: 0.08;
- fade-in: 5 seconds;
- fade-out: 10 seconds;
- no autoplay;
- explicit user start, volume control, pause/resume where supported and immediate stop are required.

This creates a reproducible transition without claiming that a particular sweep duration or curve is historically traditional.

## 3. ACTIVE definition

```text
id                    HNK-PORTAL109-SATURN-JUPITER-ACTIVE-V1
left start            147.85 Hz
left end              183.58 Hz
right start           151.85 Hz
right end             187.58 Hz
difference throughout   4.00 Hz
curve                  linear-frequency / phase-continuous
duration               600 s
sample rate            44,100 Hz
PCM reference          signed 16-bit stereo little-endian WAV
gain/channel           0.06
```

Full 600-second deterministic render SHA-256:

`599116929d4dde21a9ff77a4d64b2d43a79f9947a69df3a08bcffec389c95e58`

## 4. CONTROL definition

```text
id                    HNK-PORTAL109-SATURN-JUPITER-CONTROL-V1
left start            147.85 Hz
left end              183.58 Hz
right start           147.85 Hz
right end              183.58 Hz
active difference        0 Hz
curve                  linear-frequency / phase-continuous
duration               600 s
sample rate            44,100 Hz
PCM reference          signed 16-bit stereo little-endian WAV
gain/channel           0.06
```

Full 600-second deterministic render SHA-256:

`0deac19834d622bed5bd3aa6b16df8e1acabc7f3513b3a29377f02d73f1295e9`

The CONTROL exists for engineering/comparison validation. The canonical Portal flow does not require the user to complete both conditions unless a later reviewed protocol explicitly adds that requirement.

## 5. Deterministic render rule

For time `t` in seconds, `0 <= t < 600`:

```text
k = (183.58 - 147.85) / 600
f_left(t) = 147.85 + k*t
phase_left(t) = 2π * (147.85*t + 0.5*k*t²)
```

ACTIVE:

```text
phase_right(t) = phase_left(t) + 2π*4*t
```

CONTROL:

```text
phase_right(t) = phase_left(t)
```

Each sample is `round(sin(phase) * 0.06 * 32767)` clamped to signed PCM16. The WAV header is canonical PCM stereo 44.1 kHz. Fade behavior is a runtime envelope and is not baked into the reference render hash, matching the separation already used by the ritual-player contract.

## 6. Safety / epistemic boundary

The UI may report the exact tones, transition curve, duration and preset version. It must not claim that the transition:

- measures or guarantees a Theta brain state;
- receives physical signals from Saturn or Jupiter;
- heals or diagnoses;
- proves an occult or spiritual transition;
- guarantees successful initiation.

Safety Stop preserves prior progress and prevents Portal completion until a valid returned session is submitted.

## 7. Approval / release boundary

This freeze resolves the **canonical Saturn→Jupiter audio semantics** required by Portal 109.

The presets are approved but not runtime-published. Web/Native synthesis parity, lifecycle behavior, headphones/listening QA and Portal E2E remain G7/G8.
