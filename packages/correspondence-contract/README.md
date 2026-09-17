# @hnk/correspondence-contract

Runtime-neutral contract for storing and querying HNK correspondence data without flattening historical disagreements.

## Guarantees

- Every record carries `tradition_id`, `system_version`, `historical_layer`, `origin`, `claim_kind`, `evidence_scope`, `decision`, and provenance sources.
- HNK-authored mappings require explicit authorship and rationale.
- Historical mappings cannot masquerade as HNK-authored evidence.
- Tarot number, Hebrew-letter position, path number, and glyph position are separate ordinal fields.
- Queries never silently choose a winner when multiple traditions or values coexist.
- `resolveCorrespondence()` returns `CONFLICT` instead of collapsing competing mappings.

## Non-goals

This package does not declare occult correspondences true, does not promote research material into HNK canon, and does not select a preferred historical tradition. It implements the governance rules admitted by Research 001 / Comparative Pass 004.
