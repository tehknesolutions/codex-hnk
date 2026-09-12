create or replace function hnk_private.validate_day047_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare ib jsonb; iw jsonb; bb jsonb; bw jsonb; cmp jsonb; m jsonb; cond jsonb; refv text; cond_key text; field_key text; present boolean; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day047_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','indirect_black','indirect_white','bright_black','bright_white','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day047_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D047-V2' then raise exception 'day047_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '74d2be4a84f4818729bb069ac7642c7e51ff6f14' then raise exception 'day047_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day047_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day047_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day047_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day047_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','EYE_PAIN','HEADACHE','ALTERED_VISION','ANXIETY','OTHER_DISCOMFORT') then raise exception 'day047_v2_safety_reason_invalid'; end if;
 if (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day047_v2_safety_reason_required'; end if;
 if not (p_evidence->>'safety_stop_occurred')::boolean and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day047_v2_safety_reason_without_stop'; end if;

 ib:=p_evidence->'indirect_black'; iw:=p_evidence->'indirect_white'; bb:=p_evidence->'bright_black'; bw:=p_evidence->'bright_white';
 if jsonb_typeof(ib) is distinct from 'object' or jsonb_typeof(iw) is distinct from 'object' or jsonb_typeof(bb) is distinct from 'object' or jsonb_typeof(bw) is distinct from 'object' then raise exception 'day047_v2_conditions_required'; end if;

 foreach cond_key in array array['indirect_black','indirect_white','bright_black','bright_white'] loop
   cond:=p_evidence->cond_key;
   if exists(select 1 from jsonb_object_keys(cond) x where x not in ('duration_seconds','background','lighting','gaze_offset_cm','approximately_two_cm_beyond_fingertips_confirmed','normal_blinking_confirmed','candle_gaze_absent_confirmed','result_chasing_absent_confirmed','effect_present','halo_present','contrast_present','color_present','brightness_present','haze_present','intensity','stability','comfort','expectation','interruption_count','returned_to_common_focus_confirmed','vault_entry_ref','distance_duration_context_similar_confirmed','no_intensity_or_effort_compensation_confirmed')) then raise exception 'day047_v2_condition_unknown_field:%',cond_key; end if;
   if cond->'duration_seconds' is distinct from '300'::jsonb then raise exception 'day047_v2_condition_300_required:%',cond_key; end if;
   if not coalesce(hnk_private.jsonb_is_nonnegative_integer(cond->'gaze_offset_cm'),false) or (cond->>'gaze_offset_cm')::int not between 1 and 5 then raise exception 'day047_v2_gaze_offset_invalid:%',cond_key; end if;
   foreach field_key in array array['effect_present','halo_present','contrast_present','color_present','brightness_present','haze_present'] loop if jsonb_typeof(cond->field_key) is distinct from 'boolean' then raise exception 'day047_v2_effect_flag_invalid:%:%',cond_key,field_key; end if; end loop;
   foreach field_key in array array['intensity','stability','comfort','expectation','interruption_count'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(cond->field_key),false) then raise exception 'day047_v2_scalar_invalid:%:%',cond_key,field_key; end if; end loop;
   if (cond->>'intensity')::int>10 or (cond->>'stability')::int>10 or (cond->>'comfort')::int>10 or (cond->>'expectation')::int>10 or (cond->>'interruption_count')::int>9999 then raise exception 'day047_v2_scalar_range_invalid:%',cond_key; end if;
   if cond->'approximately_two_cm_beyond_fingertips_confirmed' is distinct from 'true'::jsonb or cond->'normal_blinking_confirmed' is distinct from 'true'::jsonb or cond->'candle_gaze_absent_confirmed' is distinct from 'true'::jsonb or cond->'result_chasing_absent_confirmed' is distinct from 'true'::jsonb or cond->'returned_to_common_focus_confirmed' is distinct from 'true'::jsonb then raise exception 'day047_v2_condition_boundaries_required:%',cond_key; end if;
   if cond_key in ('bright_black','bright_white') and (cond->'distance_duration_context_similar_confirmed' is distinct from 'true'::jsonb or cond->'no_intensity_or_effort_compensation_confirmed' is distinct from 'true'::jsonb) then raise exception 'day047_v2_control_boundaries_required:%',cond_key; end if;
   if cond_key in ('indirect_black','indirect_white') and (cond ? 'distance_duration_context_similar_confirmed' or cond ? 'no_intensity_or_effort_compensation_confirmed') then raise exception 'day047_v2_primary_control_fields_forbidden:%',cond_key; end if;
   present:=(cond->>'effect_present')::boolean;
   if not present and ((cond->>'halo_present')::boolean or (cond->>'contrast_present')::boolean or (cond->>'color_present')::boolean or (cond->>'brightness_present')::boolean or (cond->>'haze_present')::boolean or (cond->>'intensity')::int<>0 or (cond->>'stability')::int<>0) then raise exception 'day047_v2_absent_effect_metrics_must_be_zero:%',cond_key; end if;
   if present and not ((cond->>'halo_present')::boolean or (cond->>'contrast_present')::boolean or (cond->>'color_present')::boolean or (cond->>'brightness_present')::boolean or (cond->>'haze_present')::boolean) then raise exception 'day047_v2_present_effect_requires_descriptor:%',cond_key; end if;
   if cond ? 'vault_entry_ref' then refv:=cond->>'vault_entry_ref'; if refv is null or refv!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day047_v2_condition_vault_ref_invalid:%',cond_key; end if; end if;
 end loop;

 if ib->>'background'<>'BLACK' or ib->>'lighting'<>'INDIRECT' or iw->>'background'<>'WHITE' or iw->>'lighting'<>'INDIRECT' or bb->>'background'<>'BLACK' or bb->>'lighting'<>'BRIGHTER_CONTROL' or bw->>'background'<>'WHITE' or bw->>'lighting'<>'BRIGHTER_CONTROL' then raise exception 'day047_v2_condition_identity_invalid'; end if;
 if ib->>'gaze_offset_cm' is distinct from iw->>'gaze_offset_cm' or ib->>'gaze_offset_cm' is distinct from bb->>'gaze_offset_cm' or ib->>'gaze_offset_cm' is distinct from bw->>'gaze_offset_cm' then raise exception 'day047_v2_gaze_offset_mismatch'; end if;

 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day047_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','preselected_winner_absent_confirmed','alternative_explanations_recorded_confirmed','observation_sensation_imagination_traditional_interpretation_separated_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','diagnosis_of_others_not_made_confirmed','prudence_rule_defined_confirmed','vault_entry_ref')) then raise exception 'day047_v2_comparison_unknown_field'; end if;
 foreach field_key in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','preselected_winner_absent_confirmed','alternative_explanations_recorded_confirmed','observation_sensation_imagination_traditional_interpretation_separated_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','diagnosis_of_others_not_made_confirmed','prudence_rule_defined_confirmed'] loop if cmp->field_key is distinct from 'true'::jsonb then raise exception 'day047_v2_comparison_boundary_required:%',field_key; end if; end loop;
 if cmp ? 'vault_entry_ref' then refv:=cmp->>'vault_entry_ref'; if refv is null or refv!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day047_v2_comparison_vault_ref_invalid'; end if; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day047_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day047_v2_middle_unknown_field'; end if;
 foreach field_key in array array['psalm_18_30_confirmed','alep_lamed_dalet_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed'] loop if m->field_key is distinct from 'true'::jsonb then raise exception 'day047_v2_middle_boundary_required:%',field_key; end if; end loop;
 if m ? 'vault_entry_ref' then refv:=m->>'vault_entry_ref'; if refv is null or refv!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day047_v2_middle_vault_ref_invalid'; end if; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','black_completed',true,'white_completed',true,'bright_black_completed',true,'bright_white_completed',true,'comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','null_results_preserved',cmp->'null_results_preserved_confirmed','diagnosis_not_made',cmp->'diagnosis_of_others_not_made_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','primary_effect_present',((ib->>'effect_present')::boolean or (iw->>'effect_present')::boolean),'control_effect_present',((bb->>'effect_present')::boolean or (bw->>'effect_present')::boolean),'black_seconds',300,'white_seconds',300,'bright_black_seconds',300,'bright_white_seconds',300);
 perform hnk_private.validate_day047_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_aladiah_047_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day<>47 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=47) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=47;
 if v_status is distinct from 'canon' then raise exception 'aladiah_day047_canonical_day_not_available'; end if;
 if v_source_sha is distinct from '74d2be4a84f4818729bb069ac7642c7e51ff6f14' then raise exception 'day047_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D047-V2' then perform hnk_private.validate_day047_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day047_scalar_evidence_v1(new.evidence); end if;
 return new;
end$$;

do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day047_v2''' in v_def)=0 then
   v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
   if position(v_old in v_def)=0 then raise exception 'day047_dispatcher_patch_anchor_missing'; end if;
   v_new:='  when ''day047_v2'' then perform hnk_private.validate_day047_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
   v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D047-COMP-V2','HNK-CHOKMAH-D047-V2',47,'74d2be4a84f4818729bb069ac7642c7e51ff6f14','2.0.0','day047_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
