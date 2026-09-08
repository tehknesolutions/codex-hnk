begin;

select plan(10);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'atziluth-040-041@example.invalid', '', now(),
  '{}'::jsonb, '{}'::jsonb, now(), now()
);

insert into public.codex_days (
  day, chapter, sephira, world, level, xp, title, slug,
  source_path, source_sha, status
) values
  (39, 2, 'Chokmah', 'Atziluth', 2, 100, 'QA Day 039', 'qa-day-039', 'qa/chokmah/dia-039.md', repeat('39', 20), 'canon'),
  (40, 2, 'Chokmah', 'Atziluth', 2, 150, 'QA Day 040', 'qa-day-040', 'qa/chokmah/dia-040.md', repeat('40', 20), 'canon'),
  (41, 2, 'Chokmah', 'Atziluth', 2, 150, 'QA Day 041', 'qa-day-041', 'qa/chokmah/dia-041.md', repeat('41', 20), 'canon')
on conflict (day) do update set
  chapter = excluded.chapter,
  sephira = excluded.sephira,
  world = excluded.world,
  level = excluded.level,
  xp = excluded.xp,
  title = excluded.title,
  slug = excluded.slug,
  source_path = excluded.source_path,
  source_sha = excluded.source_sha,
  status = excluded.status;

insert into public.user_progress(
  user_id, xp_total, initiatory_grade, initiatory_title,
  current_day, current_chapter, current_sephira
) values (
  '44444444-4444-4444-4444-444444444444', 0, 2, 'Iniciado', 40, 2, 'Chokmah'
);

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values
  ('dddddddd-dddd-dddd-dddd-dddddddd0040', '44444444-4444-4444-4444-444444444444', 40, 'qa-day40-first', 'first_completion', 'evidence_pending', '{"protocol_completed":true,"return_confirmed":true}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddd0041', '44444444-4444-4444-4444-444444444444', 41, 'qa-day41-first', 'first_completion', 'evidence_pending', '{"protocol_completed":true,"return_confirmed":true}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddd1040', '44444444-4444-4444-4444-444444444444', 40, 'qa-day40-revisit', 'revisit', 'evidence_pending', '{"protocol_completed":true}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddd2040', '44444444-4444-4444-4444-444444444444', 40, 'qa-day40-control', 'control', 'active', '{}'::jsonb);

set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select throws_ok(
  $$select public.complete_codex_day(40::smallint, 'dddddddd-dddd-dddd-dddd-dddddddd0040'::uuid, null, now())$$,
  'P0001',
  'previous_day_required',
  'ATZ-040 first completion requires Day 039'
);

reset role;
insert into public.day_completions(user_id, day, completion_version)
values ('44444444-4444-4444-4444-444444444444', 39, 'qa-fixture');
set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select is(
  (public.complete_codex_day(40::smallint, 'dddddddd-dddd-dddd-dddd-dddddddd0040'::uuid, 'qa-40', now()) ->> 'xp_awarded')::integer,
  150,
  'ATZ-040 awards canonical +150 XP'
);

select is(
  (public.complete_codex_day(41::smallint, 'dddddddd-dddd-dddd-dddd-dddddddd0041'::uuid, 'qa-41', now()) ->> 'xp_awarded')::integer,
  150,
  'ATZ-041 awards canonical +150 XP after Day 040'
);

select is(
  (public.complete_codex_day(40::smallint, 'dddddddd-dddd-dddd-dddd-dddddddd1040'::uuid, 'qa-40-r', now()) ->> 'xp_awarded')::integer,
  0,
  'ATZ-040 revisit awards zero XP'
);

select is(
  (select xp_total from public.user_progress where user_id='44444444-4444-4444-4444-444444444444'),
  300,
  'ATZ progression totals 300 XP for 040+041 once'
);

select is(
  (select current_day from public.user_progress where user_id='44444444-4444-4444-4444-444444444444'),
  42::smallint,
  'ATZ progression advances current_day to 42'
);

select is(
  (select count(*) from public.day_completions where user_id='44444444-4444-4444-4444-444444444444' and day between 40 and 41),
  2::bigint,
  'ATZ creates one completion for each canonical Day'
);

select throws_ok(
  $$select public.complete_codex_day(42::smallint, 'dddddddd-dddd-dddd-dddd-dddddddd2040'::uuid, null, now())$$,
  'P0001',
  'canonical_day_not_found',
  'ATZ-042 stays unavailable before canonical sync'
);

select ok(
  not has_function_privilege('authenticated', 'hnk_private.sync_codex_successor_range(integer,integer,text)', 'EXECUTE'),
  'ATZ authenticated client cannot execute successor sync'
);

select ok(
  not has_function_privilege('authenticated', 'hnk_private.sync_atziluth_codex_range(integer,integer,text,text)', 'EXECUTE'),
  'ATZ authenticated client cannot execute generic source sync'
);

select * from finish();
rollback;
