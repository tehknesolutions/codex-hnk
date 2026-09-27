# Day 001 Golden post-merge probe

This no-runtime probe exists only to trigger the Day 001 Golden Gate after diagnostics persistence landed on `main`.

Expected invariant: validator failures remain fail-closed, while `golden.log` and `exit-code.txt` are persisted before enforcement.
