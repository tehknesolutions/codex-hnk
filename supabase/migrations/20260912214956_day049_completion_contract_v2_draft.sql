create or replace function hnk_private.validate_day049_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare a jsonb; c jsonb; cmp jsonb; m jsonb; k text; r text; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day049_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','active','control','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day049_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D049-V2' then raise exception 'day049_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '63932dceb3e412a5f6a067049d8a57e0374ed68e' then raise exception 'day049_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day049_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day049_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day049_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day049_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','CHEST_PAIN','FAINTING','IMPORTANT_SHORTNESS_OF_BREATH','PERSISTENT_PALPITATIONS','OTHER_DISCOMFORT') then raise exception 'day049_v2_safety_reason_invalid'; end if;
 if (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day049_v2_safety_reason_required'; end if;
 if not (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day049_v2_safety_reason_without_stop'; end if;

 a:=p_evidence->'active'; c:=p_evidence->'control';
 if jsonb_typeof(a) is distinct from 'object' or jsonb_typeof(c) is distinct from 'object' then raise exception 'day049_v2_conditions_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('rest_seconds','count_seconds','attention_site','pulse_count','heat_present','heat_intensity','comfort','anxiety','interoceptive_clarity','expectation','natural_breathing_confirmed','neck_compression_absent_confirmed','ideal_number_target_absent_confirmed','returned_to_common_focus_confirmed','thermal_visualization_completed_confirmed','thermal_visualization_after_count_confirmed','vault_entry_ref')) then raise exception 'day049_v2_active_unknown_field'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('rest_seconds','count_seconds','attention_site','pulse_count','heat_present','heat_intensity','comfort','anxiety','interoceptive_clarity','expectation','natural_breathing_confirmed','neck_compression_absent_confirmed','ideal_number_target_absent_confirmed','returned_to_common_focus_confirmed','thermal_visualization_absent_confirmed','similar_rest_context_confirmed','same_measurement_method_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed','vault_entry_ref')) then raise exception 'day049_v2_control_unknown_field'; end if;
 if a->'rest_seconds' is distinct from '300'::jsonb or c->'rest_seconds' is distinct from '300'::jsonb then raise exception 'day049_v2_rest_300_required'; end if;
 if a->'count_seconds' is distinct from '30'::jsonb or c->'count_seconds' is distinct from '30'::jsonb then raise exception 'day049_v2_count_30_required'; end if;
 if a->>'attention_site' not in ('WRIST','CHEST_PERCEPTION') or c->>'attention_site' not in ('WRIST','CHEST_PERCEPTION') then raise exception 'day049_v2_attention_site_invalid'; end if;
 if a->>'attention_site' is distinct from c->>'attention_site' then raise exception 'day049_v2_measurement_site_mismatch'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'pulse_count'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'pulse_count'),false) or (a->>'pulse_count')::int>300 or (c->>'pulse_count')::int>300 then raise exception 'day049_v2_pulse_count_invalid'; end if;
 foreach k in array array['heat_intensity','comfort','anxiety','interoceptive_clarity','expectation'] loop
   if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->k),false) or (a->>k)::int>10 then raise exception 'day049_v2_active_scalar_invalid:%',k; end if;
   if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) or (c->>k)::int>10 then raise exception 'day049_v2_control_scalar_invalid:%',k; end if;
 end loop;
 if jsonb_typeof(a->'heat_present') is distinct from 'boolean' or jsonb_typeof(c->'heat_present') is distinct from 'boolean' then raise exception 'day049_v2_heat_flag_invalid'; end if;
 if not (a->>'heat_present')::boolean and (a->>'heat_intensity')::int<>0 then raise exception 'day049_v2_active_absent_heat_intensity_must_be_zero'; end if;
 if not (c->>'heat_present')::boolean and (c->>'heat_intensity')::int<>0 then raise exception 'day049_v2_control_absent_heat_intensity_must_be_zero'; end if;
 foreach k in array array['natural_breathing_confirmed','neck_compression_absent_confirmed','ideal_number_target_absent_confirmed','returned_to_common_focus_confirmed'] loop
   if a->k is distinct from 'true'::jsonb or c->k is distinct from 'true'::jsonb then raise exception 'day049_v2_common_boundary_required:%',k; end if;
 end loop;
 if a->'thermal_visualization_completed_confirmed' is distinct from 'true'::jsonb or a->'thermal_visualization_after_count_confirmed' is distinct from 'true'::jsonb then raise exception 'day049_v2_active_thermal_sequence_required'; end if;
 foreach k in array array['thermal_visualization_absent_confirmed','similar_rest_context_confirmed','same_measurement_method_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day049_v2_control_boundary_required:%',k; end if; end loop;
 if a ? 'vault_entry_ref' then r:=a->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day049_v2_active_vault_ref_invalid'; end if; end if;
 if c ? 'vault_entry_ref' then r:=c->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day049_v2_control_vault_ref_invalid'; end if; end if;

 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day049_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','diagnosis_not_made_confirmed','treatment_not_claimed_confirmed','clinical_evaluation_not_replaced_confirmed','pulse_difference_not_treated_as_diagnosis_confirmed','heat_not_treated_as_external_measurement_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed','vault_entry_ref')) then raise exception 'day049_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','diagnosis_not_made_confirmed','treatment_not_claimed_confirmed','clinical_evaluation_not_replaced_confirmed','pulse_difference_not_treated_as_diagnosis_confirmed','heat_not_treated_as_external_measurement_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day049_v2_comparison_boundary_required:%',k; end if; end loop;
 if cmp ? 'vault_entry_ref' then r:=cmp->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day049_v2_comparison_vault_ref_invalid'; end if; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day049_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','medical_narrative_absent_from_practice_record_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day049_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','medical_narrative_absent_from_practice_record_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day049_v2_middle_boundary_required:%',k; end if; end loop;
 if m ? 'vault_entry_ref' then r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day049_v2_middle_vault_ref_invalid'; end if; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','active_rest_completed',true,'active_count_completed',true,'thermal_visualization_completed',a->'thermal_visualization_completed_confirmed','control_rest_completed',true,'control_count_completed',true,'comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','no_diagnosis_claim',cmp->'diagnosis_not_made_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','active_pulse_count',a->'pulse_count','control_pulse_count',c->'pulse_count','active_heat_present',a->'heat_present','control_heat_present',c->'heat_present','active_rest_seconds',300,'active_count_seconds',30,'control_rest_seconds',300,'control_count_seconds',30);
 perform hnk_private.validate_day049_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_aladiah_049_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day<>49 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=49) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=49;
 if v_status is distinct from 'canon' then raise exception 'aladiah_day049_canonical_day_not_available'; end if;
 if v_source_sha is distinct from '63932dceb3e412a5f6a067049d8a57e0374ed68e' then raise exception 'day049_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D049-V2' then perform hnk_private.validate_day049_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day049_scalar_evidence_v1(new.evidence); end if;
 return new;
end$$;

do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day049_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day049_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day049_v2'' then perform hnk_private.validate_day049_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D049-COMP-V2','HNK-CHOKMAH-D049-V2',49,'63932dceb3e412a5f6a067049d8a57e0374ed68e','2.0.0','day049_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
