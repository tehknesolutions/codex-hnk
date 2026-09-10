create or replace function hnk_private.validate_day021_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day021_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day021_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D021-V1' then raise exception 'day021_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '12ca319d37146b91693fcb09ebc5fd9aa7d5490c' then raise exception 'day021_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day021_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day021_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day021_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day021_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day021_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','natural_nasal_breathing_confirmed','no_breath_retention_confirmed','kether_to_malkuth_visualization_confirmed','visualization_ease_score','body_presence_score','sensation_response','observation_vault_entry_ref')) then raise exception 'day021_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds') is distinct from 'number' then raise exception 'day021_jachin_duration_invalid'; end if; n:=(p_evidence->'jachin'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>600 then raise exception 'day021_jachin_duration_invalid'; end if;
 if p_evidence->'jachin'->'natural_nasal_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'no_breath_retention_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'kether_to_malkuth_visualization_confirmed' is distinct from 'true'::jsonb then raise exception 'day021_jachin_requirements'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'visualization_ease_score') is distinct from 'number' then raise exception 'day021_visualization_score_invalid'; end if; n:=(p_evidence->'jachin'->>'visualization_ease_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day021_visualization_score_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'body_presence_score') is distinct from 'number' then raise exception 'day021_body_presence_score_invalid'; end if; n:=(p_evidence->'jachin'->>'body_presence_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day021_body_presence_score_invalid'; end if;
 if p_evidence->'jachin'->>'sensation_response' not in ('STRONG','WEAK','ABSENT') then raise exception 'day021_sensation_response_invalid'; end if;
 r:=p_evidence->'jachin'->>'observation_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day021_observation_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day021_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','no_special_sensation_required_confirmed','no_increased_breath_volume_confirmed','no_breath_holding_confirmed','sensation_or_absence_recorded_confirmed','interpretation_suspended_confirmed','prana_ki_not_biomedical_fact_confirmed','discrimination_vault_entry_ref')) then raise exception 'day021_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'duration_seconds') is distinct from 'number' then raise exception 'day021_boaz_duration_invalid'; end if; n:=(p_evidence->'boaz'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>600 then raise exception 'day021_boaz_duration_invalid'; end if;
 if p_evidence->'boaz'->'no_special_sensation_required_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_increased_breath_volume_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_breath_holding_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'sensation_or_absence_recorded_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'interpretation_suspended_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'prana_ki_not_biomedical_fact_confirmed' is distinct from 'true'::jsonb then raise exception 'day021_boaz_requirements'; end if;
 r:=p_evidence->'boaz'->>'discrimination_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day021_discrimination_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day021_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','natural_breathing_confirmed','psalm_34_4_prayer_confirmed','hands_feet_moved_confirmed','environment_reorientation_confirmed','presence_score','concrete_action_defined_confirmed','integration_vault_entry_ref')) then raise exception 'day021_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'duration_seconds') is distinct from 'number' then raise exception 'day021_middle_duration_invalid'; end if; n:=(p_evidence->'middle'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>300 then raise exception 'day021_middle_duration_invalid'; end if;
 if p_evidence->'middle'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_34_4_prayer_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'hands_feet_moved_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'environment_reorientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'concrete_action_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day021_middle_requirements'; end if;
 if jsonb_typeof(p_evidence->'middle'->'presence_score') is distinct from 'number' then raise exception 'day021_presence_score_invalid'; end if; n:=(p_evidence->'middle'->>'presence_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day021_presence_score_invalid'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day021_integration_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day021_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','breath_image_sensation_interpretation_action_vault_entry_ref')) then raise exception 'day021_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day021_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'breath_image_sensation_interpretation_action_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day021_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D021-COMP-V1','HNK-KETHER-D021-V1',21,'12ca319d37146b91693fcb09ebc5fd9aa7d5490c','1.0.0','day021_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
