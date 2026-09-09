# HNK Binah — Safety-Cleared Canonical Promotion Record V1

**Status:** G5/G6 PASS  
**Scope:** Days 083, 084 and 089 · Binah · Atziluth · Level 3 — Teurgo  
**Safety disposition:** `docs/experience/binah/HNK_BINAH_SAFETY_DISPOSITION_083_084_089_093_V1.md`

## Purpose

Record the immutable canonical promotion and database synchronization of the three Binah Days whose production safety review was resolved without changing the reviewed ritual body.

Day 093 is deliberately excluded and remains blocked.

## Safety decision

Governance record commit:

`6d99657f7da12b2125ab26932f8c691840dac959`

Disposition:

| Day | Practice | Safety result |
|---:|---|---|
| 083 | Ritual do Espinho Protetor | `APPROVED_WITH_GUARDS` |
| 084 | Revelação por Espelho | `APPROVED_WITH_GUARDS` |
| 089 | A Palavra Justa | `APPROVED_WITH_GUARDS` |
| 093 | O Sopro do Ar Puro | `HOLD — SAFETY_REVIEW` |

## G5 — immutable successor canon

The final source commit containing all three promoted files is:

`3c34bde5b280204c519f0b3a862916bb23b534fd`

Canonical source proofs:

| Day | Canonical path | Git blob SHA |
|---:|---|---|
| 083 | `content/canon/atziluth/binah/dia-083.md` | `7b96756fd1b827af4d268328a0b4398598b2acea` |
| 084 | `content/canon/atziluth/binah/dia-084.md` | `01d26332f0ce92d5c89fefc62c44dfd5051fdb7b` |
| 089 | `content/canon/atziluth/binah/dia-089.md` | `dd664c8fb6e02060b5d30d417a63cd204e7ac95d` |

Each file is `status: canon` and cites the reviewed staging blob plus the safety-disposition document.

## G6 — exact immutable Supabase sync

Executed against Supabase project `codex-hnk-app`:

```sql
select *
from hnk_private.sync_codex_successor_range(
  83,
  89,
  '3c34bde5b280204c519f0b3a862916bb23b534fd'
);
```

Returned exact source blobs:

```text
083  7b96756fd1b827af4d268328a0b4398598b2acea
084  01d26332f0ce92d5c89fefc62c44dfd5051fdb7b
085  28048b337092c20989fe96252c4baf09d495b271
086  bce3886fed360aedf87c57ca87e5c535a82f82a9
087  6561d3ec143a27648c406c2664071194560c15c5
088  ad546b6a512dbe086b05da7a4e508913d7d2c249
089  dd664c8fb6e02060b5d30d417a63cd204e7ac95d
```

Days 085–088 were re-read from the same immutable commit and remained byte-identical to their prior canon.

Database verification for Days 083–092 confirmed:

- 083–089 are `status='canon'`;
- 083–089 point to `source_commit_sha = 3c34bde5b280204c519f0b3a862916bb23b534fd`;
- 090–092 remain canonical from their prior immutable commit;
- all rows point to `tehknesolutions/codex-hnk` successor canon.

## Negative proof — Day 093

At the same final commit:

`content/canon/atziluth/binah/dia-093.md` → **404 / absent**.

The database query through Day 093 returned no Day 093 row.

Therefore the safety decision did not accidentally promote the breath-retention practice.

## Binah blocker set after this promotion

The remaining non-canonical Binah Days are now:

```text
079  REFERENCE_REVIEW — Thurisaz asset/orientation/provenance
093  SAFETY_REVIEW — canonical 4-4-4-4 breath retention disposition
105  REFERENCE_REVIEW — exact 22-petal Rose / Hermetic Cross
107  AUDIO_PRESET_PENDING — Saturn audio parameters/provenance
109  CANONICAL_REFERENCE_PENDING — Portal operators
```

For Day 109, the mandatory-fire safety subgate has separately been resolved by `docs/experience/binah/HNK_BINAH_PORTAL109_SAFETY_DISPOSITION_V1.md`; the Portal remains blocked by references/backend QA.

## Frontier

```text
highest stored canonical Day: 108
continuous executable frontier: 044
```

The stored frontier is not the executable frontier. Day 045 remains the first unresolved continuity blocker in Chokmah.

## Result

**G5 PASS:** 083, 084, 089  
**G6 PASS:** exact Git ↔ Supabase blob equality  
**093:** intentionally blocked and absent  
**No G7 claim is made by this record.**
