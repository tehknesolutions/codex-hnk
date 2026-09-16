# HNK CHOKMAH — RELEASE GATE EXECUTION V1

Status: `EXECUTION_PENDING__NO_PASS_INFERRED`
Date: 2026-09-16
Scope: Day045 final QA + Day070–072 continuity + Portal073 pre-publication.

## Purpose

This runbook converts the remaining Chokmah release blockers into an executable, evidence-producing sequence. It does not authorize XP, completion, promotion, Portal073 publication, or a PASS without actual command/runtime evidence.

## Gate A — Day045 structural execution

Run from repository root with Node 22.x and pnpm 12.1.0:

```bash
node scripts/validate-day045-runtime-integration.mjs
pnpm --filter @hnk/web typecheck
pnpm --filter @hnk/mobile typecheck
```

Required evidence:
- validator process exit code 0;
- exact validator success line captured from stdout;
- Web typecheck exit code 0;
- Expo/mobile typecheck exit code 0.

A GitHub Actions run with `steps=[]`, `runner_id=0`, missing logs, or a pre-step infrastructure failure is **not** execution evidence and is neither code PASS nor code FAIL.

## Gate B — Chokmah continuity 070–072

```bash
node scripts/validate-day070-runtime-integration.mjs
node scripts/validate-day071-runtime-integration.mjs
node scripts/validate-day072-runtime-integration.mjs
```

Required evidence:
- each process exits 0;
- Day070 recognizes canonical supersession master SHA `26cd747bc3397c5dba08dbaf159f55b6a90c19b7b0e64b326a12bee389760989`;
- no validator restores `UPSTREAM_DAY045_AUDIO_PUBLICATION` as an open blocker;
- Day072 preserves exact 900-second gate and progression to Day073 without promotion.

## Gate C — Portal073 static/audio/type execution

Run only against the current approved operator set. Do not publish the operator set as a side effect.

```bash
pnpm validate:audio
pnpm validate:chokmah-portal
pnpm --filter @hnk/audio-contract typecheck
pnpm --filter @hnk/supabase-client typecheck
pnpm --filter @hnk/mobile typecheck
```

Required evidence: every command exits 0. A successful Web/Vercel build does not substitute for Expo/mobile execution evidence.

## Gate D — real browser/device QA

Evidence must be produced from actual runtime interaction, not source inspection.

Day045:
- explicit user start; no autoplay;
- ACTIVE/CONTROL selection works;
- volume cannot exceed 0.08;
- immediate Stop works;
- background/page hide stops playback;
- 600-second terminal behavior is correct;
- listening QA records no clipping/obvious artifact in both exact published masters.

Day072:
- 900-second active gate cannot seal at 899 or 901 seconds;
- foreground loss invalidates/resets the active measurement as specified;
- Vault E2EE path is exercised without server plaintext.

Portal073:
- approved ACTIVE operator plays with required controls;
- pause/resume/background behavior matches the frozen operator contract;
- Safety Stop works;
- Vault ciphertext -> receipt -> completion path resolves for the same user/day;
- no Day074 auto-start.

## Gate E — concurrency/release proof

Before publication, execute two genuinely simultaneous completion requests over independent connections and confirm runtime serialization/idempotency. Historical rollback proof is preserved but does not replace this real concurrency run.

Only after Gates A–E are evidenced may the release owner consider:
- publishing `portal_operator_sets(73)`;
- enabling `PORTAL073_PRODUCTION_ENABLED`;
- allowing the +500 XP / Iniciado -> Teurgo / Day074 transition in production.

## Fail-closed rule

Until all required evidence is attached to the release tracker, state remains:

`DAY045_FINAL_QA_LOCK__PORTAL073_APPROVED_NOT_PUBLISHED`

Do not infer PASS from implementation, code review, Vercel build, historical transaction proofs, or unavailable runner infrastructure.
