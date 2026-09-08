-- HNK Day 004 Completion V1 smoke test.
-- Validates +100 XP first completion, replay idempotency, revisit=0 XP,
-- and zero attribute gain. Days 001-003 are seeded because each has its own smoke.
-- All data is rolled back.

begin;

create temporary table qa4_ids(user_id uuid not null,session_id uuid not null,revisit_session_id uuid not null) on commit drop;
insert into qa4_ids values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select on qa4_ids to authenticated;

insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at)
select user_id,'authenticated','authenticated','hnk-qa-d004-'||replace(user_id::text,'-','')||'@example.invalid',now(),now(),now() from qa4_ids;
insert into public.user_progress(user_id,xp_total,current_day) select user_id,350,4 from qa4_ids;
insert into public.attribute_state(user_id) select user_id from qa4_ids;
insert into public.day_completions(user_id,day,completion_version)
select user_id,1,'qa-seed' from qa4_ids
union all select user_id,2,'qa-seed' from qa4_ids
union all select user_id,3,'qa-seed' from qa4_ids;

insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select session_id,user_id,4,'qa:d004:first','first_completion','evidence_pending',now()-interval '20 minutes',now(),1200,
jsonb_build_object('total_duration_seconds',1200,'pattern_notices',3),
jsonb_build_object(
 'protocol_version','HNK-KETHER-D004-V1','source_sha','376964a263f3d4f07542fcf55ca3bf2c18c5fd94','session_id',session_id::text,'mode','first_completion',
 'experiment',jsonb_build_object('expectation_before',5,'body_state_before',5,'observation_recorded',true,'perceived_change_after',5),
 'jachin',jsonb_build_object('visualization_completed',true,'duration_seconds',600,'return_confirmed',true),
 'audio_theta432',jsonb_build_object('started',true,'profile_id','HNK-THETA432-BINAURAL-V1','duration_seconds',60),
 'boaz',jsonb_build_object('monitor_completed',true,'duration_seconds',600,'pattern_notices',3,'trigger_recorded',true,'return_confirmed',true),
 'middle',jsonb_build_object('swish_completed',true,'target_state_before',5,'perceived_change_after',5,'observation_recorded',true,'return_confirmed',true),
 'phenomenology',jsonb_build_array('NO_NOTICEABLE_CHANGE'),
 'soul_mirror',jsonb_build_object('completed',true,'difficulty_rating',4),
 'voluntary_completion_confirmed',true,'safety_stop_occurred',false
) from qa4_ids;

create temporary table qa4_results(label text primary key,payload jsonb) on commit drop;
grant select,insert on qa4_results to authenticated;
select set_config('request.jwt.claim.sub',(select user_id::text from qa4_ids),true);
set local role authenticated;
insert into qa4_results select 'first',public.complete_codex_day_v2(4::smallint,(select session_id from qa4_ids),'HNK-KETHER-D004-COMP-V1','HNK-KETHER-D004-V1','376964a263f3d4f07542fcf55ca3bf2c18c5fd94','qa:d004:first:completion',null,now());
insert into qa4_results select 'replay',public.complete_codex_day_v2(4::smallint,(select session_id from qa4_ids),'HNK-KETHER-D004-COMP-V1','HNK-KETHER-D004-V1','376964a263f3d4f07542fcf55ca3bf2c18c5fd94','qa:d004:first:completion',null,now());
reset role;

insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select revisit_session_id,user_id,4,'qa:d004:revisit','revisit','evidence_pending',now()-interval '20 minutes',now(),1200,
jsonb_build_object('total_duration_seconds',1200,'pattern_notices',1),
jsonb_build_object(
 'protocol_version','HNK-KETHER-D004-V1','source_sha','376964a263f3d4f07542fcf55ca3bf2c18c5fd94','session_id',revisit_session_id::text,'mode','revisit',
 'experiment',jsonb_build_object('expectation_before',5,'body_state_before',5,'observation_recorded',true,'perceived_change_after',5),
 'jachin',jsonb_build_object('visualization_completed',true,'duration_seconds',600,'return_confirmed',true),
 'audio_theta432',jsonb_build_object('started',true,'profile_id','HNK-THETA432-BINAURAL-V1'),
 'boaz',jsonb_build_object('monitor_completed',true,'duration_seconds',600,'pattern_notices',1,'trigger_recorded',true,'return_confirmed',true),
 'middle',jsonb_build_object('swish_completed',true,'target_state_before',5,'perceived_change_after',5,'observation_recorded',true,'return_confirmed',true),
 'soul_mirror',jsonb_build_object('completed',true),
 'voluntary_completion_confirmed',true,'safety_stop_occurred',false
) from qa4_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa4_ids),true);
set local role authenticated;
insert into qa4_results select 'revisit',public.complete_codex_day_v2(4::smallint,(select revisit_session_id from qa4_ids),'HNK-KETHER-D004-COMP-V1','HNK-KETHER-D004-V1','376964a263f3d4f07542fcf55ca3bf2c18c5fd94','qa:d004:revisit:completion',null,now());
reset role;

do $$
declare
 v_user uuid:=(select user_id from qa4_ids);
 v_first jsonb:=(select payload from qa4_results where label='first');
 v_replay jsonb:=(select payload from qa4_results where label='replay');
 v_revisit jsonb:=(select payload from qa4_results where label='revisit');
 v_xp_count int; v_xp_sum int; v_attr_count int; v_total int; v_completion_count int;
begin
 if (v_first->>'xp_awarded')::int<>100 or (v_first->>'first_completion')::boolean is not true then raise exception 'qa_day004_first_completion_failed'; end if;
 if v_replay<>v_first then raise exception 'qa_day004_replay_not_stable'; end if;
 if (v_revisit->>'xp_awarded')::int<>0 or (v_revisit->>'first_completion')::boolean is not false then raise exception 'qa_day004_revisit_reward_failed'; end if;
 select count(*),coalesce(sum(amount),0) into v_xp_count,v_xp_sum from public.xp_events where user_id=v_user and day=4;
 select count(*) into v_attr_count from public.attribute_events where user_id=v_user and day=4;
 select xp_total into v_total from public.user_progress where user_id=v_user;
 select count(*) into v_completion_count from public.day_completions where user_id=v_user and day=4;
 if v_xp_count<>1 or v_xp_sum<>100 then raise exception 'qa_day004_xp_idempotency_failed'; end if;
 if v_attr_count<>0 then raise exception 'qa_day004_attribute_gain_must_be_zero'; end if;
 if v_total<>450 then raise exception 'qa_day004_total_xp_expected_450'; end if;
 if v_completion_count<>1 then raise exception 'qa_day004_completion_idempotency_failed'; end if;
end $$;

select 'PASS' as result,
 (select payload->>'xp_awarded' from qa4_results where label='first')::int as day4_xp,
 (select payload->>'xp_awarded' from qa4_results where label='revisit')::int as revisit_xp,
 (select count(*) from public.xp_events where user_id=(select user_id from qa4_ids) and day=4) as day4_xp_events,
 (select count(*) from public.attribute_events where user_id=(select user_id from qa4_ids) and day=4) as day4_attribute_events,
 (select xp_total from public.user_progress where user_id=(select user_id from qa4_ids)) as xp_total_after;

rollback;
