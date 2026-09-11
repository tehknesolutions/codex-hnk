# KETHER → CHOKMAH TRANSITION AUDIO V1

**Status:** `CANONICAL_RECIPE_APPROVED` / `MASTER_RENDERED` / `LISTENING_QA_PENDING` / `NOT_PUBLISHED`  
**Scope:** Portal 036  
**Canonical preset id:** `hnk.audio.kether_chokmah.transition.v1`  
**Approval:** Kether Reference Approval Packet V1 + project-owner progression authorization, 2026-09-04  
**Protocol:** HNK-EP-1.1

## 1. Canonical technical recipe

Stereo carrier pair:

- left: `429 Hz`;
- right: `435 Hz`;
- arithmetic center: `432 Hz`;
- binaural difference: `6 Hz`.

Ritual/Solfeggio layer:

- `528 Hz` mono-centered;
- mixed below the stereo carrier bed.

Target-state product label:

- `Theta — HNK target label`.

The app must never display `Theta detected` or claim that the 6 Hz production difference proves a measured neurological state.

## 2. Duration and envelope

- sample rate: `48,000 Hz`;
- channels: stereo;
- sample width: 16-bit PCM;
- duration: `720 s / 12 min`;
- fade in: `36 s`;
- body: `648 s`;
- fade out: `36 s`;
- carrier amplitude: `0.28`;
- ritual tone amplitude: `0.08`.

## 3. Deterministic renderer

Canonical recipe source:

`scripts/audio/render_kether_chokmah_transition_v1.py`

Publication model:

`versioned recipe → deterministic lossless master → listening QA → distribution derivative → checksums → Asset Registry`.

The app must play the published asset; it must not improvise these frequencies at runtime during a canonical Portal session.

## 4. Rendered master checkpoint

A lossless WAV master was rendered from the V1 algorithm on 2026-09-04.

File identity:

`kether-chokmah-transition-v1-proposal.wav`

SHA-256:

`5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168`

The reference renderer was independently accelerated for the local render only after a two-second PCM/WAV control sample was verified byte-for-byte against the Python algorithm. The checksum above identifies the resulting 12-minute WAV bytes.

The WAV is intentionally not committed to Git because of its large binary size. The recipe + checksum are the repository audit anchors until a publication storage target is registered.

## 5. Listening QA gate

The recipe is approved, but the audio asset is **not yet published**. Before publication, a human listening QA must confirm at safe volume:

- no harsh start/end transient;
- no clipping or unexpected artifact;
- tolerable stereo presentation;
- ritual layer remains subordinate to carrier bed;
- stop/pause/volume UX remains available in product;
- headphones warning is clear;
- reduced-sensory alternative remains available.

Issue #14 must remain open until this listening QA and final asset publication/registry step are complete.

## 6. Portal relationship

Canonical responsibility remains:

`audio armed → induction → stable depth → approved Kether sigil → gnosis → voluntary return → record`.

Playback alone never activates the sigil or marks the Portal complete.

## 7. Baseline

Portal comparison remains:

`FULL HNK PORTAL STACK` vs `INDUCTION-ONLY BASELINE`.

No synthetic control tone is introduced by V1.

## 8. HNK-EP boundary

This is an HNK-original production reconciliation of source-backed `432 Hz base`, `528 Hz` ritual references and the `Theta` label. It is not presented as a recovered manuscript recipe, medical treatment, neurological measurement or supernatural detection mechanism.
