create or replace function hnk_private.validate_day027_visual_metrics_v1(p_metrics jsonb,p_label text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; result_value text; latency jsonb; recovery jsonb; disappearances integer; max_cont integer;
begin
 if jsonb_typeof(p_metrics) is distinct from 'object' then raise exception '%_metrics_required',p_label; end if;
 if exists(select 1 from jsonb_object_keys(p_metrics) x where x not in ('result','initial_latency_seconds','max_continuous_seconds','disappearance_count','average_recovery_seconds','sharpness_score','brightness_score','color_fidelity_score','centrality_score','ocular_stability_score')) then raise exception '%_metrics_unknown_field',p_label; end if;
 result_value:=p_metrics->>'result'; if result_value not in ('STABLE','INTERMITTENT','ABSENT') then raise exception '%_result_invalid',p_label; end if;
 latency:=p_metrics->'initial_latency_seconds';
 if latency is null or jsonb_typeof(latency)='null' then if result_value<>'ABSENT' then raise exception '%_latency_required_when_present',p_label; end if;
 else if jsonb_typeof(latency) is distinct from 'number' then raise exception '%_latency_invalid',p_label; end if; n:=(latency#>>'{}')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception '%_latency_invalid',p_label; end if; if result_value='ABSENT' then raise exception '%_latency_must_be_null_when_absent',p_label; end if; end if;
 if jsonb_typeof(p_metrics->'max_continuous_seconds') is distinct from 'number' then raise exception '%_max_continuous_invalid',p_label; end if;
 n:=(p_metrics->>'max_continuous_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception '%_max_continuous_invalid',p_label; end if; max_cont:=n::integer;
 if result_value='ABSENT' and max_cont<>0 then raise exception '%_max_continuous_must_be_zero_when_absent',p_label; end if;
 if result_value<>'ABSENT' and max_cont=0 then raise exception '%_max_continuous_required_when_present',p_label; end if;
 if jsonb_typeof(p_metrics->'disappearance_count') is distinct from 'number' then raise exception '%_disappearance_count_invalid',p_label; end if;
 n:=(p_metrics->>'disappearance_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception '%_disappearance_count_invalid',p_label; end if; disappearances:=n::integer;
 recovery:=p_metrics->'average_recovery_seconds';
 if recovery is null or jsonb_typeof(recovery)='null' then null;
 else if jsonb_typeof(recovery) is distinct from 'number' then raise exception '%_average_recovery_invalid',p_label; end if; n:=(recovery#>>'{}')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception '%_average_recovery_invalid',p_label; end if; if disappearances=0 then raise exception '%_average_recovery_requires_disappearance',p_label; end if; if result_value='ABSENT' then raise exception '%_average_recovery_must_be_null_when_absent',p_label; end if; end if;
 foreach r in array array['sharpness_score','brightness_score','color_fidelity_score','centrality_score','ocular_stability_score'] loop if jsonb_typeof(p_metrics->r) is distinct from 'number' then raise exception '%_%_invalid',p_label,r; end if; n:=(p_metrics->>r)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception '%_%_invalid',p_label,r; end if; end loop;
 if result_value='ABSENT' and ((p_metrics->>'sharpness_score')::int<>0 or (p_metrics->>'brightness_score')::int<>0 or (p_metrics->>'color_fidelity_score')::int<>0 or (p_metrics->>'centrality_score')::int<>0) then raise exception '%_visual_scores_must_be_zero_when_absent',p_label; end if;
end$$;

create or replace function hnk_private.validate_day027_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day027_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day027_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D027-V1' then raise exception 'day027_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'f3238116f4bf63b54c1bf7e34d6accb58afbef06' then raise exception 'day027_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day027_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day027_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day027_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day027_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day027_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') x where x not in ('duration_seconds','dark_or_low_light_confirmed','eyes_closed_confirmed','ocular_relaxation_confirmed','no_eyelid_squeezing_confirmed','no_voluntary_eye_movement_confirmed','natural_breathing_confirmed','blue_pearl_construction_attempted','metrics','active_vault_entry_ref')) then raise exception 'day027_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds') is distinct from 'number' or (p_evidence->'jachin'->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day027_active_requires_600_seconds'; end if;
 if p_evidence->'jachin'->'dark_or_low_light_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'eyes_closed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'ocular_relaxation_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'no_eyelid_squeezing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'no_voluntary_eye_movement_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'blue_pearl_construction_attempted' is distinct from 'true'::jsonb then raise exception 'day027_jachin_requirements'; end if;
 perform hnk_private.validate_day027_visual_metrics_v1(p_evidence->'jachin'->'metrics','day027_active');
 r:=p_evidence->'jachin'->>'active_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day027_active_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day027_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') x where x not in ('duration_seconds','gray_point_same_size_confirmed','gray_point_same_position_confirmed','same_lighting_confirmed','approximate_time_posture_preserved_confirmed','same_breathing_confirmed','no_formula_confirmed','control_not_sabotaged_confirmed','metrics','spontaneous_visual_phenomena_not_automatic_spiritual_proof_confirmed','data_may_correct_expectation_confirmed','control_vault_entry_ref')) then raise exception 'day027_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'duration_seconds') is distinct from 'number' or (p_evidence->'boaz'->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day027_control_requires_600_seconds'; end if;
 if p_evidence->'boaz'->'gray_point_same_size_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'gray_point_same_position_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_lighting_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'approximate_time_posture_preserved_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_formula_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'control_not_sabotaged_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'spontaneous_visual_phenomena_not_automatic_spiritual_proof_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'data_may_correct_expectation_confirmed' is distinct from 'true'::jsonb then raise exception 'day027_boaz_requirements'; end if;
 perform hnk_private.validate_day027_visual_metrics_v1(p_evidence->'boaz'->'metrics','day027_control');
 r:=p_evidence->'boaz'->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day027_control_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day027_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') x where x not in ('active_duration_seconds','silent_observation_seconds','eyes_relaxed_confirmed','natural_breathing_confirmed','lamed_lamed_he_once_confirmed','psalm_9_11_orientation_confirmed','no_visual_pursuit_confirmed','e1_e5_recorded_confirmed','construction_spontaneous_interpretation_separated_confirmed','sinal_astral_traditional_classification_not_origin_proof_confirmed','single_session_not_definitive_confirmed','hypothesis_refined_confirmed','repeatability_criterion_defined_confirmed','integration_vault_entry_ref')) then raise exception 'day027_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'active_duration_seconds') is distinct from 'number' or (p_evidence->'middle'->>'active_duration_seconds')::numeric is distinct from 600::numeric or jsonb_typeof(p_evidence->'middle'->'silent_observation_seconds') is distinct from 'number' or (p_evidence->'middle'->>'silent_observation_seconds')::numeric is distinct from 60::numeric then raise exception 'day027_middle_timing_invalid'; end if;
 if p_evidence->'middle'->'eyes_relaxed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'lamed_lamed_he_once_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_9_11_orientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'no_visual_pursuit_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'e1_e5_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'construction_spontaneous_interpretation_separated_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'sinal_astral_traditional_classification_not_origin_proof_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'single_session_not_definitive_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'hypothesis_refined_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'repeatability_criterion_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day027_middle_requirements'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day027_integration_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day027_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') x where x not in ('completed','stability_reconstruction_control_difference_vault_entry_ref')) then raise exception 'day027_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day027_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'stability_reconstruction_control_difference_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day027_soul_vault_ref_invalid'; end if;
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
  when 'day027_v1' then perform hnk_private.validate_day027_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D027-COMP-V1','HNK-KETHER-D027-V1',27,'f3238116f4bf63b54c1bf7e34d6accb58afbef06','1.0.0','day027_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
