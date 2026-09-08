-- HNK Day 003 RealWorldAction V1 smoke
-- Safety: synthetic user, transaction-scoped, ends with ROLLBACK.

begin;

create temporary table qa_rw(user_id uuid not null, action_id uuid) on commit drop;
grant select,update on qa_rw to authenticated;
create temporary table qa_snapshots(label text primary key,payload jsonb) on commit drop;
grant select,insert on qa_snapshots to authenticated;

insert into qa_rw(user_id) values (gen_random_uuid());
insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at)
select user_id,'authenticated','authenticated','hnk-rw-'||replace(user_id::text,'-','')||'@example.invalid',now(),now(),now() from qa_rw;
insert into public.day_completions(user_id,day,completion_version)
select user_id,2,'qa-prerequisite' from qa_rw;

select set_config('request.jwt.claim.sub',(select user_id::text from qa_rw),true);
set local role authenticated;
with started as (
  select public.start_real_world_action_v1('HNK-KETHER-D003-BOAZ-24H-V1','qa:d003:24h') as payload
)
update qa_rw set action_id=(select (payload->>'id')::uuid from started);
reset role;

-- 23:59:59 must still be active.
update hnk_private.real_world_actions
set started_at=now()-interval '23 hours 59 minutes 59 seconds',state='active',qualified_at=null
where id=(select action_id from qa_rw);
select set_config('request.jwt.claim.sub',(select user_id::text from qa_rw),true);
set local role authenticated;
insert into qa_snapshots select 'before_24h',public.refresh_real_world_action_v1((select action_id from qa_rw));
insert into qa_snapshots select 'restart',public.restart_real_world_action_v1((select action_id from qa_rw));
reset role;

-- Active action cannot satisfy Day003 completion validator.
do $$
declare
  v_id uuid:=(select action_id from qa_rw);
  v_failed boolean:=false;
  v_evidence jsonb;
begin
  perform set_config('request.jwt.claim.sub',(select user_id::text from qa_rw),true);
  v_evidence:=jsonb_build_object(
    'protocol_version','HNK-KETHER-D003-V1','source_sha','3cb60ed208c24ee885cbe95d974c7468419120aa','session_id',gen_random_uuid()::text,'mode','first_completion',
    'jachin',jsonb_build_object('observation_completed',true,'duration_seconds',600,'beliefs_recorded_count',3,'return_confirmed',true),
    'boaz',jsonb_build_object('relaxation_completed',true,'protective_intention_inquiry_completed',true,'real_world_action_id',v_id::text,'challenge_completed',true,'restart_count',1,'return_confirmed',true),
    'middle',jsonb_build_object('completed',true,'return_confirmed',true),
    'soul_mirror',jsonb_build_object('completed',true),'voluntary_completion_confirmed',true
  );
  begin
    perform hnk_private.validate_day003_completion_v1(v_evidence,'3cb60ed208c24ee885cbe95d974c7468419120aa');
  exception when others then
    if sqlerrm like '%day003_real_world_action_not_qualified%' then v_failed:=true; else raise; end if;
  end;
  if not v_failed then raise exception 'qa_day003_active_action_should_not_validate'; end if;
end $$;

-- Beyond 24h qualifies on server refresh.
update hnk_private.real_world_actions
set started_at=now()-interval '24 hours 1 second',state='active',qualified_at=null
where id=(select action_id from qa_rw);
select set_config('request.jwt.claim.sub',(select user_id::text from qa_rw),true);
set local role authenticated;
insert into qa_snapshots select 'after_24h',public.refresh_real_world_action_v1((select action_id from qa_rw));
reset role;

-- Qualified action passes validator.
do $$
declare
  v_id uuid:=(select action_id from qa_rw);
  v_restart integer:=(select restart_count from hnk_private.real_world_actions where id=v_id);
  v_evidence jsonb;
begin
  perform set_config('request.jwt.claim.sub',(select user_id::text from qa_rw),true);
  v_evidence:=jsonb_build_object(
    'protocol_version','HNK-KETHER-D003-V1','source_sha','3cb60ed208c24ee885cbe95d974c7468419120aa','session_id',gen_random_uuid()::text,'mode','first_completion',
    'jachin',jsonb_build_object('observation_completed',true,'duration_seconds',600,'beliefs_recorded_count',3,'return_confirmed',true),
    'audio_theta432',jsonb_build_object('started',true,'profile_id','HNK-THETA432-BINAURAL-V1'),
    'boaz',jsonb_build_object('relaxation_completed',true,'protective_intention_inquiry_completed',true,'real_world_action_id',v_id::text,'challenge_completed',true,'restart_count',v_restart,'return_confirmed',true),
    'middle',jsonb_build_object('completed',true,'return_confirmed',true),
    'soul_mirror',jsonb_build_object('completed',true),'voluntary_completion_confirmed',true
  );
  perform hnk_private.validate_day003_completion_v1(v_evidence,'3cb60ed208c24ee885cbe95d974c7468419120aa');
end $$;

select
  (select payload->>'state' from qa_snapshots where label='before_24h') as state_before_24h,
  (select (payload->>'remaining_seconds')::int from qa_snapshots where label='before_24h') as remaining_before_24h,
  (select payload->>'state' from qa_snapshots where label='restart') as state_after_restart,
  (select (payload->>'restart_count')::int from qa_snapshots where label='restart') as restart_count,
  (select payload->>'state' from qa_snapshots where label='after_24h') as state_after_24h,
  (select payload->>'qualified_at' from qa_snapshots where label='after_24h') is not null as qualified_at_present,
  (select status from hnk_private.completion_contract_registry where completion_contract_id='HNK-KETHER-D003-COMP-V1') as completion_contract_status;

rollback;
