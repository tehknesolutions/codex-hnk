# E3 — HNKP Mandala Namespace Extension

Status: **CANDIDATE / HUMAN GATE REQUIRED**

## Objective

Extend the experimental HNKP transport from MF-only PATHs to the Mandala E1/E2 address architecture without breaking any existing HNKP1 packet.

## Compatibility law

HNKP1 remains frozen:

- magic `HNKP`
- version `1`
- flags `1`
- MF tuple nodes encoded as LAY typed-frame + SEC typed-frame
- existing packet bytes, CRC32 values and base64url strings MUST NOT change.

A decoder implementing E3 dispatches `version=1` to the original HNKP1 decoder unchanged.

## HNKP2

HNKP2 introduces generic Mandala address nodes:

`namespace:u8 + ordinal:u16BE`

Namespaces:

- `1` MF — ordinal 1..432
- `2` CG — ordinal 1..9
- `3` CR:T — ordinal 1..3
- `4` CR:H — ordinal 1..7
- `5` CR:D — ordinal 1..12
- `255` HC — reserved, rejected in E3

MF ordinal mapping is deterministic:

`ordinal = (layer - 1) × 72 + sector`

This is transport representation only. It does not replace the canonical readable E1 address ID `MF:Lxx:Syy`.

## Edge governance

E3 separates **serialization capability** from **topological authority**.

An edge byte existing in the enum does not mean the transition is legal. The encoder/decoder MUST validate the transition against E2.

Currently legal classes include MF angular/radial, MF↔CG, CG circumferential and independent Rose cycles. MF↔CR, Rose cross-family bridges and HC transitions remain blocked.

## Packet structure

```text
H N K P | 02 | 02 | nodeCount |
(namespace ordinalHi ordinalLo) × N |
edge × (N-1) |
CRC32
```

For N nodes, packet size is:

`11 + 3N + (N-1) = 10 + 4N bytes`

Example: a 12-node V2 path occupies **58 bytes**.

The existing 12-node HNK40 HNKP1 representation occupies **70 bytes**, so a future V2 projection can be more compact while HNKP1 remains immutable for compatibility.

## Integrity boundary

CRC32 detects accidental corruption. It is not authentication, signature, semantic proof or canonical authority.

## Next gate

**E4 — HNK40 Genesis Projection**

Project every HNK40 MF-only PATH into HNKP2, decode it back to E1 addresses, and prove:

1. exact ordered PATH equality;
2. exact edge equality;
3. HNKP1 packets remain byte-identical;
4. HNKP2 packets round-trip independently;
5. no semantic/canonical promotion occurs.
