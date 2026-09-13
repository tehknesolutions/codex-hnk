create or replace function hnk_private.validate_day052_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare a jsonb; c jsonb; cmp jsonb; m jsonb; k text; r text; legacy jsonb; stopped boolean;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day052_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','expansion','control','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day052_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D052-V2' then raise exception 'day052_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '88ae2a1dc163f474b3afc82f2bcacdf4069c8f5e' then raise exception 'day052_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day052_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day052_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day052_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day052_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','DEPERSONALIZATION','DEREALIZATION','ANXIETY','DISORIENTATION','OTHER_DISCOMFORT') then raise exception 'day052_v2_safety_reason_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean;
 if stopped and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day052_v2_safety_reason_required'; end if;
 if not stopped and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day052_v2_safety_reason_without_stop'; end if;
 a:=p_evidence->'expansion'; c:=p_evidence->'control';
 if jsonb_typeof(a) is distinct from 'object' or jsonb_typeof(c) is distinct from 'object' then raise exception 'day052_v2_conditions_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('duration_seconds','effect_present','amplitude','lightness','spatiality','heat','quietude','strangeness','comfort','expectation','body_boundaries_noticed_first_confirmed','attention_expanded_gradually_to_room_confirmed','natural_breathing_confirmed','eyes_open_if_needed_acknowledged','orientation_preserved_confirmed','result_chasing_absent_confirmed','returned_to_common_focus_confirmed','vault_entry_ref')) then raise exception 'day052_v2_expansion_unknown_field'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('duration_seconds','effect_present','amplitude','lightness','spatiality','heat','quietude','strangeness','comfort','expectation','body_contact_points_and_breath_only_confirmed','similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed','orientation_preserved_confirmed','returned_to_common_focus_confirmed','vault_entry_ref')) then raise exception 'day052_v2_control_unknown_field'; end if;
 if a->'duration_seconds' is distinct from '600'::jsonb or c->'duration_seconds' is distinct from '600'::jsonb then raise exception 'day052_v2_duration_600_required'; end if;
 if jsonb_typeof(a->'effect_present') is distinct from 'boolean' or jsonb_typeof(c->'effect_present') is distinct from 'boolean' then raise exception 'day052_v2_effect_flag_invalid'; end if;
 foreach k in array array['amplitude','lightness','spatiality','heat','quietude','strangeness','comfort','expectation'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->k),false) or (a->>k)::int>10 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) or (c->>k)::int>10 then raise exception 'day052_v2_scalar_invalid:%',k; end if; end loop;
 if not (a->>'effect_present')::boolean and ((a->>'amplitude')::int<>0 or (a->>'lightness')::int<>0 or (a->>'spatiality')::int<>0 or (a->>'heat')::int<>0 or (a->>'quietude')::int<>0 or (a->>'strangeness')::int<>0) then raise exception 'day052_v2_expansion_absent_effect_metrics_must_be_zero'; end if;
 if not (c->>'effect_present')::boolean and ((c->>'amplitude')::int<>0 or (c->>'lightness')::int<>0 or (c->>'spatiality')::int<>0 or (c->>'heat')::int<>0 or (c->>'quietude')::int<>0 or (c->>'strangeness')::int<>0) then raise exception 'day052_v2_control_absent_effect_metrics_must_be_zero'; end if;
 foreach k in array array['body_boundaries_noticed_first_confirmed','attention_expanded_gradually_to_room_confirmed','natural_breathing_confirmed','eyes_open_if_needed_acknowledged','orientation_preserved_confirmed','result_chasing_absent_confirmed','returned_to_common_focus_confirmed'] loop if a->k is distinct from 'true'::jsonb then raise exception 'day052_v2_expansion_boundary_required:%',k; end if; end loop;
 foreach k in array array['body_contact_points_and_breath_only_confirmed','similar_context_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed','orientation_preserved_confirmed','returned_to_common_focus_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day052_v2_control_boundary_required:%',k; end if; end loop;
 if a ? 'vault_entry_ref' then r:=a->>'vault_entry_ref'; if r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day052_v2_expansion_vault_ref_invalid'; end if; end if;
 if c ? 'vault_entry_ref' then r:=c->>'vault_entry_ref'; if r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day052_v2_control_vault_ref_invalid'; end if; end if;
 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day052_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','expansion_as_imagination_and_fenomenology_confirmed','outside_brain_claim_not_made_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed','vault_entry_ref')) then raise exception 'day052_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','expansion_as_imagination_and_fenomenology_confirmed','outside_brain_claim_not_made_confirmed','external_mechanism_not_claimed_confirmed','supernatural_faculty_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day052_v2_comparison_boundary_required:%',k; end if; end loop;
 if cmp ? 'vault_entry_ref' then r:=cmp->>'vault_entry_ref'; if r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day052_v2_comparison_vault_ref_invalid'; end if; end if;
 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day052_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_18_46_confirmed','lamed_aleph_vav_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day052_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_18_46_confirmed','lamed_aleph_vav_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day052_v2_middle_boundary_required:%',k; end if; end loop;
 if m ? 'vault_entry_ref' then r:=m->>'vault_entry_ref'; if r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day052_v2_middle_vault_ref_invalid'; end if; end if;
 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','expansion_completed',true,'control_completed',true,'comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','outside_brain_claim_not_made',cmp->'outside_brain_claim_not_made_confirmed','orientation_preserved',(a->'orientation_preserved_confirmed'='true'::jsonb and c->'orientation_preserved_confirmed'='true'::jsonb),'null_results_preserved',cmp->'null_results_preserved_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','expansion_effect_present',a->'effect_present','control_effect_present',c->'effect_present','expansion_seconds',600,'control_seconds',600);
 perform hnk_private.validate_day052_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_lauviah_052_053_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day not in (52,53) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
 if v_status is distinct from 'canon' then raise exception 'lauviah_canonical_day_not_available'; end if;
 if new.day=52 then
  if v_source_sha is distinct from '88ae2a1dc163f474b3afc82f2bcacdf4069c8f5e' then raise exception 'day052_canonical_source_sha_mismatch'; end if;
  if new.evidence->>'protocol_version'='HNK-CHOKMAH-D052-V2' then perform hnk_private.validate_day052_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day052_scalar_evidence_v1(new.evidence); end if;
 else
  if v_source_sha is distinct from '0bb908ec27feeed2023a3a93d7f481328e5056c2' then raise exception 'day053_canonical_source_sha_mismatch'; end if;
  perform hnk_private.validate_day053_scalar_evidence_v1(new.evidence);
 end if;
 return new;
end$$;

do $$ declare v_def text; v_old text; v_new text; begin select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def; if position('when ''day052_v2''' in v_def)=0 then v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;'; if position(v_old in v_def)=0 then raise exception 'day052_dispatcher_patch_anchor_missing'; end if; v_new:='  when ''day052_v2'' then perform hnk_private.validate_day052_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old; v_def:=replace(v_def,v_old,v_new); execute v_def; end if; end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D052-COMP-V2','HNK-CHOKMAH-D052-V2',52,'88ae2a1dc163f474b3afc82f2bcacdf4069c8f5e','2.0.0','day052_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
