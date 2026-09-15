# HOC FACELET SCAN V1

**ID:** `HOC-FACELET-SCAN-V1`  
**Status:** `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`  
**Purpose:** make physical 3×3 cube transcription reproducible for `HNK-ORACULUM-CUBE/V0.4`.

## 1. Canonical home orientation

Choose and freeze the six center faces before a consultation:

- `U` = Up
- `R` = Right
- `F` = Front
- `D` = Down
- `L` = Left
- `B` = Back

The center colors define the base-6 palette:

- color of U center -> digit `0`
- color of R center -> digit `1`
- color of F center -> digit `2`
- color of D center -> digit `3`
- color of L center -> digit `4`
- color of B center -> digit `5`

Color names are metadata only. The digits are the serialized values.

## 2. Face order

Serialize faces in exactly this order:

`U -> R -> F -> D -> L -> B`

Each face contributes nine digits, producing 54 digits total.

## 3. In-face order

Every visible 3×3 face is read row-by-row:

`1 2 3 / 4 5 6 / 7 8 9`

Within each row, read left to right; process rows top to bottom.

## 4. Physical viewing convention

Keep the canonical centers fixed. Do not relabel faces during scanning.

- `F`: view from front, U physically above.
- `R`: view from the right side, U above.
- `L`: view from the left side, U above.
- `B`: view from behind the cube, U above.
- `U`: view from above; the F edge is the bottom edge of the viewed U face.
- `D`: view from below; the F edge is the top edge of the viewed D face.

This convention defines the scan only. It does not claim historical occult authority.

## 5. Center lock

Position 5 of each face must equal its face digit:

`U5=0, R5=1, F5=2, D5=3, L5=4, B5=5`.

A valid color-state transcript contains exactly nine occurrences of each digit `0..5`.

## 6. Raw serialization

Concatenate the six nine-digit faces without spaces:

`UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB`

where each letter above represents that sticker's calibrated base-6 digit.

The resulting 54-character string is the `CUBE_STATE` consumed by V0.4.

## 7. Governance

`HOC-FACELET-SCAN-V1` closes a physical-capture ambiguity. It does not alter the V0.4 bit map, SHA-256 derivation, retry sampling, profile logic, or HNK glyph authority.
