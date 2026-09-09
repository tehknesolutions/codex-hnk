create or replace function hnk_private.validate_day011_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$
declare v text; n numeric;
begin
 if jsonb_typeof(p_evidence)<>'object' then raise exception 'day011_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day011_unknown_top_field'; end if;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D011-V1' then raise exception 'day011_protocol_invalid'; end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'9b7140dee8d346a4ea81dd753d342e4c1f172b0d' then raise exception 'day011_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day011_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day011_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day011_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred')<>'boolean' then raise exception 'day011_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day011_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('five_minute_observation_completed','blink_and_natural_breathing_confirmed','three_non_evaluative_characteristics_recorded','relationship_change_vault_entry_ref')) then raise exception 'day011_jachin_unknown_field'; end if;
 if p_evidence->'jachin'->'five_minute_observation_completed'<>'true'::jsonb or p_evidence->'jachin'->'blink_and_natural_breathing_confirmed'<>'true'::jsonb or p_evidence->'jachin'->'three_non_evaluative_characteristics_recorded'<>'true'::jsonb then raise exception 'day011_jachin_required'; end if;
 v:=p_evidence->'jachin'->>'relationship_change_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day011_relationship_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day011_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('five_minute_observation_completed','judgment_labeling_completed','predominant_judgment_vault_entry_ref','returned_to_observation_confirmed','visual_strangeness_not_automatic_revelation_confirmed','safe_limit_confirmed')) then raise exception 'day011_boaz_unknown_field'; end if;
 if p_evidence->'boaz'->'five_minute_observation_completed'<>'true'::jsonb or p_evidence->'boaz'->'judgment_labeling_completed'<>'true'::jsonb or p_evidence->'boaz'->'returned_to_observation_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'visual_strangeness_not_automatic_revelation_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'safe_limit_confirmed'<>'true'::jsonb then raise exception 'day011_boaz_required'; end if;
 v:=p_evidence->'boaz'->>'predominant_judgment_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day011_judgment_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day011_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('five_minute_observation_completed','see_before_judge_completed','psalm_91_2_prayer_confirmed','attention_stability_score','final_observation_vault_entry_ref')) then raise exception 'day011_middle_unknown_field'; end if;
 if p_evidence->'middle'->'five_minute_observation_completed'<>'true'::jsonb or p_evidence->'middle'->'see_before_judge_completed'<>'true'::jsonb or p_evidence->'middle'->'psalm_91_2_prayer_confirmed'<>'true'::jsonb then raise exception 'day011_middle_required'; end if;
 if jsonb_typeof(p_evidence->'middle'->'attention_stability_score')<>'number' then raise exception 'day011_attention_score_invalid'; end if;
 n:=(p_evidence->'middle'->>'attention_stability_score')::numeric; if n<0 or n>10 or trunc(n)<>n then raise exception 'day011_attention_score_invalid'; end if;
 v:=p_evidence->'middle'->>'final_observation_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day011_final_observation_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day011_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','observation_vs_interpretation_vault_entry_ref')) then raise exception 'day011_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb then raise exception 'day011_soul_mirror_required'; end if;
 v:=p_evidence->'soul_mirror'->>'observation_vs_interpretation_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day011_soul_mirror_vault_ref_invalid'; end if;
end$$;

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$
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
  else raise exception 'completion_validator_not_supported';
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D011-COMP-V1','HNK-KETHER-D011-V1',11,'9b7140dee8d346a4ea81dd753d342e4c1f172b0d','1.0.0','day011_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='active',updated_at=now();
