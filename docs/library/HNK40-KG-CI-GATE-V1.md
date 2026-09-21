# HNK40 KG CI Gate V1

The fail-closed HNK40 Knowledge Graph integrity contract is part of the repository root `check` chain.

Command:

`pnpm validate:hnk40-kg`

Root gate:

`pnpm check`

The HNK40 validator executes before the Turbo typecheck/test phase. Any drift in the protected HNK40 structural, visual-provenance, or approved compact-semantic invariants fails the root check.

This wiring does not claim a successful CI run by itself. It makes the validator mandatory whenever the root check is executed.
