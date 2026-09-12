create or replace function hnk_private.validate_day050_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare p jsonb; c jsonb; cmp jsonb; m jsonb; k text; r text; legacy jsonb; used boolean; consent boolean;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day050_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','primary','control','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day050_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D050-V2' then raise exception 'day050_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '99f56677fb57d8ddfe191b081cae44734b38ae50' then raise exception 'day050_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day050_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day050_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day050_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day050_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','FATIGUE','EYE_PAIN','ANXIETY','SOCIAL_DISCOMFORT','OTHER_DISCOMFORT') then raise exception 'day050_v2_safety_reason_invalid'; end if;
 if (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day050_v2_safety_reason_required'; end if;
 if not (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day050_v2_safety_reason_without_stop'; end if;
 p:=p_evidence->'primary'; c:=p_evidence->'control';
 if jsonb_typeof(p) is distinct from 'object' or jsonb_typeof(c) is distinct from 'object' then raise exception 'day050_v2_conditions_required'; end if;
 if exists(select 1 from jsonb_object_keys(p) x where x not in ('duration_seconds','effect_present','color_present','halo_present','contrast_present','movement_present','intensity','stability','comfort','expectation','normal_blinking_confirmed','result_chasing_absent_confirmed','returned_to_common_focus_confirmed','vault_entry_ref','subject_mode','third_party_used','third_party_consent','simple_background_confirmed','indirect_comfortable_light_confirmed')) then raise exception 'day050_v2_primary_unknown_field'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('duration_seconds','effect_present','color_present','halo_present','contrast_present','movement_present','intensity','stability','comfort','expectation','normal_blinking_confirmed','result_chasing_absent_confirmed','returned_to_common_focus_confirmed','vault_entry_ref','control_mode','similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed')) then raise exception 'day050_v2_control_unknown_field'; end if;
 if p->'duration_seconds' is distinct from '300'::jsonb or c->'duration_seconds' is distinct from '300'::jsonb then raise exception 'day050_v2_duration_300_required'; end if;
 foreach k in array array['effect_present','color_present','halo_present','contrast_present','movement_present'] loop if jsonb_typeof(p->k) is distinct from 'boolean' or jsonb_typeof(c->k) is distinct from 'boolean' then raise exception 'day050_v2_effect_flag_invalid:%',k; end if; end loop;
 foreach k in array array['intensity','stability','comfort','expectation'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->k),false) or (p->>k)::int>10 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) or (c->>k)::int>10 then raise exception 'day050_v2_scalar_invalid:%',k; end if; end loop;
 if not (p->>'effect_present')::boolean and ((p->>'color_present')::boolean or (p->>'halo_present')::boolean or (p->>'contrast_present')::boolean or (p->>'movement_present')::boolean or (p->>'intensity')::int<>0 or (p->>'stability')::int<>0) then raise exception 'day050_v2_primary_absent_effect_metrics_must_be_zero'; end if;
 if not (c->>'effect_present')::boolean and ((c->>'color_present')::boolean or (c->>'halo_present')::boolean or (c->>'contrast_present')::boolean or (c->>'movement_present')::boolean or (c->>'intensity')::int<>0 or (c->>'stability')::int<>0) then raise exception 'day050_v2_control_absent_effect_metrics_must_be_zero'; end if;
 if (p->>'effect_present')::boolean and not ((p->>'color_present')::boolean or (p->>'halo_present')::boolean or (p->>'contrast_present')::boolean or (p->>'movement_present')::boolean) then raise exception 'day050_v2_primary_present_effect_requires_descriptor'; end if;
 if (c->>'effect_present')::boolean and not ((c->>'color_present')::boolean or (c->>'halo_present')::boolean or (c->>'contrast_present')::boolean or (c->>'movement_present')::boolean) then raise exception 'day050_v2_control_present_effect_requires_descriptor'; end if;
 foreach k in array array['normal_blinking_confirmed','result_chasing_absent_confirmed','returned_to_common_focus_confirmed'] loop if p->k is distinct from 'true'::jsonb or c->k is distinct from 'true'::jsonb then raise exception 'day050_v2_common_boundary_required:%',k; end if; end loop;
 if p->'simple_background_confirmed' is distinct from 'true'::jsonb or p->'indirect_comfortable_light_confirmed' is distinct from 'true'::jsonb then raise exception 'day050_v2_primary_environment_required'; end if;
 if p->>'subject_mode' not in ('SELF_REFLECTION','CONSENTED_THIRD_PARTY') then raise exception 'day050_v2_subject_mode_invalid'; end if;
 if jsonb_typeof(p->'third_party_used') is distinct from 'boolean' or jsonb_typeof(p->'third_party_consent') is distinct from 'boolean' then raise exception 'day050_v2_third_party_flags_invalid'; end if;
 used:=(p->>'third_party_used')::boolean; consent:=(p->>'third_party_consent')::boolean;
 if used and (p->>'subject_mode'<>'CONSENTED_THIRD_PARTY' or not consent) then raise exception 'day050_v2_third_party_consent_required'; end if;
 if not used and (p->>'subject_mode'<>'SELF_REFLECTION' or consent) then raise exception 'day050_v2_self_reflection_consistency_required'; end if;
 if c->>'control_mode' not in ('MIRROR','NEUTRAL_SILHOUETTE','CONTROLLED_BACKGROUND_LIGHT_CHANGE') then raise exception 'day050_v2_control_mode_invalid'; end if;
 foreach k in array array['similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day050_v2_control_boundary_required:%',k; end if; end loop;
 if p ? 'vault_entry_ref' then r:=p->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day050_v2_primary_vault_ref_invalid'; end if; end if;
 if c ? 'vault_entry_ref' then r:=c->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day050_v2_control_vault_ref_invalid'; end if; end if;
 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day050_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','consent_rule_respected_confirmed','privacy_preserved_confirmed','diagnosis_not_made_confirmed','judgment_of_person_not_made_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed','vault_entry_ref')) then raise exception 'day050_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','consent_rule_respected_confirmed','privacy_preserved_confirmed','diagnosis_not_made_confirmed','judgment_of_person_not_made_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day050_v2_comparison_boundary_required:%',k; end if; end loop;
 if cmp ? 'vault_entry_ref' then r:=cmp->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day050_v2_comparison_vault_ref_invalid'; end if; end if;
 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day050_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','third_party_identity_face_image_or_personal_interpretation_absent_from_server_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day050_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','third_party_identity_face_image_or_personal_interpretation_absent_from_server_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day050_v2_middle_boundary_required:%',k; end if; end loop;
 if m ? 'vault_entry_ref' then r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day050_v2_middle_vault_ref_invalid'; end if; end if;
 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','primary_completed',true,'control_completed',true,'comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','consent_rule_respected',cmp->'consent_rule_respected_confirmed','privacy_preserved',cmp->'privacy_preserved_confirmed','diagnosis_not_made',cmp->'diagnosis_not_made_confirmed','null_results_preserved',cmp->'null_results_preserved_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','primary_effect_present',p->'effect_present','control_effect_present',c->'effect_present','third_party_used',p->'third_party_used','third_party_consent',p->'third_party_consent','primary_seconds',300,'control_seconds',300);
 perform hnk_private.validate_day050_scalar_evidence_v1(legacy);
end$$;
create or replace function hnk_private.enforce_aladiah_050_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day<>50 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=50) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=50;
 if v_status is distinct from 'canon' then raise exception 'aladiah_day050_canonical_day_not_available'; end if;
 if v_source_sha is distinct from '99f56677fb57d8ddfe191b081cae44734b38ae50' then raise exception 'day050_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D050-V2' then perform hnk_private.validate_day050_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day050_scalar_evidence_v1(new.evidence); end if;
 return new;
end$$;
do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day050_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day050_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day050_v2'' then perform hnk_private.validate_day050_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;
insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D050-COMP-V2','HNK-CHOKMAH-D050-V2',50,'99f56677fb57d8ddfe191b081cae44734b38ae50','2.0.0','day050_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
