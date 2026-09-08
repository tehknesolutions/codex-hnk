begin;

select plan(13);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('44444444-4444-4444-4444-444444444444','00000000-0000-0000-0000-000000000000','authenticated','authenticated','atz-040-041-a@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now()),
  ('55555555-5555-5555-5555-555555555555','00000000-0000-0000-0000-000000000000','authenticated','authenticated','atz-040-041-b@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

insert into public.codex_days (
  day, chapter, sephira, world, level, xp, title, slug,
  source_path, source_sha, status
) values
  (39,2,'Chokmah','Atziluth',2,100,'QA Day 039','qa-day-039','qa/chokmah/dia-039.md',repeat('39',20),'canon'),
  (40,2,'Chokmah','Atziluth',2,150,'QA Day 040','qa-day-040','content/canon/atziluth/chokmah/dia-040.md','7a26302a35aa87b309e94abf516834019df29737','canon'),
  (41,2,'Chokmah','Atziluth',2,150,'QA Day 041','qa-day-041','content/canon/atziluth/chokmah/dia-041.md','f163bc7437efb0dfa70cdc5171e9a2e6acd7fdad','canon')
on conflict (day) do update set
  chapter=excluded.chapter,sephira=excluded.sephira,world=excluded.world,level=excluded.level,
  xp=excluded.xp,title=excluded.title,slug=excluded.slug,source_path=excluded.source_path,
  source_sha=excluded.source_sha,status=excluded.status;

insert into public.user_progress(user_id,xp_total,initiatory_grade,initiatory_title,current_day,current_chapter,current_sephira)
values
('44444444-4444-4444-4444-444444444444',0,2,'Iniciado',40,2,'Chokmah'),
('55555555-5555-5555-5555-555555555555',0,2,'Iniciado',40,2,'Chokmah');

insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,evidence) values
('dddddddd-dddd-dddd-dddd-dddddddd0040','44444444-4444-4444-4444-444444444444',40,'qa40','canonical','active','{}'::jsonb),
('dddddddd-dddd-dddd-dddd-dddddddd0041','44444444-4444-4444-4444-444444444444',41,'qa41','canonical','active','{}'::jsonb),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0040','55555555-5555-5555-5555-555555555555',40,'qa40-fake-revisit','revisit','active','{}'::jsonb);

select throws_ok(
  $$update public.practice_sessions set evidence='{"protocol_completed":true}'::jsonb,state='evidence_pending' where id='dddddddd-dddd-dddd-dddd-dddddddd0040'::uuid$$,
  'P0001','day040_required_flag_missing','ATZ-040 missing required evidence fails closed'
);

select throws_ok(
  $$update public.practice_sessions set evidence='{"protocol_completed":true,"return_confirmed":true,"verbal_condition_completed":true,"silent_condition_completed":true,"comparison_completed":true,"autonomy_preserved":true,"verbal_seconds":360,"silent_seconds":360,"truisms_logged":3,"suggestions_logged":1,"private_note":"forbidden"}'::jsonb,state='evidence_pending' where id='dddddddd-dddd-dddd-dddd-dddddddd0040'::uuid$$,
  'P0001','day040_evidence_unknown_field','ATZ-040 rejects private/free-form operational evidence'
);

select throws_ok(
  $$update public.practice_sessions set evidence='{"protocol_completed":true}'::jsonb,state='evidence_pending' where id='eeeeeeee-eeee-eeee-eeee-eeeeeeee0040'::uuid$$,
  'P0001','day040_required_flag_missing','ATZ fake revisit cannot bypass first-completion evidence'
);

update public.practice_sessions
set evidence='{"protocol_completed":true,"return_confirmed":true,"verbal_condition_completed":true,"silent_condition_completed":true,"comparison_completed":true,"autonomy_preserved":true,"verbal_seconds":360,"silent_seconds":360,"truisms_logged":3,"suggestions_logged":1}'::jsonb,
    state='evidence_pending'
where id='dddddddd-dddd-dddd-dddd-dddddddd0040'::uuid;

select is((select state from public.practice_sessions where id='dddddddd-dddd-dddd-dddd-dddddddd0040'::uuid),'evidence_pending'::text,'ATZ-040 valid scalar evidence is accepted');

insert into public.day_completions(user_id,day,completion_version)
values('44444444-4444-4444-4444-444444444444',39,'qa-fixture');

set local role authenticated;
set local request.jwt.claim.sub='44444444-4444-4444-4444-444444444444';
select is((public.complete_codex_day(40::smallint,'dddddddd-dddd-dddd-dddd-dddddddd0040'::uuid,'qa40',now())->>'xp_awarded')::integer,150,'ATZ-040 awards canonical +150 XP');
reset role;

select throws_ok(
  $$update public.practice_sessions set evidence='{"protocol_completed":true,"return_confirmed":true,"question_defined":true,"active_reception_completed":true,"open_reception_completed":true,"interpretation_delayed":true,"alternative_recorded":true,"verification_defined":true,"active_reception_seconds":420,"open_reception_seconds":420,"active_content_present":"no","open_content_present":false}'::jsonb,state='evidence_pending' where id='dddddddd-dddd-dddd-dddd-dddddddd0041'::uuid$$,
  'P0001','day041_content_presence_flag_invalid','ATZ-041 content-presence fields are boolean only'
);

update public.practice_sessions
set evidence='{"protocol_completed":true,"return_confirmed":true,"question_defined":true,"active_reception_completed":true,"open_reception_completed":true,"interpretation_delayed":true,"alternative_recorded":true,"verification_defined":true,"active_reception_seconds":420,"open_reception_seconds":420,"active_content_present":false,"open_content_present":false}'::jsonb,
    state='evidence_pending'
where id='dddddddd-dddd-dddd-dddd-dddddddd0041'::uuid;

select is((select state from public.practice_sessions where id='dddddddd-dddd-dddd-dddd-dddddddd0041'::uuid),'evidence_pending'::text,'ATZ-041 accepts explicit no-response/silence');

set local role authenticated;
set local request.jwt.claim.sub='44444444-4444-4444-4444-444444444444';
select is((public.complete_codex_day(41::smallint,'dddddddd-dddd-dddd-dddd-dddddddd0041'::uuid,'qa41',now())->>'xp_awarded')::integer,150,'ATZ-041 awards canonical +150 XP');
select is((select xp_total from public.user_progress where user_id='44444444-4444-4444-4444-444444444444'),300,'ATZ 040+041 award exactly 300 XP');
select is((select current_day from public.user_progress where user_id='44444444-4444-4444-4444-444444444444'),42::smallint,'ATZ progression advances to Day 042');
reset role;

select ok(not has_function_privilege('authenticated','hnk_private.validate_day040_scalar_evidence_v1(jsonb)','EXECUTE'),'ATZ client cannot execute Day040 private validator');
select ok(not has_function_privilege('authenticated','hnk_private.validate_day041_scalar_evidence_v1(jsonb)','EXECUTE'),'ATZ client cannot execute Day041 private validator');
select ok(not has_function_privilege('authenticated','hnk_private.sync_codex_successor_range(integer,integer,text)','EXECUTE'),'ATZ client cannot execute successor sync');

select * from finish();
rollback;
