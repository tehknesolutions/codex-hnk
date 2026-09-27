# Day 001 Golden post-merge probe

This no-runtime probe exists only to trigger the Day 001 Golden Gate after diagnostics persistence landed on `main`.

The first probe intentionally revealed a path-filter blind spot: `docs/ci/**` is not watched by the Day 001 workflow, so no Actions run was created.

This revision is paired with a watched Day 001 experience probe so the existing `pull_request.paths` filter actually dispatches the workflow.

Expected invariant: validator failures remain fail-closed, while `golden.log` and `exit-code.txt` are persisted before enforcement.
