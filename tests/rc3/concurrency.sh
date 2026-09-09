#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"

USER_ID="22222222-2222-2222-2222-222222222222"
EVIDENCE='{"protocol_version":"HNK-CHOKHMAH-D037-RC3","source_sha":"sha-037","jachin":{"completed":true,"return_confirmed":true},"boaz":{"completed":true,"return_confirmed":true},"equilibrium":{"completed":true,"return_confirmed":true},"voluntary_completion_confirmed":true}'

reset_case() {
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -q <<SQL
truncate hnk_rc3_ci.completions,hnk_rc3_ci.xp_events,hnk_rc3_ci.receipts;
insert into hnk_rc3_ci.completions values('$USER_ID',36);
update hnk_rc3_ci.codex_days set status='reviewed';
update hnk_rc3_ci.registry set status='draft';
update hnk_rc3_ci.codex_days set status='canon' where day=37;
update hnk_rc3_ci.registry set status='active' where day=37;
SQL
}

run_call() {
  local client_id="$1"
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -qAt <<SQL
select hnk_rc3_ci.complete_day(
  '$USER_ID'::uuid,
  37::smallint,
  'HNK-CHOKHMAH-D037-COMP-RC3',
  'HNK-CHOKHMAH-D037-RC3',
  'sha-037',
  '$client_id',
  '$EVIDENCE'::jsonb
);
SQL
}

# A: same replay identity concurrently.
reset_case
run_call "same-replay" >/tmp/hnk-a.out & PID_A=$!
run_call "same-replay" >/tmp/hnk-b.out & PID_B=$!
wait "$PID_A"; wait "$PID_B"

read -r completions xp_events receipts <<<"$(psql "$DATABASE_URL" -X -qAt -F' ' -c \
  "select (select count(*) from hnk_rc3_ci.completions where user_id='$USER_ID' and day=37),
          (select count(*) from hnk_rc3_ci.xp_events where user_id='$USER_ID' and day=37),
          (select count(*) from hnk_rc3_ci.receipts where user_id='$USER_ID');")"
[[ "$completions" == "1" ]]
[[ "$xp_events" == "1" ]]
[[ "$receipts" == "1" ]]
cmp -s /tmp/hnk-a.out /tmp/hnk-b.out

# B: different replay identities racing the same Day.
reset_case
run_call "race-a" >/tmp/hnk-race-a.out & PID_A=$!
run_call "race-b" >/tmp/hnk-race-b.out & PID_B=$!
wait "$PID_A"; wait "$PID_B"

read -r completions xp_events receipts <<<"$(psql "$DATABASE_URL" -X -qAt -F' ' -c \
  "select (select count(*) from hnk_rc3_ci.completions where user_id='$USER_ID' and day=37),
          (select count(*) from hnk_rc3_ci.xp_events where user_id='$USER_ID' and day=37),
          (select count(*) from hnk_rc3_ci.receipts where user_id='$USER_ID');")"
[[ "$completions" == "1" ]]
[[ "$xp_events" == "1" ]]
[[ "$receipts" == "2" ]]

XP_A="$(jq -r '.xp_awarded' /tmp/hnk-race-a.out)"
XP_B="$(jq -r '.xp_awarded' /tmp/hnk-race-b.out)"
if ! { [[ "$XP_A" == "100" && "$XP_B" == "0" ]] || [[ "$XP_A" == "0" && "$XP_B" == "100" ]]; }; then
  echo "expected one 100-XP winner and one 0-XP race loser; got $XP_A / $XP_B" >&2
  exit 1
fi

echo "RC3_CONCURRENCY_PASS"
