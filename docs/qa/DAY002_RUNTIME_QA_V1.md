# HNK Day 002 — Runtime QA V1

**Status:** PARTIAL PASS — backend/runtime integration proven; browser/device QA pending.

## Scope

This document records evidence for `RUNTIME-002-INTEGRATION-QA` without conflating static integration, transactional backend proof, browser execution and physical-device execution.

## Proven by code/configuration

- Day 002 resolves through `QuestCatalog.requireDay(2)`.
- Quest content is bundled by `@hnk/quest-library`; canonical blocks are not copied manually into Web/Expo views.
- Quest engine contains no Day 002 branch or Day 002 audio frequencies.
- `AUDIO` resolves by `profile_id` through `AudioRuntimeRegistry`.
- Web and Expo implement the same `AudioRuntimePort` contract.
- Day 002 uses the approved `HNK-KETHER-D002-AUDIO-V1` profile.
- Web/Expo journeys call `startDay002PracticeSessionV1()` and `sealDay002V1()`.
- Safety Stop and Return Gate remain explicit.
- Private prose does not enter structured Evidence.
- Completion remains server-authoritative.

## Live Supabase transactional smoke

Executed against Supabase project `codex-hnk-app` using a synthetic auth user created inside one transaction and removed by `ROLLBACK`.

The sequence tested:

1. Day 001 first canonical completion.
2. Day 002 first canonical completion.
3. Replay of Day 002 with the same `client_completion_id`.
4. Day 002 revisit with a distinct Practice Session and completion id.
5. XP and attribute event counts.
6. Final user progress and DIS value.

Observed results before rollback:

- Day 001: `xp_awarded = 150`, first completion true.
- Day 002: `xp_awarded = 100`, first completion true.
- Day 002 replay using the same client id: stable replay response; no duplicate XP/attribute event.
- Day 002 revisit: `xp_awarded = 0`, first completion false.
- Day 002 XP events: exactly `1`, total `100`.
- Day 002 DIS events: exactly `1`.
- DIS moved from baseline `5` to `6`.
- XP total after Day 001 + Day 002: `250`.

No persistent user, completion, XP or attribute state was left behind because the test ended in `ROLLBACK`.

The reproducible test is versioned at:

`supabase/tests/day002_completion_v1_smoke.sql`

## What this proves

- Sequential gate Day 001 → Day 002 works.
- Day 002 Completion Contract is active and callable.
- First completion grants exactly +100 canonical XP.
- `HNK-ATTRIBUTE-PROGRESSION-MATRIX-V1` grants exactly +1 DIS for Day 002.
- Same-client replay is idempotent at the persisted event layer.
- Revisit grants 0 XP and 0 additional attribute event.

## What this does NOT yet prove

- True simultaneous concurrency from two independent database/network connections.
- Browser audio actually reaches the user's audio device.
- Expo audio actually plays correctly on Android/iOS hardware.
- Headphone channel separation on physical headphones.
- Browser auth callback and complete UI journey from a deployed preview.
- Expo lifecycle/interruption behavior on real devices.
- Full visual/accessibility QA.

## Vercel status

The existing Vercel project named `codex-hnk-app` is not used as release evidence for this repo: its most recent preview returned 404 for `/day-001`, showing it is not the current migrated shell.

Do not overwrite its active production domains merely to obtain QA evidence.

For the new monorepo preview, configure a separate Vercel project with:

- Repository: `tehknesolutions/codex-hnk`
- Root Directory: `apps/web`
- Framework: Next.js
- Node: 22.x (matching repo `engines`)
- Workspace install from repository root/pnpm workspace
- Preview environment variables for Supabase only; never commit keys.

Turborepo now declares `.next/**` while excluding `.next/cache/**`.

## Remaining acceptance evidence

- browser preview build + `/day-002` smoke;
- browser audio controls and channel playback;
- authenticated browser completion against live V2 backend;
- Expo physical-device test;
- true two-connection concurrency/idempotency test;
- final accessibility/reduced-motion pass.

Until those are captured, the Quest Pack may remain technically integrated but must not be labeled fully release-ready.
