#!/usr/bin/env bash
set -euo pipefail

# DRAFT ONLY.
# Move into supabase/tests after canonical Supabase migration.
#
# Purpose:
# - fire two first-completion calls concurrently for the same Day/user
# - prove one day_completion
# - prove one canonical XP event
# - prove xp_total increments once
#
# Required env:
#   DATABASE_URL
#   TEST_USER_ID
#   TEST_SESSION_A
#   TEST_SESSION_B
#
# This harness intentionally leaves fixture creation to the pgTAP/bootstrap layer.

: "${DATABASE_URL:?DATABASE_URL required}"
: "${TEST_USER_ID:?TEST_USER_ID required}"
: "${TEST_SESSION_A:?TEST_SESSION_A required}"
: "${TEST_SESSION_B:?TEST_SESSION_B required}"

CALL_A=$(cat <<SQL
begin;
set local role authenticated;
set local request.jwt.claim.sub = '${TEST_USER_ID}';
select public.complete_codex_day_v2(
  1::smallint,
  '${TEST_SESSION_A}'::uuid,
  'HNK-KETHER-D001-COMP-V2',
  'HNK-KETHER-D001-V2',
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  'concurrent-a',
  null,
  now()
);
commit;
SQL
)

CALL_B=$(cat <<SQL
begin;
set local role authenticated;
set local request.jwt.claim.sub = '${TEST_USER_ID}';
select public.complete_codex_day_v2(
  1::smallint,
  '${TEST_SESSION_B}'::uuid,
  'HNK-KETHER-D001-COMP-V2',
  'HNK-KETHER-D001-V2',
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  'concurrent-b',
  null,
  now()
);
commit;
SQL
)

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "$CALL_A" > /tmp/hnk-completion-a.log 2>&1 &
PID_A=$!
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "$CALL_B" > /tmp/hnk-completion-b.log 2>&1 &
PID_B=$!

wait "$PID_A"
wait "$PID_B"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
select count(*) = 1 as exactly_one_completion
from public.day_completions
where user_id = '${TEST_USER_ID}'::uuid and day = 1;

select count(*) = 1 as exactly_one_xp_event
from public.xp_events
where user_id = '${TEST_USER_ID}'::uuid
  and day = 1
  and source = 'canonical_day_completion';

select xp_total = 150 as xp_once
from public.user_progress
where user_id = '${TEST_USER_ID}'::uuid;
SQL
