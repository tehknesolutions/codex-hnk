create or replace function hnk_private.validate_day057_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare p jsonb; a jsonb; c jsonb; cmp jsonb; m jsonb; k text; r text; stopped boolean; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day057_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','prepare','active','control','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day057_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D057-V2' then raise exception 'day057_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'deb6305d38b89a4168ad5cff083d2b96e7a7fec4' then raise exception 'day057_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day057_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day057_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day057_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day057_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','PARTNER_WITHDREW','DISTRESS','COERCION_CONCERN','PRIVACY_CONCERN','OTHER_DISCOMFORT') then raise exception 'day057_v2_safety_reason_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean;
 if stopped and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day057_v2_safety_reason_required'; end if;
 if not stopped and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day057_v2_safety_reason_without_stop'; end if;

 p:=p_evidence->'prepare'; if jsonb_typeof(p) is distinct from 'object' then raise exception 'day057_v2_prepare_required'; end if;
 if exists(select 1 from jsonb_object_keys(p) x where x not in ('partner_consent_confirmed','partner_can_interrupt_confirmed','partner_identity_not_stored_confirmed','closed_set_defined_confirmed','target_set_size','scoring_rule_predefined_confirmed','high_impact_use_absent_confirmed')) then raise exception 'day057_v2_prepare_unknown_field'; end if;
 foreach k in array array['partner_consent_confirmed','partner_can_interrupt_confirmed','partner_identity_not_stored_confirmed','closed_set_defined_confirmed','scoring_rule_predefined_confirmed','high_impact_use_absent_confirmed'] loop if p->k is distinct from 'true'::jsonb then raise exception 'day057_v2_prepare_boundary_required:%',k; end if; end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'target_set_size'),false) or (p->>'target_set_size')::int<2 or (p->>'target_set_size')::int>1000 then raise exception 'day057_v2_target_set_size_invalid'; end if;

 a:=p_evidence->'active'; if jsonb_typeof(a) is distinct from 'object' then raise exception 'day057_v2_active_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('measured_seconds','target_preregistered_confirmed','target_hidden_from_receiver_confirmed','receiver_response_preregistered_confirmed','feedback_after_response_confirmed','no_parallel_messages_cues_or_gestures_confirmed','errors_included_confirmed','possible_cues_logged_confirmed','match','confidence','contaminated','target_vault_entry_ref','response_vault_entry_ref','returned_to_common_focus_confirmed')) then raise exception 'day057_v2_active_unknown_field'; end if;
 foreach k in array array['target_preregistered_confirmed','target_hidden_from_receiver_confirmed','receiver_response_preregistered_confirmed','feedback_after_response_confirmed','no_parallel_messages_cues_or_gestures_confirmed','errors_included_confirmed','possible_cues_logged_confirmed','returned_to_common_focus_confirmed'] loop if a->k is distinct from 'true'::jsonb then raise exception 'day057_v2_active_boundary_required:%',k; end if; end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'measured_seconds'),false) or (a->>'measured_seconds')::int>7200 then raise exception 'day057_v2_active_measured_seconds_invalid'; end if;
 if jsonb_typeof(a->'match') is distinct from 'boolean' or jsonb_typeof(a->'contaminated') is distinct from 'boolean' then raise exception 'day057_v2_active_boolean_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'confidence'),false) or (a->>'confidence')::int>10 then raise exception 'day057_v2_active_confidence_invalid'; end if;
 foreach k in array array['target_vault_entry_ref','response_vault_entry_ref'] loop r:=a->>k; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day057_v2_active_vault_ref_invalid:%',k; end if; end loop;

 c:=p_evidence->'control'; if jsonb_typeof(c) is distinct from 'object' then raise exception 'day057_v2_control_required'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('measured_seconds','same_closed_set_confirmed','same_scoring_rule_confirmed','no_atziluth_ritual_or_formula_confirmed','similar_context_confirmed','target_preregistered_confirmed','receiver_response_preregistered_confirmed','feedback_after_response_confirmed','possible_cues_logged_confirmed','match','confidence','contaminated','target_vault_entry_ref','response_vault_entry_ref','returned_to_common_focus_confirmed')) then raise exception 'day057_v2_control_unknown_field'; end if;
 foreach k in array array['same_closed_set_confirmed','same_scoring_rule_confirmed','no_atziluth_ritual_or_formula_confirmed','similar_context_confirmed','target_preregistered_confirmed','receiver_response_preregistered_confirmed','feedback_after_response_confirmed','possible_cues_logged_confirmed','returned_to_common_focus_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day057_v2_control_boundary_required:%',k; end if; end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'measured_seconds'),false) or (c->>'measured_seconds')::int>7200 then raise exception 'day057_v2_control_measured_seconds_invalid'; end if;
 if jsonb_typeof(c->'match') is distinct from 'boolean' or jsonb_typeof(c->'contaminated') is distinct from 'boolean' then raise exception 'day057_v2_control_boolean_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'confidence'),false) or (c->>'confidence')::int>10 then raise exception 'day057_v2_control_confidence_invalid'; end if;
 foreach k in array array['target_vault_entry_ref','response_vault_entry_ref'] loop r:=c->>k; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day057_v2_control_vault_ref_invalid:%',k; end if; end loop;

 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day057_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','errors_preserved_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','possible_cues_considered_confirmed','set_size_considered_confirmed','telepathy_not_claimed_confirmed','external_mechanism_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','diagnosis_or_prophecy_not_used_confirmed','surveillance_not_used_confirmed','coercion_not_used_confirmed','high_impact_not_used_confirmed','prudence_rule_defined_confirmed','relationship_vault_entry_ref')) then raise exception 'day057_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','errors_preserved_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','possible_cues_considered_confirmed','set_size_considered_confirmed','telepathy_not_claimed_confirmed','external_mechanism_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','diagnosis_or_prophecy_not_used_confirmed','surveillance_not_used_confirmed','coercion_not_used_confirmed','high_impact_not_used_confirmed','prudence_rule_defined_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day057_v2_comparison_boundary_required:%',k; end if; end loop;
 if cmp ? 'relationship_vault_entry_ref' then r:=cmp->>'relationship_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day057_v2_relationship_vault_ref_invalid'; end if; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day057_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_10_1_confirmed','he_he_aleph_confirmed','one_instrumental_fact_named_confirmed','one_subjective_experience_named_confirmed','one_traditional_hypothesis_named_confirmed','one_alternative_explanation_named_confirmed','partner_thanked_confirmed','thanks_to_god_confirmed','continuation_not_automatic_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day057_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_10_1_confirmed','he_he_aleph_confirmed','one_instrumental_fact_named_confirmed','one_subjective_experience_named_confirmed','one_traditional_hypothesis_named_confirmed','one_alternative_explanation_named_confirmed','partner_thanked_confirmed','thanks_to_god_confirmed','continuation_not_automatic_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day057_v2_middle_boundary_required:%',k; end if; end loop;
 if m ? 'vault_entry_ref' then r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day057_v2_middle_vault_ref_invalid'; end if; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','partner_consent',p->'partner_consent_confirmed','closed_set_defined',p->'closed_set_defined_confirmed','target_preregistered',a->'target_preregistered_confirmed','receiver_response_preregistered',a->'receiver_response_preregistered_confirmed','feedback_after_response',a->'feedback_after_response_confirmed','control_completed',true,'errors_included',a->'errors_included_confirmed','possible_cues_logged',(a->>'possible_cues_logged_confirmed')::boolean and (c->>'possible_cues_logged_confirmed')::boolean,'telepathy_not_claimed',cmp->'telepathy_not_claimed_confirmed','high_impact_not_used',cmp->'high_impact_not_used_confirmed','vault_saved',true,'safety_clear',p_evidence->'final_safety_clear_confirmed','active_match',a->'match','control_match',c->'match','target_set_size',p->'target_set_size');
 perform hnk_private.validate_day057_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_hahaiah_057_061_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day not in (57,58,59,60,61) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
 if v_status is distinct from 'canon' then raise exception 'hahaiah_canonical_day_not_available'; end if;
 if new.day=57 then
  if v_source_sha is distinct from 'deb6305d38b89a4168ad5cff083d2b96e7a7fec4' then raise exception 'day057_canonical_source_sha_mismatch'; end if;
  if new.evidence->>'protocol_version'='HNK-CHOKMAH-D057-V2' then perform hnk_private.validate_day057_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day057_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=58 then
  if v_source_sha is distinct from 'e32753a57daab23d378e881451194b0dd77d8aac' then raise exception 'day058_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day058_scalar_evidence_v1(new.evidence);
 elsif new.day=59 then
  if v_source_sha is distinct from 'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8' then raise exception 'day059_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day059_scalar_evidence_v1(new.evidence);
 elsif new.day=60 then
  if v_source_sha is distinct from 'e98e8925c8e03555c39b033813999d6a488149a9' then raise exception 'day060_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day060_scalar_evidence_v1(new.evidence);
 else
  if v_source_sha is distinct from '12e4c2da623f2f78d3fea3ff65e23f9446f9784b' then raise exception 'day061_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day061_scalar_evidence_v1(new.evidence);
 end if;
 return new;
end$$;

do $$ declare v_def text; v_old text; v_new text; begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day057_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day057_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day057_v2'' then perform hnk_private.validate_day057_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D057-COMP-V2','HNK-CHOKMAH-D057-V2',57,'deb6305d38b89a4168ad5cff083d2b96e7a7fec4','2.0.0','day057_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();