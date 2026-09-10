create or replace function hnk_private.validate_day023_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; active_distance numeric; control_distance numeric;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day023_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','reference','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day023_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D023-V1' then raise exception 'day023_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '1b7e27c69a7d4b9eaaf548043ad3b781e331f516' then raise exception 'day023_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day023_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day023_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day023_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day023_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'reference') is distinct from 'object' then raise exception 'day023_reference_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'reference') k where k not in ('canonical_reference_id','master_sha256','family','semantic_master')) then raise exception 'day023_reference_unknown_field'; end if;
 if p_evidence->'reference'->>'canonical_reference_id' is distinct from 'reiki-usui-dai-ko-myo-v1' or p_evidence->'reference'->>'master_sha256' is distinct from '25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0' or p_evidence->'reference'->>'family' is distinct from 'USUI_KANJI' or p_evidence->'reference'->>'semantic_master' is distinct from '大光明' then raise exception 'day023_reference_invalid'; end if;

 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day023_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','hand_distance_cm','neck_neutral_confirmed','natural_breathing_confirmed','dai_koo_myo_visualization_confirmed','canonical_usui_reference_confirmed','crown_intensity_score','visual_clarity_score','heat_score','pressure_score','pulsation_score','attention_score','emotion_stability_score','active_vault_entry_ref')) then raise exception 'day023_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds') is distinct from 'number' or (p_evidence->'jachin'->>'duration_seconds')::numeric <> 420 then raise exception 'day023_active_requires_420_seconds'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'hand_distance_cm') is distinct from 'number' then raise exception 'day023_active_distance_invalid'; end if; active_distance:=(p_evidence->'jachin'->>'hand_distance_cm')::numeric; if active_distance<>trunc(active_distance) or active_distance<5 or active_distance>10 then raise exception 'day023_active_distance_invalid'; end if;
 if p_evidence->'jachin'->'neck_neutral_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'dai_koo_myo_visualization_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'canonical_usui_reference_confirmed' is distinct from 'true'::jsonb then raise exception 'day023_jachin_requirements'; end if;
 foreach r in array array['crown_intensity_score','visual_clarity_score','heat_score','pressure_score','pulsation_score','attention_score','emotion_stability_score'] loop if jsonb_typeof(p_evidence->'jachin'->r) is distinct from 'number' then raise exception 'day023_jachin_score_invalid'; end if; n:=(p_evidence->'jachin'->>r)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day023_jachin_score_invalid'; end if; end loop;
 r:=p_evidence->'jachin'->>'active_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day023_active_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day023_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','hand_distance_cm','same_posture_and_breathing_confirmed','no_symbol_confirmed','no_formula_confirmed','no_conduction_intent_confirmed','heat_score','pressure_score','pulsation_score','mental_clarity_score','emotion_stability_score','presence_score','clinical_claim_not_inferred_confirmed','data_may_correct_expectation_confirmed','control_vault_entry_ref')) then raise exception 'day023_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'duration_seconds') is distinct from 'number' or (p_evidence->'boaz'->>'duration_seconds')::numeric <> 300 then raise exception 'day023_control_requires_300_seconds'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'hand_distance_cm') is distinct from 'number' then raise exception 'day023_control_distance_invalid'; end if; control_distance:=(p_evidence->'boaz'->>'hand_distance_cm')::numeric; if control_distance<>trunc(control_distance) or control_distance<5 or control_distance>10 or control_distance<>active_distance then raise exception 'day023_control_distance_must_match_active'; end if;
 if p_evidence->'boaz'->'same_posture_and_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_symbol_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_formula_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_conduction_intent_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'clinical_claim_not_inferred_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'data_may_correct_expectation_confirmed' is distinct from 'true'::jsonb then raise exception 'day023_boaz_requirements'; end if;
 foreach r in array array['heat_score','pressure_score','pulsation_score','mental_clarity_score','emotion_stability_score','presence_score'] loop if jsonb_typeof(p_evidence->'boaz'->r) is distinct from 'number' then raise exception 'day023_boaz_score_invalid'; end if; n:=(p_evidence->'boaz'->>r)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day023_boaz_score_invalid'; end if; end loop;
 r:=p_evidence->'boaz'->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day023_control_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day023_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('active_duration_seconds','silent_observation_seconds','hands_cupped_confirmed','dai_koo_myo_visualization_confirmed','mem_he_shin_vocalization_confirmed','psalm_34_4_orientation_confirmed','five_domains_recorded_confirmed','biological_effect_not_established_confirmed','hypothesis_refined_confirmed','objective_improvement_criterion_defined_confirmed','integration_vault_entry_ref')) then raise exception 'day023_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'active_duration_seconds') is distinct from 'number' or (p_evidence->'middle'->>'active_duration_seconds')::numeric <> 420 or jsonb_typeof(p_evidence->'middle'->'silent_observation_seconds') is distinct from 'number' or (p_evidence->'middle'->>'silent_observation_seconds')::numeric <> 60 then raise exception 'day023_middle_timing_invalid'; end if;
 if p_evidence->'middle'->'hands_cupped_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'dai_koo_myo_visualization_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'mem_he_shin_vocalization_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_34_4_orientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'five_domains_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'biological_effect_not_established_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'hypothesis_refined_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'objective_improvement_criterion_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day023_middle_requirements'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day023_integration_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day023_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','active_control_difference_repeatability_test_needed_vault_entry_ref')) then raise exception 'day023_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day023_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'active_control_difference_repeatability_test_needed_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day023_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D023-COMP-V1','HNK-KETHER-D023-V1',23,'1b7e27c69a7d4b9eaaf548043ad3b781e331f516','1.0.0','day023_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
