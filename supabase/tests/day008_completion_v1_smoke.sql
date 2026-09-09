-- Day 008 smoke: +150 XP, zero attribute gain, countdown need not reach 1, replay/revisit idempotency.
-- All QA data is rolled back.
begin;
create temporary table qa8_ids(user_id uuid,session_id uuid,revisit_session_id uuid) on commit drop;
insert into qa8_ids values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid());grant select on qa8_ids to authenticated;
insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) select user_id,'authenticated','authenticated','hnk-qa-d008-'||replace(user_id::text,'-','')||'@example.invalid',now(),now(),now() from qa8_ids;
insert into public.user_progress(user_id,xp_total,current_day) select user_id,800,8 from qa8_ids;
insert into public.day_completions(user_id,day,completion_version) select user_id,d,'qa-seed' from qa8_ids cross join generate_series(1,7)d;
insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select session_id,user_id,8,'qa:d008:first','first_completion','evidence_pending',now()-interval '15 minutes',now(),900,'{"total_duration_seconds":900,"attention_returns":2,"distractions_noted_count":3}'::jsonb,
jsonb_build_object('protocol_version','HNK-KETHER-D008-V1','source_sha','df7c39ced019ead6eb0be817a1ac638789d40c3c','session_id',session_id::text,'mode','first_completion','jachin',jsonb_build_object('body_relaxation_completed',true,'countdown_completed',true,'final_number',97,'attention_returns',2,'return_confirmed',true),'boaz',jsonb_build_object('countdown_completed',true,'final_number',88,'distractions_noted_count',3,'adjustment_recorded',true,'return_confirmed',true),'middle',jsonb_build_object('sequence_completed',true,'final_number',74,'silent_observation_seconds',60,'return_confirmed',true),'soul_mirror',jsonb_build_object('completed',true,'relaxation_rating',6,'attention_stability_rating',5,'forcing_rating',2),'voluntary_completion_confirmed',true) from qa8_ids;
create temporary table qa8_results(label text primary key,payload jsonb) on commit drop;grant select,insert on qa8_results to authenticated;
select set_config('request.jwt.claim.sub',(select user_id::text from qa8_ids),true);set local role authenticated;
insert into qa8_results select 'first',public.complete_codex_day_v2(8::smallint,(select session_id from qa8_ids),'HNK-KETHER-D008-COMP-V1','HNK-KETHER-D008-V1','df7c39ced019ead6eb0be817a1ac638789d40c3c','qa:d008:first:completion',null,now());
insert into qa8_results select 'replay',public.complete_codex_day_v2(8::smallint,(select session_id from qa8_ids),'HNK-KETHER-D008-COMP-V1','HNK-KETHER-D008-V1','df7c39ced019ead6eb0be817a1ac638789d40c3c','qa:d008:first:completion',null,now());reset role;
insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select revisit_session_id,user_id,8,'qa:d008:revisit','revisit','evidence_pending',now()-interval '12 minutes',now(),720,'{"total_duration_seconds":720,"attention_returns":1,"distractions_noted_count":1}'::jsonb,
jsonb_build_object('protocol_version','HNK-KETHER-D008-V1','source_sha','df7c39ced019ead6eb0be817a1ac638789d40c3c','session_id',revisit_session_id::text,'mode','revisit','jachin',jsonb_build_object('body_relaxation_completed',true,'countdown_completed',true,'final_number',90,'attention_returns',1,'return_confirmed',true),'boaz',jsonb_build_object('countdown_completed',true,'final_number',82,'distractions_noted_count',1,'adjustment_recorded',true,'return_confirmed',true),'middle',jsonb_build_object('sequence_completed',true,'final_number',65,'silent_observation_seconds',60,'return_confirmed',true),'soul_mirror',jsonb_build_object('completed',true,'relaxation_rating',7,'attention_stability_rating',6,'forcing_rating',1),'voluntary_completion_confirmed',true) from qa8_ids;
select set_config('request.jwt.claim.sub',(select user_id::text from qa8_ids),true);set local role authenticated;
insert into qa8_results select 'revisit',public.complete_codex_day_v2(8::smallint,(select revisit_session_id from qa8_ids),'HNK-KETHER-D008-COMP-V1','HNK-KETHER-D008-V1','df7c39ced019ead6eb0be817a1ac638789d40c3c','qa:d008:revisit:completion',null,now());reset role;
do $$ declare u uuid:=(select user_id from qa8_ids);f jsonb:=(select payload from qa8_results where label='first');r jsonb:=(select payload from qa8_results where label='replay');rv jsonb:=(select payload from qa8_results where label='revisit');x int;a int;total int;c int;begin
 if (f->>'xp_awarded')::int<>150 or (f->>'first_completion')::boolean is not true then raise exception 'qa_day008_first_failed';end if;
 if f->'progression_events' ? 'KETHER_FRAGMENT_LIT' then raise exception 'qa_day008_fragment_lit_prematurely';end if;
 if r<>f then raise exception 'qa_day008_replay_not_stable';end if;
 if (rv->>'xp_awarded')::int<>0 or (rv->>'first_completion')::boolean is not false then raise exception 'qa_day008_revisit_failed';end if;
 select count(*) into x from public.xp_events where user_id=u and day=8;select count(*) into a from public.attribute_events where user_id=u and day=8;select xp_total into total from public.user_progress where user_id=u;select count(*) into c from public.day_completions where user_id=u and day=8;
 if x<>1 or a<>0 or total<>950 or c<>1 then raise exception 'qa_day008_state_failed';end if;
end $$;
select 'PASS' result,(select payload->>'xp_awarded' from qa8_results where label='first')::int day8_xp,(select xp_total from public.user_progress where user_id=(select user_id from qa8_ids)) xp_total_after,(select count(*) from public.attribute_events where user_id=(select user_id from qa8_ids) and day=8) day8_attribute_events,(select payload->'progression_events' from qa8_results where label='first') progression_events,(select payload->'crown' from qa8_results where label='first') crown;
rollback;
