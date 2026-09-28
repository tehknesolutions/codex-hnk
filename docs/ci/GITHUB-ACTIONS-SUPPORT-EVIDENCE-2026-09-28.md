# GitHub Actions — Support Evidence Packet

Repository: `tehknesolutions/codex-hnk`
Default branch: `main`
Observed date: 2026-09-28

## Symptom

Multiple GitHub Actions workflow runs are created and marked `completed / failure`, but their jobs terminate before executable workflow steps are exposed.

Representative run:
- Run: `36485226297`
- Workflow: `Web Typecheck Diagnostic`
- Head SHA: `b040badc8d1ff0786ba60c65b9930e9d531a4d05`
- Check Suite: `98797195788`
- Job: `109140401094`
- Job conclusion: `failure`
- `steps: []`
- `runner_id: 0`
- `runner_name: ""`
- `runner_group_id: 0`
- labels: `ubuntu-latest`
- started: `2026-09-28T21:18:37Z`
- completed: `2026-09-28T21:18:40Z`

A second independent minimal runner probe reproduced the pre-step failure:
- Run: `36485832618`
- Probe job: `PROBE 0 · Runner shell only`
- The probe contains only shell/node diagnostic commands.
- It also failed before executable steps were exposed.

The Visual Target V1 gate reproduced the same class of failure.

## What has been ruled out by repository evidence

- The issue is not limited to the visual branch: the representative failure above occurred on `main`.
- The issue is not caused by the Day 001 test assertions: the jobs do not expose executed steps.
- The issue is not caused by local tooling: no local build/install is required to reproduce the hosted job failure.
- Repository connection has admin-level repository permissions.

## Current product state

Visual Target V1 is already merged into `main` through PR #363:
`b040badc8d1ff0786ba60c65b9930e9d531a4d05`.

Do not modify product implementation or weaken CI assertions to mask the infrastructure symptom.

## Requested GitHub investigation

Please inspect the Actions backend/job scheduling state for the repository and determine why jobs are failing before a hosted runner is assigned/exposed.

Useful identifiers:
- repository ID: `1360256352`
- run: `36485226297`
- job: `109140401094`
- check suite: `98797195788`
- head SHA: `b040badc8d1ff0786ba60c65b9930e9d531a4d05`

Expected resolution criterion:
1. A minimal runner probe executes at least its first step.
2. Visual Target V1 gate executes all four contract tests.
3. Web Typecheck Diagnostic reaches checkout/install/typecheck.
4. Only then evaluate any actual code/test failures.

## Related issue

Repository issue: #362
