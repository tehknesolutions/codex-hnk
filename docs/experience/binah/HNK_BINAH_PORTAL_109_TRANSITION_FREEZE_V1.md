# HNK Binah Portal 109 — Transition Freeze V1

Status: **TRANSITION TARGET FROZEN / BACKEND PROMOTION APPLIED / CANONICAL OPERATORS STILL BLOCKED**

Branch: `migration/m90-unified-v2`

## 1. Resolved transition semantics

The project sources resolve the apparent wording split between `Binah -> Chesed` and `Atziluth -> Beriah`.

Both describe the same boundary:

- Day 109 is the last Day of **Binah**, Chapter 3, and the last Day of **Atziluth**.
- Day 110 is the first Day of **Chesed**, Chapter 4, and the first Day of **Beriah**.
- Chapter 4 defines the practitioner state as **Level 4 — Praticante**.

Therefore the canonical post-Portal target is:

```text
Level 3 — Teurgo
Binah / Atziluth / Day 109
        |
        v
Level 4 — Praticante
Chesed / Beriah / Day 110
```

## 2. Source identity anchors

- `codex_365_arquitetura_final.md`
  - SHA-256: `6e671361b03a1f74963dfddd238dcd863cae2c94504cf12a48bda20decebe8d9`
  - establishes Atziluth through Day 109 and Beriah beginning at Day 110 with Chesed.
- `capitulo_4_plano_escrita.md`
  - SHA-256: `052bf85e17106ee0d45af559806641fbc840cb8bc37fad12afa89a6ce9473221`
  - establishes Chesed as pages 110–146, Beriah, **Level 4 — Praticante**.

## 3. Backend change

Repository migration:

`supabase/migrations/20260909143000_add_binah_portal_109_promotion.sql`

Final repository commit after preserving completion-contract v3 semantics:

`eeaa9740b038e2025be76b9afa7b2706047a773e`

Applied Supabase migration:

`add_binah_portal_109_promotion`

The existing `public.complete_codex_day` transaction now preserves all prior sequencing/idempotency behavior and adds the following atomic update for a **valid first completion of canonical Day 109**:

```text
initiatory_grade = 4
initiatory_title = Praticante
current_day = 110
current_chapter = 4
current_sephira = Chesed
```

No `current_world` column exists in `public.user_progress`; world is derived from the Day/chapter mapping.

## 4. Verification

Post-migration database audit confirmed that `public.complete_codex_day` contains:

- a Day 109 branch;
- `initiatory_title = 'Praticante'`;
- `current_day = 110`;
- `current_sephira = 'Chesed'`.

A separate audit confirmed `public.codex_days` still contains **no Day 109 row**.

Therefore this backend change does **not** release the Portal. It only makes the eventual canonical completion transaction correct.

## 5. Safety subgate already resolved

The paper-burning step has an approved no-fire product disposition with equivalent completion semantics. Fire is never required for XP.

## 6. Remaining release blockers

Day 109 remains non-canonical and runtime-blocked until all required operators are frozen:

1. approved Sintonizador Angelical preset/asset + provenance/checksum;
2. approved Saturn -> Jupiter transition audio semantics, with no guessed carrier/difference;
3. approved transition visual/sigil assets and orientation/version provenance where applicable;
4. Portal 109 evidence/runtime E2E validation against the server transaction;
5. final Web/Native QA and privacy audit.

## 7. Governance rule

This transition freeze resolves **where the Portal goes**, not **how the unresolved ritual operators are instantiated**. No audio, sigil or visual placeholder may use this backend readiness as justification for canonical release.
