-- Day 074 / Binah authoritative completion.
-- Privacy boundary: private prose never enters this RPC; only the E2EE Vault entry UUID is accepted.

create or replace function public.complete_day074_v1(
  p_client_completion_id uuid,
  p_session_id uuid,
  p_private_vault_entry_ref uuid,
  p_self_accusation_count integer,
  p_omissions_reviewed_confirmed boolean,
  p_epistemic_separation_confirmed boolean,
  p_private_vault_e2ee_confirmed boolean,
  p_practice_record_no_private_prose_confirmed boolean,
  p_voluntary_completion_confirmed boolean,
  p_next_day_not_auto_started_confirmed boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing jsonb;
  v_completion_id uuid;
  v_xp_awarded integer := 0;
begin
  if v_user_id is null then raise exception 'day074_auth_required'; end if;
  if p_client_completion_id is null or p_session_id is null or p_private_vault_entry_ref is null then raise exception 'day074_uuid_required'; end if;
  if p_self_accusation_count <> 3 then raise exception 'day074_exactly_three_entries_required'; end if;
  if not coalesce(p_omissions_reviewed_confirmed,false) then raise exception 'day074_omissions_review_required'; end if;
  if not coalesce(p_epistemic_separation_confirmed,false) then raise exception 'day074_epistemic_separation_required'; end if;
  if not coalesce(p_private_vault_e2ee_confirmed,false) then raise exception 'day074_vault_e2ee_required'; end if;
  if not coalesce(p_practice_record_no_private_prose_confirmed,false) then raise exception 'day074_private_prose_boundary_required'; end if;
  if not coalesce(p_voluntary_completion_confirmed,false) then raise exception 'day074_voluntary_completion_required'; end if;
  if not coalesce(p_next_day_not_auto_started_confirmed,false) then raise exception 'day074_no_auto_start_required'; end if;

  -- Existing completion wins: retries are idempotent and cannot mint XP twice.
  select jsonb_build_object('completion_id',dc.id,'xp_awarded',0,'idempotent_replay',true,'day075_unlocked',true,'day075_auto_started',false)
    into v_existing
    from public.day_completions dc
   where dc.user_id=v_user_id and dc.day_number=74
   limit 1;
  if v_existing is not null then return v_existing; end if;

  -- Portal 073 must already be completed/unlocked in progression before Binah Day074.
  if not exists(select 1 from public.day_completions dc where dc.user_id=v_user_id and dc.day_number=73) then
    raise exception 'day074_requires_portal073';
  end if;

  insert into public.day_completions(user_id,day_number,client_completion_id,completed_at,evidence)
  values(v_user_id,74,p_client_completion_id,now(),jsonb_build_object(
    'protocol_version','HNK-BINAH-D074-V1','session_id',p_session_id,
    'self_accusation_count',3,'omissions_reviewed_confirmed',true,
    'observation_interpretation_belief_separated_confirmed',true,
    'private_vault_entry_ref',p_private_vault_entry_ref,'private_vault_e2ee_confirmed',true,
    'practice_record_no_private_prose_confirmed',true,'voluntary_completion_confirmed',true,
    'next_day_not_auto_started_confirmed',true))
  on conflict do nothing
  returning id into v_completion_id;

  if v_completion_id is null then
    select id into v_completion_id from public.day_completions where user_id=v_user_id and day_number=74 limit 1;
    return jsonb_build_object('completion_id',v_completion_id,'xp_awarded',0,'idempotent_replay',true,'day075_unlocked',true,'day075_auto_started',false);
  end if;

  insert into public.xp_events(user_id,amount,reason,idempotency_key,created_at)
  values(v_user_id,100,'day074_first_completion','day074:'||v_user_id::text,now())
  on conflict (idempotency_key) do nothing;
  get diagnostics v_xp_awarded = row_count;

  return jsonb_build_object('completion_id',v_completion_id,'xp_awarded',case when v_xp_awarded=1 then 100 else 0 end,'idempotent_replay',false,'day075_unlocked',true,'day075_auto_started',false);
end;
$$;

revoke all on function public.complete_day074_v1(uuid,uuid,uuid,integer,boolean,boolean,boolean,boolean,boolean,boolean) from public;
grant execute on function public.complete_day074_v1(uuid,uuid,uuid,integer,boolean,boolean,boolean,boolean,boolean,boolean) to authenticated;
