-- HNK Day 003 Completion V1 smoke test.
-- Validates server-qualified 24h action, +100 XP first completion,
-- replay idempotency, revisit=0 XP, and zero attribute gain.
-- All data is rolled back.

begin;

create temporary table qa3_ids(
  user_id uuid not null,
  session_id uuid not null,
  revisit_session_id uuid not null,
  action_id uuid
) on commit drop;
insert into qa3_ids(user_id,session_id,revisit_session_id)
values(gen_random_uuid(),gen_random_uuid(),gen_random_uuid());
grant select,update on qa3_ids to authenticated;

insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at)
select user_id,'authenticated','authenticated',
       'hnk-qa-d003-'||replace(user_id::text,'-','')||'@example.invalid',
       now(),now(),now()
from qa3_ids;

-- Days 001/002 are seeded here because they already have their own end-to-end smoke.
insert into public.user_progress(user_id,xp_total,current_day)
select user_id,250,3 from qa3_ids;
insert into public.attribute_state(user_id)
select user_id from qa3_ids;
insert into public.day_completions(user_id,day,completion_version)
select user_id,1,'qa-seed' from qa3_ids
union all
select user_id,2,'qa-seed' from qa3_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa3_ids),true);
set local role authenticated;
with started as (
  select public.start_real_world_action_v1(
    'HNK-KETHER-D003-BOAZ-24H-V1','qa:d003:24h'
  ) as payload
)
update qa3_ids set action_id=((select payload->>'id' from started)::uuid);
reset role;

-- Simulate server elapsed time without waiting in real time.
update hnk_private.real_world_actions
set started_at=now()-interval '24 hours 1 second',updated_at=now()
where id=(select action_id from qa3_ids);

select set_config('request.jwt.claim.sub',(select user_id::text from qa3_ids),true);
set local role authenticated;
create temporary table qa3_results(label text primary key,payload jsonb) on commit drop;
grant select,insert,update on qa3_results to authenticated;
insert into qa3_results
select 'qualified_action',public.refresh_real_world_action_v1((select action_id from qa3_ids));
reset role;

insert into public.practice_sessions(
  id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence
)
select
  session_id,user_id,3,'qa:d003:first','first_completion','evidence_pending',
  now()-interval '15 minutes',now(),900,
  jsonb_build_object('total_duration_seconds',900,'thought_returns',4,'restart_count',0),
  jsonb_build_object(
    'protocol_version','HNK-KETHER-D003-V1',
    'source_sha','3cb60ed208c24ee885cbe95d974c7468419120aa',
    'session_id',session_id::text,
    'mode','first_completion',
    'jachin',jsonb_build_object(
      'observation_completed',true,'duration_seconds',600,'thought_returns',4,
      'beliefs_recorded_count',3,'belief_reframe_completed',true,'return_confirmed',true
    ),
    'boaz',jsonb_build_object(
      'relaxation_completed',true,'protective_intention_inquiry_completed',true,
      'real_world_action_id',action_id::text,'challenge_completed',true,
      'restart_count',0,'return_confirmed',true
    ),
    'middle',jsonb_build_object('completed',true,'return_confirmed',true),
    'soul_mirror',jsonb_build_object('completed',true,'difficulty_rating',4),
    'voluntary_completion_confirmed',true,
    'safety_stop_occurred',false
  )
from qa3_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa3_ids),true);
set local role authenticated;
insert into qa3_results
select 'day3_first',public.complete_codex_day_v2(
  3::smallint,(select session_id from qa3_ids),
  'HNK-KETHER-D003-COMP-V1','HNK-KETHER-D003-V1',
  '3cb60ed208c24ee885cbe95d974c7468419120aa',
  'qa:d003:first:completion',null,now()
);
insert into qa3_results
select 'day3_replay',public.complete_codex_day_v2(
  3::smallint,(select session_id from qa3_ids),
  'HNK-KETHER-D003-COMP-V1','HNK-KETHER-D003-V1',
  '3cb60ed208c24ee885cbe95d974c7468419120aa',
  'qa:d003:first:completion',null,now()
);
reset role;

