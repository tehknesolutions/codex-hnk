create or replace function hnk_private.validate_day025_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; p text; s text; n numeric; obj jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day025_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','reference','ar_runtime','environment_baseline','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day025_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D025-V1' then raise exception 'day025_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '88336e31521c64b3b43aae06d6d5e221fc77a490' then raise exception 'day025_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day025_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day025_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day025_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day025_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'reference') is distinct from 'object' then raise exception 'day025_reference_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'reference') x where x not in ('canonical_reference_id','master_sha256','family','semantic_master')) then raise exception 'day025_reference_unknown_field'; end if;
 if p_evidence->'reference'->>'canonical_reference_id' is distinct from 'reiki-usui-dai-ko-myo-v1' or p_evidence->'reference'->>'master_sha256' is distinct from '25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0' or p_evidence->'reference'->>'family' is distinct from 'USUI_KANJI' or p_evidence->'reference'->>'semantic_master' is distinct from '大光明' then raise exception 'day025_reference_invalid'; end if;

 if jsonb_typeof(p_evidence->'ar_runtime') is distinct from 'object' then raise exception 'day025_ar_runtime_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'ar_runtime') x where x not in ('tracking_mode','camera_permission_granted','real_world_tracking_confirmed','flat_overlay_used','camera_frames_server_side','camera_frames_persisted')) then raise exception 'day025_ar_runtime_unknown_field'; end if;
 if p_evidence->'ar_runtime'->>'tracking_mode' not in ('WEBXR_IMMERSIVE_AR','NATIVE_ARCORE_ARKIT') then raise exception 'day025_tracking_mode_invalid'; end if;
 if p_evidence->'ar_runtime'->'camera_permission_granted' is distinct from 'true'::jsonb or p_evidence->'ar_runtime'->'real_world_tracking_confirmed' is distinct from 'true'::jsonb then raise exception 'day025_real_ar_required'; end if;
 if p_evidence->'ar_runtime'->'flat_overlay_used' is distinct from 'false'::jsonb then raise exception 'day025_flat_overlay_forbidden'; end if;
 if p_evidence->'ar_runtime'->'camera_frames_server_side' is distinct from 'false'::jsonb or p_evidence->'ar_runtime'->'camera_frames_persisted' is distinct from 'false'::jsonb then raise exception 'day025_camera_frame_privacy_required'; end if;

 if jsonb_typeof(p_evidence->'environment_baseline') is distinct from 'object' then raise exception 'day025_environment_baseline_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'environment_baseline') x where x not in ('recorded','vault_entry_ref')) then raise exception 'day025_environment_baseline_unknown_field'; end if;
 if p_evidence->'environment_baseline'->'recorded' is distinct from 'true'::jsonb then raise exception 'day025_environment_baseline_required'; end if;
 r:=p_evidence->'environment_baseline'->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day025_baseline_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day025_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') x where x not in ('duration_seconds','tracked_seconds','world_anchor_established_confirmed','dai_koo_myo_world_space_confirmed','natural_breathing_confirmed','four_points_ordered','point_scores','active_environment_map_vault_entry_ref')) then raise exception 'day025_jachin_unknown_field'; end if;
 if (p_evidence->'jachin'->>'duration_seconds')::numeric is distinct from 420::numeric or (p_evidence->'jachin'->>'tracked_seconds')::numeric is distinct from 420::numeric then raise exception 'day025_active_tracking_requires_420_seconds'; end if;
 if p_evidence->'jachin'->'world_anchor_established_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'dai_koo_myo_world_space_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'natural_breathing_confirmed' is distinct from 'true'::jsonb then raise exception 'day025_jachin_requirements'; end if;
 if p_evidence->'jachin'->'four_points_ordered' is distinct from '["P1","P2","P3","P4"]'::jsonb then raise exception 'day025_point_order_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'point_scores') is distinct from 'object' then raise exception 'day025_active_scores_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin'->'point_scores') x where x not in ('P1','P2','P3','P4')) then raise exception 'day025_active_point_unknown'; end if;
 foreach p in array array['P1','P2','P3','P4'] loop obj:=p_evidence->'jachin'->'point_scores'->p; if jsonb_typeof(obj) is distinct from 'object' then raise exception 'day025_active_point_required'; end if; if exists(select 1 from jsonb_object_keys(obj) x where x not in ('focus','comfort','silence','presence','meditation_readiness')) then raise exception 'day025_active_score_unknown_field'; end if; foreach s in array array['focus','comfort','silence','presence','meditation_readiness'] loop if jsonb_typeof(obj->s) is distinct from 'number' then raise exception 'day025_active_score_invalid'; end if; n:=(obj->>s)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day025_active_score_invalid'; end if; end loop; end loop;
 r:=p_evidence->'jachin'->>'active_environment_map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day025_active_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day025_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') x where x not in ('duration_seconds','camera_active_seconds','same_environment_confirmed','same_route_confirmed','same_point_order_confirmed','approximate_time_and_lighting_preserved_confirmed','ar_symbol_absent_confirmed','formula_absent_confirmed','expectation_acknowledged_confirmed','four_points_ordered','point_scores','competing_environmental_variable_identified_confirmed','single_episode_not_definitive_confirmed','control_environment_map_vault_entry_ref')) then raise exception 'day025_boaz_unknown_field'; end if;
 if (p_evidence->'boaz'->>'duration_seconds')::numeric is distinct from 420::numeric or (p_evidence->'boaz'->>'camera_active_seconds')::numeric is distinct from 420::numeric then raise exception 'day025_control_requires_420_seconds'; end if;
 if p_evidence->'boaz'->'same_environment_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_route_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_point_order_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'approximate_time_and_lighting_preserved_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'ar_symbol_absent_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'formula_absent_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'expectation_acknowledged_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'competing_environmental_variable_identified_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'single_episode_not_definitive_confirmed' is distinct from 'true'::jsonb then raise exception 'day025_boaz_requirements'; end if;
 if p_evidence->'boaz'->'four_points_ordered' is distinct from '["P1","P2","P3","P4"]'::jsonb then raise exception 'day025_control_point_order_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'point_scores') is distinct from 'object' then raise exception 'day025_control_scores_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz'->'point_scores') x where x not in ('P1','P2','P3','P4')) then raise exception 'day025_control_point_unknown'; end if;
 foreach p in array array['P1','P2','P3','P4'] loop obj:=p_evidence->'boaz'->'point_scores'->p; if jsonb_typeof(obj) is distinct from 'object' then raise exception 'day025_control_point_required'; end if; if exists(select 1 from jsonb_object_keys(obj) x where x not in ('focus','comfort','silence','presence','meditation_readiness')) then raise exception 'day025_control_score_unknown_field'; end if; foreach s in array array['focus','comfort','silence','presence','meditation_readiness'] loop if jsonb_typeof(obj->s) is distinct from 'number' then raise exception 'day025_control_score_invalid'; end if; n:=(obj->>s)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day025_control_score_invalid'; end if; end loop; end loop;
 r:=p_evidence->'boaz'->>'control_environment_map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day025_control_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day025_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') x where x not in ('duration_seconds','tracked_seconds','silent_observation_seconds','world_anchor_reestablished_confirmed','same_four_points_order_confirmed','mem_he_shin_once_per_point_confirmed','psalm_34_4_orientation_confirmed','five_domains_recorded_confirmed','environmental_signature_not_objective_energy_proof_confirmed','hypothesis_refined_confirmed','objective_repeatability_criterion_defined_confirmed','integration_environment_map_vault_entry_ref')) then raise exception 'day025_middle_unknown_field'; end if;
 if (p_evidence->'middle'->>'duration_seconds')::numeric is distinct from 420::numeric or (p_evidence->'middle'->>'tracked_seconds')::numeric is distinct from 420::numeric then raise exception 'day025_middle_tracking_requires_420_seconds'; end if;
 if (p_evidence->'middle'->>'silent_observation_seconds')::numeric is distinct from 60::numeric then raise exception 'day025_middle_silence_requires_60_seconds'; end if;
 if p_evidence->'middle'->'world_anchor_reestablished_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'same_four_points_order_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'mem_he_shin_once_per_point_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_34_4_orientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'five_domains_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'environmental_signature_not_objective_energy_proof_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'hypothesis_refined_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'objective_repeatability_criterion_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day025_middle_requirements'; end if;
 r:=p_evidence->'middle'->>'integration_environment_map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day025_integration_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day025_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') x where x not in ('completed','physical_configuration_operator_expectation_interaction_constant_parameter_vault_entry_ref')) then raise exception 'day025_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day025_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'physical_configuration_operator_expectation_interaction_constant_parameter_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day025_soul_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D025-COMP-V1','HNK-KETHER-D025-V1',25,'88336e31521c64b3b43aae06d6d5e221fc77a490','1.0.0','day025_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
