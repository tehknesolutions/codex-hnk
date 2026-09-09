create or replace function hnk_private.validate_day015_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare v jsonb; n numeric; r text; m text; b jsonb;
begin
 if jsonb_typeof(p_evidence)<>'object' then raise exception 'day015_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day015_unknown_top_field'; end if;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D015-V1' then raise exception 'day015_protocol_invalid'; end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'2a5037afce694753bef1b89da89d2746850ef4a1' then raise exception 'day015_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day015_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day015_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day015_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred')<>'boolean' then raise exception 'day015_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day015_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('patterns_count','emotional_intensity_before','externalization_vault_entry_ref')) then raise exception 'day015_jachin_unknown_field'; end if;
 if p_evidence->'jachin'->'patterns_count'<>'3'::jsonb then raise exception 'day015_three_patterns_required'; end if;
 v:=p_evidence->'jachin'->'emotional_intensity_before'; if jsonb_typeof(v)<>'number' then raise exception 'day015_before_score_invalid'; end if; n:=(p_evidence->'jachin'->>'emotional_intensity_before')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day015_before_score_invalid'; end if;
 r:=p_evidence->'jachin'->>'externalization_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day015_jachin_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day015_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('method','symbolic_destruction_completed','emotional_intensity_after','symbol_not_guarantee_confirmed','responsibility_not_erased_confirmed','closure_vault_entry_ref','burn_safety')) then raise exception 'day015_boaz_unknown_field'; end if;
 m:=p_evidence->'boaz'->>'method'; if m not in ('BURN_SAFE','TEAR','SHRED_DISCARD') then raise exception 'day015_method_invalid'; end if;
 if p_evidence->'boaz'->'symbolic_destruction_completed'<>'true'::jsonb then raise exception 'day015_symbolic_destruction_required'; end if;
 v:=p_evidence->'boaz'->'emotional_intensity_after'; if jsonb_typeof(v)<>'number' then raise exception 'day015_after_score_invalid'; end if; n:=(p_evidence->'boaz'->>'emotional_intensity_after')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day015_after_score_invalid'; end if;
 if p_evidence->'boaz'->'symbol_not_guarantee_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'responsibility_not_erased_confirmed'<>'true'::jsonb then raise exception 'day015_boaz_boundary_required'; end if;
 r:=p_evidence->'boaz'->>'closure_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day015_boaz_vault_ref_invalid'; end if;
 if m='BURN_SAFE' then
  if not (p_evidence->'boaz' ? 'burn_safety') or jsonb_typeof(p_evidence->'boaz'->'burn_safety')<>'object' then raise exception 'day015_burn_safety_required'; end if;
  b:=p_evidence->'boaz'->'burn_safety';
  if exists(select 1 from jsonb_object_keys(b) k where k not in ('stable_surface_confirmed','flammables_clear_confirmed','heat_resistant_container_confirmed','water_available_confirmed','continuous_supervision_confirmed','safe_material_only_confirmed','flame_fully_extinguished_confirmed','area_rechecked_confirmed')) then raise exception 'day015_burn_safety_unknown_field'; end if;
  if b->'stable_surface_confirmed'<>'true'::jsonb or b->'flammables_clear_confirmed'<>'true'::jsonb or b->'heat_resistant_container_confirmed'<>'true'::jsonb or b->'water_available_confirmed'<>'true'::jsonb or b->'continuous_supervision_confirmed'<>'true'::jsonb or b->'safe_material_only_confirmed'<>'true'::jsonb or b->'flame_fully_extinguished_confirmed'<>'true'::jsonb or b->'area_rechecked_confirmed'<>'true'::jsonb then raise exception 'day015_burn_safety_required'; end if;
 else
  if p_evidence->'boaz' ? 'burn_safety' then raise exception 'day015_burn_safety_for_non_burn_forbidden'; end if;
 end if;
 if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day015_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('psalm_91_2_prayer_confirmed','discipline_score','responsibility_remains_confirmed','future_action_committed_not_claimed_completed','next_cycle_commitment_vault_entry_ref')) then raise exception 'day015_middle_unknown_field'; end if;
 if p_evidence->'middle'->'psalm_91_2_prayer_confirmed'<>'true'::jsonb or p_evidence->'middle'->'responsibility_remains_confirmed'<>'true'::jsonb or p_evidence->'middle'->'future_action_committed_not_claimed_completed'<>'true'::jsonb then raise exception 'day015_middle_required'; end if;
 v:=p_evidence->'middle'->'discipline_score'; if jsonb_typeof(v)<>'number' then raise exception 'day015_discipline_score_invalid'; end if; n:=(p_evidence->'middle'->>'discipline_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day015_discipline_score_invalid'; end if;
 r:=p_evidence->'middle'->>'next_cycle_commitment_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day015_middle_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day015_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','responsibility_and_tomorrow_action_vault_entry_ref')) then raise exception 'day015_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb then raise exception 'day015_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'responsibility_and_tomorrow_action_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day015_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D015-COMP-V1','HNK-KETHER-D015-V1',15,'2a5037afce694753bef1b89da89d2746850ef4a1','1.0.0','day015_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;