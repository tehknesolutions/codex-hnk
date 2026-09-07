#!/usr/bin/env bash
set -euo pipefail

export PGPASSWORD="${PGPASSWORD:-postgres}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

USER_ID="44444444-4444-4444-4444-444444444444"
SESSION_A="dddddddd-dddd-dddd-dddd-dddddddd0001"
SESSION_B="dddddddd-dddd-dddd-dddd-dddddddd0002"

psql_admin() {
  psql -X -qAt -v ON_ERROR_STOP=1 \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" "$@"
}

cleanup() {
  psql_admin -c "delete from auth.users where id = '$USER_ID'::uuid;" >/dev/null 2>&1 || true
  rm -f /tmp/kether-race-a.json /tmp/kether-race-b.json
}
trap cleanup EXIT

psql_admin <<SQL
insert into public.codex_days (
  day, chapter, sephira, world, level, xp, title, slug,
  source_path, source_sha, status
) values (
  1, 1, 'Kether', 'Atziluth', 1, 150,
  'Kether Concurrency Test Day 001',
  'kether-concurrency-test-day-001',
  'canon/test/concurrency-day-001.md',
  'concurrency-source-sha-001',
  'canon'
)
on conflict (day) do update set
  xp = excluded.xp,
  title = excluded.title,
  source_sha = excluded.source_sha,
  status = excluded.status;

delete from auth.users where id = '$USER_ID'::uuid;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '$USER_ID'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated', 'authenticated', 'kether-race@example.invalid', '',
  now(), '{}'::jsonb, '{}'::jsonb, now(), now()
);

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values
  (
    '$SESSION_A'::uuid,
    '$USER_ID'::uuid,
    1, 'race-device-a', 'first_completion', 'evidence_pending',
    '{"protocol_completed":true,"return_confirmed":true}'::jsonb
  ),
  (
    '$SESSION_B'::uuid,
    '$USER_ID'::uuid,
    1, 'race-device-b', 'first_completion', 'evidence_pending',
    '{"protocol_completed":true,"return_confirmed":true}'::jsonb
  );
SQL

run_device() {
  local session_id="$1"
  local hash="$2"
  psql_admin -c "
    set role authenticated;
    set request.jwt.claim.sub = '$USER_ID';
    select public.complete_codex_day(1::smallint, '$session_id'::uuid, '$hash', now())::text;
  "
}

(run_device "$SESSION_A" "race-a" > /tmp/kether-race-a.json) &
PID_A=$!
(run_device "$SESSION_B" "race-b" > /tmp/kether-race-b.json) &
PID_B=$!

STATUS=0
wait "$PID_A" || STATUS=1
wait "$PID_B" || STATUS=1

if [[ "$STATUS" -ne 0 ]]; then
  echo "XP-005/OFF-003 FAIL: one concurrent RPC returned an error"
  echo "--- device A ---"
  cat /tmp/kether-race-a.json 2>/dev/null || true
  echo "--- device B ---"
  cat /tmp/kether-race-b.json 2>/dev/null || true
  exit 1
fi

PAYLOAD_A="$(grep -v '^[[:space:]]*$' /tmp/kether-race-a.json | tail -n 1)"
PAYLOAD_B="$(grep -v '^[[:space:]]*$' /tmp/kether-race-b.json | tail -n 1)"

jq -e . >/dev/null <<<"$PAYLOAD_A"
jq -e . >/dev/null <<<"$PAYLOAD_B"

XP_A="$(jq -r '.xp_awarded' <<<"$PAYLOAD_A")"
XP_B="$(jq -r '.xp_awarded' <<<"$PAYLOAD_B")"
FIRST_A="$(jq -r '.first_completion' <<<"$PAYLOAD_A")"
FIRST_B="$(jq -r '.first_completion' <<<"$PAYLOAD_B")"

if [[ $((XP_A + XP_B)) -ne 150 ]]; then
  echo "XP-005 FAIL: concurrent xp_awarded sum was $((XP_A + XP_B)), expected 150"
  printf 'A=%s\nB=%s\n' "$PAYLOAD_A" "$PAYLOAD_B"
  exit 1
fi

echo "XP-005 PASS: concurrent RPCs awarded canonical XP exactly once (A=$XP_A, B=$XP_B)"

if [[ "$FIRST_A" == "$FIRST_B" ]]; then
  echo "XP-005 FAIL: expected exactly one first_completion=true, got A=$FIRST_A B=$FIRST_B"
  exit 1
fi

STATE="$(psql_admin -F '|' -c "
  select
    (select count(*) from public.day_completions where user_id = '$USER_ID'::uuid and day = 1),
    (select count(*) from public.xp_events where user_id = '$USER_ID'::uuid and day = 1 and source = 'canonical_day_completion'),
    (select xp_total from public.user_progress where user_id = '$USER_ID'::uuid);
")"

IFS='|' read -r COMPLETIONS XP_EVENTS XP_TOTAL <<<"$STATE"

if [[ "$COMPLETIONS" != "1" || "$XP_EVENTS" != "1" || "$XP_TOTAL" != "150" ]]; then
  echo "OFF-003 FAIL: completion=$COMPLETIONS xp_events=$XP_EVENTS xp_total=$XP_TOTAL"
  exit 1
fi

echo "OFF-003 PASS: two-device race left one completion, one XP event and xp_total=150"
