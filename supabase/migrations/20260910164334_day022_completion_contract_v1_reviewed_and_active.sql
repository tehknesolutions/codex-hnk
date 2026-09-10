create or replace function hnk_private.validate_day022_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day022_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','reference','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day022_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D022-V1' then raise exception 'day022_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'dd2d6f906b57050fb568b5f82b806f456acdd3af' then raise exception 'day022_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day022_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day022_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day022_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day022_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'reference') is distinct from 'object' then raise exception 'day022_reference_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'reference') k where k not in ('canonical_reference_id','master_checksum_sha256','stroke_order_checksum_sha256','semantic_master','vertical_order_confirmed','usui_kanji_family_confirmed','tibetan_dumo_substitution_rejected')) then raise exception 'day022_reference_unknown_field'; end if;
 if p_evidence->'reference'->>'canonical_reference_id' is distinct from 'reiki-usui-dai-ko-myo-v1' then raise exception 'day022_reference_id_invalid'; end if;
 if p_evidence->'reference'->>'master_checksum_sha256' is distinct from '25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0' then raise exception 'day022_master_checksum_invalid'; end if;
 if p_evidence->'reference'->>'stroke_order_checksum_sha256' is distinct from '52cf6921ccd6ede63a6f83d05b31faf787d2881b99d5b8ce1ee6095a86b4fe6b' then raise exception 'day022_stroke_checksum_invalid'; end if;
 if p_evidence->'reference'->>'semantic_master' is distinct from '大光明' or p_evidence->'reference'->'vertical_order_confirmed' is distinct from 'true'::jsonb or p_evidence->'reference'->'usui_kanji_family_confirmed' is distinct from 'true'::jsonb or p_evidence->'reference'->'tibetan_dumo_substitution_rejected' is distinct from 'true'::jsonb then raise exception 'day022_reference_boundary_required'; end if;

 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day022_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','finger_trace_completed','dominant_hand_air_trace_completed','white_visualization_completed','reference_consultations_count','memory_hesitations_count','visual_clarity_score','sensation_response','special_sensation_not_required_confirmed','observation_vault_entry_ref')) then raise exception 'day022_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds') is distinct from 'number' then raise exception 'day022_jachin_duration_invalid'; end if; n:=(p_evidence->'jachin'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>600 then raise exception 'day022_jachin_duration_invalid'; end if;
 if p_evidence->'jachin'->'finger_trace_completed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'dominant_hand_air_trace_completed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'white_visualization_completed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'special_sensation_not_required_confirmed' is distinct from 'true'::jsonb then raise exception 'day022_jachin_requirements'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'reference_consultations_count') is distinct from 'number' or jsonb_typeof(p_evidence->'jachin'->'memory_hesitations_count') is distinct from 'number' then raise exception 'day022_jachin_count_invalid'; end if;
 n:=(p_evidence->'jachin'->>'reference_consultations_count')::numeric; if n<>trunc(n) or n<0 or n>99 then raise exception 'day022_reference_consultations_invalid'; end if;
 n:=(p_evidence->'jachin'->>'memory_hesitations_count')::numeric; if n<>trunc(n) or n<0 or n>99 then raise exception 'day022_memory_hesitations_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'visual_clarity_score') is distinct from 'number' then raise exception 'day022_visual_clarity_invalid'; end if; n:=(p_evidence->'jachin'->>'visual_clarity_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day022_visual_clarity_invalid'; end if;
 if p_evidence->'jachin'->>'sensation_response' not in ('STRONG','WEAK','ABSENT') then raise exception 'day022_sensation_response_invalid'; end if;
 r:=p_evidence->'jachin'->>'observation_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day022_observation_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day022_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','slow_trace_completed','symbolic_voluntary_confirmed','shoulder_wrist_fingers_relaxed_confirmed','consult_reference_if_forgotten_confirmed','restart_without_punishment_confirmed','no_sensation_chasing_confirmed','sensation_or_absence_recorded_confirmed','expectation_not_certainty_confirmed','symbol_faith_evidence_distinct_confirmed','god_highest_spiritual_authority_confirmed','rigor_vault_entry_ref')) then raise exception 'day022_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'duration_seconds') is distinct from 'number' then raise exception 'day022_boaz_duration_invalid'; end if; n:=(p_evidence->'boaz'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>600 then raise exception 'day022_boaz_duration_invalid'; end if;
 if p_evidence->'boaz'->'slow_trace_completed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'symbolic_voluntary_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'shoulder_wrist_fingers_relaxed_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'consult_reference_if_forgotten_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'restart_without_punishment_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_sensation_chasing_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'sensation_or_absence_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'expectation_not_certainty_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'symbol_faith_evidence_distinct_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'god_highest_spiritual_authority_confirmed' is distinct from 'true'::jsonb then raise exception 'day022_boaz_requirements'; end if;
 r:=p_evidence->'boaz'->>'rigor_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day022_rigor_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day022_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','complete_air_trace_confirmed','psalm_34_4_prayer_confirmed','three_natural_breaths_confirmed','image_voluntarily_dismissed_confirmed','three_external_objects_observed_confirmed','imagined_symbol_body_gesture_external_reality_distinguished_confirmed','visual_clarity_score','symbol_served_attention_without_replacing_god_confirmed','integration_vault_entry_ref')) then raise exception 'day022_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'duration_seconds') is distinct from 'number' then raise exception 'day022_middle_duration_invalid'; end if; n:=(p_evidence->'middle'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>300 then raise exception 'day022_middle_duration_invalid'; end if;
 if p_evidence->'middle'->'complete_air_trace_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_34_4_prayer_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'three_natural_breaths_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'image_voluntarily_dismissed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'three_external_objects_observed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'imagined_symbol_body_gesture_external_reality_distinguished_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'symbol_served_attention_without_replacing_god_confirmed' is distinct from 'true'::jsonb then raise exception 'day022_middle_requirements'; end if;
 if jsonb_typeof(p_evidence->'middle'->'visual_clarity_score') is distinct from 'number' then raise exception 'day022_middle_visual_clarity_invalid'; end if; n:=(p_evidence->'middle'->>'visual_clarity_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day022_middle_visual_clarity_invalid'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day022_integration_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day022_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','form_movement_visualization_spiritual_interpretation_reverence_vault_entry_ref')) then raise exception 'day022_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day022_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'form_movement_visualization_spiritual_interpretation_reverence_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day022_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D022-COMP-V1','HNK-KETHER-D022-V1',22,'dd2d6f906b57050fb568b5f82b806f456acdd3af','1.0.0','day022_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
