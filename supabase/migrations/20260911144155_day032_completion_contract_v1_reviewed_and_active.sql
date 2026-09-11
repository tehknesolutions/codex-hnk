create or replace function hnk_private.validate_day032_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; k text; v_j jsonb; v_b jsonb; v_m jsonb; v_s jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day032_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz_control','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day032_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D032-V1' then raise exception 'day032_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'e769394099a40802b45b9d5d269e1545dc5c4cf5' then raise exception 'day032_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day032_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day032_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day032_voluntary_completion_required'; end if;
 if not(p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day032_safety_stop_invalid'; end if;

 v_j:=p_evidence->'jachin'; if jsonb_typeof(v_j) is distinct from 'object' then raise exception 'day032_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_j) x where x not in ('descent_seconds','floors_completed','final_level_seconds','return_seconds','supported_position_confirmed','eyes_closed_or_safe_equivalent_confirmed','natural_breathing_confirmed','orientation_thread_preserved_confirmed','memory_continuity_confirmed','voluntary_return_confirmed','no_specific_marker_required_confirmed','critical_floor','predominant_marker','depth_score','distraction_count','return_clarity_score','jachin_vault_entry_ref')) then raise exception 'day032_jachin_unknown_field'; end if;
 foreach k in array array['descent_seconds','return_seconds'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day032_jachin_measured_time_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<1 or n>7200 then raise exception 'day032_jachin_measured_time_invalid'; end if; end loop;
 if jsonb_typeof(v_j->'floors_completed') is distinct from 'number' or (v_j->>'floors_completed')::numeric is distinct from 7::numeric then raise exception 'day032_jachin_seven_floors_required'; end if;
 if jsonb_typeof(v_j->'final_level_seconds') is distinct from 'number' or (v_j->>'final_level_seconds')::numeric is distinct from 180::numeric then raise exception 'day032_jachin_final_180_required'; end if;
 if v_j->'supported_position_confirmed' is distinct from 'true'::jsonb or v_j->'eyes_closed_or_safe_equivalent_confirmed' is distinct from 'true'::jsonb or v_j->'natural_breathing_confirmed' is distinct from 'true'::jsonb or v_j->'orientation_thread_preserved_confirmed' is distinct from 'true'::jsonb or v_j->'memory_continuity_confirmed' is distinct from 'true'::jsonb or v_j->'voluntary_return_confirmed' is distinct from 'true'::jsonb or v_j->'no_specific_marker_required_confirmed' is distinct from 'true'::jsonb then raise exception 'day032_jachin_boundaries_required'; end if;
 if not(v_j?'critical_floor') then raise exception 'day032_jachin_critical_floor_required'; end if; if v_j->'critical_floor'<>'null'::jsonb then if jsonb_typeof(v_j->'critical_floor') is distinct from 'number' then raise exception 'day032_jachin_critical_floor_invalid'; end if; n:=(v_j->>'critical_floor')::numeric; if n<>trunc(n) or n<1 or n>7 then raise exception 'day032_jachin_critical_floor_invalid'; end if; end if;
 if coalesce(v_j->>'predominant_marker','') not in ('BREATH_SLOWER','WEIGHT','WARMTH','QUIET','FOCUS','COMFORTABLE_IMMOBILITY','DEPTH','MIXED','NONE') then raise exception 'day032_jachin_marker_invalid'; end if;
 foreach k in array array['depth_score','return_clarity_score'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day032_jachin_score_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day032_jachin_score_invalid'; end if; end loop;
 if jsonb_typeof(v_j->'distraction_count') is distinct from 'number' then raise exception 'day032_jachin_distractions_invalid'; end if; n:=(v_j->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day032_jachin_distractions_invalid'; end if;
 r:=v_j->>'jachin_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day032_jachin_vault_ref_invalid'; end if;

 v_b:=p_evidence->'boaz_control'; if jsonb_typeof(v_b) is distinct from 'object' then raise exception 'day032_boaz_control_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_b) x where x not in ('count_down_seconds','final_silence_seconds','return_count_seconds','same_or_comparable_posture_environment_time_confirmed','natural_breathing_confirmed','no_elevator_or_descent_imagery_confirmed','no_depth_or_anesthesia_imagery_confirmed','no_theurgic_formula_confirmed','five_objects_named_after_confirmed','hands_and_feet_moved_after_confirmed','depth_score','relaxation_score','sleepiness_score','distraction_count','return_clarity_score','control_vault_entry_ref')) then raise exception 'day032_boaz_unknown_field'; end if;
 foreach k in array array['count_down_seconds','return_count_seconds'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day032_boaz_measured_time_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<1 or n>7200 then raise exception 'day032_boaz_measured_time_invalid'; end if; end loop;
 if jsonb_typeof(v_b->'final_silence_seconds') is distinct from 'number' or (v_b->>'final_silence_seconds')::numeric is distinct from 180::numeric then raise exception 'day032_boaz_final_180_required'; end if;
 if v_b->'same_or_comparable_posture_environment_time_confirmed' is distinct from 'true'::jsonb or v_b->'natural_breathing_confirmed' is distinct from 'true'::jsonb or v_b->'no_elevator_or_descent_imagery_confirmed' is distinct from 'true'::jsonb or v_b->'no_depth_or_anesthesia_imagery_confirmed' is distinct from 'true'::jsonb or v_b->'no_theurgic_formula_confirmed' is distinct from 'true'::jsonb or v_b->'five_objects_named_after_confirmed' is distinct from 'true'::jsonb or v_b->'hands_and_feet_moved_after_confirmed' is distinct from 'true'::jsonb then raise exception 'day032_boaz_boundaries_required'; end if;
 foreach k in array array['depth_score','relaxation_score','sleepiness_score','return_clarity_score'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day032_boaz_score_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day032_boaz_score_invalid'; end if; end loop;
 if jsonb_typeof(v_b->'distraction_count') is distinct from 'number' then raise exception 'day032_boaz_distractions_invalid'; end if; n:=(v_b->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day032_boaz_distractions_invalid'; end if;
 r:=v_b->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day032_control_vault_ref_invalid'; end if;

 v_m:=p_evidence->'middle'; if jsonb_typeof(v_m) is distinct from 'object' then raise exception 'day032_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_m) x where x not in ('descent_seconds','floors_completed','final_level_seconds','return_seconds','psalm_3_5_orientation_confirmed','aleph_cheth_aleph_once_confirmed','markers_observed_without_requirement_confirmed','orientation_preserved_confirmed','return_available_at_will_confirmed','critical_floor','predominant_marker','depth_score','return_clarity_score','eyes_opened_after_confirmed','hands_and_feet_moved_after_confirmed','deep_breath_after_confirmed','functional_capacity_intact_confirmed','e1_e5_recorded_confirmed','criterion_before_catatonia_defined_confirmed','pain_testing_rejected_confirmed','medical_care_not_replaced_confirmed','integration_vault_entry_ref')) then raise exception 'day032_middle_unknown_field'; end if;
 foreach k in array array['descent_seconds','return_seconds'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day032_middle_measured_time_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<1 or n>7200 then raise exception 'day032_middle_measured_time_invalid'; end if; end loop;
 if jsonb_typeof(v_m->'floors_completed') is distinct from 'number' or (v_m->>'floors_completed')::numeric is distinct from 7::numeric then raise exception 'day032_middle_seven_floors_required'; end if;
 if jsonb_typeof(v_m->'final_level_seconds') is distinct from 'number' or (v_m->>'final_level_seconds')::numeric is distinct from 180::numeric then raise exception 'day032_middle_final_180_required'; end if;
 if v_m->'psalm_3_5_orientation_confirmed' is distinct from 'true'::jsonb or v_m->'aleph_cheth_aleph_once_confirmed' is distinct from 'true'::jsonb or v_m->'markers_observed_without_requirement_confirmed' is distinct from 'true'::jsonb or v_m->'orientation_preserved_confirmed' is distinct from 'true'::jsonb or v_m->'return_available_at_will_confirmed' is distinct from 'true'::jsonb or v_m->'eyes_opened_after_confirmed' is distinct from 'true'::jsonb or v_m->'hands_and_feet_moved_after_confirmed' is distinct from 'true'::jsonb or v_m->'deep_breath_after_confirmed' is distinct from 'true'::jsonb or v_m->'functional_capacity_intact_confirmed' is distinct from 'true'::jsonb or v_m->'e1_e5_recorded_confirmed' is distinct from 'true'::jsonb or v_m->'criterion_before_catatonia_defined_confirmed' is distinct from 'true'::jsonb or v_m->'pain_testing_rejected_confirmed' is distinct from 'true'::jsonb or v_m->'medical_care_not_replaced_confirmed' is distinct from 'true'::jsonb then raise exception 'day032_middle_boundaries_required'; end if;
 if not(v_m?'critical_floor') then raise exception 'day032_middle_critical_floor_required'; end if; if v_m->'critical_floor'<>'null'::jsonb then if jsonb_typeof(v_m->'critical_floor') is distinct from 'number' then raise exception 'day032_middle_critical_floor_invalid'; end if; n:=(v_m->>'critical_floor')::numeric; if n<>trunc(n) or n<1 or n>7 then raise exception 'day032_middle_critical_floor_invalid'; end if; end if;
 if coalesce(v_m->>'predominant_marker','') not in ('BREATH_SLOWER','WEIGHT','WARMTH','QUIET','FOCUS','COMFORTABLE_IMMOBILITY','DEPTH','MIXED','NONE') then raise exception 'day032_middle_marker_invalid'; end if;
 foreach k in array array['depth_score','return_clarity_score'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day032_middle_score_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day032_middle_score_invalid'; end if; end loop;
 r:=v_m->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day032_integration_vault_ref_invalid'; end if;

 v_s:=p_evidence->'soul_mirror'; if jsonb_typeof(v_s) is distinct from 'object' then raise exception 'day032_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_s) x where x not in ('completed','elevator_markers_comparison_return_vault_entry_ref')) then raise exception 'day032_soul_mirror_unknown_field'; end if;
 if v_s->'completed' is distinct from 'true'::jsonb then raise exception 'day032_soul_mirror_required'; end if;
 r:=v_s->>'elevator_markers_comparison_return_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day032_soul_vault_ref_invalid'; end if;
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
  when 'day028_v1' then perform hnk_private.validate_day028_completion_v1(p_evidence,p_expected_source_sha);
  when 'day029_v1' then perform hnk_private.validate_day029_completion_v1(p_evidence,p_expected_source_sha);
  when 'day030_v1' then perform hnk_private.validate_day030_completion_v1(p_evidence,p_expected_source_sha);
  when 'day031_v1' then perform hnk_private.validate_day031_completion_v1(p_evidence,p_expected_source_sha);
  when 'day032_v1' then perform hnk_private.validate_day032_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D032-COMP-V1','HNK-KETHER-D032-V1',32,'e769394099a40802b45b9d5d269e1545dc5c4cf5','1.0.0','day032_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='active',updated_at=now();
