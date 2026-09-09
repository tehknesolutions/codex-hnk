-- Day 006 smoke: +100 XP, +1 PER, Jeliel 1/5, Crown stays 1/7, replay/revisit idempotency.
-- All QA data is rolled back.
begin;
create temporary table qa6_ids(user_id uuid,session_id uuid,revisit_session_id uuid) on commit drop;
insert into qa6_ids values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid()); grant select on qa6_ids to authenticated;
insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) select user_id,'authenticated','authenticated','hnk-qa-d006-'||replace(user_id::text,'-','')||'@example.invalid',now(),now(),now() from qa6_ids;
insert into public.user_progress(user_id,xp_total,current_day) select user_id,550,6 from qa6_ids;
insert into public.attribute_state(user_id,dis,vnt) select user_id,6,6 from qa6_ids;
insert into public.day_completions(user_id,day,completion_version) select user_id,d,'qa-seed' from qa6_ids cross join generate_series(1,5) d;
insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select session_id,user_id,6,'qa:d006:first','first_completion','evidence_pending',now()-interval '25 minutes',now(),1200,'{"total_duration_seconds":1200,"sounds_noted_count":5,"thought_returns":8}'::jsonb,
jsonb_build_object('protocol_version','HNK-KETHER-D006-V1','source_sha','923c43ae0a68d63a4c88f67d83076b72e0b06c39','session_id',session_id::text,'mode','first_completion','jachin',jsonb_build_object('listening_completed',true,'duration_seconds',600,'sounds_noted_count',5,'return_confirmed',true),'boaz',jsonb_build_object('silence_practice_completed',true,'duration_seconds',600,'thought_returns',8,'difficulties_recorded_count',3,'return_confirmed',true),'middle',jsonb_build_object('voice_practice_completed',true,'voice_recorded',false,'return_confirmed',true),'soul_mirror',jsonb_build_object('completed',true,'difficulty_rating',4),'voluntary_completion_confirmed',true) from qa6_ids;
create temporary table qa6_results(label text primary key,payload jsonb) on commit drop; grant select,insert on qa6_results to authenticated;
select set_config('request.jwt.claim.sub',(select user_id::text from qa6_ids),true); set local role authenticated;
insert into qa6_results select 'first',public.complete_codex_day_v2(6::smallint,(select session_id from qa6_ids),'HNK-KETHER-D006-COMP-V1','HNK-KETHER-D006-V1','923c43ae0a68d63a4c88f67d83076b72e0b06c39','qa:d006:first:completion',null,now());
insert into qa6_results select 'replay',public.complete_codex_day_v2(6::smallint,(select session_id from qa6_ids),'HNK-KETHER-D006-COMP-V1','HNK-KETHER-D006-V1','923c43ae0a68d63a4c88f67d83076b72e0b06c39','qa:d006:first:completion',null,now()); reset role;
insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select revisit_session_id,user_id,6,'qa:d006:revisit','revisit','evidence_pending',now()-interval '12 minutes',now(),700,'{"total_duration_seconds":700}'::jsonb,
jsonb_build_object('protocol_version','HNK-KETHER-D006-V1','source_sha','923c43ae0a68d63a4c88f67d83076b72e0b06c39','session_id',revisit_session_id::text,'mode','revisit','jachin',jsonb_build_object('listening_completed',true,'duration_seconds',300,'sounds_noted_count',2,'return_confirmed',true),'boaz',jsonb_build_object('silence_practice_completed',true,'duration_seconds',300,'thought_returns',4,'difficulties_recorded_count',3,'return_confirmed',true),'middle',jsonb_build_object('voice_practice_completed',true,'voice_recorded',false,'return_confirmed',true),'soul_mirror',jsonb_build_object('completed',true),'voluntary_completion_confirmed',true) from qa6_ids;
select set_config('request.jwt.claim.sub',(select user_id::text from qa6_ids),true); set local role authenticated;
insert into qa6_results select 'revisit',public.complete_codex_day_v2(6::smallint,(select revisit_session_id from qa6_ids),'HNK-KETHER-D006-COMP-V1','HNK-KETHER-D006-V1','923c43ae0a68d63a4c88f67d83076b72e0b06c39','qa:d006:revisit:completion',null,now()); reset role;
do $$ declare u uuid:=(select user_id from qa6_ids); f jsonb:=(select payload from qa6_results where label='first'); r jsonb:=(select payload from qa6_results where label='replay'); rv jsonb:=(select payload from qa6_results where label='revisit'); x int;a int;p int;total int;c int;frag int;jeliel int; begin
 if (f->>'xp_awarded')::int<>100 or (f->>'first_completion')::boolean is not true then raise exception 'qa_day006_first_failed'; end if;
 if f->'progression_events' ? 'KETHER_FRAGMENT_LIT' then raise exception 'qa_day006_fragment_lit_too_early'; end if;
 if r<>f then raise exception 'qa_day006_replay_not_stable'; end if;
 if (rv->>'xp_awarded')::int<>0 or (rv->>'first_completion')::boolean is not false then raise exception 'qa_day006_revisit_failed'; end if;
 select count(*) into x from public.xp_events where user_id=u and day=6; select count(*) into a from public.attribute_events where user_id=u and day=6 and attribute_code='PER' and amount=1; select per into p from public.attribute_state where user_id=u; select xp_total into total from public.user_progress where user_id=u; select count(*) into c from public.day_completions where user_id=u and day=6; frag:=(f#>>'{crown,fragments_lit}')::int; select (elem->>'completed_days')::int into jeliel from jsonb_array_elements(f->'crown'->'cycles') elem where elem->>'angel'='Jeliel';
 if x<>1 or a<>1 or p<>6 or total<>650 or c<>1 or frag<>1 or jeliel<>1 then raise exception 'qa_day006_state_failed'; end if;
end $$;
select 'PASS' result,(select payload->>'xp_awarded' from qa6_results where label='first')::int day6_xp,(select per from public.attribute_state where user_id=(select user_id from qa6_ids)) per_after,(select xp_total from public.user_progress where user_id=(select user_id from qa6_ids)) xp_total_after,(select payload->'progression_events' from qa6_results where label='first') progression_events,(select payload->'crown' from qa6_results where label='first') crown;
rollback;
