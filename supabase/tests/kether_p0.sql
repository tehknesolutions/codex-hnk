begin;

select plan(27);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kether-a@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kether-b@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kether-portal@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

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
  'Kether Test Day ' || lpad(d::text, 3, '0'),
  'kether-test-day-' || lpad(d::text, 3, '0'),
  'canon/test/day-' || lpad(d::text, 3, '0') || '.md',
  repeat(lpad(d::text, 2, '0'), 20),
  'canon'
from generate_series(1, 36) as g(d);

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '11111111-1111-1111-1111-111111111111', 1, 'a-day1-first', 'first_completion', 'evidence_pending', '{"protocol_completed":true,"return_confirmed":true}'::jsonb),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', '11111111-1111-1111-1111-111111111111', 1, 'a-day1-revisit', 'revisit', 'evidence_pending', '{"protocol_completed":true,"return_confirmed":true}'::jsonb);

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', '22222222-2222-2222-2222-222222222222', 2, 'b-day2-no-day1', 'first_completion', 'evidence_pending', '{"protocol_completed":true}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', '22222222-2222-2222-2222-222222222222', 1, 'b-day1-active', 'first_completion', 'active', '{}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', '22222222-2222-2222-2222-222222222222', 1, 'b-day1-empty-evidence', 'first_completion', 'evidence_pending', '{}'::jsonb);

insert into public.user_progress(user_id)
values ('33333333-3333-3333-3333-333333333333');