insert into public.practice_sessions(
  id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence
)
select
  revisit_session_id,user_id,3,'qa:d003:revisit','revisit','evidence_pending',
  now()-interval '15 minutes',now(),900,
  jsonb_build_object('total_duration_seconds',900,'thought_returns',2,'restart_count',0),
  jsonb_build_object(
    'protocol_version','HNK-KETHER-D003-V1',
    'source_sha','3cb60ed208c24ee885cbe95d974c7468419120aa',
    'session_id',revisit_session_id::text,
    'mode','revisit',
    'jachin',jsonb_build_object('observation_completed',true,'duration_seconds',600,'thought_returns',2,'beliefs_recorded_count',3,'return_confirmed',true),
    'boaz',jsonb_build_object('relaxation_completed',true,'protective_intention_inquiry_completed',true,'real_world_action_id',action_id::text,'challenge_completed',true,'restart_count',0,'return_confirmed',true),
    'middle',jsonb_build_object('completed',true,'return_confirmed',true),
    'soul_mirror',jsonb_build_object('completed',true),
    'voluntary_completion_confirmed',true,
    'safety_stop_occurred',false
  )
from qa3_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa3_ids),true);
set local role authenticated;
insert into qa3_results
select 'day3_revisit',public.complete_codex_day_v2(
  3::smallint,(select revisit_session_id from qa3_ids),
  'HNK-KETHER-D003-COMP-V1','HNK-KETHER-D003-V1',
  '3cb60ed208c24ee885cbe95d974c7468419120aa',
  'qa:d003:revisit:completion',null,now()
);
reset role;

do $$
declare
  v_user uuid:=(select user_id from qa3_ids);
  v_first jsonb:=(select payload from qa3_results where label='day3_first');
  v_replay jsonb:=(select payload from qa3_results where label='day3_replay');
  v_revisit jsonb:=(select payload from qa3_results where label='day3_revisit');
  v_action jsonb:=(select payload from qa3_results where label='qualified_action');
  v_xp_count int; v_xp_sum int; v_attr_count int; v_total int; v_completion_count int;
begin
  if v_action->>'state'<>'qualified' then raise exception 'qa_day003_action_not_qualified'; end if;
  if (v_first->>'xp_awarded')::int<>100 or (v_first->>'first_completion')::boolean is not true then raise exception 'qa_day003_first_completion_failed'; end if;
  if v_replay<>v_first then raise exception 'qa_day003_replay_not_stable'; end if;
  if (v_revisit->>'xp_awarded')::int<>0 or (v_revisit->>'first_completion')::boolean is not false then raise exception 'qa_day003_revisit_reward_failed'; end if;

  select count(*),coalesce(sum(amount),0) into v_xp_count,v_xp_sum
  from public.xp_events where user_id=v_user and day=3;
  select count(*) into v_attr_count
  from public.attribute_events where user_id=v_user and day=3;
  select xp_total into v_total from public.user_progress where user_id=v_user;
  select count(*) into v_completion_count
  from public.day_completions where user_id=v_user and day=3;

  if v_xp_count<>1 or v_xp_sum<>100 then raise exception 'qa_day003_xp_idempotency_failed'; end if;
  if v_attr_count<>0 then raise exception 'qa_day003_attribute_gain_must_be_zero'; end if;
  if v_total<>350 then raise exception 'qa_day003_total_xp_expected_350'; end if;
  if v_completion_count<>1 then raise exception 'qa_day003_completion_idempotency_failed'; end if;
end $$;

select
  'PASS' as result,
  (select payload->>'state' from qa3_results where label='qualified_action') as action_state,
  (select payload->>'xp_awarded' from qa3_results where label='day3_first')::int as day3_xp,
  (select payload->>'xp_awarded' from qa3_results where label='day3_revisit')::int as revisit_xp,
  (select count(*) from public.xp_events where user_id=(select user_id from qa3_ids) and day=3) as day3_xp_events,
  (select count(*) from public.attribute_events where user_id=(select user_id from qa3_ids) and day=3) as day3_attribute_events,
  (select xp_total from public.user_progress where user_id=(select user_id from qa3_ids)) as xp_total_after;

rollback;
