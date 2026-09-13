create or replace function hnk_private.validate_day051_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare s jsonb; c jsonb; cmp jsonb; m jsonb; a jsonb; k text; r text; legacy jsonb; stopped boolean;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day051_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','private_artifacts','sigil','text_control','comparison','middle','symbol_archived_confirmed','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day051_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D051-V2' then raise exception 'day051_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'e70910495dbbe0c70cece9b694271ded7799c7fd' then raise exception 'day051_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day051_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day051_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day051_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day051_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','FEAR_INCREASE','COMPULSION_INCREASE','EXCESSIVE_VIGILANCE','INVULNERABILITY_SENSATION','OTHER_DISCOMFORT') then raise exception 'day051_v2_safety_reason_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean;
 if stopped and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day051_v2_safety_reason_required'; end if;
 if not stopped and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day051_v2_safety_reason_without_stop'; end if;
 if stopped and p_evidence->'symbol_archived_confirmed' is distinct from 'true'::jsonb then raise exception 'day051_v2_symbol_archive_required_after_stop'; end if;
 if jsonb_typeof(p_evidence->'symbol_archived_confirmed') is distinct from 'boolean' then raise exception 'day051_v2_symbol_archive_flag_invalid'; end if;

 a:=p_evidence->'private_artifacts'; if jsonb_typeof(a) is distinct from 'object' then raise exception 'day051_v2_private_artifacts_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('original_phrase_vault_ref','reduction_vault_ref','drawing_vault_ref')) then raise exception 'day051_v2_private_artifact_unknown_field'; end if;
 foreach k in array array['original_phrase_vault_ref','reduction_vault_ref','drawing_vault_ref'] loop r:=a->>k; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day051_v2_required_vault_ref_invalid:%',k; end if; end loop;

 s:=p_evidence->'sigil'; c:=p_evidence->'text_control';
 if jsonb_typeof(s) is distinct from 'object' or jsonb_typeof(c) is distinct from 'object' then raise exception 'day051_v2_conditions_required'; end if;
 if exists(select 1 from jsonb_object_keys(s) x where x not in ('observation_seconds','effect_present','focus','protection_sensation','anxiety','pearl_blue_present','comfort','expectation','reduction_documented_confirmed','sigil_drawn_confirmed','observe_verify_do_not_feed_panic_rule_confirmed','natural_breathing_confirmed','result_chasing_absent_confirmed','returned_to_common_focus_confirmed')) then raise exception 'day051_v2_sigil_unknown_field'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('same_rule_plain_text_without_sigil_confirmed','non_critical_daily_context_confirmed','similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed','effect_present','focus','protection_sensation','anxiety','pearl_blue_present','comfort','expectation','measured_seconds')) then raise exception 'day051_v2_control_unknown_field'; end if;
 if s->'observation_seconds' is distinct from '180'::jsonb then raise exception 'day051_v2_observation_180_required'; end if;
 foreach k in array array['effect_present','pearl_blue_present'] loop if jsonb_typeof(s->k) is distinct from 'boolean' or jsonb_typeof(c->k) is distinct from 'boolean' then raise exception 'day051_v2_effect_flag_invalid:%',k; end if; end loop;
 foreach k in array array['focus','protection_sensation','anxiety','comfort','expectation'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->k),false) or (s->>k)::int>10 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) or (c->>k)::int>10 then raise exception 'day051_v2_scalar_invalid:%',k; end if; end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'measured_seconds'),false) or (c->>'measured_seconds')::int>86400 then raise exception 'day051_v2_control_measured_seconds_invalid'; end if;
 foreach k in array array['reduction_documented_confirmed','sigil_drawn_confirmed','observe_verify_do_not_feed_panic_rule_confirmed','natural_breathing_confirmed','result_chasing_absent_confirmed','returned_to_common_focus_confirmed'] loop if s->k is distinct from 'true'::jsonb then raise exception 'day051_v2_sigil_boundary_required:%',k; end if; end loop;
 foreach k in array array['same_rule_plain_text_without_sigil_confirmed','non_critical_daily_context_confirmed','similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day051_v2_control_boundary_required:%',k; end if; end loop;

 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day051_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','symbolic_anchor_only_confirmed','guaranteed_protection_not_claimed_confirmed','entities_accidents_diseases_protection_not_claimed_confirmed','pearl_blue_external_detection_not_claimed_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed','vault_entry_ref')) then raise exception 'day051_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','symbolic_anchor_only_confirmed','guaranteed_protection_not_claimed_confirmed','entities_accidents_diseases_protection_not_claimed_confirmed','pearl_blue_external_detection_not_claimed_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day051_v2_comparison_boundary_required:%',k; end if; end loop;
 if cmp ? 'vault_entry_ref' then r:=cmp->>'vault_entry_ref'; if r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day051_v2_comparison_vault_ref_invalid'; end if; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day051_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day051_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day051_v2_middle_boundary_required:%',k; end if; end loop;
 if m ? 'vault_entry_ref' then r:=m->>'vault_entry_ref'; if r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day051_v2_middle_vault_ref_invalid'; end if; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','reduction_documented',s->'reduction_documented_confirmed','sigil_drawn',s->'sigil_drawn_confirmed','observation_completed',true,'text_control_completed',c->'same_rule_plain_text_without_sigil_confirmed','comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','symbolic_anchor_only',cmp->'symbolic_anchor_only_confirmed','no_guaranteed_protection_claim',cmp->'guaranteed_protection_not_claimed_confirmed','panic_rule_acknowledged',s->'observe_verify_do_not_feed_panic_rule_confirmed','vault_saved',true,'safety_clear',p_evidence->'final_safety_clear_confirmed','sigil_effect_present',s->'effect_present','text_effect_present',c->'effect_present','sigil_observation_seconds',180);
 perform hnk_private.validate_day051_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_aladiah_051_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day<>51 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=51) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=51;
 if v_status is distinct from 'canon' then raise exception 'aladiah_day051_canonical_day_not_available'; end if;
 if v_source_sha is distinct from 'e70910495dbbe0c70cece9b694271ded7799c7fd' then raise exception 'day051_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D051-V2' then perform hnk_private.validate_day051_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day051_scalar_evidence_v1(new.evidence); end if;
 return new;
end$$;

do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day051_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day051_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day051_v2'' then perform hnk_private.validate_day051_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D051-COMP-V2','HNK-CHOKMAH-D051-V2',51,'e70910495dbbe0c70cece9b694271ded7799c7fd','2.0.0','day051_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