insert into public.day_completions(user_id, day, completion_version)
select '33333333-3333-3333-3333-333333333333', d, 'qa-fixture'
from generate_series(1, 34) as g(d);

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values
  (
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    '33333333-3333-3333-3333-333333333333',
    36,
    'portal-incomplete',
    'first_completion',
    'evidence_pending',
    '{"protocol_completed":true}'::jsonb
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccc0002',
    '33333333-3333-3333-3333-333333333333',
    36,
    'portal-complete',
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
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select is(
  (select count(*) from public.practice_sessions),
  2::bigint,
  'PRC-001 authenticated user reads only own Practice Sessions'
);

update public.practice_sessions
set state = 'complete'
where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002';
reset role;
select is(
  (select state from public.practice_sessions where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002'),
  'evidence_pending'::text,
  'PRC-002 RLS prevents modifying another user Practice Session'
);

select ok(
  not has_table_privilege('authenticated', 'public.xp_events', 'INSERT'),
  'XP-001 authenticated client has no INSERT privilege on xp_events'
);
select ok(
  not has_table_privilege('authenticated', 'public.day_completions', 'INSERT'),
  'XP-002 authenticated client has no INSERT privilege on day_completions'
);
select ok(
  not has_table_privilege('authenticated', 'public.user_progress', 'UPDATE'),
  'XP-003 authenticated client has no UPDATE privilege on canonical progress'
);

set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select throws_ok(
  $$select public.complete_codex_day(2::smallint, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002'::uuid, null, now())$$,
  'P0001',
  'previous_day_required',
  'DAY-002 first completion requires previous Day'
);
select throws_ok(
  $$select public.complete_codex_day(1::smallint, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001'::uuid, null, now())$$,
  'P0001',
  'practice_session_not_ready',
  'DAY-005 ACTIVE session cannot seal as first completion'
);
select throws_ok(
  $$select public.complete_codex_day(1::smallint, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003'::uuid, null, now())$$,
  'P0001',
  'evidence_required',
  'DAY-005 first completion rejects empty evidence'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select is(
  (public.complete_codex_day(1::smallint, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'::uuid, 'hash-a1', now()) ->> 'first_completion')::boolean,
  true,
  'DAY-006 valid evidence-pending session seals first completion'
);
select is(
  (select count(*) from public.day_completions where user_id = '11111111-1111-1111-1111-111111111111' and day = 1),
  1::bigint,
  'DAY-006 first completion creates exactly one canonical completion'
);
select is(
  (select amount from public.xp_events where user_id = '11111111-1111-1111-1111-111111111111' and day = 1),
  150,
  'XP-004 Day 001 awards canonical XP from codex_days'
);
select is(
  (select xp_total from public.user_progress where user_id = '11111111-1111-1111-1111-111111111111'),
  150,
  'XP-004 xp_total reflects the awarded canonical XP once'
);
select is(
  (public.complete_codex_day(1::smallint, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002'::uuid, 'hash-a1-r', now()) ->> 'xp_awarded')::integer,
  0,
  'XP-006 revisit awards zero canonical XP'
);
select is(
  (select count(*) from public.day_completions where user_id = '11111111-1111-1111-1111-111111111111' and day = 1),
  1::bigint,
  'DAY-008 revisit does not create a second Day Completion'
);

set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select is(
  (public.get_kether_crown_state() ->> 'fragments_lit')::integer,
  6,
  'CRW-001 Crown fragments are derived from completed Days'
);
select is(
  (public.get_kether_crown_state() ->> 'portal_unlocked')::boolean,
  false,
  'CRW-009 Portal remains locked at 34/35'
);

reset role;
insert into public.day_completions(user_id, day, completion_version)
values ('33333333-3333-3333-3333-333333333333', 35, 'qa-fixture');
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select is(
  (public.get_kether_crown_state() ->> 'portal_unlocked')::boolean,
  true,
  'CRW-010 Portal unlocks at 35/35'
);
select is(
  (select initiatory_grade from public.user_progress where user_id = '33333333-3333-3333-3333-333333333333'),
  1::smallint,
  'P36-002 Coroa 7/7 does not itself promote Neófito'
);

select throws_ok(
  $$select public.complete_codex_day(36::smallint, 'cccccccc-cccc-cccc-cccc-cccccccc0001'::uuid, 'bad-portal', now())$$,
  'P0001',
  'kether_portal_evidence_incomplete',
  'P36-012 structurally incomplete Portal evidence is rejected'
);
select is(
  (select count(*) from public.day_completions where user_id = '33333333-3333-3333-3333-333333333333' and day = 36),
  0::bigint,
  'P36-012 rejected Portal leaves no Day 036 completion side effect'
);
select throws_ok(
  $$select public.complete_codex_day(36::smallint, 'cccccccc-cccc-cccc-cccc-cccccccc0002'::uuid, 'portal-no-vault', now())$$,
  'P0001',
  'kether_portal_journal_required',
  'P36-012 structurally valid Portal still requires encrypted Day 036 Vault update'
);

insert into public.journal_vault(user_id, day, ciphertext, nonce, aad)
values (
  '33333333-3333-3333-3333-333333333333',
  36,
  'ciphertext-test-only',
  'nonce-test-only',
  'kether-portal-036'
);

select is(
  (public.complete_codex_day(36::smallint, 'cccccccc-cccc-cccc-cccc-cccccccc0002'::uuid, 'portal-valid', now()) ->> 'xp_awarded')::integer,
  500,
  'P36-013 valid Day 036 awards exactly +500 XP'
);
select ok(
  (select initiatory_grade = 2 and initiatory_title = 'Iniciado'
   from public.user_progress
   where user_id = '33333333-3333-3333-3333-333333333333'),
  'P36-014 grade/title promotion is atomic with valid Portal completion'
);
select ok(
  (select current_day = 37 and current_chapter = 2 and current_sephira = 'Chokmah'
   from public.user_progress
   where user_id = '33333333-3333-3333-3333-333333333333'),
  'P36-018 Chokmah unlocks at Day 37 state without auto-completing Day 037'
);
select is(
  (public.complete_codex_day(36::smallint, 'cccccccc-cccc-cccc-cccc-cccccccc0002'::uuid, 'portal-valid-retry', now()) ->> 'xp_awarded')::integer,
  0,
  'P36-015 repeated Portal completion awards zero duplicate XP'
);
select is(
  (select count(*) from public.day_completions where user_id = '33333333-3333-3333-3333-333333333333' and day = 36),
  1::bigint,
  'P36-015 repeated Portal call keeps one Day 036 completion'
);
select is(
  (select count(*) from public.xp_events where user_id = '33333333-3333-3333-3333-333333333333' and day = 36 and source = 'canonical_day_completion'),
  1::bigint,
  'P36-015 repeated Portal call keeps one XP event'
);

select * from finish();
rollback;
