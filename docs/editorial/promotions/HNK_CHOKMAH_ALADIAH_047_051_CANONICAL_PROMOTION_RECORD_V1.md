# HNK Chokmah — Aladiah 047–051 Canonical Promotion Record V1

Status: **CANON + IMMUTABLE SYNC / G7 SEQUENCE-BLOCKED BY DAY 045**  
Scope: Chokmah · Atziluth · Aladiah · Days 047–051  
Source plan SHA-256: `49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59`

## Promotion chain

| Day | Candidate blob | Canonical blob | XP | G5 | G6 | G7 |
|---:|---|---|---:|---|---|---|
| 047 | `942535e3f2d6f96083cceb90bde9976c7484d8b1` | `74d2be4a84f4818729bb069ac7642c7e51ff6f14` | 150 | PASS | PASS | BLOCKED BY 045 |
| 048 | `7b940f11c60db8632660a5f69c2b8661cf703a88` | `ff8cae22023e70359768023dfc927ce94c1a27d5` | 150 | PASS | PASS | BLOCKED BY 045 |
| 049 | `f0907085fba35f638c5bd2b8bb252845162f0596` | `63932dceb3e412a5f6a067049d8a57e0374ed68e` | 100 | PASS | PASS | BLOCKED BY 045 |
| 050 | `bbd9093837c13a2d6f30ea88396c1e1f367b4bcf` | `99f56677fb57d8ddfe191b081cae44734b38ae50` | 200 | PASS | PASS | BLOCKED BY 045 |
| 051 | `da445744bffbdbeaad6f693e141407fdcae6c260` | `e70910495dbbe0c70cece9b694271ded7799c7fd` | 200 | PASS | PASS | BLOCKED BY 045 |

Immutable successor commit used for DB sync: `9ec35c133177afdc698c453d33fac35b552789d1`.

## Integrity and provenance

Each canonical file preserves the reviewed counted body and changes only promotion metadata: `status: canon` plus the `CANONICAL SUCCESSOR` provenance marker naming the approved staging blob.

The production Supabase successor sync imported Days 047–051 from exactly commit `9ec35c13...`. Verification confirmed:

- `status = canon`;
- `source_sha` equals the canonical Git blob for every Day;
- `source_path` points to `content/canon/atziluth/chokmah/dia-0XX.md`;
- `content.source_repository = tehknesolutions/codex-hnk`;
- `content.source_kind = successor`;
- `content.source_commit_sha = 9ec35c133177afdc698c453d33fac35b552789d1`.

Provenance repository/kind/commit are intentionally stored inside `codex_days.content` by migration `20260908214808_add_immutable_atziluth_source_sync`, not as direct table columns.

## Runtime disposition

No Aladiah runtime is authorized yet. The first-completion sequence is server-authoritative and currently stops at Day 045 because the required Haziel audio preset remains unresolved under issue #10. Canonical publication of later Days does not bypass progression.

Day 046 is likewise canonical/synced but sequence-blocked. Therefore 047–051 may exist in canonical storage and database while remaining non-executable.

## Release boundary

G8 remains pending. This record does not claim CI green, device QA complete or Atziluth Gold.

## Next action

Continue G5/G6 promotion of later reviewed candidates where G4 is clear. Keep G7 frontier at Day 044 until issue #10 is resolved and Day 045 itself completes G4→G7.
