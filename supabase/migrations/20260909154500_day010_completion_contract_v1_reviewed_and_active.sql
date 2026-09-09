create or replace function hnk_private.validate_day010_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$
declare v text;
begin
 if jsonb_typeof(p_evidence)<>'object' then raise exception 'day010_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day010_unknown_top_field'; end if;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D010-V1' then raise exception 'day010_protocol_invalid'; end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'167b3380e029456be1571f1d6dc3d491775acec5' then raise exception 'day010_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day010_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day010_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day010_voluntary_completion_required'; end if;
 if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day010_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('calm_before','calm_after','anchor_paired','somatic_vault_entry_ref')) then raise exception 'day010_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'calm_before')<>'number' or (p_evidence->'jachin'->>'calm_before')::numeric not between 0 and 10 then raise exception 'day010_calm_before_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'calm_after')<>'number' or (p_evidence->'jachin'->>'calm_after')::numeric not between 0 and 10 then raise exception 'day010_calm_after_invalid'; end if;
 if p_evidence->'jachin'->'anchor_paired'<>'true'::jsonb then raise exception 'day010_anchor_pairing_required'; end if;
 v:=p_evidence->'jachin'->>'somatic_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day010_somatic_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day010_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('neutral_test_completed','response','suppression_avoidance_confirmed','non_infallibility_confirmed')) then raise exception 'day010_boaz_unknown_field'; end if;
 if p_evidence->'boaz'->'neutral_test_completed'<>'true'::jsonb or p_evidence->'boaz'->'suppression_avoidance_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'non_infallibility_confirmed'<>'true'::jsonb then raise exception 'day010_boaz_required'; end if;
 if p_evidence->'boaz'->>'response' not in ('STRONG','WEAK','ABSENT') then raise exception 'day010_response_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day010_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('final_pairing_completed','psalm_22_19_prayer_confirmed','extraordinary_sensation_not_required_confirmed')) then raise exception 'day010_middle_unknown_field'; end if;
 if p_evidence->'middle'->'final_pairing_completed'<>'true'::jsonb or p_evidence->'middle'->'psalm_22_19_prayer_confirmed'<>'true'::jsonb or p_evidence->'middle'->'extraordinary_sensation_not_required_confirmed'<>'true'::jsonb then raise exception 'day010_middle_required'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day010_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','response_recorded','responsible_use_vault_entry_ref')) then raise exception 'day010_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb or p_evidence->'soul_mirror'->'response_recorded'<>'true'::jsonb then raise exception 'day010_soul_mirror_required'; end if;
 v:=p_evidence->'soul_mirror'->>'responsible_use_vault_entry_ref'; if v is null or v!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day010_responsible_use_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported';
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D010-COMP-V1','HNK-KETHER-D010-V1',10,'167b3380e029456be1571f1d6dc3d491775acec5','1.0.0','day010_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='active',updated_at=now();
