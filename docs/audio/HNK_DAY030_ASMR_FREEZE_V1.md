# HNK Day 030 — Procedural ASMR / Neutral Control Freeze V1

Status: FROZEN_FOR_RUNTIME_V1
Day: 030
Canon: `Tehkne-Solutions/hnk-codex-365/canon/capitulo-01-kether/dia-030.md`
Canon SHA: `a9bea648b20595579ef70c11ba3f319e477845dd`

## Purpose

Day 030 requires three 10-minute listening blocks: Kether ASMR active, neutral control, then Kether ASMR integration. V1 renders the two audio conditions procedurally from deterministic code so Web and Expo use the same underlying PCM design without depending on an opaque binary upload.

The audio is a product implementation of the canon, not a scientific claim that binaural playback or ASMR produces a specific neurological state. Subjective relaxation, tingles, absorption, imagery, proximity, lateralization or silence are observations, not proof of an external or neurological cause.

## Active profile

Profile id: `HNK-KETHER-D030-ASMR-ACTIVE-V1`

- deterministic stereo PCM loop
- 22,050 Hz sample rate
- 8 second seamless design window
- shared neutral tonal bed
- low-level 192 Hz left / 198 Hz right layer; 6 Hz channel difference is a product parameter only
- low-level short micro-events with smooth envelopes and alternating stereo position
- no spoken formula and no hidden verbal suggestion
- target RMS matched to the neutral control
- peak ceiling 0.12 before user volume control

## Neutral control profile

Profile id: `HNK-KETHER-D030-CONTROL-V1`

- deterministic stereo PCM loop
- same sample rate, loop duration, neutral tonal bed, target RMS and peak ceiling
- channels are correlated for the neutral bed
- no ASMR micro-events
- no binaural difference layer
- no LAMED-LAMED-HE or other ritual formula embedded in the signal

The control is intentionally not silence. Silence would change more than the ASMR-specific variables and would weaken the comparison.

## Runtime invariants

1. Autoplay is forbidden.
2. User volume control and immediate stop are mandatory.
3. Each canonical listening condition requires 600 effective foreground seconds while its audio is playing.
4. Pause stops effective-time accumulation.
5. Backgrounding/hidden-tab during an active timed block invalidates that block rather than silently counting background time.
6. Active and control should use the same headphones, posture and approximately the same user-set volume.
7. Higher volume is never treated as deeper gnosis or better performance.
8. Pain, significant irritation or persistent tinnitus is a stop/reduce-volume signal.
9. Active need not outperform control; data may contradict expectation.
10. LAMED-LAMED-HE is performed separately where the canon calls for it; it is not encoded into the procedural waveform.

## Evidence boundary

The server may receive structured metrics such as duration, latency, distraction count and 0–10 ratings. Free-form phenomenology remains Vault E2EE and completion receives only opaque Vault refs. Audio is never recorded from the user in Day 030 V1.

## Release boundary

A procedurally generated profile can be runtime-ready without a storage asset, but it still requires device/browser QA before the Day 030 release is considered final.