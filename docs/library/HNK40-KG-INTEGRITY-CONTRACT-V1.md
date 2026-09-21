# HNK40 KG Integrity Contract V1

This validator fails closed if the integrated graph drifts from the approved HNK40 boundaries.

It requires:

- exactly 40 structural HNK_GLYPH nodes;
- each structural node to preserve the reference matrix visual state;
- exactly one SOURCE_ASSERTED `DERIVED_FROM` edge from each glyph to `HNK40-VISUAL-CANON-V2`;
- exactly six HNK_APPROVED `REPRESENTS` semantic edges per glyph;
- 240 approved compact semantic edges in total;
- 40 visual provenance edges in total;
- Visual Canon V2 to retain `legacy_recovery_claim=false`.

The validator does not promote Transformation, Question or Action, does not create reference-language mappings, and does not equate HNK40 with HENUVOKODAN.
