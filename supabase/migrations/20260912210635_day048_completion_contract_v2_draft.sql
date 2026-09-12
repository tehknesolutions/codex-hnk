create or replace function hnk_private.validate_day048_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare l jsonb; c jsonb; cmp jsonb; m jsonb; k text; r text; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day048_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','loop_condition','linear_control','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day048_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D048-V2' then raise exception 'day048_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'ff8cae22023e70359768023dfc927ce94c1a27d5' then raise exception 'day048_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day048_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day048_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day048_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day048_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','ANXIETY','OVERLOAD','OTHER_DISCOMFORT') then raise exception 'day048_v2_safety_reason_invalid'; end if;
 if (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day048_v2_safety_reason_required'; end if;
 if not (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day048_v2_safety_reason_without_stop'; end if;
 l:=p_evidence->'loop_condition'; if jsonb_typeof(l) is distinct from 'object' then raise exception 'day048_v2_loop_required'; end if;
 if exists(select 1 from jsonb_object_keys(l) x where x not in ('loops_opened','opening_order','suspended_after_first','suspended_after_second','loops_closed','closure_order','all_threads_closed_confirmed','effect_present','curiosity','absorption','confusion','memory_effort','closure_sensation','expectation','comfort','measured_seconds','result_chasing_absent_confirmed','full_stories_vault_ref')) then raise exception 'day048_v2_loop_unknown_field'; end if;
 if l->'loops_opened' is distinct from '3'::jsonb or l->'loops_closed' is distinct from '3'::jsonb or l->'opening_order' is distinct from '[1,2,3]'::jsonb or l->'closure_order' is distinct from '[3,2,1]'::jsonb then raise exception 'day048_v2_loop_sequence_invalid'; end if;
 if l->'suspended_after_first' is distinct from 'true'::jsonb or l->'suspended_after_second' is distinct from 'true'::jsonb or l->'all_threads_closed_confirmed' is distinct from 'true'::jsonb or l->'result_chasing_absent_confirmed' is distinct from 'true'::jsonb then raise exception 'day048_v2_loop_boundaries_required'; end if;
 if jsonb_typeof(l->'effect_present') is distinct from 'boolean' then raise exception 'day048_v2_loop_effect_flag_invalid'; end if;
 foreach k in array array['curiosity','absorption','confusion','memory_effort','closure_sensation','expectation','comfort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(l->k),false) or (l->>k)::int>10 then raise exception 'day048_v2_loop_scalar_invalid:%',k; end if; end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(l->'measured_seconds'),false) or (l->>'measured_seconds')::int>86400 then raise exception 'day048_v2_loop_measured_seconds_invalid'; end if;
 r:=l->>'full_stories_vault_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day048_v2_loop_vault_required'; end if;
 c:=p_evidence->'linear_control'; if jsonb_typeof(c) is distinct from 'object' then raise exception 'day048_v2_linear_required'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('linear_stories_completed','independent_stories_confirmed','similar_length_confirmed','similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed','effect_present','curiosity','absorption','confusion','memory_effort','closure_sensation','expectation','comfort','measured_seconds','full_stories_vault_ref')) then raise exception 'day048_v2_linear_unknown_field'; end if;
 if c->'linear_stories_completed' is distinct from '3'::jsonb then raise exception 'day048_v2_linear_three_required'; end if;
 foreach k in array array['independent_stories_confirmed','similar_length_confirmed','similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day048_v2_linear_boundary_required:%',k; end if; end loop;
 if jsonb_typeof(c->'effect_present') is distinct from 'boolean' then raise exception 'day048_v2_linear_effect_flag_invalid'; end if;
 foreach k in array array['curiosity','absorption','confusion','memory_effort','closure_sensation','expectation','comfort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) or (c->>k)::int>10 then raise exception 'day048_v2_linear_scalar_invalid:%',k; end if; end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'measured_seconds'),false) or (c->>'measured_seconds')::int>86400 then raise exception 'day048_v2_linear_measured_seconds_invalid'; end if;
 r:=c->>'full_stories_vault_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day048_v2_linear_vault_required'; end if;
 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day048_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','consent_only_confirmed','coercion_not_used_confirmed','self_study_creation_or_consented_interaction_only_confirmed','preselected_winner_absent_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed','vault_entry_ref')) then raise exception 'day048_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','consent_only_confirmed','coercion_not_used_confirmed','self_study_creation_or_consented_interaction_only_confirmed','preselected_winner_absent_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day048_v2_comparison_boundary_required:%',k; end if; end loop;
 if cmp ? 'vault_entry_ref' then r:=cmp->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day048_v2_comparison_vault_invalid'; end if; end if;
 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day048_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day048_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day048_v2_middle_boundary_required:%',k; end if; end loop;
 if m ? 'vault_entry_ref' then r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day048_v2_middle_vault_invalid'; end if; end if;
 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','loop_structure_completed',true,'linear_control_completed',true,'all_threads_closed',l->'all_threads_closed_confirmed','comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','consent_only',cmp->'consent_only_confirmed','coercion_not_used',cmp->'coercion_not_used_confirmed','vault_saved',true,'safety_clear',p_evidence->'final_safety_clear_confirmed','loop_effect_present',l->'effect_present','linear_effect_present',c->'effect_present','loops_opened',3,'loops_closed',3,'linear_stories_completed',3);
 perform hnk_private.validate_day048_scalar_evidence_v1(legacy);
end$$;
create or replace function hnk_private.enforce_aladiah_048_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day<>48 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=48) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=48;
 if v_status is distinct from 'canon' then raise exception 'aladiah_day048_canonical_day_not_available'; end if;
 if v_source_sha is distinct from 'ff8cae22023e70359768023dfc927ce94c1a27d5' then raise exception 'day048_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D048-V2' then perform hnk_private.validate_day048_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day048_scalar_evidence_v1(new.evidence); end if;
 return new;
end$$;
do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day048_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day048_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day048_v2'' then perform hnk_private.validate_day048_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;
insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D048-COMP-V2','HNK-CHOKMAH-D048-V2',48,'ff8cae22023e70359768023dfc927ce94c1a27d5','2.0.0','day048_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
