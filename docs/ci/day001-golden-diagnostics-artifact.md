# Day 001 Golden diagnostics artifact

The `Day 001 Golden Gate` persists validator output as a GitHub Actions artifact before enforcing the validator exit code.

Artifact contents:

- `golden.log` — complete stdout/stderr from `scripts/validate-day001-golden.mjs`.
- `exit-code.txt` — captured validator process exit code.

The workflow remains fail-closed: artifact upload does not turn a failing validator run green. `Enforce Golden result` fails the job whenever the captured exit code is non-zero.

Retention: 7 days.
