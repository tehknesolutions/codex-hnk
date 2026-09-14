# HNK TETRAGRAMMATON D070 — REFERENCE FREEZE V1

Status: `REFERENCE_LOCKED__EXPECTED_MASTER_NOT_MATERIALIZED`

## Canonical expectation
- Day: 070 / Mebahel IV / Chokmah / Atziluth.
- Canonical source blob: `bb1e47aee510fe9df58a46f697ebafb9005e223e`.
- Expected canonical path: `assets/canonical/chokmah/pantaculo-tetragrammaton-hnk-master-v1.svg`.
- Expected SHA-256: `16cd1d9ff1cc256f570d526bc6c6bfd249d06957d972f87f51168011cb78451b`.
- Orientation: upright; never mirrored.
- Canonical registry document expected by the canon: `docs/design/canonical-references/HNK_CANONICAL_REFERENCE_REGISTRY_V1.json`.

## Current repository evidence
The expected canonical SVG and global canonical-reference registry are not materialized in the current repository tree and no historical commit for the expected SVG path was found.

## Candidate bridge
- Asset key: `hnk.tetragrammaton.day070.candidate.v1`.
- Repo path: `assets/candidates/chokmah/pantaculo-tetragrammaton-hnk-candidate-v1.svg`.
- Candidate SHA-256: `bf0e187137457b969695906fbabfce876a72500c21d115e18266220fc1bb6f52`.
- Approval state: `draft`.
- Provenance: original HNK vector candidate informed by a user-supplied visual reference; the source raster is not redistributed.
- Candidate is upright and non-mirrored, but it is **not canonical** and does not satisfy the expected checksum.

## Release rule
Day070 MUST remain reference-locked until either:
1. the historical approved master matching the expected SHA-256 is recovered and materialized; or
2. a new explicit canonical decision supersedes the historical checksum/path, updates the canon/freeze/registry coherently, and is approved before runtime activation.

No candidate, visual similarity, user perception, or approximate geometry may bypass this gate.
