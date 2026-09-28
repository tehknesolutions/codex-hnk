# HNK40 Legacy → E5 Bridge — V6 Packet Identity Audit

Status: RESEARCH_RESULT / NON-CANONICAL
Branch: research/hnk40-legacy-e5-bridge

## Question
Do HNKP2/HNKP1 contain an independent identity-bearing field that can legitimately break the G17/G20 V5 tie?

## Packet-level result
The verified HNKP2 records have a fixed structure visible directly in the 58-byte packets:
- header: HNKP 02 02 0C;
- 12 encoded Mandala addresses;
- one terminal ordinal byte;
- 11 edge-direction/type bytes;
- CRC32.

For G17, the terminal byte is 0x58 = 88, matching its final E1 ordinal. The following 11 bytes are 03 01 03 01 00 00 02 01 01 00 02 and reproduce its source edge sequence under the existing edge code mapping:
- 03 = RADIAL_OUT
- 01 = ANGULAR_PREV
- 00 = ANGULAR_NEXT
- 02 = RADIAL_IN

For G20, the terminal byte is 0x5D = 93, matching its final E1 ordinal. Its 11 edge bytes 03 00 03 00 01 01 02 00 00 01 02 reproduce its source edge sequence exactly.

Therefore the HNKP2 tail does not provide a hidden independent identity selector: it is a transport encoding of information already represented by sourcePath, sourceEdges, and the terminal E1 ordinal.

The HNKP1 records likewise pass immutable path/CRC/base64 checks and encode the legacy path; the V1 source explicitly treats HNKP1 as immutable evidence, not as a second semantic identity assignment.

## G17 / G20 consequence
No independently encoded HNKP2/HNKP1 field was found that distinguishes the two V5 candidates.

Therefore the V5 state remains:
- G17 = DERIVED_AMBIGUOUS
- G20 = DERIVED_AMBIGUOUS
- strongest structural projection = 38/40 unique

## Governance conclusion
Do not manufacture a tie-break from packet bytes, CRC, PUA, glyph ordinal or transport representation. CRC validates integrity; it does not establish semantic identity.

The packet audit therefore closes the current V6 hypothesis:
PACKET TRANSPORT != INDEPENDENT IDENTITY SOURCE.

## Next legitimate research directions
1. locate an existing, independently versioned HNK40↔glyph identity mapping;
2. inspect source provenance outside the packet itself, if such a mapping is explicitly governed;
3. test whether a new E5 identity model should intentionally permit multiple projections for legacy records;
4. otherwise preserve G17/G20 as ambiguous rather than forcing a 40/40 bijection.

No canonical promotion is made by this audit.