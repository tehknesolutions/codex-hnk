# Day 001 Golden watched diagnostics probe

No runtime, canon, Evidence, Seal, or completion-contract change.

This probe intentionally lives under `docs/experience/kether/day-001/**`, a path watched by the Day 001 Golden Gate, so the pull-request event dispatches the post-merge diagnostic workflow.

Expected behavior: the gate remains fail-closed and persists `golden.log` plus `exit-code.txt` before enforcing any validator failure.
