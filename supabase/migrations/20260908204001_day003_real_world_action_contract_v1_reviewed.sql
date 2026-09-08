-- HNK CODEX — generic RealWorldAction contract + Day 003 reviewed completion
-- Applied to Supabase project codex-hnk-app as migration 20260908204001.

create table if not exists hnk_private.real_world_action_contract_registry (
  action_contract_id text primary key,
  day smallint not null references public.codex_days(day) on delete cascade,
  contract_version text not null,
  action_key text not null,
  target_elapsed_seconds integer not null check (target_elapsed_seconds > 0),
  consecutive boolean not null default true,
  status text not null check (status in ('draft','reviewed','active','retired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hnk_private.real_world_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_contract_id text not null references hnk_private.real_world_action_contract_registry(action_contract_id) on delete restrict,
  day smallint not null references public.codex_days(day) on delete cascade,
  client_action_id text not null,
  state text not null default 'active' check (state in ('active','qualified','stopped')),
  started_at timestamptz not null default now(),
  qualified_at timestamptz,
  last_check_in_at timestamptz,
  restart_count integer not null default 0 check (restart_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_action_id)
);

create index if not exists real_world_actions_user_day_idx on hnk_private.real_world_actions(user_id, day);
create index if not exists real_world_actions_contract_idx on hnk_private.real_world_actions(action_contract_id);
create index if not exists real_world_actions_state_idx on hnk_private.real_world_actions(state);

revoke all on hnk_private.real_world_action_contract_registry from public, anon, authenticated;
revoke all on hnk_private.real_world_actions from public, anon, authenticated;

insert into hnk_private.real_world_action_contract_registry (
  action_contract_id, day, contract_version, action_key, target_elapsed_seconds, consecutive, status, metadata
) values (
  'HNK-KETHER-D003-BOAZ-24H-V1', 3, '1', 'NO_COMPLAINT_24H', 86400, true, 'active',
  jsonb_build_object(
    'quest_definition_id','HNK-KETHER-D003-V1',
    'phase_id','boaz_24h_action',
    'lapse_policy','RESTART_WINDOW_WITHOUT_PUNISHMENT',
    'server_clock_authoritative',true,
    'private_prose_storage','VAULT_ONLY'
  )
)
on conflict (action_contract_id) do update set
  day = excluded.day,
  contract_version = excluded.contract_version,
  action_key = excluded.action_key,
  target_elapsed_seconds = excluded.target_elapsed_seconds,
  consecutive = excluded.consecutive,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = now();

create or replace function hnk_private.real_world_action_snapshot_v1(p_action_id uuid, p_uid uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action hnk_private.real_world_actions%rowtype;
  v_contract hnk_private.real_world_action_contract_registry%rowtype;
  v_now timestamptz := now();
  v_remaining integer;
begin
  select * into v_action from hnk_private.real_world_actions where id=p_action_id and user_id=p_uid for update;
  if not found then raise exception 'real_world_action_not_found'; end if;
  select * into v_contract from hnk_private.real_world_action_contract_registry where action_contract_id=v_action.action_contract_id;
  if not found then raise exception 'real_world_action_contract_not_found'; end if;

  if v_action.state='active' and v_now >= v_action.started_at + (v_contract.target_elapsed_seconds * interval '1 second') then
    update hnk_private.real_world_actions set state='qualified',qualified_at=v_now,last_check_in_at=v_now,updated_at=v_now where id=v_action.id returning * into v_action;
  elsif v_action.state='active' then
    update hnk_private.real_world_actions set last_check_in_at=v_now,updated_at=v_now where id=v_action.id returning * into v_action;
  end if;

  v_remaining := greatest(0,ceil(extract(epoch from ((v_action.started_at + (v_contract.target_elapsed_seconds * interval '1 second')) - v_now)))::integer);
  return jsonb_build_object(
    'id',v_action.id,'day',v_action.day,'action_contract_id',v_action.action_contract_id,'action_key',v_contract.action_key,
    'state',v_action.state,'started_at',v_action.started_at,'qualified_at',v_action.qualified_at,'last_check_in_at',v_action.last_check_in_at,
    'restart_count',v_action.restart_count,'target_elapsed_seconds',v_contract.target_elapsed_seconds,'remaining_seconds',v_remaining,
    'consecutive',v_contract.consecutive,'server_now',v_now
  );
end;
$$;
revoke all on function hnk_private.real_world_action_snapshot_v1(uuid,uuid) from public,anon,authenticated;

create or replace function hnk_private.start_real_world_action_v1_impl(p_action_contract_id text,p_client_action_id text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_uid uuid:=auth.uid(); v_contract hnk_private.real_world_action_contract_registry%rowtype; v_action_id uuid; v_prev_complete boolean;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  if nullif(btrim(p_client_action_id),'') is null then raise exception 'client_action_id_required'; end if;
  select * into v_contract from hnk_private.real_world_action_contract_registry where action_contract_id=p_action_contract_id and status='active';
  if not found then raise exception 'real_world_action_contract_not_active'; end if;
  if v_contract.day>1 then
    select exists(select 1 from public.day_completions where user_id=v_uid and day=v_contract.day-1) into v_prev_complete;
    if not v_prev_complete then raise exception 'previous_day_required'; end if;
  end if;
  insert into hnk_private.real_world_actions(user_id,action_contract_id,day,client_action_id)
  values(v_uid,v_contract.action_contract_id,v_contract.day,p_client_action_id)
  on conflict(user_id,client_action_id) do update set updated_at=hnk_private.real_world_actions.updated_at
  returning id into v_action_id;
  return hnk_private.real_world_action_snapshot_v1(v_action_id,v_uid);
end; $$;

create or replace function hnk_private.refresh_real_world_action_v1_impl(p_action_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); begin if v_uid is null then raise exception 'authentication_required'; end if; return hnk_private.real_world_action_snapshot_v1(p_action_id,v_uid); end; $$;

create or replace function hnk_private.restart_real_world_action_v1_impl(p_action_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_now timestamptz:=now(); v_id uuid;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  update hnk_private.real_world_actions a set state='active',started_at=v_now,qualified_at=null,last_check_in_at=v_now,restart_count=restart_count+1,updated_at=v_now
  where a.id=p_action_id and a.user_id=v_uid returning a.id into v_id;
  if v_id is null then raise exception 'real_world_action_not_found'; end if;
  return hnk_private.real_world_action_snapshot_v1(v_id,v_uid);
end; $$;

create or replace function hnk_private.stop_real_world_action_v1_impl(p_action_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_now timestamptz:=now(); v_id uuid;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  update hnk_private.real_world_actions a set state='stopped',last_check_in_at=v_now,updated_at=v_now
  where a.id=p_action_id and a.user_id=v_uid and a.state<>'qualified' returning a.id into v_id;
  if v_id is null then select id into v_id from hnk_private.real_world_actions where id=p_action_id and user_id=v_uid; end if;
  if v_id is null then raise exception 'real_world_action_not_found'; end if;
  return hnk_private.real_world_action_snapshot_v1(v_id,v_uid);
end; $$;

revoke all on function hnk_private.start_real_world_action_v1_impl(text,text) from public,anon,authenticated;
revoke all on function hnk_private.refresh_real_world_action_v1_impl(uuid) from public,anon,authenticated;
revoke all on function hnk_private.restart_real_world_action_v1_impl(uuid) from public,anon,authenticated;
revoke all on function hnk_private.stop_real_world_action_v1_impl(uuid) from public,anon,authenticated;
grant usage on schema hnk_private to authenticated;
grant execute on function hnk_private.start_real_world_action_v1_impl(text,text) to authenticated;
grant execute on function hnk_private.refresh_real_world_action_v1_impl(uuid) to authenticated;
grant execute on function hnk_private.restart_real_world_action_v1_impl(uuid) to authenticated;
grant execute on function hnk_private.stop_real_world_action_v1_impl(uuid) to authenticated;

create or replace function public.start_real_world_action_v1(p_action_contract_id text,p_client_action_id text)
returns jsonb language sql security invoker set search_path='' as $$ select hnk_private.start_real_world_action_v1_impl(p_action_contract_id,p_client_action_id); $$;
create or replace function public.refresh_real_world_action_v1(p_action_id uuid)
returns jsonb language sql security invoker set search_path='' as $$ select hnk_private.refresh_real_world_action_v1_impl(p_action_id); $$;
create or replace function public.restart_real_world_action_v1(p_action_id uuid)
returns jsonb language sql security invoker set search_path='' as $$ select hnk_private.restart_real_world_action_v1_impl(p_action_id); $$;
create or replace function public.stop_real_world_action_v1(p_action_id uuid)
returns jsonb language sql security invoker set search_path='' as $$ select hnk_private.stop_real_world_action_v1_impl(p_action_id); $$;
revoke all on function public.start_real_world_action_v1(text,text) from public,anon;
revoke all on function public.refresh_real_world_action_v1(uuid) from public,anon;
revoke all on function public.restart_real_world_action_v1(uuid) from public,anon;
revoke all on function public.stop_real_world_action_v1(uuid) from public,anon;
grant execute on function public.start_real_world_action_v1(text,text) to authenticated;
grant execute on function public.refresh_real_world_action_v1(uuid) to authenticated;
grant execute on function public.restart_real_world_action_v1(uuid) to authenticated;
grant execute on function public.stop_real_world_action_v1(uuid) to authenticated;

create or replace function hnk_private.validate_day003_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare
  v_key text; v_item text; v_action_id uuid; v_action hnk_private.real_world_actions%rowtype; v_contract hnk_private.real_world_action_contract_registry%rowtype;
  v_allowed_phenomenology constant text[]:=array['MANY_THOUGHTS','CALM','AGITATION','BODY_SENSATIONS','SILENCE','STRONG_EMOTION','NOTHING_SPECIAL','OTHER'];
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key<>all(array['protocol_version','source_sha','session_id','mode','jachin','audio_theta432','boaz','middle','phenomenology','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred']) then raise exception 'day003_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->>'protocol_version'<>'HNK-KETHER-D003-V1' then raise exception 'completion_evidence_protocol_mismatch'; end if;
  if p_evidence->>'source_sha'<>p_expected_source_sha then raise exception 'completion_evidence_source_sha_mismatch'; end if;
  if jsonb_typeof(p_evidence->'session_id')<>'string' or nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day003_session_id_required'; end if;

  if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day003_jachin_incomplete'; end if;
  if p_evidence#>'{jachin,observation_completed}'<>'true'::jsonb or p_evidence#>'{jachin,return_confirmed}'<>'true'::jsonb
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{jachin,duration_seconds}')
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{jachin,beliefs_recorded_count}')
     or (p_evidence#>>'{jachin,beliefs_recorded_count}')::integer<3
     or not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence#>'{jachin,vault_entry_ref}') then raise exception 'day003_jachin_incomplete'; end if;

  if p_evidence?'audio_theta432' then
    if p_evidence#>'{audio_theta432,started}'<>'true'::jsonb or p_evidence#>>'{audio_theta432,profile_id}'<>'HNK-THETA432-BINAURAL-V1' then raise exception 'day003_audio_profile_invalid'; end if;
  end if;

  if jsonb_typeof(p_evidence->'boaz')<>'object' or p_evidence#>'{boaz,relaxation_completed}'<>'true'::jsonb
     or p_evidence#>'{boaz,protective_intention_inquiry_completed}'<>'true'::jsonb
     or p_evidence#>'{boaz,challenge_completed}'<>'true'::jsonb
     or p_evidence#>'{boaz,return_confirmed}'<>'true'::jsonb
     or not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence#>'{boaz,inquiry_vault_entry_ref}') then raise exception 'day003_boaz_incomplete'; end if;
  begin v_action_id:=(p_evidence#>>'{boaz,real_world_action_id}')::uuid; exception when others then raise exception 'day003_real_world_action_id_invalid'; end;
  select * into v_action from hnk_private.real_world_actions where id=v_action_id and user_id=auth.uid() and day=3;
  if not found then raise exception 'day003_real_world_action_not_found'; end if;
  select * into v_contract from hnk_private.real_world_action_contract_registry where action_contract_id=v_action.action_contract_id;
  if not found or v_contract.action_contract_id<>'HNK-KETHER-D003-BOAZ-24H-V1' then raise exception 'day003_real_world_action_contract_invalid'; end if;
  if v_action.state<>'qualified' or v_action.qualified_at is null or v_action.qualified_at<v_action.started_at+(v_contract.target_elapsed_seconds*interval '1 second') then raise exception 'day003_real_world_action_not_qualified'; end if;
  if p_evidence#>'{boaz,restart_count}' is not null and (not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{boaz,restart_count}') or (p_evidence#>>'{boaz,restart_count}')::integer<>v_action.restart_count) then raise exception 'day003_restart_count_mismatch'; end if;

  if jsonb_typeof(p_evidence->'middle')<>'object' or p_evidence#>'{middle,completed}'<>'true'::jsonb or p_evidence#>'{middle,return_confirmed}'<>'true'::jsonb then raise exception 'day003_middle_incomplete'; end if;
  if p_evidence?'phenomenology' then for v_item in select value from jsonb_array_elements_text(p_evidence->'phenomenology') loop if v_item<>all(v_allowed_phenomenology) then raise exception 'day003_phenomenology_invalid'; end if; end loop; end if;
  if jsonb_typeof(p_evidence->'soul_mirror')<>'object' or p_evidence#>'{soul_mirror,completed}'<>'true'::jsonb then raise exception 'day003_soul_mirror_incomplete'; end if;
  if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'voluntary_completion_required'; end if;
end; $$;
revoke all on function hnk_private.validate_day003_completion_v1(jsonb,text) from public,anon,authenticated;

insert into hnk_private.completion_contract_registry(completion_contract_id,day,quest_definition_id,canonical_source_sha,validator_key,contract_version,status)
values('HNK-KETHER-D003-COMP-V1',3,'HNK-KETHER-D003-V1','3cb60ed208c24ee885cbe95d974c7468419120aa','day003_v1','1','reviewed')
on conflict(completion_contract_id) do update set day=excluded.day,quest_definition_id=excluded.quest_definition_id,canonical_source_sha=excluded.canonical_source_sha,validator_key=excluded.validator_key,contract_version=excluded.contract_version,status='reviewed';
