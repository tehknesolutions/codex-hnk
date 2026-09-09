-- Day 007 smoke: +150 XP, +1 HIP, catalepsy not required, replay/revisit idempotency.
-- All QA data is rolled back.
begin;

create temporary table qa7_ids(user_id uuid, session_id uuid, revisit_session_id uuid) on commit drop;
insert into qa7_ids values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select on qa7_ids to authenticated;

insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at)
select user_id,'authenticated','authenticated','hnk-qa-d007-'||replace(user_id::text,'-','')||'@example.invalid',now(),now(),now() from qa7_ids;

insert into public.user_progress(user_id,xp_total,current_day) select user_id,650,7 from qa7_ids;
insert into public.attribute_state(user_id,hip) select user_id,5 from qa7_ids;
insert into public.day_completions(user_id,day,completion_version)
select user_id,d,'qa-seed' from qa7_ids cross join generate_series(1,6) d;

insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select session_id,user_id,7,'qa:d007:first','first_completion','evidence_pending',now()-interval '15 minutes',now(),900,
'{"total_duration_seconds":900,"second_attempt_performed":false}'::jsonb,
jsonb_build_object(
  'protocol_version','HNK-KETHER-D007-V1',
  'source_sha','bc12709d5a346870405cf41e62f99ac28d70186d',
  'session_id',session_id::text,
  'mode','first_completion',
  'jachin',jsonb_build_object(
    'relaxation_completed',true,
    'relaxation_rating',6,
    'test_performed',true,
    'catalepsy_reported',false,
    'release_confirmed',true,
    'return_confirmed',true
  ),
  'boaz',jsonb_build_object(
    'comparison_completed',true,
    'spontaneous_sensation_rating',4,
    'muscular_effort_rating',2,
    'second_attempt_performed',false,
    'outcome','NO_CATALEPSY',
    'release_confirmed',true,
    'return_confirmed',true
  ),
  'middle',jsonb_build_object(
    'sequence_completed',true,
    'silent_observation_seconds',60,
    'release_confirmed',true,
    'return_confirmed',true
  ),
  'soul_mirror',jsonb_build_object(
    'completed',true,
    'relaxation_spontaneous_rating',5,
    'muscular_effort_rating',2,
    'perception_change_rating',3
  ),
  'voluntary_completion_confirmed',true
) from qa7_ids;

create temporary table qa7_results(label text primary key,payload jsonb) on commit drop;
grant select,insert on qa7_results to authenticated;

select set_config('request.jwt.claim.sub',(select user_id::text from qa7_ids),true);
set local role authenticated;
insert into qa7_results select 'first',public.complete_codex_day_v2(
  7::smallint,(select session_id from qa7_ids),'HNK-KETHER-D007-COMP-V1','HNK-KETHER-D007-V1',
  'bc12709d5a346870405cf41e62f99ac28d70186d','qa:d007:first:completion',null,now()
);
insert into qa7_results select 'replay',public.complete_codex_day_v2(
  7::smallint,(select session_id from qa7_ids),'HNK-KETHER-D007-COMP-V1','HNK-KETHER-D007-V1',
  'bc12709d5a346870405cf41e62f99ac28d70186d','qa:d007:first:completion',null,now()
);
reset role;

insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence)
select revisit_session_id,user_id,7,'qa:d007:revisit','revisit','evidence_pending',now()-interval '12 minutes',now(),720,
'{"total_duration_seconds":720,"second_attempt_performed":true}'::jsonb,
jsonb_build_object(
  'protocol_version','HNK-KETHER-D007-V1',
  'source_sha','bc12709d5a346870405cf41e62f99ac28d70186d',
  'session_id',revisit_session_id::text,
  'mode','revisit',
  'jachin',jsonb_build_object('relaxation_completed',true,'relaxation_rating',7,'test_performed',true,'catalepsy_reported',true,'release_confirmed',true,'return_confirmed',true),
  'boaz',jsonb_build_object('comparison_completed',true,'spontaneous_sensation_rating',6,'muscular_effort_rating',1,'second_attempt_performed',true,'outcome','CATALEPSY_REPORTED','release_confirmed',true,'return_confirmed',true),
  'middle',jsonb_build_object('sequence_completed',true,'silent_observation_seconds',60,'release_confirmed',true,'return_confirmed',true),
  'soul_mirror',jsonb_build_object('completed',true,'relaxation_spontaneous_rating',6,'muscular_effort_rating',1,'perception_change_rating',4),
  'voluntary_completion_confirmed',true
) from qa7_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa7_ids),true);
set local role authenticated;
insert into qa7_results select 'revisit',public.complete_codex_day_v2(
  7::smallint,(select revisit_session_id from qa7_ids),'HNK-KETHER-D007-COMP-V1','HNK-KETHER-D007-V1',
  'bc12709d5a346870405cf41e62f99ac28d70186d','qa:d007:revisit:completion',null,now()
);
reset role;

do $$
declare
  u uuid := (select user_id from qa7_ids);
  f jsonb := (select payload from qa7_results where label='first');
  r jsonb := (select payload from qa7_results where label='replay');
  rv jsonb := (select payload from qa7_results where label='revisit');
  x int; a int; hip_value int; total int; c int;
begin
  if (f->>'xp_awarded')::int <> 150 or (f->>'first_completion')::boolean is not true then raise exception 'qa_day007_first_failed'; end if;
  if f->'progression_events' ? 'KETHER_FRAGMENT_LIT' then raise exception 'qa_day007_fragment_lit_prematurely'; end if;
  if r <> f then raise exception 'qa_day007_replay_not_stable'; end if;
  if (rv->>'xp_awarded')::int <> 0 or (rv->>'first_completion')::boolean is not false then raise exception 'qa_day007_revisit_failed'; end if;
  select count(*) into x from public.xp_events where user_id=u and day=7;
  select count(*) into a from public.attribute_events where user_id=u and day=7 and attribute_code='HIP' and amount=1;
  select hip into hip_value from public.attribute_state where user_id=u;
  select xp_total into total from public.user_progress where user_id=u;
  select count(*) into c from public.day_completions where user_id=u and day=7;
  if x<>1 or a<>1 or hip_value<>6 or total<>800 or c<>1 then raise exception 'qa_day007_state_failed'; end if;
end $$;

select
  'PASS' result,
  (select payload->>'xp_awarded' from qa7_results where label='first')::int day7_xp,
  (select hip from public.attribute_state where user_id=(select user_id from qa7_ids)) hip_after,
  (select xp_total from public.user_progress where user_id=(select user_id from qa7_ids)) xp_total_after,
  (select payload->'progression_events' from qa7_results where label='first') progression_events,
  (select payload->'crown' from qa7_results where label='first') crown,
  false as first_completion_catalepsy_reported;

rollback;
