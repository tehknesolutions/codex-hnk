create or replace function hnk_private.validate_day029_slot_metrics_v1(p_metrics jsonb,p_kind text)
returns void language plpgsql set search_path='' as $$
declare i integer; item jsonb; k text; n numeric;
begin
 if jsonb_typeof(p_metrics) is distinct from 'array' or jsonb_array_length(p_metrics)<>3 then raise exception 'day029_%_metrics_require_three_slots',p_kind; end if;
 for i in 0..2 loop
  item:=p_metrics->i;
  if jsonb_typeof(item) is distinct from 'object' then raise exception 'day029_%_metric_object_required',p_kind; end if;
  if jsonb_typeof(item->'slot') is distinct from 'number' or (item->>'slot')::numeric is distinct from (i+1)::numeric then raise exception 'day029_%_slot_order_invalid',p_kind; end if;
  if p_kind='pre' then
    if exists(select 1 from jsonb_object_keys(item) x where x not in ('slot','emotion_score','decision_score')) then raise exception 'day029_pre_metric_unknown_field'; end if;
    foreach k in array array['emotion_score','decision_score'] loop if jsonb_typeof(item->k) is distinct from 'number' then raise exception 'day029_pre_score_invalid'; end if; n:=(item->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day029_pre_score_invalid'; end if; end loop;
  elsif p_kind='control' then
    if exists(select 1 from jsonb_object_keys(item) x where x not in ('slot','emotion_score','decision_score','change_urgency_score')) then raise exception 'day029_control_metric_unknown_field'; end if;
    foreach k in array array['emotion_score','decision_score','change_urgency_score'] loop if jsonb_typeof(item->k) is distinct from 'number' then raise exception 'day029_control_score_invalid'; end if; n:=(item->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day029_control_score_invalid'; end if; end loop;
  elsif p_kind='post' then
    if exists(select 1 from jsonb_object_keys(item) x where x not in ('slot','emotion_score','decision_score','repeat_impulse_score')) then raise exception 'day029_post_metric_unknown_field'; end if;
    foreach k in array array['emotion_score','decision_score','repeat_impulse_score'] loop if jsonb_typeof(item->k) is distinct from 'number' then raise exception 'day029_post_score_invalid'; end if; n:=(item->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day029_post_score_invalid'; end if; end loop;
  else raise exception 'day029_metric_kind_invalid'; end if;
 end loop;
end$$;

create or replace function hnk_private.validate_day029_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; v_uid uuid:=auth.uid(); v_material text; v_closure text; v_24 uuid; v_7d uuid; v_ok boolean;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day029_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day029_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D029-V1' then raise exception 'day029_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'cb3ffc429076d323d9996fbe9c22a458f9c49dde' then raise exception 'day029_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day029_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day029_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day029_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day029_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day029_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') x where x not in ('duration_seconds','material','patterns_count','replacement_behaviors_count','identity_separated_from_patterns_confirmed','natural_breathing_confirmed','costs_named_confirmed','pre_metrics','pattern_map_vault_entry_ref')) then raise exception 'day029_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'duration_seconds') is distinct from 'number' or (p_evidence->'jachin'->>'duration_seconds')::numeric is distinct from 420::numeric then raise exception 'day029_jachin_requires_420_seconds'; end if;
 v_material:=p_evidence->'jachin'->>'material'; if v_material not in ('PAPER','CLAY') then raise exception 'day029_material_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'patterns_count') is distinct from 'number' or (p_evidence->'jachin'->>'patterns_count')::numeric is distinct from 3::numeric or jsonb_typeof(p_evidence->'jachin'->'replacement_behaviors_count') is distinct from 'number' or (p_evidence->'jachin'->>'replacement_behaviors_count')::numeric is distinct from 3::numeric then raise exception 'day029_three_patterns_and_replacements_required'; end if;
 if p_evidence->'jachin'->'identity_separated_from_patterns_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'costs_named_confirmed' is distinct from 'true'::jsonb then raise exception 'day029_jachin_requirements'; end if;
 perform hnk_private.validate_day029_slot_metrics_v1(p_evidence->'jachin'->'pre_metrics','pre');
 r:=p_evidence->'jachin'->>'pattern_map_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day029_pattern_map_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day029_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') x where x not in ('control_and_closure_duration_seconds','control_reading_before_closure_confirmed','control_metrics','closure_method','single_material_closure_completed','self_punishment_rejected_confirmed','body_soul_dignity_not_targeted_confirmed','physical_harm_absent_confirmed','fire_not_used_confirmed','cutting_not_required_confirmed','destruction_not_merit_confirmed','post_metrics','first_substitute_slot','comparison_vault_entry_ref')) then raise exception 'day029_boaz_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'boaz'->'control_and_closure_duration_seconds') is distinct from 'number' then raise exception 'day029_boaz_duration_invalid'; end if; n:=(p_evidence->'boaz'->>'control_and_closure_duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>86400 then raise exception 'day029_boaz_duration_invalid'; end if;
 v_closure:=p_evidence->'boaz'->>'closure_method'; if v_closure not in ('TEAR_PAPER','DISASSEMBLE_CLAY','ERASE_WATER_SOLUBLE_MARKS') then raise exception 'day029_closure_method_invalid'; end if;
 if (v_material='CLAY' and v_closure='TEAR_PAPER') or (v_material='PAPER' and v_closure='DISASSEMBLE_CLAY') then raise exception 'day029_closure_material_mismatch'; end if;
 if p_evidence->'boaz'->'control_reading_before_closure_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'single_material_closure_completed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'self_punishment_rejected_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'body_soul_dignity_not_targeted_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'physical_harm_absent_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'fire_not_used_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'cutting_not_required_confirmed' is distinct from 'true'::jsonb or p_evidence->'boaz'->'destruction_not_merit_confirmed' is distinct from 'true'::jsonb then raise exception 'day029_boaz_safety_requirements'; end if;
 perform hnk_private.validate_day029_slot_metrics_v1(p_evidence->'boaz'->'control_metrics','control'); perform hnk_private.validate_day029_slot_metrics_v1(p_evidence->'boaz'->'post_metrics','post');
 if jsonb_typeof(p_evidence->'boaz'->'first_substitute_slot') is distinct from 'number' then raise exception 'day029_first_substitute_slot_invalid'; end if; n:=(p_evidence->'boaz'->>'first_substitute_slot')::numeric; if n<>trunc(n) or n<1 or n>3 then raise exception 'day029_first_substitute_slot_invalid'; end if;
 r:=p_evidence->'boaz'->>'comparison_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day029_comparison_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day029_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') x where x not in ('integration_pre_visualization_duration_seconds','single_closure_already_completed_confirmed','lamed_lamed_he_once_confirmed','psalm_9_11_orientation_confirmed','prayer_to_god_confirmed','future_response_visualization_seconds','first_action_scheduled_today_confirmed','observation_24h_action_id','review_7d_action_id','followup_window_elapsed_not_success_confirmed','e1_e5_recorded_confirmed','integration_vault_entry_ref')) then raise exception 'day029_middle_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'middle'->'integration_pre_visualization_duration_seconds') is distinct from 'number' then raise exception 'day029_middle_duration_invalid'; end if; n:=(p_evidence->'middle'->>'integration_pre_visualization_duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>86400 then raise exception 'day029_middle_duration_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle'->'future_response_visualization_seconds') is distinct from 'number' or (p_evidence->'middle'->>'future_response_visualization_seconds')::numeric is distinct from 60::numeric then raise exception 'day029_middle_requires_60_seconds'; end if;
 if p_evidence->'middle'->'single_closure_already_completed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'lamed_lamed_he_once_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_9_11_orientation_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'prayer_to_god_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'first_action_scheduled_today_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'followup_window_elapsed_not_success_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'e1_e5_recorded_confirmed' is distinct from 'true'::jsonb then raise exception 'day029_middle_requirements'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day029_integration_vault_ref_invalid'; end if;
 begin v_24:=(p_evidence->'middle'->>'observation_24h_action_id')::uuid; exception when others then raise exception 'day029_24h_action_id_invalid'; end;
 begin v_7d:=(p_evidence->'middle'->>'review_7d_action_id')::uuid; exception when others then raise exception 'day029_7d_action_id_invalid'; end;
 if v_24=v_7d then raise exception 'day029_followup_action_ids_must_differ'; end if;
 if v_uid is null then raise exception 'day029_authentication_required_for_followup_validation'; end if;
 select exists(select 1 from hnk_private.real_world_actions a where a.id=v_24 and a.user_id=v_uid and a.day=29 and a.action_contract_id='HNK-KETHER-D029-SUBSTITUTION-24H-V1' and a.state in ('active','qualified')) into v_ok; if not v_ok then raise exception 'day029_24h_action_not_started'; end if;
 select exists(select 1 from hnk_private.real_world_actions a where a.id=v_7d and a.user_id=v_uid and a.day=29 and a.action_contract_id='HNK-KETHER-D029-REVIEW-7D-V1' and a.state in ('active','qualified')) into v_ok; if not v_ok then raise exception 'day029_7d_action_not_started'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day029_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') x where x not in ('completed','identity_pattern_substitute_vault_entry_ref')) then raise exception 'day029_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day029_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'identity_pattern_substitute_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day029_soul_vault_ref_invalid'; end if;
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
  when 'day024_v1' then perform hnk_private.validate_day024_completion_v1(p_evidence,p_expected_source_sha);
  when 'day025_v1' then perform hnk_private.validate_day025_completion_v1(p_evidence,p_expected_source_sha);
  when 'day026_v1' then perform hnk_private.validate_day026_completion_v1(p_evidence,p_expected_source_sha);
  when 'day027_v1' then perform hnk_private.validate_day027_completion_v1(p_evidence,p_expected_source_sha);
  when 'day028_v1' then perform hnk_private.validate_day028_completion_v1(p_evidence,p_expected_source_sha);
  when 'day029_v1' then perform hnk_private.validate_day029_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.real_world_action_contract_registry(action_contract_id,day,contract_version,action_key,target_elapsed_seconds,consecutive,status,metadata)
