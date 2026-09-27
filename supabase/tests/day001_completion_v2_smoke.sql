-- HNK Day 001 Completion V2 smoke test
-- Purpose: validate first completion, same-client replay idempotency, canonical identity,
-- XP single-award semantics, and the privacy boundary of persisted evidence.
-- Safety: everything runs inside one transaction and ends with ROLLBACK.

begin;

create temporary table qa_ids (
  user_id uuid not null,
  session_id uuid not null
) on commit drop;

insert into qa_ids values (gen_random_uuid(), gen_random_uuid());
grant select on qa_ids to authenticated;

insert into auth.users (id, aud, role, email, email_confirmed_at, created_at, updated_at)
select user_id, 'authenticated', 'authenticated',
       'hnk-qa-d001-' || replace(user_id::text, '-', '') || '@example.invalid',
       now(), now(), now()
from qa_ids;

insert into public.user_progress (user_id)
select user_id from qa_ids
on conflict (user_id) do nothing;

insert into public.attribute_state (user_id)
select user_id from qa_ids
on conflict (user_id) do nothing;

create temporary table qa_results(label text primary key, payload jsonb) on commit drop;
grant select, insert on qa_results to authenticated;

insert into public.practice_sessions (
  id,user_id,day,client_session_id,mode,state,started_at,ended_at,duration_seconds,metrics,evidence
)
select
  session_id,user_id,1,'qa:d001:v2:first','first_completion','evidence_pending',
  now()-interval '18 minutes',now(),1080,
  jsonb_build_object('attention_returns',2,'total_duration_seconds',1080),
  jsonb_build_object(
    'protocol_version','HNK-KETHER-D001-V2',
    'source_sha','a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
    'session_id',session_id::text,
    'mode','first_completion',
    'jachin',jsonb_build_object('started',true,'completed',true,'duration_seconds',600,'attention_returns',2,'return_confirmed',true),
    'ritual_tone_528',jsonb_build_object('started',true,'duration_seconds',10,'stopped_for_discomfort',false),
    'boaz',jsonb_build_object('started',true,'completed',true,'duration_seconds',300,'environment_distractions_count',3,'return_confirmed',true),
    'middle',jsonb_build_object('voice_practice_completed',true,'duration_seconds',180,'voice_recorded',false,'return_confirmed',true),
    'soul_mirror',jsonb_build_object('completed',true),
    'voluntary_completion_confirmed',true,
    'safety_stop_occurred',false
  )
from qa_ids;

select set_config('request.jwt.claim.sub',(select user_id::text from qa_ids),true);
set local role authenticated;

insert into qa_results
select 'first', public.complete_codex_day_v2(
  1::smallint,
  (select session_id from qa_ids),
  'HNK-KETHER-D001-COMP-V2',
  'HNK-KETHER-D001-V2',
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  'qa:d001:v2:first:completion',
  null,
  now()
);

insert into qa_results
select 'replay_same_client_id', public.complete_codex_day_v2(
  1::smallint,
  (select session_id from qa_ids),
  'HNK-KETHER-D001-COMP-V2',
  'HNK-KETHER-D001-V2',
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  'qa:d001:v2:first:completion',
  null,
  now()
);

reset role;

do $$
declare
  v_user uuid := (select user_id from qa_ids);
  v_session uuid := (select session_id from qa_ids);
  v_first jsonb := (select payload from qa_results where label='first');
  v_replay jsonb := (select payload from qa_results where label='replay_same_client_id');
  v_xp_count int;
  v_xp_sum int;
  v_total int;
  v_evidence jsonb;
begin
  if (v_first->>'xp_awarded')::int <> 150 then raise exception 'qa_day001_expected_150_xp'; end if;
  if (v_first->>'first_completion')::boolean is not true then raise exception 'qa_day001_expected_first_completion'; end if;
  if v_first->>'completion_contract_id' <> 'HNK-KETHER-D001-COMP-V2' then raise exception 'qa_day001_completion_contract_mismatch'; end if;
  if v_replay <> v_first then raise exception 'qa_day001_same_client_replay_not_stable'; end if;

  select count(*), coalesce(sum(amount),0) into v_xp_count,v_xp_sum
  from public.xp_events where user_id=v_user and day=1;
  if v_xp_count <> 1 or v_xp_sum <> 150 then raise exception 'qa_day001_xp_idempotency_failed'; end if;

  select xp_total into v_total from public.user_progress where user_id=v_user;
  if v_total <> 150 then raise exception 'qa_day001_total_xp_expected_150'; end if;

  select evidence into v_evidence from public.practice_sessions where id=v_session;
  if v_evidence ? 'intention' or v_evidence ? 'mirror' or v_evidence ? 'anchor' or v_evidence ? 'distractions'
     or (v_evidence->'soul_mirror') ? 'plaintext' or (v_evidence->'soul_mirror') ? 'text'
     or (v_evidence->'soul_mirror') ? 'content' then
    raise exception 'qa_day001_private_plaintext_persisted';
  end if;
  if (v_evidence#>>'{boaz,environment_distractions_count}')::int <> 3 then raise exception 'qa_day001_distraction_count_missing'; end if;
end $$;

select 'PASS' as result,
  (select payload->>'xp_awarded' from qa_results where label='first')::int as first_xp,
  (select payload->>'first_completion' from qa_results where label='first')::boolean as first_completion,
  (select payload->>'completion_contract_id' from qa_results where label='first') as completion_contract_id,
  ((select payload from qa_results where label='first')=(select payload from qa_results where label='replay_same_client_id')) as replay_stable,
  (select count(*) from public.xp_events where user_id=(select user_id from qa_ids) and day=1) as xp_events,
  (select xp_total from public.user_progress where user_id=(select user_id from qa_ids)) as xp_total;

rollback;
