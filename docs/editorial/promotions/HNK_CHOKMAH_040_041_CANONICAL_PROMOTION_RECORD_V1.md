# HNK Chokmah — Canonical Promotion Record V1 — Days 040–041

Status: **CANON + IMMUTABLE SYNC + RUNTIME ENABLED / G8 PENDING**  
Scope: Chokmah · Atziluth · Cahetel · Days 040–041  
Source plan: `capitulo_2_plano_escrita.md`  
Source plan SHA-256: `49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59`

## 1. Promotion chain

| Day | Staging/candidate blob | Canonical blob | XP | State |
|---:|---|---|---:|---|
| 040 | `eb9fdd0f91fc69e2a2a76086c78c6dcc93cee001` | `7a26302a35aa87b309e94abf516834019df29737` | 150 | canon + synced + runtime |
| 041 | `6ed522a0929d8c613bd6ad46ea55726df9ae93d9` | `f163bc7437efb0dfa70cdc5171e9a2e6acd7fdad` | 150 | canon + synced + runtime |

Canonical successor commit: `2d4a2e16f07012372cee49c551c2fb9532f7921b`.

Canonical paths:

- `content/canon/atziluth/chokmah/dia-040.md`
- `content/canon/atziluth/chokmah/dia-041.md`

The canonical copies preserve the reviewed nine counted blocks without semantic edits. The permitted promotion mutation is limited to `status: draft -> canon` plus the explicit canonical-successor provenance marker. `scripts/validate-canonical-successor.mjs` enforces this boundary.

## 2. Gate disposition

| Gate | Day 040 | Day 041 | Evidence |
|---|---|---|---|
| G1 — structure / HNK-EP / 705 | PASS | PASS | candidate/editorial validators + reviewed count matrix |
| G2 — source fidelity | PASS | PASS | `HNK_CHOKMAH_040_041_PROMOTION_CANDIDATE_V1.md` |
| G3 — epistemic / safety / privacy | PASS | PASS | reversibility, delayed interpretation, Vault boundary |
| G4 — reference provenance | N/A | N/A | no unresolved mandatory asset/audio operator |
| G5 — immutable canonical commit | PASS | PASS | commit `2d4a2e16...` |
| G6 — immutable DB sync | PASS | PASS | exact source blobs matched in `codex_days` |
| G7 — runtime enablement | PASS | PASS | mobile runtime commit `693d268d...` + server scalar evidence gate |
| G8 — release evidence | PENDING | PENDING | CI runner/device QA remain required |

## 3. Database provenance

The production HNK Supabase project was audited before sync. It contained only Days 001–036; Days 037–039 had not yet been imported despite existing in historical canon. The stale deployed sync function also fetched the moving `main` branch from the historical repository and did not provide a successor-source path.

The following production migrations were therefore applied and mirrored into this repository:

- `20260908214808_add_immutable_atziluth_source_sync`
  - introduces allowlisted `historical` and `successor` sources;
  - fetches exact immutable commit SHA;
  - requires `status: canon`;
  - records source repository, source kind and source commit SHA;
  - keeps sync functions private from `public`, `anon` and `authenticated`.
- `20260908214958_extend_atziluth_progression_v3`
  - closes sequential progression after Kether;
  - adds Portal 073 and 109 sequence gates;
  - accepts canonical/control Practice modes;
  - keeps XP and grade server-authoritative.
- `20260908220350_enforce_cahetel_040_041_scalar_evidence`
  - adds strict server evidence validators for Days 040–041;
  - checks the exact expected canonical source blob;
  - rejects unknown operational fields so private prose cannot cross into Practice Session evidence;
  - validates first-completion evidence independent of a client-supplied `mode` label.
- `20260908220534_fix_cahetel_040_041_required_evidence_nulls`
  - hardens SQL three-valued logic so absent JSONB keys fail closed via `IS DISTINCT FROM` / `COALESCE`.

