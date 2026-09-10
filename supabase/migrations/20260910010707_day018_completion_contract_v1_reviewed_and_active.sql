create or replace function hnk_private.validate_day018_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; v text;
begin
 if jsonb_typeof(p_evidence)<>'object' then raise exception 'day018_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day018_unknown_top_field'; end if;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D018-V1' then raise exception 'day018_protocol_invalid'; end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'152f91da1e7442f645687ba5b72c9977496a1e55' then raise exception 'day018_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day018_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day018_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day018_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred')<>'boolean' then raise exception 'day018_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day018_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','skull_base','chest_center','umbilical','comfortable_posture_confirmed','moderate_volume_confirmed','no_forcing_confirmed','map_vault_entry_ref')) then raise exception 'day018_jachin_unknown_field'; end if;
 n:=(p_evidence->'jachin'->>'duration_seconds')::numeric; if trunc(n)<>n or n<1 or n>600 then raise exception 'day018_jachin_duration_invalid'; end if;
 foreach v in array array[p_evidence->'jachin'->>'skull_base',p_evidence->'jachin'->>'chest_center',p_evidence->'jachin'->>'umbilical'] loop if v not in ('STRONG','WEAK','ABSENT') then raise exception 'day018_resonance_response_invalid'; end if; end loop;
 if p_evidence->'jachin'->'comfortable_posture_confirmed'<>'true'::jsonb or p_evidence->'jachin'->'moderate_volume_confirmed'<>'true'::jsonb or p_evidence->'jachin'->'no_forcing_confirmed'<>'true'::jsonb then raise exception 'day018_jachin_safety_required'; end if;
 r:=p_evidence->'jachin'->>'map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day018_jachin_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day018_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','throat_free_confirmed','jaw_relaxed_confirmed','breathing_available_confirmed','no_pain_confirmed','no_breath_retention_or_hyperventilation_confirmed','perception_not_spiritual_activation_confirmed','adjustment_vault_entry_ref')) then raise exception 'day018_boaz_unknown_field'; end if;
 n:=(p_evidence->'boaz'->>'duration_seconds')::numeric; if trunc(n)<>n or n<1 or n>600 then raise exception 'day018_boaz_duration_invalid'; end if;
 if p_evidence->'boaz'->'throat_free_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'jaw_relaxed_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'breathing_available_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'no_pain_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'no_breath_retention_or_hyperventilation_confirmed'<>'true'::jsonb then raise exception 'day018_boaz_safety_required'; end if;
 if p_evidence->'boaz'->'perception_not_spiritual_activation_confirmed'<>'true'::jsonb then raise exception 'day018_epistemic_boundary_required'; end if;
 r:=p_evidence->'boaz'->>'adjustment_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day018_boaz_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day018_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','three_regions_revisited_confirmed','slowed_to_silence_confirmed','normal_breathing_confirmed','psalm_6_4_prayer_confirmed','special_sensation_not_required_confirmed','sensation_emotion_expectation_interpretation_distinguished','comfort_score','integration_vault_entry_ref')) then raise exception 'day018_middle_unknown_field'; end if;
 n:=(p_evidence->'middle'->>'duration_seconds')::numeric; if trunc(n)<>n or n<1 or n>300 then raise exception 'day018_middle_duration_invalid'; end if;
 if p_evidence->'middle'->'three_regions_revisited_confirmed'<>'true'::jsonb or p_evidence->'middle'->'slowed_to_silence_confirmed'<>'true'::jsonb or p_evidence->'middle'->'normal_breathing_confirmed'<>'true'::jsonb or p_evidence->'middle'->'psalm_6_4_prayer_confirmed'<>'true'::jsonb then raise exception 'day018_middle_integration_required'; end if;
 if p_evidence->'middle'->'special_sensation_not_required_confirmed'<>'true'::jsonb or p_evidence->'middle'->'sensation_emotion_expectation_interpretation_distinguished'<>'true'::jsonb then raise exception 'day018_middle_boundary_required'; end if;
 n:=(p_evidence->'middle'->>'comfort_score')::numeric; if trunc(n)<>n or n<0 or n>10 then raise exception 'day018_comfort_score_invalid'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day018_middle_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day018_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','four_layers_vault_entry_ref')) then raise exception 'day018_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb then raise exception 'day018_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'four_layers_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day018_soul_mirror_vault_ref_invalid'; end if;
exception when invalid_text_representation then raise exception 'day018_numeric_field_invalid';
end$$;

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$ begin case p_validator_key
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
 else raise exception 'completion_validator_not_supported'; end case; end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D018-COMP-V1','HNK-KETHER-D018-V1',18,'152f91da1e7442f645687ba5b72c9977496a1e55','1.0.0','day018_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;