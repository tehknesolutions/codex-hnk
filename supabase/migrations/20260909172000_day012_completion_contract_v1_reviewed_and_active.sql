create or replace function hnk_private.validate_day012_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$
declare v text; n numeric;
begin
 if jsonb_typeof(p_evidence)<>'object' then raise exception 'day012_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','safety','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day012_unknown_top_field'; end if;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D012-V1' then raise exception 'day012_protocol_invalid'; end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'a3be33e6d390b6c507e284d6dad6aaf94ebd4294' then raise exception 'day012_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day012_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day012_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day012_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred')<>'boolean' then raise exception 'day012_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'safety')<>'object' then raise exception 'day012_fire_safety_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'safety') k where k not in ('stable_surface_confirmed','flammables_clear_confirmed','children_animals_clear_confirmed','continuous_supervision_confirmed','alert_not_sleepy_confirmed','natural_blinking_confirmed')) then raise exception 'day012_safety_unknown_field'; end if;
 if p_evidence->'safety'->'stable_surface_confirmed'<>'true'::jsonb or p_evidence->'safety'->'flammables_clear_confirmed'<>'true'::jsonb or p_evidence->'safety'->'children_animals_clear_confirmed'<>'true'::jsonb or p_evidence->'safety'->'continuous_supervision_confirmed'<>'true'::jsonb or p_evidence->'safety'->'alert_not_sleepy_confirmed'<>'true'::jsonb or p_evidence->'safety'->'natural_blinking_confirmed'<>'true'::jsonb then raise exception 'day012_fire_safety_required'; end if;

 if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day012_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','distraction_count','returned_without_judgment_confirmed','return_vault_entry_ref')) then raise exception 'day012_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds')<>'number' then raise exception 'day012_jachin_duration_invalid'; end if;
 n:=(p_evidence->'jachin'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>600 then raise exception 'day012_jachin_duration_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'distraction_count')<>'number' then raise exception 'day012_jachin_distraction_count_invalid'; end if;
 n:=(p_evidence->'jachin'->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>100000 then raise exception 'day012_jachin_distraction_count_invalid'; end if;
 if p_evidence->'jachin'->'returned_without_judgment_confirmed'<>'true'::jsonb then raise exception 'day012_jachin_return_required'; end if;
 v:=p_evidence->'jachin'->>'return_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day012_jachin_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day012_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','distraction_count','competition_avoidance_confirmed','discomfort_response','no_forced_eye_strain_confirmed','distraction_discomfort_vault_entry_ref')) then raise exception 'day012_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'duration_seconds')<>'number' then raise exception 'day012_boaz_duration_invalid'; end if;
 n:=(p_evidence->'boaz'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>600 then raise exception 'day012_boaz_duration_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'distraction_count')<>'number' then raise exception 'day012_boaz_distraction_count_invalid'; end if;
 n:=(p_evidence->'boaz'->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>100000 then raise exception 'day012_boaz_distraction_count_invalid'; end if;
 if p_evidence->'boaz'->'competition_avoidance_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'no_forced_eye_strain_confirmed'<>'true'::jsonb then raise exception 'day012_boaz_safety_required'; end if;
 if p_evidence->'boaz'->>'discomfort_response' not in ('NONE','ADJUSTED','STOPPED') then raise exception 'day012_discomfort_response_invalid'; end if;
 v:=p_evidence->'boaz'->>'distraction_discomfort_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day012_boaz_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day012_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','thought_return_without_restart_confirmed','simultaneous_awareness_confirmed','psalm_91_2_prayer_confirmed','attention_stability_score','final_vault_entry_ref','flame_extinguished_confirmed')) then raise exception 'day012_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'duration_seconds')<>'number' then raise exception 'day012_middle_duration_invalid'; end if;
 n:=(p_evidence->'middle'->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>600 then raise exception 'day012_middle_duration_invalid'; end if;
 if p_evidence->'middle'->'thought_return_without_restart_confirmed'<>'true'::jsonb or p_evidence->'middle'->'simultaneous_awareness_confirmed'<>'true'::jsonb or p_evidence->'middle'->'psalm_91_2_prayer_confirmed'<>'true'::jsonb or p_evidence->'middle'->'flame_extinguished_confirmed'<>'true'::jsonb then raise exception 'day012_middle_required'; end if;
 if jsonb_typeof(p_evidence->'middle'->'attention_stability_score')<>'number' then raise exception 'day012_attention_score_invalid'; end if;
 n:=(p_evidence->'middle'->>'attention_stability_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day012_attention_score_invalid'; end if;
 v:=p_evidence->'middle'->>'final_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day012_middle_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day012_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','attention_distraction_return_vault_entry_ref')) then raise exception 'day012_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb then raise exception 'day012_soul_mirror_required'; end if;
 v:=p_evidence->'soul_mirror'->>'attention_distraction_return_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day012_soul_mirror_vault_ref_invalid'; end if;
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
  when 'day012_v1' then perform hnk_private.validate_day012_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'completion_validator_not_supported';
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D012-COMP-V1','HNK-KETHER-D012-V1',12,'a3be33e6d390b6c507e284d6dad6aaf94ebd4294','1.0.0','day012_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='active',updated_at=now();
