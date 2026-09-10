create or replace function hnk_private.validate_day020_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day020_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day020_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D020-V1' then raise exception 'day020_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '9d901354b737c2d724ff6a1aaf336d5a411fbd55' then raise exception 'day020_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day020_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day020_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day020_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day020_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day020_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('vocalization_performed_confirmed','silence_duration_seconds','safe_surface_confirmed','head_support_if_needed_confirmed','eyes_optional_confirmed','no_forced_mental_blankness_confirmed','first_verbal_thought_latency_seconds','verbal_density','body_relaxation_score','observation_vault_entry_ref')) then raise exception 'day020_jachin_unknown_field'; end if;
 if p_evidence->'jachin'->'vocalization_performed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'safe_surface_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'head_support_if_needed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'eyes_optional_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'no_forced_mental_blankness_confirmed' is distinct from 'true'::jsonb then raise exception 'day020_jachin_requirements'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'silence_duration_seconds') is distinct from 'number' or (p_evidence->'jachin'->>'silence_duration_seconds')::numeric<>300 then raise exception 'day020_jachin_silence_requires_300_seconds'; end if;
 if p_evidence->'jachin' ? 'first_verbal_thought_latency_seconds' and p_evidence->'jachin'->'first_verbal_thought_latency_seconds' <> 'null'::jsonb then if jsonb_typeof(p_evidence->'jachin'->'first_verbal_thought_latency_seconds') is distinct from 'number' then raise exception 'day020_first_thought_latency_invalid'; end if; n:=(p_evidence->'jachin'->>'first_verbal_thought_latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>300 then raise exception 'day020_first_thought_latency_invalid'; end if; end if;
 if p_evidence->'jachin'->>'verbal_density' not in ('NONE','LOW','MODERATE','HIGH') then raise exception 'day020_verbal_density_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'body_relaxation_score') is distinct from 'number' then raise exception 'day020_body_relaxation_score_invalid'; end if; n:=(p_evidence->'jachin'->>'body_relaxation_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day020_body_relaxation_score_invalid'; end if;
 r:=p_evidence->'jachin'->>'observation_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day020_observation_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day020_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('breathing_free_confirmed','jaw_relaxed_confirmed','neck_supported_confirmed','hands_relaxed_confirmed','attention_present_confirmed','no_breath_holding_confirmed','quietude_not_proof_confirmed','interpretation_vault_entry_ref')) then raise exception 'day020_boaz_unknown_field'; end if;
 if p_evidence->'boaz'->'breathing_free_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'jaw_relaxed_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'neck_supported_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'hands_relaxed_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'attention_present_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'no_breath_holding_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'quietude_not_proof_confirmed' is distinct from 'true'::jsonb then raise exception 'day020_boaz_requirements'; end if;
 r:=p_evidence->'boaz'->>'interpretation_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day020_interpretation_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day020_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','thoughts_need_not_be_suppressed_confirmed','psalm_6_4_prayer_confirmed','hands_feet_moved_confirmed','eyes_opened_if_closed_confirmed','sat_up_slowly_confirmed','environment_reorientation_confirmed','presence_score','synthesis_vault_entry_ref')) then raise exception 'day020_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'duration_seconds') is distinct from 'number' then raise exception 'day020_middle_duration_invalid'; end if; n:=(p_evidence->'middle'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>300 then raise exception 'day020_middle_duration_invalid'; end if;
 if p_evidence->'middle'->'thoughts_need_not_be_suppressed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_6_4_prayer_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'hands_feet_moved_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'eyes_opened_if_closed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'sat_up_slowly_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'environment_reorientation_confirmed' is distinct from 'true'::jsonb then raise exception 'day020_middle_requirements'; end if;
 if jsonb_typeof(p_evidence->'middle'->'presence_score') is distinct from 'number' then raise exception 'day020_presence_score_invalid'; end if; n:=(p_evidence->'middle'->>'presence_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day020_presence_score_invalid'; end if;
 r:=p_evidence->'middle'->>'synthesis_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day020_synthesis_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day020_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','cycle_contrast_vault_entry_ref')) then raise exception 'day020_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day020_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'cycle_contrast_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day020_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D020-COMP-V1','HNK-KETHER-D020-V1',20,'9d901354b737c2d724ff6a1aaf336d5a411fbd55','1.0.0','day020_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
