-- HNK Day 002 Completion V1 smoke test
-- Purpose: validate Day001 -> Day002 first completion, replay idempotency and revisit behavior.
-- Safety: everything runs inside one transaction and ends with ROLLBACK.

begin;

create temporary table qa_ids (
  user_id uuid not null,
  day1_session_id uuid not null,
  day2_session_id uuid not null,
  day2_revisit_session_id uuid not null
) on commit drop;

insert into qa_ids values (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid());

insert into auth.users (id, aud, role, email, email_confirmed_at, created_at, updated_at)
select user_id, 'authenticated', 'authenticated',
       'hnk-qa-' || replace(user_id::text, '-', '') || '@example.invalid',
       now(), now(), now()
from qa_ids;

insert into public.user_progress (user_id)
select user_id from qa_ids
on conflict (user_id) do nothing;

insert into public.attribute_state (user_id)
select user_id from qa_ids
on conflict (user_id) do nothing;

create temporary table qa_results(label text primary key, payload jsonb) on commit drop;

-- Day 001 prerequisite.
insert into public.practice_sessions (
  id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence
)
select
  day1_session_id,user_id,1,'qa:d001:first','first_completion','evidence_pending',
  now()-interval '18 minutes',now(),1080,'{}'::jsonb,
  jsonb_build_object(
    'protocol_version','HNK-KETHER-D001-V2',
    'source_sha','a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
    'session_id',day1_session_id::text,
    'mode','first_completion',
    'jachin',jsonb_build_object('started',true,'completed',true,'duration_seconds',600,'attention_returns',2,'return_confirmed',true),
    'ritual_tone_528',jsonb_build_object('started',true,'duration_seconds',10,'stopped_for_discomfort',false),
    'boaz',jsonb_build_object('started',true,'completed',true,'duration_seconds',300,'environment_distractions_count',3,'return_confirmed',true),
    'middle',jsonb_build_object('voice_practice_completed',true,'duration_seconds',180,'voice_recorded',false,'return_confirmed',true),
    'soul_mirror',jsonb_build_object('completed',true,'difficulty_rating',3),
    'voluntary_completion_confirmed',true,
    'safety_stop_occurred',false
  )
from qa_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa_ids),true);
set local role authenticated;

insert into qa_results
select 'day1_first', public.complete_codex_day_v2(
  1::smallint,
  (select day1_session_id from qa_ids),
  'HNK-KETHER-D001-COMP-V2',
  'HNK-KETHER-D001-V2',
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  'qa:d001:first:completion',
  null,
  now()
);

reset role;

-- Day 002 first completion.
insert into public.practice_sessions (
  id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence
)
select
  day2_session_id,user_id,2,'qa:d002:first','first_completion','evidence_pending',
  now()-interval '23 minutes',now(),1380,
  jsonb_build_object('impulse_count',4,'total_duration_seconds',1380,'pause_count',1),
  jsonb_build_object(
    'protocol_version','HNK-KETHER-D002-V1',
    'source_sha','71019573414493ee9e5521f4d27ed744748c0d2b',
    'session_id',day2_session_id::text,
    'mode','first_completion',
    'jachin',jsonb_build_object('completed',true,'duration_seconds',300,'comfort_rating',7,'return_confirmed',true),
    'audio_528_binaural',jsonb_build_object('started',true,'profile_id','HNK-KETHER-D002-AUDIO-V1','duration_seconds',30,'stopped_for_discomfort',false),
    'boaz',jsonb_build_object('completed',true,'duration_seconds',900,'impulse_count',4,'first_five_minutes_reflection_completed',true,'comfort_rating',6,'return_confirmed',true),
    'middle',jsonb_build_object('completed',true,'duration_seconds',180,'comfort_rating',7,'return_confirmed',true),
    'phenomenology',jsonb_build_array('MOVEMENT_IMPULSES','CALM'),
    'soul_mirror',jsonb_build_object('completed',true,'difficulty_rating',4),
    'voluntary_completion_confirmed',true,
    'safety_stop_occurred',false
  )
from qa_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa_ids),true);
set local role authenticated;

insert into qa_results
select 'day2_first', public.complete_codex_day_v2(
  2::smallint,
  (select day2_session_id from qa_ids),
  'HNK-KETHER-D002-COMP-V1',
  'HNK-KETHER-D002-V1',
  '71019573414493ee9e5521f4d27ed744748c0d2b',
  'qa:d002:first:completion',
  null,
  now()
);

insert into qa_results
select 'day2_replay_same_client_id', public.complete_codex_day_v2(
  2::smallint,
  (select day2_session_id from qa_ids),
  'HNK-KETHER-D002-COMP-V1',
  'HNK-KETHER-D002-V1',
  '71019573414493ee9e5521f4d27ed744748c0d2b',
  'qa:d002:first:completion',
  null,
  now()
);

