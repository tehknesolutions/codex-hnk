# HNK RENDERER LAYER V1

**Status:** runtime contract baseline  
**Scope:** Quest Engine → Web / Expo adapters  
**Golden consumer:** `HNK-KETHER-D001-V2`

## 1. Purpose

The Renderer Layer converts an `ExperienceDirective` into a neutral `RenderSurface` before any framework-specific UI is involved.

This prevents React, Next.js or Expo components from owning canonical or progression rules.

Pipeline:

```text
Quest Definition
→ ExperienceDirector
→ ExperienceDirective
→ buildRenderSurface(...)
→ Renderer Adapter
→ Web / Mobile UI
```

## 2. RenderSurface responsibilities

A `RenderSurface` exposes only presentation-safe runtime information:

- phase id/type;
- directive status;
- canonical requirement;
- source voice;
- canonical block ids;
- allowed controls;
- epistemic badges;
- effective motion profile;
- Vault/private-media requirements;
- fallback/reason when unavailable.

It does not award XP, write Day Completion or reinterpret Canon.

## 3. Voice separation

The renderer must preserve the source channel:

- `CANON` — canonical Codex text;
- `GUIDE` — platform mediation and beginner explanation;
- `GUIDE_SAFETY` — operational safety guidance;
- `SYSTEM` — state, sync, timer and progression UI;
- `USER` — private user-generated material.

Framework adapters may style these voices differently but may not merge them into an indistinguishable content stream.

## 4. Completion boundary

`COMPLETION` is not a client-owned completion button.

Its only allowed action is conceptually:

```text
REQUEST_SERVER_COMPLETION
```

The server validates the published completion contract, writes the idempotent completion/XP event and returns the authoritative result. Only then may the runtime enter the post-completion unlock phase.

## 5. Practice controls

Focus/relaxation/voice/audio surfaces must expose interruption controls appropriate to the phase. `STOP` must remain reachable during practices that can create prolonged focus, relaxation or audio exposure.

Reduced-motion mode must replace non-essential motion without removing the canonical protocol.

## 6. Privacy

The neutral surface explicitly marks:

- `vaultOnly` for free text destined exclusively for encrypted storage;
- `optionalPrivateMedia` for optional private media such as Day 001 vocal capture.

Renderer adapters must not route these payloads into analytics.

## 7. Epistemic overlays

`RenderSurface.badges` carries HNK-EP annotations such as `E1`–`E5` and `OPERATIONAL_HYPOTHESIS`.

The UI may render them as a compact information affordance. Their role is classification, not dismissal of the practice.

## 8. Day 001 profile

`docs/experience/kether/day-001/day-001.renderer-profile.json` maps every phase type currently used by Day 001 to a framework-neutral scene key.

The profile also freezes:

- server-only canonical completion;
- optional voice recording;
- voice practice without microphone capture;
- non-blocking unpublished Theta/432 profile;
- required reduced-motion fallback;
- signature moments for Kether reveal, attention return, Soul Mirror and First Spark.

## 9. Adapter target

When the migrated shell arrives, each platform implements the same scene keys:

```text
NarrativeScene
InstructionScene
TermRevealScene
CanonReadingScene
FocusPracticeScene
AudioPracticeScene
ReturnGateScene
RelaxationScene
VaultJournalScene
VoicePracticeScene
PhenomenologyScene
SoulMirrorScene
CorrespondenceScene
CompletionBoundaryScene
UnlockScene
```

Web and Expo may use different native primitives but must consume the same `RenderSurface` semantics.

## 10. Gate

Run:

```bash
node scripts/validate-day001-renderer.mjs
```

Expected:

```text
DAY001 RENDERER PASS
```

This gate verifies renderer coverage and the non-negotiable Day 001 policies before a visual adapter is allowed to ship.
