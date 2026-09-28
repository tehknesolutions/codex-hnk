-- HNK CODEX — Day 074 / Binah Completion Contract V1
-- Extends the existing Completion V2 pipeline. Private prose stays in the E2EE Vault;
-- practice_sessions.evidence carries structural evidence and an opaque Vault reference only.

insert into hnk_private.completion_contract_registry (
  completion_contract_id, quest_definition_id, day, canonical_source_sha,
  contract_version, validator_key, status
)
select
  'HNK-BINAH-D074-COMP-V1', 'HNK-BINAH-D074-V1', 74,
  source_sha, '1', 'day074_v1', 'active'
from public.codex_days
where day = 74 and status = 'canon'
on conflict (completion_contract_id) do update
set quest_definition_id=excluded.quest_definition_id, day=excluded.day,
    canonical_source_sha=excluded.canonical_source_sha, contract_version=excluded.contract_version,
    validator_key=excluded.validator_key, status=excluded.status, updated_at=now();

create or replace function hnk_private.validate_day074_completion_v1(
  p_evidence jsonb,
  p_expected_source_sha text
) returns void
language plpgsql
set search_path = ''
as $$
declare v_key text;
begin
  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then raise exception 'evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_version','source_sha','session_id','mode','self_accusation_count',
      'omissions_reviewed_confirmed','observation_interpretation_belief_separated_confirmed',
      'private_vault_entry_ref','private_vault_e2ee_confirmed','practice_record_no_private_prose_confirmed',
      'voluntary_completion_confirmed','next_day_not_auto_started_confirmed'
    ]) then raise exception 'day074_evidence_unknown_field'; end if;
  end loop;
  if p_evidence ->> 'protocol_version' <> 'HNK-BINAH-D074-V1' then raise exception 'completion_evidence_protocol_mismatch'; end if;
  if p_evidence ->> 'source_sha' <> p_expected_source_sha then raise exception 'completion_evidence_source_sha_mismatch'; end if;
  if nullif(btrim(p_evidence ->> 'session_id'),'') is null then raise exception 'day074_session_id_required'; end if;
  if p_evidence ? 'mode' and p_evidence ->> 'mode' not in ('first_completion','revisit') then raise exception 'day074_mode_invalid'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'self_accusation_count')
     or (p_evidence ->> 'self_accusation_count')::integer <> 3 then raise exception 'day074_exactly_three_entries_required'; end if;
  if p_evidence -> 'omissions_reviewed_confirmed' <> 'true'::jsonb then raise exception 'day074_omissions_review_required'; end if;
  if p_evidence -> 'observation_interpretation_belief_separated_confirmed' <> 'true'::jsonb then raise exception 'day074_epistemic_separation_required'; end if;
  if not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence -> 'private_vault_entry_ref')
     or p_evidence -> 'private_vault_entry_ref' is null or p_evidence -> 'private_vault_entry_ref' = 'null'::jsonb
  then raise exception 'day074_vault_ref_required'; end if;
  if p_evidence -> 'private_vault_e2ee_confirmed' <> 'true'::jsonb then raise exception 'day074_vault_e2ee_required'; end if;
  if p_evidence -> 'practice_record_no_private_prose_confirmed' <> 'true'::jsonb then raise exception 'day074_private_prose_boundary_required'; end if;
  if p_evidence -> 'voluntary_completion_confirmed' <> 'true'::jsonb then raise exception 'day074_voluntary_completion_required'; end if;
  if p_evidence -> 'next_day_not_auto_started_confirmed' <> 'true'::jsonb then raise exception 'day074_no_auto_start_required'; end if;
end;
$$;
revoke all on function hnk_private.validate_day074_completion_v1(jsonb,text) from public,anon,authenticated;

-- Patch the generic V2 implementation to support Day074 while preserving its receipt,
-- advisory-lock, canonical-source, XP-event and user_progress transaction semantics.
-- PostgreSQL stores the function body below as the current generic implementation.
create or replace function hnk_private.validate_completion_evidence_v2(
  p_validator_key text, p_evidence jsonb, p_expected_source_sha text
) returns void
language plpgsql
set search_path = ''
as $$
begin
  case p_validator_key
    when 'day001_v2' then perform hnk_private.validate_day001_completion_v2(p_evidence,p_expected_source_sha);
    when 'day074_v1' then perform hnk_private.validate_day074_completion_v1(p_evidence,p_expected_source_sha);
    else raise exception 'completion_validator_not_supported';
  end case;
end;
$$;
revoke all on function hnk_private.validate_completion_evidence_v2(text,jsonb,text) from public,anon,authenticated;

-- Day074 wrapper: validates prerequisite Portal073, then delegates all mutation/idempotency/XP
-- to the established complete_codex_day_v2 pipeline. It never receives private prose.
create or replace function public.complete_day074_v1(
  p_session_id uuid,
  p_completion_contract_id text,
  p_quest_definition_id text,
  p_canonical_source_sha text,
  p_client_completion_id text,
  p_local_record_hash text default null,
  p_client_completed_at timestamptz default null
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare v_uid uuid := auth.uid(); v_response jsonb;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  if not exists(select 1 from public.day_completions where user_id=v_uid and day=73) then
    raise exception 'day074_requires_portal073';
  end if;
  -- Fail closed until the generic completion V2 implementation dispatches day074_v1.
  -- This avoids duplicating the transaction engine or granting XP through a parallel path.
  if not exists(
    select 1 from hnk_private.completion_contract_registry
    where completion_contract_id=p_completion_contract_id and day=74
      and quest_definition_id=p_quest_definition_id and canonical_source_sha=p_canonical_source_sha
      and validator_key='day074_v1' and status='active'
  ) then raise exception 'completion_contract_not_found'; end if;
  raise exception 'day074_generic_dispatch_pending';
end;
$$;
revoke all on function public.complete_day074_v1(uuid,text,text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.complete_day074_v1(uuid,text,text,text,text,text,timestamptz) to authenticated;
