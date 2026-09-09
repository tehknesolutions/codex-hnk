create or replace function hnk_private.validate_day016_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text;
begin
 if jsonb_typeof(p_evidence)<>'object' then raise exception 'day016_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day016_unknown_top_field'; end if;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D016-V1' then raise exception 'day016_protocol_invalid'; end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'cc19245af2b1b23c56bc337b6ec1bce5ead7b2e3' then raise exception 'day016_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day016_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day016_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day016_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred')<>'boolean' then raise exception 'day016_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day016_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','prelabel_perception_count','automatic_label_noticed','returned_to_direct_experience','prelabel_and_label_vault_entry_ref')) then raise exception 'day016_jachin_unknown_field'; end if;
 if p_evidence->'jachin'->'duration_seconds'<>'300'::jsonb then raise exception 'day016_jachin_duration_invalid'; end if;
 if p_evidence->'jachin'->'prelabel_perception_count'<>'3'::jsonb then raise exception 'day016_three_prelabel_perceptions_required'; end if;
 if p_evidence->'jachin'->'automatic_label_noticed'<>'true'::jsonb or p_evidence->'jachin'->'returned_to_direct_experience'<>'true'::jsonb then raise exception 'day016_jachin_method_required'; end if;
 r:=p_evidence->'jachin'->>'prelabel_and_label_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day016_jachin_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day016_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','perception_interpretation_belief_separated','spoken_description_compared','association_not_external_fact_confirmed','layers_vault_entry_ref')) then raise exception 'day016_boaz_unknown_field'; end if;
 if p_evidence->'boaz'->'duration_seconds'<>'300'::jsonb then raise exception 'day016_boaz_duration_invalid'; end if;
 if p_evidence->'boaz'->'perception_interpretation_belief_separated'<>'true'::jsonb or p_evidence->'boaz'->'spoken_description_compared'<>'true'::jsonb then raise exception 'day016_boaz_layers_required'; end if;
 if p_evidence->'boaz'->'association_not_external_fact_confirmed'<>'true'::jsonb then raise exception 'day016_epistemic_boundary_required'; end if;
 r:=p_evidence->'boaz'->>'layers_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day016_boaz_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day016_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','silence_listening_seconds','chosen_word_observation_seconds','final_prayer_seconds','psalm_6_4_prayer_confirmed','word_not_total_reality_confirmed','integration_vault_entry_ref')) then raise exception 'day016_middle_unknown_field'; end if;
 if p_evidence->'middle'->'duration_seconds'<>'300'::jsonb then raise exception 'day016_middle_duration_invalid'; end if;
 if p_evidence->'middle'->'silence_listening_seconds'<>'120'::jsonb or p_evidence->'middle'->'chosen_word_observation_seconds'<>'120'::jsonb or p_evidence->'middle'->'final_prayer_seconds'<>'60'::jsonb then raise exception 'day016_middle_segments_invalid'; end if;
 if p_evidence->'middle'->'psalm_6_4_prayer_confirmed'<>'true'::jsonb or p_evidence->'middle'->'word_not_total_reality_confirmed'<>'true'::jsonb then raise exception 'day016_middle_integration_required'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day016_middle_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day016_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','helpful_word_vs_replacing_label_vault_entry_ref')) then raise exception 'day016_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb then raise exception 'day016_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'helpful_word_vs_replacing_label_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day016_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D016-COMP-V1','HNK-KETHER-D016-V1',16,'cc19245af2b1b23c56bc337b6ec1bce5ead7b2e3','1.0.0','day016_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;