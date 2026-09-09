create or replace function hnk_private.validate_day013_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$
declare
  v jsonb;
  n numeric;
  r text;
begin
  if jsonb_typeof(p_evidence)<>'object' then raise exception 'day013_evidence_object_required'; end if;
  if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day013_unknown_top_field'; end if;
  if p_evidence->>'protocol_version'<>'HNK-KETHER-D013-V1' then raise exception 'day013_protocol_invalid'; end if;
  if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'b8203e7443af20298679c8f4ca84339e7815438a' then raise exception 'day013_source_sha_invalid'; end if;
  if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day013_session_required'; end if;
  if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day013_mode_invalid'; end if;
  if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day013_voluntary_completion_required'; end if;
  if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred')<>'boolean' then raise exception 'day013_safety_stop_invalid'; end if;

  if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day013_jachin_required'; end if;
  if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','last_valid_number','distraction_count','returned_without_irritation_confirmed','return_strategy_vault_entry_ref')) then raise exception 'day013_jachin_unknown_field'; end if;
  v:=p_evidence->'jachin'->'duration_seconds'; if jsonb_typeof(v)<>'number' then raise exception 'day013_jachin_duration_invalid'; end if; n:=(p_evidence->'jachin'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>86400 then raise exception 'day013_jachin_duration_invalid'; end if;
  v:=p_evidence->'jachin'->'last_valid_number'; if jsonb_typeof(v)<>'number' then raise exception 'day013_jachin_number_invalid'; end if; n:=(p_evidence->'jachin'->>'last_valid_number')::numeric; if n<>trunc(n) or n>993 or n< -1000000 or mod(1000-n,7)<>0 then raise exception 'day013_jachin_number_invalid'; end if;
  v:=p_evidence->'jachin'->'distraction_count'; if jsonb_typeof(v)<>'number' then raise exception 'day013_jachin_distraction_count_invalid'; end if; n:=(p_evidence->'jachin'->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>1000000 then raise exception 'day013_jachin_distraction_count_invalid'; end if;
  if p_evidence->'jachin'->'returned_without_irritation_confirmed'<>'true'::jsonb then raise exception 'day013_jachin_return_required'; end if;
  r:=p_evidence->'jachin'->>'return_strategy_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day013_jachin_vault_ref_invalid'; end if;

  if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day013_boaz_required'; end if;
  if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','last_valid_number','error_count','distraction_count','competition_avoidance_confirmed','relaxed_body_confirmed','load_response','first_error_correction_vault_entry_ref')) then raise exception 'day013_boaz_unknown_field'; end if;
  v:=p_evidence->'boaz'->'duration_seconds'; if jsonb_typeof(v)<>'number' then raise exception 'day013_boaz_duration_invalid'; end if; n:=(p_evidence->'boaz'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>86400 then raise exception 'day013_boaz_duration_invalid'; end if;
  v:=p_evidence->'boaz'->'last_valid_number'; if jsonb_typeof(v)<>'number' then raise exception 'day013_boaz_number_invalid'; end if; n:=(p_evidence->'boaz'->>'last_valid_number')::numeric; if n<>trunc(n) or n>993 or n< -1000000 or mod(1000-n,7)<>0 then raise exception 'day013_boaz_number_invalid'; end if;
  foreach r in array array['error_count','distraction_count'] loop
    v:=p_evidence->'boaz'->r; if jsonb_typeof(v)<>'number' then raise exception 'day013_boaz_count_invalid'; end if; n:=(p_evidence->'boaz'->>r)::numeric; if n<>trunc(n) or n<0 or n>1000000 then raise exception 'day013_boaz_count_invalid'; end if;
  end loop;
  if p_evidence->'boaz'->'competition_avoidance_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'relaxed_body_confirmed'<>'true'::jsonb then raise exception 'day013_boaz_method_required'; end if;
  if p_evidence->'boaz'->>'load_response' not in ('NONE','ADJUSTED','STOPPED') then raise exception 'day013_load_response_invalid'; end if;
  r:=p_evidence->'boaz'->>'first_error_correction_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day013_boaz_vault_ref_invalid'; end if;

  if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day013_middle_required'; end if;
  if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','last_valid_number','breath_cue_followed_when_applicable','psalm_91_2_prayer_confirmed','attention_stability_score','discipline_error_return_vault_entry_ref')) then raise exception 'day013_middle_unknown_field'; end if;
  v:=p_evidence->'middle'->'duration_seconds'; if jsonb_typeof(v)<>'number' then raise exception 'day013_middle_duration_invalid'; end if; n:=(p_evidence->'middle'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>86400 then raise exception 'day013_middle_duration_invalid'; end if;
  v:=p_evidence->'middle'->'last_valid_number'; if jsonb_typeof(v)<>'number' then raise exception 'day013_middle_number_invalid'; end if; n:=(p_evidence->'middle'->>'last_valid_number')::numeric; if n<>trunc(n) or n>993 or n< -1000000 or mod(1000-n,7)<>0 then raise exception 'day013_middle_number_invalid'; end if;
  if p_evidence->'middle'->'breath_cue_followed_when_applicable'<>'true'::jsonb or p_evidence->'middle'->'psalm_91_2_prayer_confirmed'<>'true'::jsonb then raise exception 'day013_middle_required'; end if;
  v:=p_evidence->'middle'->'attention_stability_score'; if jsonb_typeof(v)<>'number' then raise exception 'day013_attention_score_invalid'; end if; n:=(p_evidence->'middle'->>'attention_stability_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day013_attention_score_invalid'; end if;
  r:=p_evidence->'middle'->>'discipline_error_return_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day013_middle_vault_ref_invalid'; end if;

  if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day013_soul_mirror_required'; end if;
  if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','dispersion_error_return_vault_entry_ref')) then raise exception 'day013_soul_mirror_unknown_field'; end if;
  if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb then raise exception 'day013_soul_mirror_required'; end if;
  r:=p_evidence->'soul_mirror'->>'dispersion_error_return_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day013_soul_mirror_vault_ref_invalid'; end if;
end$$;

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$
begin
 case p_validator_key
  when 'day001_v2' then perform hnk_private.validate_day001_completion_v2(p_evidence,p_expected_source_sha);
  when 'day002_v1' then perform hnk_private.validate_day002_completion_v1(p_evidence,p_expected_source_sha);
  when 'day003_v1' then perform hnk_private.validate_day003_completion_v1(p_evidence,p_expected_source_sha);
  when 'day004_v1' then perform hnk_private.validate_day004_completion_v1(p_evidence,p_expected_source_sha);
  when 'day005_v1' then perform hnk_private.validate_day005_completion_v1(p_evidence,p_expected_source_sha);
  when 'day006_v1' then perform hnk_private.validate_day006_completion_v1(p_evidence,p_expected_source_sha);
  when 'day007_v1' then perform hnk_private.validate_day007_completion_v1(p_evidence,p_expected_source_sha);
  when 'day008_v1' then perform hnk_private.validate_day008_completion_v1(p_evidence,p_expected_source_sha);
  when 'day009_v1' then perform hnk_private.validate_day009_completion_v1(p_evidence,p_expected_source_sha);
  when 'day010_v1' then perform hnk_private.validate_day010_completion_v1(p_evidence,p_expected_source_sha);
  when 'day011_v1' then perform hnk_private.validate_day011_completion_v1(p_evidence,p_expected_source_sha);
  when 'day012_v1' then perform hnk_private.validate_day012_completion_v1(p_evidence,p_expected_source_sha);
  when 'day013_v1' then perform hnk_private.validate_day013_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'completion_validator_not_supported';
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D013-COMP-V1','HNK-KETHER-D013-V1',13,'b8203e7443af20298679c8f4ca84339e7815438a','1.0.0','day013_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='active',updated_at=now();
