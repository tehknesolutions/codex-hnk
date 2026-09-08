# HNK Canonical Successor Promotion V1

Status: **GOVERNANCE CANDIDATE / NO AUTO-PROMOTION**

## Purpose

The historical editorial repository `Tehkne-Solutions/hnk-codex-365` remains readable but the current connector cannot write to it (403). Atziluth drafting must therefore continue without silently redefining `draft` as `canon`.

This contract establishes the promotion path for the staged Chokmah 040–073 and Binah 074–109 corpus.

## Canonical successor rule

Until a writable canonical source is explicitly established, the following directories are **staging only**:

- `content/editorial/chokmah-drafts/`
- `content/editorial/binah-drafts/`

Files under those roots must remain `status: draft` and are prohibited from granting canonical XP or creating canonical Day completion.

The recommended successor source is a dedicated canonical root in the writable `tehknesolutions/codex-hnk` repository, versioned separately from staging and protected by review/validation, unless a restored writable editorial repository is deliberately selected later.

Proposed canonical root:

```text
content/canon/atziluth/
  kether/
  chokmah/
  binah/
```

Creating this directory alone does not promote any file. Promotion is an explicit reviewed operation.

## Promotion unit

The atomic editorial promotion unit is **one Day**, grouped into review batches for convenience. Each promoted Day must retain traceability to:

1. source plan SHA or recovered canonical source commit;
2. staging Git blob SHA;
3. staging content SHA-256;
4. editorial reviewer disposition;
5. resolved reference/audio/safety blockers;
6. final canonical Git blob SHA;
7. immutable canonical commit SHA;
8. database sync content SHA.

## Mandatory gates

A Day may be promoted only if all applicable gates pass:

### G1 — Editorial structure
- metadata correct for Day/chapter/sephira/world/level;
- HNK-EP-1.1 present;
- exact `137/72/26 × 3 = 705` structural-word matrix;
- no silent truncation or filler corruption.

### G2 — Source fidelity
- practice/title/XP and source-specific operators reconciled against the locked plan or recovered canon;
- product adaptations clearly identified as adaptations rather than rewritten source facts.

### G3 — Epistemic/safety/privacy
- instrumental, behavioral, phenomenological, traditional and theological claims remain separated;
- no unmeasured neurological/clinical/mystical certainty is introduced;
- private journal/Soul Mirror content remains Vault-bound;
- safety stop and Return Gate remain available.

### G4 — Reference provenance
Any Day with `REFERENCE_PENDING`, `REFERENCE_REVIEW`, `AUDIO_PRESET_PENDING`, `CANONICAL_REFERENCE_PENDING`, `SAFETY_REVIEW` or equivalent cannot be promoted until its disposition is recorded.

A blocker may be resolved only with an approved asset/operator/preset and provenance. Guessing a sigil variant, binaural carrier, planetary frequency, diagram orientation or ritual operator is prohibited.

### G5 — Canonical immutable commit
After review, the exact approved content is copied to the canonical root and committed. That commit SHA becomes the immutable source for sync. Runtime must never fetch canonical content from a mutable branch name while recording a different provenance SHA.

### G6 — Database sync verification
The Atziluth sync must fetch by the exact canonical commit SHA. After sync, verify:

- Day number;
- chapter/sephira/world;
- status `canon`;
- raw Markdown/content hash;
- source commit SHA;
- XP and progression metadata.

### G7 — Runtime enablement
Runtime definitions/UI may become canonical-completable only after G1–G6. Draft presence alone is never a runtime feature flag.

### G8 — Release evidence
Before release/tag:

- runtime/static validators green;
- progression and idempotency tests green;
- Portal E2E tests green where applicable;
- browser/device/hardware QA completed where required;
- CI green.

## Batch order

Recommended promotion sequence preserves progression dependencies:

1. Chokmah 040–071 cycles;
2. Chokmah Portal 072–073;
3. Binah 074–108 cycles;
4. Binah Portal 109.

A later Day may be editorially reviewed in parallel, but canonical runtime completion remains sequence-gated.

## Promotion record template

For each Day record:

```yaml
day: 40
staging_blob_sha: ...
staging_sha256: ...
source_plan_sha256: ...
reference_disposition: approved | not-applicable
safety_disposition: approved | not-applicable
editorial_review: approved
canonical_blob_sha: ...
canonical_commit_sha: ...
sync_content_sha: ...
runtime_enabled: false
qa_status: pending
```

## Non-goals

This governance document does not:

- promote any existing draft;
- declare Atziluth release-ready;
- resolve ritual references by itself;
- override the source plans;
- bypass the server-side XP/progression contract.

## Definition of done for Atziluth canon

Atziluth reaches **109/109 canon** only when every Day 001–109 has an approved canonical source, immutable provenance, verified database sync and no unresolved promotion blocker. Product Gold additionally requires runtime, QA, device/hardware evidence and CI green.
