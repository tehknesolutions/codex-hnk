-- HNK CODEX — Day 004 Completion Contract V1 reviewed.
-- Applied to Supabase project codex-hnk-app as migration 20260908222937.

create or replace function hnk_private.validate_day004_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void
language plpgsql
set search_path=''
as $$
declare
  v_key text;
  v_item text;
  v_allowed_phenomenology constant text[]:=array['WARMTH','CALM','IMAGERY','AGITATION','BODY_SENSATIONS','NO_NOTICEABLE_CHANGE','STRONG_EMOTION','OTHER'];
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key<>all(array['protocol_version','source_sha','session_id','mode','experiment','jachin','audio_theta432','boaz','middle','phenomenology','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred']) then raise exception 'day004_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->>'protocol_version'<>'HNK-KETHER-D004-V1' then raise exception 'completion_evidence_protocol_mismatch'; end if;
  if p_evidence->>'source_sha'<>p_expected_source_sha then raise exception 'completion_evidence_source_sha_mismatch'; end if;
  if jsonb_typeof(p_evidence->'session_id')<>'string' or nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day004_session_id_required'; end if;

  if jsonb_typeof(p_evidence->'experiment')<>'object' then raise exception 'day004_experiment_incomplete'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{experiment,expectation_before}') or (p_evidence#>>'{experiment,expectation_before}')::integer>10 then raise exception 'day004_experiment_rating_invalid'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{experiment,body_state_before}') or (p_evidence#>>'{experiment,body_state_before}')::integer>10 then raise exception 'day004_experiment_rating_invalid'; end if;
  if p_evidence#>'{experiment,observation_recorded}'<>'true'::jsonb then raise exception 'day004_experiment_observation_required'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{experiment,perceived_change_after}') or (p_evidence#>>'{experiment,perceived_change_after}')::integer>10 then raise exception 'day004_experiment_rating_invalid'; end if;
  if not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence#>'{experiment,observation_vault_entry_ref}') then raise exception 'day004_experiment_vault_ref_invalid'; end if;

  if jsonb_typeof(p_evidence->'jachin')<>'object' or p_evidence#>'{jachin,visualization_completed}'<>'true'::jsonb or p_evidence#>'{jachin,return_confirmed}'<>'true'::jsonb then raise exception 'day004_jachin_incomplete'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{jachin,duration_seconds}') then raise exception 'day004_jachin_duration_invalid'; end if;
  if p_evidence#>'{jachin,comfort_rating}' is not null and (not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{jachin,comfort_rating}') or (p_evidence#>>'{jachin,comfort_rating}')::integer>10) then raise exception 'day004_jachin_comfort_invalid'; end if;

  if jsonb_typeof(p_evidence->'audio_theta432')<>'object' or p_evidence#>'{audio_theta432,started}'<>'true'::jsonb or p_evidence#>>'{audio_theta432,profile_id}'<>'HNK-THETA432-BINAURAL-V1' then raise exception 'day004_audio_profile_invalid'; end if;
  if p_evidence#>'{audio_theta432,duration_seconds}' is not null and not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{audio_theta432,duration_seconds}') then raise exception 'day004_audio_duration_invalid'; end if;

  if jsonb_typeof(p_evidence->'boaz')<>'object' or p_evidence#>'{boaz,monitor_completed}'<>'true'::jsonb or p_evidence#>'{boaz,trigger_recorded}'<>'true'::jsonb or p_evidence#>'{boaz,return_confirmed}'<>'true'::jsonb then raise exception 'day004_boaz_incomplete'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{boaz,duration_seconds}') or not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{boaz,pattern_notices}') then raise exception 'day004_boaz_metrics_invalid'; end if;
  if not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence#>'{boaz,trigger_vault_entry_ref}') then raise exception 'day004_boaz_vault_ref_invalid'; end if;

  if jsonb_typeof(p_evidence->'middle')<>'object' or p_evidence#>'{middle,swish_completed}'<>'true'::jsonb or p_evidence#>'{middle,observation_recorded}'<>'true'::jsonb or p_evidence#>'{middle,return_confirmed}'<>'true'::jsonb then raise exception 'day004_middle_incomplete'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{middle,target_state_before}') or (p_evidence#>>'{middle,target_state_before}')::integer>10 then raise exception 'day004_middle_rating_invalid'; end if;
  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{middle,perceived_change_after}') or (p_evidence#>>'{middle,perceived_change_after}')::integer>10 then raise exception 'day004_middle_rating_invalid'; end if;
  if not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence#>'{middle,observation_vault_entry_ref}') then raise exception 'day004_middle_vault_ref_invalid'; end if;

  if p_evidence?'phenomenology' then
    if jsonb_typeof(p_evidence->'phenomenology')<>'array' then raise exception 'day004_phenomenology_invalid'; end if;
    for v_item in select value from jsonb_array_elements_text(p_evidence->'phenomenology') loop
      if v_item<>all(v_allowed_phenomenology) then raise exception 'day004_phenomenology_invalid'; end if;
    end loop;
  end if;

  if jsonb_typeof(p_evidence->'soul_mirror')<>'object' or p_evidence#>'{soul_mirror,completed}'<>'true'::jsonb then raise exception 'day004_soul_mirror_incomplete'; end if;
  if p_evidence#>'{soul_mirror,difficulty_rating}' is not null and (not hnk_private.jsonb_is_nonnegative_integer(p_evidence#>'{soul_mirror,difficulty_rating}') or (p_evidence#>>'{soul_mirror,difficulty_rating}')::integer>10) then raise exception 'day004_soul_mirror_rating_invalid'; end if;
  if not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence#>'{soul_mirror,vault_entry_ref}') then raise exception 'day004_soul_mirror_vault_ref_invalid'; end if;
  if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'voluntary_completion_required'; end if;
end;
$$;
revoke all on function hnk_private.validate_day004_completion_v1(jsonb,text) from public,anon,authenticated;

insert into hnk_private.completion_contract_registry(
  completion_contract_id,day,contract_version,quest_definition_id,canonical_source_sha,validator_key,status
) values(
  'HNK-KETHER-D004-COMP-V1',4,'1','HNK-KETHER-D004-V1','376964a263f3d4f07542fcf55ca3bf2c18c5fd94','day004_v1','reviewed'
)
on conflict(completion_contract_id) do update set
  day=excluded.day,contract_version=excluded.contract_version,quest_definition_id=excluded.quest_definition_id,
  canonical_source_sha=excluded.canonical_source_sha,validator_key=excluded.validator_key,status=excluded.status,updated_at=now();

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
begin
  case p_validator_key
    when 'day001_v2' then perform hnk_private.validate_day001_completion_v2(p_evidence,p_expected_source_sha);
    when 'day002_v1' then perform hnk_private.validate_day002_completion_v1(p_evidence,p_expected_source_sha);
    when 'day003_v1' then perform hnk_private.validate_day003_completion_v1(p_evidence,p_expected_source_sha);
    when 'day004_v1' then perform hnk_private.validate_day004_completion_v1(p_evidence,p_expected_source_sha);
    else raise exception 'completion_validator_not_supported';
  end case;
end;
$$;
revoke all on function hnk_private.validate_completion_contract_v2(text,jsonb,text) from public,anon,authenticated;
