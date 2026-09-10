create or replace function hnk_private.validate_day026_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; resp text; lat jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day026_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day026_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D026-V1' then raise exception 'day026_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '1d3a86fdbee1dad1f7cf7d1590b3e1b63e3f0496' then raise exception 'day026_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day026_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day026_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day026_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day026_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day026_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') x where x not in ('duration_seconds','eyes_closed_confirmed','face_relaxed_confirmed','natural_breathing_confirmed','no_forced_upward_eye_position_confirmed','response','first_sensation_latency_seconds','intensity_score','distraction_count','active_vault_entry_ref')) then raise exception 'day026_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds') is distinct from 'number' or (p_evidence->'jachin'->>'duration_seconds')::numeric is distinct from 420::numeric then raise exception 'day026_active_requires_420_seconds'; end if;
 if p_evidence->'jachin'->'eyes_closed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'face_relaxed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'no_forced_upward_eye_position_confirmed' is distinct from 'true'::jsonb then raise exception 'day026_jachin_requirements'; end if;
 resp:=p_evidence->'jachin'->>'response'; if resp not in ('STRONG','WEAK','ABSENT') then raise exception 'day026_active_response_invalid'; end if;
 lat:=p_evidence->'jachin'->'first_sensation_latency_seconds'; if lat is null or jsonb_typeof(lat)='null' then if resp<>'ABSENT' then raise exception 'day026_active_latency_required_when_present'; end if; else if jsonb_typeof(lat) is distinct from 'number' then raise exception 'day026_active_latency_invalid'; end if; n:=(lat#>>'{}')::numeric; if n<>trunc(n) or n<0 or n>420 then raise exception 'day026_active_latency_invalid'; end if; if resp='ABSENT' then raise exception 'day026_active_latency_must_be_null_when_absent'; end if; end if;
 if jsonb_typeof(p_evidence->'jachin'->'intensity_score') is distinct from 'number' then raise exception 'day026_active_intensity_invalid'; end if; n:=(p_evidence->'jachin'->>'intensity_score')::numeric; if n<>trunc(n) or n<0 or n>10 or (resp='ABSENT' and n<>0) then raise exception 'day026_active_intensity_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'distraction_count') is distinct from 'number' then raise exception 'day026_active_distractions_invalid'; end if; n:=(p_evidence->'jachin'->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day026_active_distractions_invalid'; end if;
 r:=p_evidence->'jachin'->>'active_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day026_active_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day026_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') x where x not in ('duration_seconds','control_point','same_posture_breathing_confirmed','same_environment_context_confirmed','no_formula_confirmed','no_sensation_manufacture_confirmed','response','first_sensation_latency_seconds','intensity_score','distraction_count','cartographies_not_identical_confirmed','data_may_correct_expectation_confirmed','control_vault_entry_ref')) then raise exception 'day026_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'duration_seconds') is distinct from 'number' or (p_evidence->'boaz'->>'duration_seconds')::numeric is distinct from 420::numeric then raise exception 'day026_control_requires_420_seconds'; end if;
 if p_evidence->'boaz'->>'control_point' not in ('NOSE_TIP','HAND_CENTER') then raise exception 'day026_control_point_invalid'; end if;
 if p_evidence->'boaz'->'same_posture_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_environment_context_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_formula_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_sensation_manufacture_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'cartographies_not_identical_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'data_may_correct_expectation_confirmed' is distinct from 'true'::jsonb then raise exception 'day026_boaz_requirements'; end if;
 resp:=p_evidence->'boaz'->>'response'; if resp not in ('STRONG','WEAK','ABSENT') then raise exception 'day026_control_response_invalid'; end if;
 lat:=p_evidence->'boaz'->'first_sensation_latency_seconds'; if lat is null or jsonb_typeof(lat)='null' then if resp<>'ABSENT' then raise exception 'day026_control_latency_required_when_present'; end if; else if jsonb_typeof(lat) is distinct from 'number' then raise exception 'day026_control_latency_invalid'; end if; n:=(lat#>>'{}')::numeric; if n<>trunc(n) or n<0 or n>420 then raise exception 'day026_control_latency_invalid'; end if; if resp='ABSENT' then raise exception 'day026_control_latency_must_be_null_when_absent'; end if; end if;
 if jsonb_typeof(p_evidence->'boaz'->'intensity_score') is distinct from 'number' then raise exception 'day026_control_intensity_invalid'; end if; n:=(p_evidence->'boaz'->>'intensity_score')::numeric; if n<>trunc(n) or n<0 or n>10 or (resp='ABSENT' and n<>0) then raise exception 'day026_control_intensity_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'distraction_count') is distinct from 'number' then raise exception 'day026_control_distractions_invalid'; end if; n:=(p_evidence->'boaz'->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day026_control_distractions_invalid'; end if;
 r:=p_evidence->'boaz'->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day026_control_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day026_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') x where x not in ('active_duration_seconds','silent_observation_seconds','natural_breathing_confirmed','lamed_lamed_he_once_confirmed','psalm_9_11_orientation_confirmed','no_sensation_pursuit_confirmed','e1_e5_recorded_confirmed','brodmann10_brow_focus_not_equivalent_confirmed','phenomenology_not_neural_or_spiritual_proof_confirmed','hypothesis_refined_confirmed','repeatability_criterion_defined_confirmed','integration_vault_entry_ref')) then raise exception 'day026_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'active_duration_seconds') is distinct from 'number' or (p_evidence->'middle'->>'active_duration_seconds')::numeric is distinct from 420::numeric or jsonb_typeof(p_evidence->'middle'->'silent_observation_seconds') is distinct from 'number' or (p_evidence->'middle'->>'silent_observation_seconds')::numeric is distinct from 60::numeric then raise exception 'day026_middle_timing_invalid'; end if;
 if p_evidence->'middle'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'lamed_lamed_he_once_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_9_11_orientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'no_sensation_pursuit_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'e1_e5_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'brodmann10_brow_focus_not_equivalent_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'phenomenology_not_neural_or_spiritual_proof_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'hypothesis_refined_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'repeatability_criterion_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day026_middle_requirements'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day026_integration_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day026_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') x where x not in ('completed','response_attention_image_interpretation_vault_entry_ref')) then raise exception 'day026_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day026_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'response_attention_image_interpretation_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day026_soul_vault_ref_invalid'; end if;
