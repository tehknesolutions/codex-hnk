-- HNK CODEX — Day 074 / Binah Completion Contract V1
-- Uses the existing Completion V2 schema. Private prose never enters the RPC.

insert into hnk_private.completion_contract_registry (
  completion_contract_id, quest_definition_id, day, canonical_source_sha,
  contract_version, validator_key, status
)
select 'HNK-BINAH-D074-COMP-V1','HNK-BINAH-D074-V1',74,source_sha,'1','day074_v1','active'
from public.codex_days where day=74 and status='canon'
on conflict (completion_contract_id) do update set
  quest_definition_id=excluded.quest_definition_id, day=excluded.day,
  canonical_source_sha=excluded.canonical_source_sha, contract_version=excluded.contract_version,
  validator_key=excluded.validator_key, status=excluded.status, updated_at=now();

create or replace function hnk_private.validate_day074_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare v_key text;
begin
  if p_evidence is null or jsonb_typeof(p_evidence)<>'object' then raise exception 'evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_version','source_sha','session_id','mode','self_accusation_count','omissions_reviewed_confirmed','observation_interpretation_belief_separated_confirmed','private_vault_entry_ref','private_vault_e2ee_confirmed','practice_record_no_private_prose_confirmed','voluntary_completion_confirmed','next_day_not_auto_started_confirmed']) then
      raise exception 'day074_evidence_unknown_field';
    end if;
  end loop;
  if p_evidence->>'protocol_version' <> 'HNK-BINAH-D074-V1' then raise exception 'completion_evidence_protocol_mismatch'; end if;
  if p_evidence->>'source_sha' <> p_expected_source_sha then raise exception 'completion_evidence_source_sha_mismatch'; end if;
  if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day074_session_id_required'; end if;
  if p_evidence ? 'mode' and p_evidence->>'mode' not in ('first_completion','revisit') then raise exception 'day074_mode_invalid'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence->'self_accusation_count') or (p_evidence->>'self_accusation_count')::integer<>3 then raise exception 'day074_exactly_three_entries_required'; end if;
  if p_evidence->'omissions_reviewed_confirmed' <> 'true'::jsonb then raise exception 'day074_omissions_review_required'; end if;
  if p_evidence->'observation_interpretation_belief_separated_confirmed' <> 'true'::jsonb then raise exception 'day074_epistemic_separation_required'; end if;
  if not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence->'private_vault_entry_ref') or p_evidence->'private_vault_entry_ref' is null or p_evidence->'private_vault_entry_ref'='null'::jsonb then raise exception 'day074_vault_ref_required'; end if;
  if p_evidence->'private_vault_e2ee_confirmed' <> 'true'::jsonb then raise exception 'day074_vault_e2ee_required'; end if;
  if p_evidence->'practice_record_no_private_prose_confirmed' <> 'true'::jsonb then raise exception 'day074_private_prose_boundary_required'; end if;
  if p_evidence->'voluntary_completion_confirmed' <> 'true'::jsonb then raise exception 'day074_voluntary_completion_required'; end if;
  if p_evidence->'next_day_not_auto_started_confirmed' <> 'true'::jsonb then raise exception 'day074_no_auto_start_required'; end if;
end; $$;
revoke all on function hnk_private.validate_day074_completion_v1(jsonb,text) from public,anon,authenticated;