values
('HNK-KETHER-D029-SUBSTITUTION-24H-V1',29,'1','SUBSTITUTION_OBSERVATION_24H',86400,false,'active',jsonb_build_object('quest_definition_id','HNK-KETHER-D029-V1','phase_id','middle_integration','qualification_semantics','OBSERVATION_WINDOW_ELAPSED_NOT_SUCCESS','user_report_required_for_behavioral_conclusion',true,'private_prose_storage','VAULT_ONLY','grants_xp',false,'grants_attribute',false,'server_clock_authoritative',true)),
('HNK-KETHER-D029-REVIEW-7D-V1',29,'1','TRANSMUTATION_REVIEW_7D',604800,false,'active',jsonb_build_object('quest_definition_id','HNK-KETHER-D029-V1','phase_id','middle_integration','qualification_semantics','REVIEW_WINDOW_ELAPSED_NOT_SUCCESS','user_report_required_for_behavioral_conclusion',true,'private_prose_storage','VAULT_ONLY','grants_xp',false,'grants_attribute',false,'server_clock_authoritative',true))
on conflict(action_contract_id) do update set day=excluded.day,contract_version=excluded.contract_version,action_key=excluded.action_key,target_elapsed_seconds=excluded.target_elapsed_seconds,consecutive=excluded.consecutive,status=excluded.status,metadata=excluded.metadata,updated_at=now();

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D029-COMP-V1','HNK-KETHER-D029-V1',29,'cb3ffc429076d323d9996fbe9c22a458f9c49dde','1.0.0','day029_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
