# REMOTE-MIGRATION-13 · Actions Infrastructure Recovery

## Classification

`PRE_RUNNER_HOSTED_ACTIONS_DISPATCH_BLOCKER`

The failure is reproduced by three independent controls:

1. RC3 PostgreSQL gate — run `34176305082`, attempts 1 and 2.
2. Day 001 Golden Gate on `main` — run `34176311075`.
3. Minimal Hosted Runner Probe — run `34178435425`.

The minimal probe contains only:

```yaml
jobs:
  probe:
    runs-on: ubuntu-latest
    steps:
      - run: echo RUNNER_PROBE_PASS
```

Observed minimal-probe metadata:

- `conclusion = failure`
- `steps = []`
- `runner_id = 0`
- `runner_name = ""`
- `runner_group_id = 0`
- no job log generated

Therefore PostgreSQL, service containers, checkout, shell scripts and RC3 SQL are ruled out as causes of this failure signature.

## External state

- repository is public;
- runner requested is standard `ubuntu-latest`;
- GitHub Status reported Actions operational at reproduction time;
- exact account-side cause is not exposed through the connected API.

Possible categories remain account/repository Actions entitlement, billing/spending entitlement, account restriction, or GitHub-side dispatch entitlement. None is claimed as confirmed.

## Supabase fallback status

`dblink` is available but cannot open a second session without explicit database credentials. The connected API does not expose those credentials and no attempt is made to bypass that boundary.

Rollback-only database materialization remains:

- pgTAP: `PASS 16/16`
- production persistence: `0`
- Days 037–109 in production: `0`
- runtime 037–109: `OFF`

## Tracking

- Draft PR: `#2` — DO NOT MERGE
- Infra Issue: `#5`
- Runner probe commit: `dba4ded1060b4e4144dc59245edc4cd6b0a38a02`

## Release gate

`TRUE_CONCURRENT_POSTGRES_INTERLEAVING = NOT_EXECUTED`

`MAIN_MERGE_ALLOWED = false`

`RUNTIME_037_109_ENABLED = false`

After hosted runner assignment is restored, first require the minimal probe to execute at least one step with `runner_id != 0`, then re-run the PostgreSQL 17 concurrency gate in PR #2.