end$$;

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
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
  when 'day014_v1' then perform hnk_private.validate_day014_completion_v1(p_evidence,p_expected_source_sha);
  when 'day015_v1' then perform hnk_private.validate_day015_completion_v1(p_evidence,p_expected_source_sha);
  when 'day016_v1' then perform hnk_private.validate_day016_completion_v1(p_evidence,p_expected_source_sha);
  when 'day017_v1' then perform hnk_private.validate_day017_completion_v1(p_evidence,p_expected_source_sha);
  when 'day018_v1' then perform hnk_private.validate_day018_completion_v1(p_evidence,p_expected_source_sha);
  when 'day019_v1' then perform hnk_private.validate_day019_completion_v1(p_evidence,p_expected_source_sha);
  when 'day020_v1' then perform hnk_private.validate_day020_completion_v1(p_evidence,p_expected_source_sha);
  when 'day021_v1' then perform hnk_private.validate_day021_completion_v1(p_evidence,p_expected_source_sha);
  when 'day022_v1' then perform hnk_private.validate_day022_completion_v1(p_evidence,p_expected_source_sha);
  when 'day023_v1' then perform hnk_private.validate_day023_completion_v1(p_evidence,p_expected_source_sha);
  when 'day024_v1' then perform hnk_private.validate_day024_completion_v1(p_evidence,p_expected_source_sha);
  when 'day025_v1' then perform hnk_private.validate_day025_completion_v1(p_evidence,p_expected_source_sha);
  when 'day026_v1' then perform hnk_private.validate_day026_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D026-COMP-V1','HNK-KETHER-D026-V1',26,'1d3a86fdbee1dad1f7cf7d1590b3e1b63e3f0496','1.0.0','day026_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