The first evidence migration and the follow-up NULL hardening are intentionally both preserved: the migration history must reflect the actual production sequence rather than silently rewriting it.

## 4. Immutable sync results

Historical backfill executed first:

- Day 037 -> `3f61ac6495fbc438e87785d1929b0a32941976d2`
- Day 038 -> `db42ffb5a78fb9f3d816c2921b02b227bb7c7652`
- Day 039 -> `be610c0d5cee2553e281ac08ef3db6c0d26b5d27`
- source repository `Tehkne-Solutions/hnk-codex-365`
- immutable commit `4a5a88cc014308d3d2e27b581dd26be70b9d7cf4`

Successor sync then executed:

- Day 040 -> `7a26302a35aa87b309e94abf516834019df29737`
- Day 041 -> `f163bc7437efb0dfa70cdc5171e9a2e6acd7fdad`
- source repository `tehknesolutions/codex-hnk`
- immutable commit `2d4a2e16f07012372cee49c551c2fb9532f7921b`

All five returned database `source_sha` values matched their Git blob SHAs exactly. After sync, the production canonical DB boundary is Day 041.

## 5. Server QA executed in production transaction

A disposable test fixture was executed inside `BEGIN ... ROLLBACK`; zero fixture users/sessions/completions persisted.

Verified behavior:

1. Day 040 cannot complete without Day 039.
2. Day 040 valid evidence awards +150 XP.
3. Day 041 valid evidence awards +150 XP after Day 040.
4. Day 040 revisit awards zero additional XP.
5. XP total becomes exactly 300 for the two first completions.
6. `current_day` advances to 42.
7. Day 042 remains unavailable because no canonical Day 042 is synced.
8. authenticated clients cannot execute private successor/generic sync functions.
9. missing Day 040 evidence fails closed.
10. unknown/free-form Day 040 evidence fields are rejected.
11. a fake `mode='revisit'` cannot bypass first-completion evidence when no completion exists.
12. Day 041 content-presence fields must be booleans.
13. Day 041 explicitly accepts `active_content_present=false` and `open_content_present=false`, preserving silence/no-response as valid phenomenology.

The first pgTAP attempt against production failed because pgTAP is not installed there; no fixture persisted. Production assertions were therefore re-run in PL/pgSQL with transaction rollback. A pgTAP version is retained at `supabase/tests/atziluth_chokmah_040_041_p0.sql` for local Supabase CI.

## 6. Runtime boundary

Runtime commit: `693d268d3575ebbeb7d5a9cd35e1ef82d28b60a7`.

Day 040:

- 6-minute verbal condition;
- three verifiable truisms + one permissive suggestion;
- 6-minute silent comparison;
- eyelid heaviness is optional/zero-valid;
- explicit ocular discomfort Stop Gate;
- autonomy/reversibility confirmation;
- private wording encrypted in Vault;
- only scalar evidence/metrics cross the operational boundary.

Day 041:

- non-urgent spiritual question, stored only in encrypted Vault;
- 7-minute active-question reception;
- 7-minute open reception comparison;
- silence/no-response is valid;
- interpretation is delayed;
- alternative explanation + safe verification are mandatory;
- no use for emergency, health, finance, accusation or third-party-risk decisions;
- private experience/interpretation prose never enters analytics evidence.

`ChokmahCycle01Cahetel` now mounts executable canonical runtime for 037–041. `ChokmahJourney` still stops the executable frontier after Day 041, so Day 042 cannot auto-start or award XP.

## 7. Remaining release boundary

This record does **not** claim Atziluth Gold or CI green.

G8 remains blocked until:

- `pnpm check` and local Supabase suite execute green in an available runner/environment;
- device/browser runtime QA is completed where required;
- CI runner allocation is restored and workflow evidence is green.

## 8. Next canonical unit

Proceed in progression order with Haziel:

- Days 042–044: eligible for G5;
- Day 045: keep blocked by audio issue #10;
- Day 046: eligible for G5.

No Day 042+ runtime may become completable before its own G5/G6 chain is finished.
