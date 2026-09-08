-- Day 005 cycle-seal smoke: +100 XP, +1 VNT, Fragment I, replay/revisit idempotency.
-- All data is rolled back.
begin;
create temporary table qa5_ids(user_id uuid,session_id uuid,revisit_session_id uuid) on commit drop;
insert into qa5_ids values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select on qa5_ids to authenticated;
insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at)
select user_id,'authenticated','authenticated','hnk-qa-d005-'||replace(user_id::text,'-','')||'@example.invalid',now(),now(),now() from qa5_ids;
insert into public.user_progress(user_id,xp_total,current_day) select user_id,450,5 from qa5_ids;
insert into public.attribute_state(user_id,dis) select user_id,6 from qa5_ids;
insert into public.day_completions(user_id,day,completion_version) select user_id,d,'qa-seed' from qa5_ids cross join generate_series(1,4) d;
insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select session_id,user_id,5,'qa:d005:first','first_completion','evidence_pending',now()-interval '20 minutes',now(),1200,'{"total_duration_seconds":1200}'::jsonb,
jsonb_build_object('protocol_version','HNK-KETHER-D005-V1','source_sha','eb9f078bdc7654135f83fbcdf0aa7d5d38412cff','session_id',session_id::text,'mode','first_completion','baseline',jsonb_build_object('tension_before',6,'tension_after',4),'jachin',jsonb_build_object('breath_completed',true,'duration_seconds',600,'natural_breathing_confirmed',true,'return_confirmed',true),'audio_theta432',jsonb_build_object('started',true,'profile_id','HNK-THETA432-BINAURAL-V1'),'boaz',jsonb_build_object('gesture_completed',true,'empty_hand_confirmed',true,'forced_exhalation_avoided',true,'journal_entry_recorded',true,'return_confirmed',true),'middle',jsonb_build_object('dai_koo_myo_focus_completed',true,'duration_seconds',300,'asset_id','HNK-KETHER-DAI-KOO-MYO-USUI-MASTER-V1','return_confirmed',true),'soul_mirror',jsonb_build_object('completed',true,'difficulty_rating',3),'voluntary_completion_confirmed',true) from qa5_ids;
create temporary table qa5_results(label text primary key,payload jsonb) on commit drop; grant select,insert on qa5_results to authenticated;
select set_config('request.jwt.claim.sub',(select user_id::text from qa5_ids),true); set local role authenticated;
insert into qa5_results select 'first',public.complete_codex_day_v2(5::smallint,(select session_id from qa5_ids),'HNK-KETHER-D005-COMP-V1','HNK-KETHER-D005-V1','eb9f078bdc7654135f83fbcdf0aa7d5d38412cff','qa:d005:first:completion',null,now());
insert into qa5_results select 'replay',public.complete_codex_day_v2(5::smallint,(select session_id from qa5_ids),'HNK-KETHER-D005-COMP-V1','HNK-KETHER-D005-V1','eb9f078bdc7654135f83fbcdf0aa7d5d38412cff','qa:d005:first:completion',null,now()); reset role;
insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select revisit_session_id,user_id,5,'qa:d005:revisit','revisit','evidence_pending',now()-interval '10 minutes',now(),900,'{"total_duration_seconds":900}'::jsonb,
jsonb_build_object('protocol_version','HNK-KETHER-D005-V1','source_sha','eb9f078bdc7654135f83fbcdf0aa7d5d38412cff','session_id',revisit_session_id::text,'mode','revisit','baseline',jsonb_build_object('tension_before',5,'tension_after',5),'jachin',jsonb_build_object('breath_completed',true,'duration_seconds',300,'natural_breathing_confirmed',true,'return_confirmed',true),'audio_theta432',jsonb_build_object('started',true,'profile_id','HNK-THETA432-BINAURAL-V1'),'boaz',jsonb_build_object('gesture_completed',true,'empty_hand_confirmed',true,'forced_exhalation_avoided',true,'journal_entry_recorded',true,'return_confirmed',true),'middle',jsonb_build_object('dai_koo_myo_focus_completed',true,'duration_seconds',300,'asset_id','HNK-KETHER-DAI-KOO-MYO-USUI-MASTER-V1','return_confirmed',true),'soul_mirror',jsonb_build_object('completed',true),'voluntary_completion_confirmed',true) from qa5_ids;
select set_config('request.jwt.claim.sub',(select user_id::text from qa5_ids),true); set local role authenticated;
insert into qa5_results select 'revisit',public.complete_codex_day_v2(5::smallint,(select revisit_session_id from qa5_ids),'HNK-KETHER-D005-COMP-V1','HNK-KETHER-D005-V1','eb9f078bdc7654135f83fbcdf0aa7d5d38412cff','qa:d005:revisit:completion',null,now()); reset role;
do $$ declare u uuid:=(select user_id from qa5_ids); f jsonb:=(select payload from qa5_results where label='first'); r jsonb:=(select payload from qa5_results where label='replay'); rv jsonb:=(select payload from qa5_results where label='revisit'); x int; a int; v int; total int; c int; begin
  if (f->>'xp_awarded')::int<>100 or (f->>'first_completion')::boolean is not true then raise exception 'qa_day005_first_failed'; end if;
  if not (f->'progression_events' ? 'KETHER_FRAGMENT_LIT') then raise exception 'qa_day005_fragment_event_missing'; end if;
  if r<>f then raise exception 'qa_day005_replay_not_stable'; end if;
  if (rv->>'xp_awarded')::int<>0 or (rv->>'first_completion')::boolean is not false then raise exception 'qa_day005_revisit_failed'; end if;
  select count(*) into x from public.xp_events where user_id=u and day=5;
  select count(*) into a from public.attribute_events where user_id=u and day=5 and attribute_code='VNT' and amount=1;
  select vnt into v from public.attribute_state where user_id=u;
  select xp_total into total from public.user_progress where user_id=u;
  select count(*) into c from public.day_completions where user_id=u and day=5;
  if x<>1 or a<>1 or v<>6 or total<>550 or c<>1 then raise exception 'qa_day005_state_failed'; end if;
end $$;
select 'PASS' result,(select payload->>'xp_awarded' from qa5_results where label='first')::int day5_xp,(select vnt from public.attribute_state where user_id=(select user_id from qa5_ids)) vnt_after,(select xp_total from public.user_progress where user_id=(select user_id from qa5_ids)) xp_total_after,(select payload->'progression_events' from qa5_results where label='first') progression_events,(select payload->'crown' from qa5_results where label='first') crown;
rollback;
