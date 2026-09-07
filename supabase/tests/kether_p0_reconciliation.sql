begin;

select plan(2);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kether-offline-late@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kether-portal-34@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

insert into public.codex_days (
  day, chapter, sephira, world, level, xp, title, slug,
  source_path, source_sha, status
)
select
  d,
  1,
  'Kether',
  'Atziluth',
  1,
  case when d = 1 then 150 when d = 36 then 500 else 100 end,
  'Kether Reconciliation Day ' || lpad(d::text, 3, '0'),
  'kether-reconciliation-day-' || lpad(d::text, 3, '0'),
  'canon/test/reconciliation-day-' || lpad(d::text, 3, '0') || '.md',
  'reconciliation-sha-' || lpad(d::text, 3, '0'),
  'canon'
from generate_series(1, 36) as g(d);

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', '55555555-5555-5555-5555-555555555555', 1, 'offline-device-a', 'first_completion', 'evidence_pending', '{"protocol_completed":true}'::jsonb),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', '55555555-5555-5555-5555-555555555555', 1, 'offline-device-b-late', 'first_completion', 'evidence_pending', '{"protocol_completed":true}'::jsonb);

set local role authenticated;
set local request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';

select public.complete_codex_day(
  1::smallint,
  'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001'::uuid,
  'offline-a',
  now()
);

select ok(
  (public.complete_codex_day(
    1::smallint,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002'::uuid,
    'offline-b-late',
    now()
  ) ->> 'first_completion')::boolean = false
  and
  (select count(*) = 1 from public.day_completions
    where user_id = '55555555-5555-5555-5555-555555555555'::uuid and day = 1)
  and
  (select count(*) = 1 from public.xp_events
    where user_id = '55555555-5555-5555-5555-555555555555'::uuid and day = 1)
  and
  (select xp_total = 150 from public.user_progress
    where user_id = '55555555-5555-5555-5555-555555555555'::uuid),
  'OFF-002 late offline first-completion intent reconciles to existing server completion without duplicate XP'
);

reset role;
insert into public.user_progress(user_id)
values ('66666666-6666-6666-6666-666666666666');

insert into public.day_completions(user_id, day, completion_version)
select '66666666-6666-6666-6666-666666666666'::uuid, d, 'qa-34-of-35'
from generate_series(1, 34) as g(d);

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values (
  'ffffffff-ffff-ffff-ffff-ffffffff0036',
  '66666666-6666-6666-6666-666666666666',
  36,
  'portal-at-34-of-35',
  'first_completion',
  'evidence_pending',
  '{
    "portal_condition_completed":true,
    "base_condition_completed":true,
    "portal_base_comparison_completed":true,
    "return_confirmed":true,
    "review_001_035_completed":true,
    "consolidated_competencies_count":3,
    "fragile_competencies_count":3,
    "attribute_evidence_count":7,
    "premature_promotion_criterion_declared":true,
    "kether_synthesis_completed":true,
    "journal_update_confirmed":true,
    "safety_blocking_state":false
  }'::jsonb
);

set local role authenticated;
set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';

select throws_ok(
  $$select public.complete_codex_day(36::smallint, 'ffffffff-ffff-ffff-ffff-ffffffff0036'::uuid, 'portal-34', now())$$,
  'P0001',
  'kether_portal_locked',
  'P36-001 Portal valid exam cannot complete at 34/35'
);

select * from finish();
rollback;
