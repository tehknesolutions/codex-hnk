# HNK Chokmah — Haziel 042–046 Canonical Promotion Record V1

Status: **PARTIAL CANON + IMMUTABLE SYNC / RUNTIME 042–044 / DAY 045 BLOCKED / DAY 046 SEQUENCE-BLOCKED**  
Scope: Chokmah · Atziluth · Haziel · Days 042–046  
Source plan SHA-256: `49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59`

## Canonical promotion state

| Day | Candidate blob | Canonical blob | XP | G5 | G6 | G7 |
|---:|---|---|---:|---|---|---|
| 042 | `d84bf2ab43506b34eb0761c243653fece4c8dab5` | `b7f4da850f8c724cf48e980bd30882283efbb822` | 100 | PASS | PASS | PASS |
| 043 | `6efe79cf784b997260060122377e58c816c1765c` | `f1c8fa153f91ab0e7b3536c8b900ea438fa3b616` | 150 | PASS | PASS | PASS |
| 044 | `0b70a0bec9ba394bdfae5be847f131b503b61ff2` | `94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9` | 150 | PASS | PASS | PASS |
| 045 | `75abeaeea7caae03c2e8e4e745379e21c61d09d9` | — | 100 | **BLOCKED #10** | BLOCKED | BLOCKED |
| 046 | `36b454419ebde83c789a51579331928f4f544208` | `e8a812598e885222d42b0ddf968fa93c83d3432b` | 150 | PASS | PASS | **SEQUENCE-BLOCKED BY 045** |

Canonical successor commit for the promoted Haziel files: `bdb87e80e229575acd8fbef5ce434b33209ad54b`.

The canonical root deliberately contains Days 042, 043, 044 and 046 but **not Day 045**. This non-contiguous canonical publication is editorial/provenance state only. Runtime first-completion remains strictly sequential, therefore the executable frontier stops at Day 044 until #10 is resolved.

## G6 immutable sync proof

The Supabase successor sync was executed by exact commit SHA `bdb87e80...`:

- 042 -> `b7f4da850f8c724cf48e980bd30882283efbb822`
- 043 -> `f1c8fa153f91ab0e7b3536c8b900ea438fa3b616`
- 044 -> `94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9`
- 046 -> `e8a812598e885222d42b0ddf968fa93c83d3432b`

Database verification confirmed for all four rows:

- `status = canon`;
- `source_repository = tehknesolutions/codex-hnk`;
- `source_kind = successor`;
- `source_commit_sha = bdb87e80e229575acd8fbef5ce434b33209ad54b`;
- `source_sha` exactly equals the Git blob.

No Day 045 row was imported.

## Runtime 042–044

Runtime commit base: `76c01257d327745c2abf6773b9c671ddcfa80229`.

### Day 042

- 180 s gentle frontal massage;
- 300 s residual observation;
- 300 s neutral body-control condition;
- absence of sensation remains valid;
- Brodmann 10 remains a source/anatomical reference, not a measured activation claim;
- ocular/neurological discomfort Stop Gate;
- scalar evidence only.

### Day 043

- 600 s Blue Pearl condition;
- 600 s gray-point control;
- `blue_content_present=false` and `gray_content_present=false` are valid outcomes;
- no brightness/vividness score becomes clairvoyance evidence;
- ocular Stop Gate + Return Gate.

### Day 044

- six verifiable truisms;
- three permissive suggestions;
- active vs neutral comparison;
- ethical review and voluntary rejection remain mandatory;
- truisms, suggestions and neutral comparison prose are encrypted in Vault;
- Practice Session evidence carries only counts/flags/ratings.

## Server evidence contract

Applied production migration:

`20260908225124_enforce_haziel_042_044_scalar_evidence`

Properties:

- strict field allowlists for Days 042–044;
- required booleans use fail-closed `IS DISTINCT FROM` semantics;
- integer minima use `COALESCE(..., false)`;
- exact canonical source blobs are pinned;
- unknown fields are rejected;
- fake client `mode='revisit'` does not bypass first-completion validation because the trigger queries canonical `day_completions` instead of trusting the label;
- private validator functions are revoked from `public`, `anon` and `authenticated`.

## Production transactional QA

A disposable QA fixture was executed in the production database inside `BEGIN ... ROLLBACK`. Result: `PASS`; zero fixture users/sessions persisted.

Verified:

1. Day 042 missing required evidence fails closed.
2. Day 042 unknown/free-form evidence field is rejected.
3. Fake Day 042 revisit without prior completion cannot bypass validation.
4. Valid Day 042 completes only after Day 041 and awards +100 XP.
5. Day 043 accepts explicit no-image/no-content while preserving full 600+600 second protocol and awards +150 XP.
6. Day 044 rejects private script text in operational evidence.
7. Valid Day 044 awards +150 XP.
8. Haziel 042–044 total is exactly +400 XP.
9. Canonical progress advances to `current_day=45`.
10. Day 045 completion fails `canonical_day_not_found`.
11. Private Haziel validator functions are not executable by authenticated clients.

## Day 045 blocker

Issue #10 remains authoritative. The source plan names a 12 Hz binaural-difference target, but production still lacks approved carrier/base frequencies, control condition, loudness contract, provenance and checksums. No generic frequency, carrier or placeholder audio may be substituted to unlock progression.

## Day 046 disposition

Day 046 is already G5/G6 complete because its content/reference gate is clear. It remains **G7 disabled** because Atziluth first-completion sequence requires Day 045. The UI may explain this state but must not mount a Day 046 runtime, call `startPracticeSession`, submit evidence or award XP while Day 045 is unresolved.

## Release boundary

G8 remains pending for the batch. No statement of CI green, device QA complete or Atziluth Gold is authorized from this record.

## Next action

Resolve or continue tracking #10. In parallel, later editorial candidates may proceed through review/G5/G6 if desired, but runtime progression must remain blocked at Day 045 until its canonical audio operator is approved and synchronized.
