create or replace function hnk_private.validate_day028_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day028_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day028_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D028-V1' then raise exception 'day028_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '9253344faa2b6be10a85e58561f306b7ef1661ba' then raise exception 'day028_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day028_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day028_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day028_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day028_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day028_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') x where x not in ('duration_seconds','posture_stable_confirmed','eyes_closed_confirmed','eight_circuits_mapped_confirmed','return_to_center_between_circuits_confirmed','construction_time_seconds','orientation_loss_count','most_stable_circuit','most_difficult_circuit','average_return_to_center_seconds','spatial_stability_score','navigation_score','active_vault_entry_ref')) then raise exception 'day028_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds') is distinct from 'number' or (p_evidence->'jachin'->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day028_active_requires_600_seconds'; end if;
 if p_evidence->'jachin'->'posture_stable_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'eyes_closed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'eight_circuits_mapped_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'return_to_center_between_circuits_confirmed' is distinct from 'true'::jsonb then raise exception 'day028_jachin_requirements'; end if;
 foreach r in array array['construction_time_seconds','average_return_to_center_seconds'] loop if jsonb_typeof(p_evidence->'jachin'->r) is distinct from 'number' then raise exception 'day028_jachin_metric_invalid'; end if; n:=(p_evidence->'jachin'->>r)::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day028_jachin_metric_invalid'; end if; end loop;
 if jsonb_typeof(p_evidence->'jachin'->'orientation_loss_count') is distinct from 'number' then raise exception 'day028_active_orientation_losses_invalid'; end if; n:=(p_evidence->'jachin'->>'orientation_loss_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day028_active_orientation_losses_invalid'; end if;
 foreach r in array array['most_stable_circuit','most_difficult_circuit'] loop if jsonb_typeof(p_evidence->'jachin'->r) is distinct from 'number' then raise exception 'day028_jachin_circuit_invalid'; end if; n:=(p_evidence->'jachin'->>r)::numeric; if n<>trunc(n) or n<1 or n>8 then raise exception 'day028_jachin_circuit_invalid'; end if; end loop;
 foreach r in array array['spatial_stability_score','navigation_score'] loop if jsonb_typeof(p_evidence->'jachin'->r) is distinct from 'number' then raise exception 'day028_jachin_score_invalid'; end if; n:=(p_evidence->'jachin'->>r)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day028_jachin_score_invalid'; end if; end loop;
 r:=p_evidence->'jachin'->>'active_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day028_active_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day028_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') x where x not in ('duration_seconds','circle_plus_eight_points_confirmed','same_functions_confirmed','same_order_confirmed','same_duration_confirmed','same_posture_confirmed','no_astral_nomenclature_confirmed','no_formula_confirmed','control_not_sabotaged_confirmed','construction_time_seconds','position_error_count','orientation_loss_count','average_recovery_seconds','spatial_stability_score','navigation_score','presence_score','data_may_correct_expectation_confirmed','control_vault_entry_ref')) then raise exception 'day028_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'duration_seconds') is distinct from 'number' or (p_evidence->'boaz'->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day028_control_requires_600_seconds'; end if;
 if p_evidence->'boaz'->'circle_plus_eight_points_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_functions_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_order_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_duration_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_posture_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_astral_nomenclature_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_formula_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'control_not_sabotaged_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'data_may_correct_expectation_confirmed' is distinct from 'true'::jsonb then raise exception 'day028_boaz_requirements'; end if;
 foreach r in array array['construction_time_seconds','average_recovery_seconds'] loop if jsonb_typeof(p_evidence->'boaz'->r) is distinct from 'number' then raise exception 'day028_boaz_metric_invalid'; end if; n:=(p_evidence->'boaz'->>r)::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day028_boaz_metric_invalid'; end if; end loop;
 foreach r in array array['position_error_count','orientation_loss_count'] loop if jsonb_typeof(p_evidence->'boaz'->r) is distinct from 'number' then raise exception 'day028_boaz_count_invalid'; end if; n:=(p_evidence->'boaz'->>r)::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day028_boaz_count_invalid'; end if; end loop;
 foreach r in array array['spatial_stability_score','navigation_score','presence_score'] loop if jsonb_typeof(p_evidence->'boaz'->r) is distinct from 'number' then raise exception 'day028_boaz_score_invalid'; end if; n:=(p_evidence->'boaz'->>r)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day028_boaz_score_invalid'; end if; end loop;
 r:=p_evidence->'boaz'->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day028_control_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day028_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') x where x not in ('sequence_duration_seconds','circuits_completed','breaths_per_circuit','center_returns','silent_center_seconds','final_reconstruction_time_seconds','lamed_lamed_he_once_confirmed','psalm_9_11_orientation_confirmed','natural_breathing_confirmed','identity_orientation_preserved_confirmed','no_excessive_tension_confirmed','e1_e5_recorded_confirmed','most_discriminable_circuit','cockpit_is_internal_protocol_not_external_realm_proof_confirmed','single_session_not_definitive_confirmed','hypothesis_refined_confirmed','stability_criterion_defined_confirmed','integration_vault_entry_ref')) then raise exception 'day028_middle_unknown_field'; end if;
 foreach r in array array['sequence_duration_seconds','final_reconstruction_time_seconds'] loop if jsonb_typeof(p_evidence->'middle'->r) is distinct from 'number' then raise exception 'day028_middle_duration_invalid'; end if; n:=(p_evidence->'middle'->>r)::numeric; if n<>trunc(n) or n<0 or n>86400 or (r='sequence_duration_seconds' and n<1) then raise exception 'day028_middle_duration_invalid'; end if; end loop;
 if jsonb_typeof(p_evidence->'middle'->'circuits_completed') is distinct from 'number' or (p_evidence->'middle'->>'circuits_completed')::numeric is distinct from 8::numeric or jsonb_typeof(p_evidence->'middle'->'breaths_per_circuit') is distinct from 'number' or (p_evidence->'middle'->>'breaths_per_circuit')::numeric is distinct from 3::numeric or jsonb_typeof(p_evidence->'middle'->'center_returns') is distinct from 'number' or (p_evidence->'middle'->>'center_returns')::numeric is distinct from 8::numeric or jsonb_typeof(p_evidence->'middle'->'silent_center_seconds') is distinct from 'number' or (p_evidence->'middle'->>'silent_center_seconds')::numeric is distinct from 60::numeric then raise exception 'day028_middle_sequence_invalid'; end if;
 if p_evidence->'middle'->'lamed_lamed_he_once_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_9_11_orientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'identity_orientation_preserved_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'no_excessive_tension_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'e1_e5_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'cockpit_is_internal_protocol_not_external_realm_proof_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'single_session_not_definitive_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'hypothesis_refined_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'stability_criterion_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day028_middle_requirements'; end if;
 if jsonb_typeof(p_evidence->'middle'->'most_discriminable_circuit') is distinct from 'number' then raise exception 'day028_discriminable_circuit_invalid'; end if; n:=(p_evidence->'middle'->>'most_discriminable_circuit')::numeric; if n<>trunc(n) or n<1 or n>8 then raise exception 'day028_discriminable_circuit_invalid'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day028_integration_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day028_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') x where x not in ('completed','center_control_indicator_vault_entry_ref')) then raise exception 'day028_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day028_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'center_control_indicator_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day028_soul_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D028-COMP-V1','HNK-KETHER-D028-V1',28,'9253344faa2b6be10a85e58561f306b7ef1661ba','1.0.0','day028_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