create or replace function public.complete_day074_v1(
  p_session_id uuid,p_completion_contract_id text,p_quest_definition_id text,
  p_canonical_source_sha text,p_client_completion_id text,
  p_local_record_hash text default null,p_client_completed_at timestamptz default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  v_uid uuid:=auth.uid(); v_session public.practice_sessions%rowtype;
  v_contract hnk_private.completion_contract_registry%rowtype;
  v_receipt hnk_private.completion_request_receipts%rowtype;
  v_existing boolean; v_new boolean:=false; v_xp integer; v_awarded integer:=0;
  v_response jsonb; v_source_sha text; v_xp_total integer;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  if nullif(btrim(p_client_completion_id),'') is null then raise exception 'client_completion_id_required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text||':day074:'||p_client_completion_id,0));

  select * into v_receipt from hnk_private.completion_request_receipts
   where user_id=v_uid and client_completion_id=p_client_completion_id for update;
  if found then
    if v_receipt.day<>74 or v_receipt.session_id<>p_session_id or v_receipt.completion_contract_id<>p_completion_contract_id or v_receipt.quest_definition_id<>p_quest_definition_id or v_receipt.canonical_source_sha<>p_canonical_source_sha then raise exception 'client_completion_id_conflict'; end if;
    if v_receipt.response is not null then return v_receipt.response; end if;
  end if;

  select * into v_contract from hnk_private.completion_contract_registry
   where completion_contract_id=p_completion_contract_id and status='active';
  if not found or v_contract.day<>74 or v_contract.quest_definition_id<>p_quest_definition_id or v_contract.canonical_source_sha<>p_canonical_source_sha or v_contract.validator_key<>'day074_v1' then raise exception 'completion_contract_not_found'; end if;

  select xp,source_sha into v_xp,v_source_sha from public.codex_days where day=74 and status='canon';
  if v_xp is null then raise exception 'canonical_day_not_found'; end if;
  if v_source_sha<>p_canonical_source_sha then raise exception 'canonical_source_sha_stale'; end if;

  if not exists(select 1 from public.day_completions where user_id=v_uid and day=73) then raise exception 'day074_requires_portal073'; end if;

  select * into v_session from public.practice_sessions where id=p_session_id and user_id=v_uid and day=74 for update;
  if not found then raise exception 'practice_session_not_found'; end if;
  if v_session.state not in ('evidence_pending','complete') then raise exception 'practice_session_not_ready'; end if;
  if v_session.evidence->>'session_id'<>p_session_id::text then raise exception 'completion_evidence_session_mismatch'; end if;
  perform hnk_private.validate_day074_completion_v1(v_session.evidence,p_canonical_source_sha);

  select exists(select 1 from public.day_completions where user_id=v_uid and day=74) into v_existing;
  if not v_existing then
    insert into hnk_private.completion_request_receipts(user_id,client_completion_id,day,session_id,completion_contract_id,quest_definition_id,canonical_source_sha)
    values(v_uid,p_client_completion_id,74,p_session_id,p_completion_contract_id,p_quest_definition_id,p_canonical_source_sha)
    on conflict (user_id,client_completion_id) do nothing;

    insert into public.day_completions(user_id,day,completion_version,local_record_hash,client_completed_at,first_completion_session_id)
    values(v_uid,74,v_contract.contract_version,p_local_record_hash,p_client_completed_at,p_session_id)
    on conflict (user_id,day) do nothing returning true into v_new;
    v_new:=coalesce(v_new,false);

    if v_new then
      insert into public.xp_events(user_id,day,source,amount,idempotency_key,metadata)
      values(v_uid,74,'canonical_day_completion',v_xp,
        v_uid::text||':day:74:completion:'||v_contract.contract_version,
        jsonb_build_object('practice_session_id',p_session_id,'completion_contract_id',p_completion_contract_id,'quest_definition_id',p_quest_definition_id,'canonical_source_sha',p_canonical_source_sha,'completion_version',v_contract.contract_version,'client_completion_id',p_client_completion_id))
      on conflict (idempotency_key) do nothing returning amount into v_awarded;
      v_awarded:=coalesce(v_awarded,0);
      insert into public.user_progress(user_id) values(v_uid) on conflict(user_id) do nothing;
      update public.user_progress set xp_total=xp_total+v_awarded,current_day=greatest(current_day,75),updated_at=now() where user_id=v_uid;
    end if;
  else
    v_awarded:=0;
  end if;

  update public.practice_sessions set state='complete',ended_at=coalesce(ended_at,now()),local_record_hash=coalesce(p_local_record_hash,local_record_hash),updated_at=now() where id=p_session_id;
  insert into public.user_progress(user_id) values(v_uid) on conflict(user_id) do nothing;
  select xp_total into v_xp_total from public.user_progress where user_id=v_uid;

  v_response:=jsonb_build_object('day',74,'completion_contract_id',p_completion_contract_id,'quest_definition_id',p_quest_definition_id,'canonical_source_sha',p_canonical_source_sha,'first_completion',v_new,'xp_awarded',v_awarded,'xp_total',v_xp_total,'day075_unlocked',true,'day075_auto_started',false);
  insert into hnk_private.completion_request_receipts(user_id,client_completion_id,day,session_id,completion_contract_id,quest_definition_id,canonical_source_sha,response)
  values(v_uid,p_client_completion_id,74,p_session_id,p_completion_contract_id,p_quest_definition_id,p_canonical_source_sha,v_response)
  on conflict(user_id,client_completion_id) do update set response=excluded.response,updated_at=now();
  return v_response;
end; $$;
revoke all on function public.complete_day074_v1(uuid,text,text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.complete_day074_v1(uuid,text,text,text,text,text,timestamptz) to authenticated;
