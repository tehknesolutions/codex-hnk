# HNK Fast Lane Pipeline V1

Mode: `BATCH_FIRST_FAIL_FAST`

The production unit is now the **cycle**, not the individual Folio.

A standard cycle runs:

`5 Folios -> lexical validation -> patch failed segments only -> source audit -> editorial QA -> cycle coherence -> GOLD LOCK -> recovery branch checkpoint -> next cycle`

No user approval is required between passing Folios or cycles. The pipeline stops only on a real blocker or explicit user interruption.

## Reporting

Instead of:
`Day 038 done -> Day 039? -> Day 040?`

Use:
`04A 037-041 -> 5/5 PASS -> 3525/3525 -> GOLD_LOCKED`

This reduces manual gates without lowering validation rigor.

## Current frontier

`04A · Cahetel · 037-041`

After PASS:
`04B · Haziel · 042-046` starts automatically.
