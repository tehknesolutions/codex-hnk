create or replace function hnk_private.validate_day067_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare a jsonb;c jsonb;x jsonb;p jsonb;m jsonb;s jsonb;k text;score_key text;r text;reason text;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day067_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) q where q not in ('protocol_version','source_sha','session_id','mode','active','control','cancellation','comparison','middle','private_vault_entry_ref','private_vault_e2ee_confirmed','practice_record_no_private_location_or_prose_confirmed','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day067_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D067-V2' then raise exception 'day067_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '1fe06968c724f74311e4fd567075fabc181f1125' then raise exception 'day067_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day067_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day067_v2_mode_invalid'; end if;
 r:=p_evidence->>'private_vault_entry_ref';
 if r is not null and r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day067_v2_vault_ref_invalid'; end if;
 if r is not null and p_evidence->'private_vault_e2ee_confirmed' is distinct from 'true'::jsonb then raise exception 'day067_v2_vault_requires_e2ee'; end if;
 if r is null and p_evidence ? 'private_vault_e2ee_confirmed' and p_evidence->'private_vault_e2ee_confirmed' is not null and p_evidence->'private_vault_e2ee_confirmed' is distinct from 'false'::jsonb then raise exception 'day067_v2_e2ee_without_vault_ref'; end if;
 if p_evidence->'practice_record_no_private_location_or_prose_confirmed' is distinct from 'true'::jsonb or p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day067_v2_completion_boundary_missing'; end if;
 reason:=coalesce(p_evidence->>'safety_stop_reason','NONE');
 if reason not in ('NONE','DISORIENTATION','STATE_PERSISTED','PHYSICAL_RISK','INTENSE_DISTRESS','OTHER') then raise exception 'day067_v2_safety_reason_invalid'; end if;
 if p_evidence->'safety_stop_occurred' is distinct from 'false'::jsonb or reason<>'NONE' then raise exception 'day067_v2_unresolved_safety_stop'; end if;

 a:=p_evidence->'active'; if jsonb_typeof(a) is distinct from 'object' then raise exception 'day067_v2_active_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) q where q not in ('active_seconds','effect_present','first_entry_completed_confirmed','ordinary_state_recovered_between_entries_confirmed','return_entry_completed_confirmed','known_safe_induction_confirmed','safe_location_no_obstacles_confirmed','vision_preserved_during_movement_confirmed','no_risky_task_while_immersed_confirmed','blue_circle_context_cue_confirmed','intention_formula_not_guarantee_confirmed','no_depth_forcing_confirmed','first_scores','return_scores')) then raise exception 'day067_v2_active_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'active_seconds'),false) or (a->>'active_seconds')::int<1 then raise exception 'day067_v2_active_duration_incomplete'; end if;
 if jsonb_typeof(a->'effect_present') is distinct from 'boolean' then raise exception 'day067_v2_active_effect_flag_invalid'; end if;
 foreach k in array array['first_entry_completed_confirmed','ordinary_state_recovered_between_entries_confirmed','return_entry_completed_confirmed','known_safe_induction_confirmed','safe_location_no_obstacles_confirmed','vision_preserved_during_movement_confirmed','no_risky_task_while_immersed_confirmed','blue_circle_context_cue_confirmed','intention_formula_not_guarantee_confirmed','no_depth_forcing_confirmed'] loop if a->k is distinct from 'true'::jsonb then raise exception 'day067_v2_active_boundary_required:%',k; end if; end loop;
 foreach k in array array['first_scores','return_scores'] loop s:=a->k; if jsonb_typeof(s) is distinct from 'object' or exists(select 1 from jsonb_object_keys(s) q where q not in ('latency_seconds','silence','tension','focus','comfort')) then raise exception 'day067_v2_active_scores_invalid:%',k; end if; if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->'latency_seconds'),false) then raise exception 'day067_v2_latency_invalid:%',k; end if; foreach score_key in array array['silence','tension','focus','comfort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->score_key),false) or (s->>score_key)::int>10 then raise exception 'day067_v2_active_score_invalid:%:%',k,score_key; end if; end loop; end loop;

 c:=p_evidence->'control'; if jsonb_typeof(c) is distinct from 'object' then raise exception 'day067_v2_control_required'; end if;
 if exists(select 1 from jsonb_object_keys(c) q where q not in ('control_seconds','effect_present','completed_confirmed','other_similar_safe_point_confirmed','same_posture_confirmed','approximate_same_duration_confirmed','no_blue_circle_confirmed','no_formula_confirmed','quietude_only_confirmed','scores')) then raise exception 'day067_v2_control_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'control_seconds'),false) or (c->>'control_seconds')::int<1 then raise exception 'day067_v2_control_duration_incomplete'; end if;
 if jsonb_typeof(c->'effect_present') is distinct from 'boolean' then raise exception 'day067_v2_control_effect_flag_invalid'; end if;
 foreach k in array array['completed_confirmed','other_similar_safe_point_confirmed','same_posture_confirmed','approximate_same_duration_confirmed','no_blue_circle_confirmed','no_formula_confirmed','quietude_only_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day067_v2_control_boundary_required:%',k; end if; end loop;
 s:=c->'scores'; if jsonb_typeof(s) is distinct from 'object' or exists(select 1 from jsonb_object_keys(s) q where q not in ('latency_seconds','silence','focus','expectation')) then raise exception 'day067_v2_control_scores_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->'latency_seconds'),false) then raise exception 'day067_v2_control_latency_invalid'; end if;
 foreach score_key in array array['silence','focus','expectation'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->score_key),false) or (s->>score_key)::int>10 then raise exception 'day067_v2_control_score_invalid:%',score_key; end if; end loop;

 x:=p_evidence->'cancellation'; if jsonb_typeof(x) is distinct from 'object' then raise exception 'day067_v2_cancellation_required'; end if;
 if exists(select 1 from jsonb_object_keys(x) q where q not in ('completed_confirmed','hands_opened_confirmed','breathing_confirmed','mental_closed_confirmed','walked_out_safely_confirmed','state_persisted_after_exit','grounding_if_persisted_confirmed','anchor_cancelable_confirmed','orientation_restored_confirmed','no_intensity_escalation_confirmed','no_external_attack_interpretation_confirmed')) then raise exception 'day067_v2_cancellation_unknown_field'; end if;
 foreach k in array array['completed_confirmed','hands_opened_confirmed','breathing_confirmed','mental_closed_confirmed','walked_out_safely_confirmed','anchor_cancelable_confirmed','orientation_restored_confirmed','no_intensity_escalation_confirmed','no_external_attack_interpretation_confirmed'] loop if x->k is distinct from 'true'::jsonb then raise exception 'day067_v2_cancellation_boundary_required:%',k; end if; end loop;
 if jsonb_typeof(x->'state_persisted_after_exit') is distinct from 'boolean' or jsonb_typeof(x->'grounding_if_persisted_confirmed') is distinct from 'boolean' then raise exception 'day067_v2_cancellation_flag_invalid'; end if;
 if x->'state_persisted_after_exit'='true'::jsonb and x->'grounding_if_persisted_confirmed' is distinct from 'true'::jsonb then raise exception 'day067_v2_grounding_required_if_state_persists'; end if;

 p:=p_evidence->'comparison'; if jsonb_typeof(p) is distinct from 'object' then raise exception 'day067_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(p) q where q not in ('completed_confirmed','after_active_and_control_confirmed','control_effect_is_valid_information_confirmed','no_objective_space_power_claimed_confirmed','no_active_superiority_required_confirmed','anchor_optional_tool_confirmed','no_territorial_obligation_confirmed','simpler_grounding_remains_available_confirmed','physical_safety_before_depth_confirmed','null_or_control_better_result_valid_confirmed')) then raise exception 'day067_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','after_active_and_control_confirmed','control_effect_is_valid_information_confirmed','no_objective_space_power_claimed_confirmed','no_active_superiority_required_confirmed','anchor_optional_tool_confirmed','no_territorial_obligation_confirmed','simpler_grounding_remains_available_confirmed','physical_safety_before_depth_confirmed','null_or_control_better_result_valid_confirmed'] loop if p->k is distinct from 'true'::jsonb then raise exception 'day067_v2_comparison_boundary_required:%',k; end if; end loop;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day067_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) q where q not in ('psalm_9_9_confirmed','mem_bet_he_confirmed','brief_anchor_entry_confirmed','state_recognized_confirmed','state_ended_by_choice_confirmed','instrumental_data_named_count','sensation_named_count','traditional_interpretation_named_count','left_circle_confirmed','body_moved_confirmed','orientation_confirmed','thanks_to_god_confirmed','marker_not_independent_power_confirmed','return_confirmed')) then raise exception 'day067_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_9_9_confirmed','mem_bet_he_confirmed','brief_anchor_entry_confirmed','state_recognized_confirmed','state_ended_by_choice_confirmed','left_circle_confirmed','body_moved_confirmed','orientation_confirmed','thanks_to_god_confirmed','marker_not_independent_power_confirmed','return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day067_v2_middle_boundary_required:%',k; end if; end loop;
 foreach k in array array['instrumental_data_named_count','sensation_named_count','traditional_interpretation_named_count'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(m->k),false) or (m->>k)::int<>1 then raise exception 'day067_v2_middle_exactly_one_required:%',k; end if; end loop;

 perform hnk_private.validate_day067_scalar_evidence_v1(jsonb_build_object(
  'protocol_completed',true,'return_confirmed',m->'return_confirmed','anchor_first_completed',a->'first_entry_completed_confirmed','anchor_return_completed',a->'return_entry_completed_confirmed','control_completed',c->'completed_confirmed','cancellation_completed',x->'completed_confirmed','comparison_completed',p->'completed_confirmed','objective_space_power_not_claimed',p->'no_objective_space_power_claimed_confirmed','risk_movement_avoided',a->'no_risky_task_while_immersed_confirmed','orientation_preserved',x->'orientation_restored_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','active_effect_present',a->'effect_present','control_effect_present',c->'effect_present','active_seconds',a->'active_seconds','control_seconds',c->'control_seconds'));
end $$;

create or replace function hnk_private.enforce_mebahel_067_071_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare existing boolean; sha text; st text; begin
 if new.day not in (67,68,69,70,71) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into existing; if existing then return new; end if;
 select source_sha,status into sha,st from public.codex_days where day=new.day; if st is distinct from 'canon' then raise exception 'mebahel_canonical_day_not_available'; end if;
 if new.day=67 then if sha is distinct from '1fe06968c724f74311e4fd567075fabc181f1125' then raise exception 'day067_canonical_source_sha_mismatch'; end if; if new.evidence->>'protocol_version'='HNK-CHOKMAH-D067-V2' then perform hnk_private.validate_day067_completion_v2(new.evidence,sha); else perform hnk_private.validate_day067_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=68 then if sha is distinct from '176ebffccc845a909f5d1d2bdb88181b94809afb' then raise exception 'day068_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day068_scalar_evidence_v1(new.evidence);
 elsif new.day=69 then if sha is distinct from '5ec5e7ade94e1a20c348028d75517475a6920e5a' then raise exception 'day069_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day069_scalar_evidence_v1(new.evidence);
 elsif new.day=70 then if sha is distinct from 'bb1e47aee510fe9df58a46f697ebafb9005e223e' then raise exception 'day070_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day070_scalar_evidence_v1(new.evidence);
 else if sha is distinct from '6dfa6b5768bd7cdc2812d5dbfc68a8bc66ad90c3' then raise exception 'day071_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day071_scalar_evidence_v1(new.evidence); end if;
 return new;
end $$;

do $$ declare d text; begin
 d:=pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure);
 if position('when ''day067_v2''' in d)=0 then
  d:=replace(d,'else raise exception ''unsupported_completion_validator:%'',p_validator_key;','when ''day067_v2'' then perform hnk_private.validate_day067_completion_v2(p_evidence,p_expected_source_sha);'||chr(10)||'  else raise exception ''unsupported_completion_validator:%'',p_validator_key;');
  if position('when ''day067_v2''' in d)=0 then raise exception 'day067_dispatcher_patch_failed'; end if;
  execute d;
 end if;
end $$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D067-COMP-V2','HNK-CHOKMAH-D067-V2',67,'1fe06968c724f74311e4fd567075fabc181f1125','2.0.0','day067_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
