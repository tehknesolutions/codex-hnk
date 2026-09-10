create or replace function hnk_private.validate_day024_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; k text; n numeric; av numeric; cv numeric;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day024_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','reference','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day024_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D024-V1' then raise exception 'day024_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '0d7c70b7bd0f82d3b4cc75ad077fce4c21202e2d' then raise exception 'day024_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day024_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day024_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day024_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day024_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'reference') is distinct from 'object' then raise exception 'day024_reference_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'reference') x where x not in ('canonical_reference_id','master_sha256','family','semantic_master')) then raise exception 'day024_reference_unknown_field'; end if;
 if p_evidence->'reference'->>'canonical_reference_id' is distinct from 'reiki-usui-dai-ko-myo-v1' or p_evidence->'reference'->>'master_sha256' is distinct from '25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0' or p_evidence->'reference'->>'family' is distinct from 'USUI_KANJI' or p_evidence->'reference'->>'semantic_master' is distinct from '大光明' then raise exception 'day024_reference_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day024_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') x where x not in ('ordered_regions','per_region_seconds','canonical_usui_reference_confirmed','dai_koo_myo_visualization_confirmed','natural_breathing_confirmed','no_eye_or_neck_pressure_confirmed','region_intensity_scores','attention_before_score','attention_after_score','active_map_vault_entry_ref')) then raise exception 'day024_jachin_unknown_field'; end if;
 if p_evidence->'jachin'->'ordered_regions' is distinct from '["CROWN","FOREHEAD","BROW","FACE_SIDES","THROAT"]'::jsonb then raise exception 'day024_region_order_invalid'; end if;
 if p_evidence->'jachin'->'canonical_usui_reference_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'dai_koo_myo_visualization_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'no_eye_or_neck_pressure_confirmed' is distinct from 'true'::jsonb then raise exception 'day024_jachin_requirements'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'per_region_seconds') is distinct from 'object' or jsonb_typeof(p_evidence->'jachin'->'region_intensity_scores') is distinct from 'object' then raise exception 'day024_jachin_map_required'; end if;
 foreach k in array array['CROWN','FOREHEAD','BROW','FACE_SIDES','THROAT'] loop if jsonb_typeof(p_evidence->'jachin'->'per_region_seconds'->k) is distinct from 'number' then raise exception 'day024_active_duration_invalid'; end if; n:=(p_evidence->'jachin'->'per_region_seconds'->>k)::numeric; if n<>trunc(n) or n<45 or n>75 then raise exception 'day024_active_duration_invalid'; end if; if jsonb_typeof(p_evidence->'jachin'->'region_intensity_scores'->k) is distinct from 'number' then raise exception 'day024_active_score_invalid'; end if; n:=(p_evidence->'jachin'->'region_intensity_scores'->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day024_active_score_invalid'; end if; end loop;
 foreach r in array array['attention_before_score','attention_after_score'] loop if jsonb_typeof(p_evidence->'jachin'->r) is distinct from 'number' then raise exception 'day024_attention_score_invalid'; end if; n:=(p_evidence->'jachin'->>r)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day024_attention_score_invalid'; end if; end loop;
 r:=p_evidence->'jachin'->>'active_map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day024_active_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day024_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') x where x not in ('ordered_regions','per_region_seconds','same_order_confirmed','same_per_region_durations_confirmed','same_hand_distance_and_posture_confirmed','no_symbol_confirmed','no_formula_confirmed','no_conduction_intent_confirmed','minimal_pressure_confirmed','airway_unobstructed_confirmed','region_intensity_scores','competing_variable_identified_confirmed','control_map_vault_entry_ref')) then raise exception 'day024_boaz_unknown_field'; end if;
 if p_evidence->'boaz'->'ordered_regions' is distinct from '["CROWN","FOREHEAD","BROW","FACE_SIDES","THROAT"]'::jsonb then raise exception 'day024_control_region_order_invalid'; end if;
 if p_evidence->'boaz'->'same_order_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_per_region_durations_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'same_hand_distance_and_posture_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_symbol_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_formula_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_conduction_intent_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'minimal_pressure_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'airway_unobstructed_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'competing_variable_identified_confirmed' is distinct from 'true'::jsonb then raise exception 'day024_boaz_requirements'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'per_region_seconds') is distinct from 'object' or jsonb_typeof(p_evidence->'boaz'->'region_intensity_scores') is distinct from 'object' then raise exception 'day024_boaz_map_required'; end if;
 foreach k in array array['CROWN','FOREHEAD','BROW','FACE_SIDES','THROAT'] loop if jsonb_typeof(p_evidence->'boaz'->'per_region_seconds'->k) is distinct from 'number' then raise exception 'day024_control_duration_invalid'; end if; cv:=(p_evidence->'boaz'->'per_region_seconds'->>k)::numeric; av:=(p_evidence->'jachin'->'per_region_seconds'->>k)::numeric; if cv<>trunc(cv) or cv<45 or cv>75 or cv<>av then raise exception 'day024_control_durations_must_match_active'; end if; if jsonb_typeof(p_evidence->'boaz'->'region_intensity_scores'->k) is distinct from 'number' then raise exception 'day024_control_score_invalid'; end if; n:=(p_evidence->'boaz'->'region_intensity_scores'->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day024_control_score_invalid'; end if; end loop;
 r:=p_evidence->'boaz'->>'control_map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day024_control_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day024_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') x where x not in ('ordered_regions','per_region_seconds','same_order_confirmed','dai_koo_myo_visualization_confirmed','mem_he_shin_once_per_region_confirmed','natural_breathing_confirmed','psalm_34_4_orientation_confirmed','silent_observation_seconds','five_domains_recorded_confirmed','stability_score','progression_criterion_defined_confirmed','integration_map_vault_entry_ref')) then raise exception 'day024_middle_unknown_field'; end if;
 if p_evidence->'middle'->'ordered_regions' is distinct from '["CROWN","FOREHEAD","BROW","FACE_SIDES","THROAT"]'::jsonb then raise exception 'day024_middle_region_order_invalid'; end if;
 if p_evidence->'middle'->'same_order_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'dai_koo_myo_visualization_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'mem_he_shin_once_per_region_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_34_4_orientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'five_domains_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'progression_criterion_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day024_middle_requirements'; end if;
 if jsonb_typeof(p_evidence->'middle'->'silent_observation_seconds') is distinct from 'number' or (p_evidence->'middle'->>'silent_observation_seconds')::numeric<>60 then raise exception 'day024_middle_silence_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle'->'per_region_seconds') is distinct from 'object' then raise exception 'day024_middle_map_required'; end if;
 foreach k in array array['CROWN','FOREHEAD','BROW','FACE_SIDES','THROAT'] loop if jsonb_typeof(p_evidence->'middle'->'per_region_seconds'->k) is distinct from 'number' then raise exception 'day024_middle_duration_invalid'; end if; n:=(p_evidence->'middle'->'per_region_seconds'->>k)::numeric; if n<>trunc(n) or n<45 or n>75 then raise exception 'day024_middle_duration_invalid'; end if; end loop;
 if jsonb_typeof(p_evidence->'middle'->'stability_score') is distinct from 'number' then raise exception 'day024_stability_score_invalid'; end if; n:=(p_evidence->'middle'->>'stability_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day024_stability_score_invalid'; end if;
 r:=p_evidence->'middle'->>'integration_map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day024_integration_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day024_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') x where x not in ('completed','regional_response_expectation_touch_posture_intention_next_variable_vault_entry_ref')) then raise exception 'day024_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day024_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'regional_response_expectation_touch_posture_intention_next_variable_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day024_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D024-COMP-V1','HNK-KETHER-D024-V1',24,'0d7c70b7bd0f82d3b4cc75ad077fce4c21202e2d','1.0.0','day024_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