reset role;

-- Day 002 revisit with a distinct session/completion id.
insert into public.practice_sessions (
  id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence
)
select
  day2_revisit_session_id,user_id,2,'qa:d002:revisit','revisit','evidence_pending',
  now()-interval '23 minutes',now(),1380,
  jsonb_build_object('impulse_count',2,'total_duration_seconds',1380,'pause_count',0),
  jsonb_build_object(
    'protocol_version','HNK-KETHER-D002-V1',
    'source_sha','71019573414493ee9e5521f4d27ed744748c0d2b',
    'session_id',day2_revisit_session_id::text,
    'mode','revisit',
    'jachin',jsonb_build_object('completed',true,'duration_seconds',300,'return_confirmed',true),
    'audio_528_binaural',jsonb_build_object('started',true,'profile_id','HNK-KETHER-D002-AUDIO-V1','duration_seconds',20,'stopped_for_discomfort',false),
    'boaz',jsonb_build_object('completed',true,'duration_seconds',900,'impulse_count',2,'first_five_minutes_reflection_completed',true,'return_confirmed',true),
    'middle',jsonb_build_object('completed',true,'duration_seconds',180,'return_confirmed',true),
    'soul_mirror',jsonb_build_object('completed',true),
    'voluntary_completion_confirmed',true,
    'safety_stop_occurred',false
  )
from qa_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa_ids),true);
set local role authenticated;

insert into qa_results
select 'day2_revisit', public.complete_codex_day_v2(
  2::smallint,
  (select day2_revisit_session_id from qa_ids),
  'HNK-KETHER-D002-COMP-V1',
  'HNK-KETHER-D002-V1',
  '71019573414493ee9e5521f4d27ed744748c0d2b',
  'qa:d002:revisit:completion',
  null,
  now()
);

reset role;

-- Assertions. Any failure aborts this test transaction.
do $$
declare
  v_user uuid := (select user_id from qa_ids);
  v_day1 jsonb := (select payload from qa_results where label='day1_first');
  v_day2 jsonb := (select payload from qa_results where label='day2_first');
  v_replay jsonb := (select payload from qa_results where label='day2_replay_same_client_id');
  v_revisit jsonb := (select payload from qa_results where label='day2_revisit');
  v_xp_count int;
  v_xp_sum int;
  v_dis_count int;
  v_dis int;
  v_total int;
begin
  if (v_day1->>'xp_awarded')::int <> 150 or (v_day1->>'first_completion')::boolean is not true then
    raise exception 'qa_day001_first_completion_failed';
  end if;
  if (v_day2->>'xp_awarded')::int <> 100 or (v_day2->>'first_completion')::boolean is not true then
    raise exception 'qa_day002_first_completion_failed';
  end if;
  if v_replay <> v_day2 then
    raise exception 'qa_day002_same_client_replay_not_stable';
  end if;
  if (v_revisit->>'xp_awarded')::int <> 0 or (v_revisit->>'first_completion')::boolean is not false then
    raise exception 'qa_day002_revisit_reward_failed';
  end if;

  select count(*), coalesce(sum(amount),0) into v_xp_count, v_xp_sum
  from public.xp_events where user_id=v_user and day=2;
  select count(*) into v_dis_count
  from public.attribute_events where user_id=v_user and day=2 and attribute_code='DIS';
  select dis into v_dis from public.attribute_state where user_id=v_user;
  select xp_total into v_total from public.user_progress where user_id=v_user;

  if v_xp_count <> 1 or v_xp_sum <> 100 then raise exception 'qa_day002_xp_idempotency_failed'; end if;
  if v_dis_count <> 1 or v_dis <> 6 then raise exception 'qa_day002_attribute_idempotency_failed'; end if;
  if v_total <> 250 then raise exception 'qa_total_xp_expected_250'; end if;
end $$;

select
  'PASS' as result,
  (select payload->>'xp_awarded' from qa_results where label='day1_first')::int as day1_xp,
  (select payload->>'xp_awarded' from qa_results where label='day2_first')::int as day2_xp,
  (select payload->>'xp_awarded' from qa_results where label='day2_revisit')::int as revisit_xp,
  (select count(*) from public.xp_events where user_id=(select user_id from qa_ids) and day=2) as day2_xp_events,
  (select count(*) from public.attribute_events where user_id=(select user_id from qa_ids) and day=2 and attribute_code='DIS') as day2_dis_events,
  (select dis from public.attribute_state where user_id=(select user_id from qa_ids)) as dis_after,
  (select xp_total from public.user_progress where user_id=(select user_id from qa_ids)) as xp_total_after;

rollback;
