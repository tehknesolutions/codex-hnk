create or replace function hnk_private.validate_day054_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare p jsonb; a jsonb; c jsonb; cmp jsonb; m jsonb; k text; r text; legacy jsonb; stopped boolean; any_diff boolean;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day054_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','preparation','active','control','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day054_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D054-V2' then raise exception 'day054_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '5ea33f99975868290d5371c8c1ac67f6de4b9c69' then raise exception 'day054_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day054_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day054_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day054_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day054_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','PAIN','HOARSENESS','DIZZINESS','OTHER_DISCOMFORT') then raise exception 'day054_v2_safety_reason_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean;
 if stopped and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day054_v2_safety_reason_required'; end if;
 if not stopped and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day054_v2_safety_reason_without_stop'; end if;

 p:=p_evidence->'preparation';
 if jsonb_typeof(p) is distinct from 'object' then raise exception 'day054_v2_preparation_required'; end if;
 if exists(select 1 from jsonb_object_keys(p) x where x not in ('script_prepared_confirmed','targets_predeclared_confirmed','target_words_marked','self_voice_recording_consent_confirmed','script_vault_ref')) then raise exception 'day054_v2_preparation_unknown_field'; end if;
 foreach k in array array['script_prepared_confirmed','targets_predeclared_confirmed','self_voice_recording_consent_confirmed'] loop if p->k is distinct from 'true'::jsonb then raise exception 'day054_v2_preparation_boundary_required:%',k; end if; end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'target_words_marked'),false) or (p->>'target_words_marked')::int<1 or (p->>'target_words_marked')::int>1000 then raise exception 'day054_v2_target_words_marked_invalid'; end if;
 if p ? 'script_vault_ref' then r:=p->>'script_vault_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day054_v2_script_vault_ref_invalid'; end if; end if;

 a:=p_evidence->'active'; c:=p_evidence->'control';
 if jsonb_typeof(a) is distinct from 'object' or jsonb_typeof(c) is distinct from 'object' then raise exception 'day054_v2_recordings_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('recording_completed_confirmed','raw_audio_local_only_confirmed','raw_audio_deletable_confirmed','raw_audio_not_uploaded_confirmed','local_analysis_completed_confirmed','effect_present','envelope_difference_observed','intensity_difference_observed','inflection_difference_observed','clarity','naturalness','vocal_effort','emphasis_perception','comfort','comfortable_volume_confirmed','laryngeal_strain_avoided_confirmed','returned_to_common_focus_confirmed')) then raise exception 'day054_v2_active_unknown_field'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('recording_completed_confirmed','same_script_confirmed','neutral_prosody_confirmed','verbal_content_unchanged_confirmed','raw_audio_local_only_confirmed','raw_audio_deletable_confirmed','raw_audio_not_uploaded_confirmed','local_analysis_completed_confirmed','effect_present','envelope_difference_observed','intensity_difference_observed','inflection_difference_observed','clarity','naturalness','vocal_effort','emphasis_perception','comfort','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed','returned_to_common_focus_confirmed')) then raise exception 'day054_v2_control_unknown_field'; end if;
 foreach k in array array['recording_completed_confirmed','raw_audio_local_only_confirmed','raw_audio_deletable_confirmed','raw_audio_not_uploaded_confirmed','local_analysis_completed_confirmed','comfortable_volume_confirmed','laryngeal_strain_avoided_confirmed','returned_to_common_focus_confirmed'] loop if a->k is distinct from 'true'::jsonb then raise exception 'day054_v2_active_boundary_required:%',k; end if; end loop;
 foreach k in array array['recording_completed_confirmed','same_script_confirmed','neutral_prosody_confirmed','verbal_content_unchanged_confirmed','raw_audio_local_only_confirmed','raw_audio_deletable_confirmed','raw_audio_not_uploaded_confirmed','local_analysis_completed_confirmed','preselected_winner_absent_confirmed','no_intensity_or_effort_compensation_confirmed','returned_to_common_focus_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day054_v2_control_boundary_required:%',k; end if; end loop;
 foreach k in array array['effect_present','envelope_difference_observed','intensity_difference_observed','inflection_difference_observed'] loop if jsonb_typeof(a->k) is distinct from 'boolean' or jsonb_typeof(c->k) is distinct from 'boolean' then raise exception 'day054_v2_difference_flag_invalid:%',k; end if; end loop;
 foreach k in array array['clarity','naturalness','vocal_effort','emphasis_perception','comfort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->k),false) or (a->>k)::int>10 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) or (c->>k)::int>10 then raise exception 'day054_v2_scalar_invalid:%',k; end if; end loop;
 any_diff:=(a->>'envelope_difference_observed')::boolean or (a->>'intensity_difference_observed')::boolean or (a->>'inflection_difference_observed')::boolean; if (a->>'effect_present')::boolean is distinct from any_diff then raise exception 'day054_v2_active_effect_difference_inconsistent'; end if;
 any_diff:=(c->>'envelope_difference_observed')::boolean or (c->>'intensity_difference_observed')::boolean or (c->>'inflection_difference_observed')::boolean; if (c->>'effect_present')::boolean is distinct from any_diff then raise exception 'day054_v2_control_effect_difference_inconsistent'; end if;

 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day054_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','consent_only_confirmed','manipulation_without_consent_not_used_confirmed','subconscious_access_not_claimed_confirmed','external_mechanism_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed','vault_entry_ref')) then raise exception 'day054_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','contradictory_results_preserved_confirmed','alternative_explanations_recorded_confirmed','consent_only_confirmed','manipulation_without_consent_not_used_confirmed','subconscious_access_not_claimed_confirmed','external_mechanism_not_claimed_confirmed','spiritual_superiority_not_claimed_confirmed','prudence_rule_defined_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day054_v2_comparison_boundary_required:%',k; end if; end loop;
 if cmp ? 'vault_entry_ref' then r:=cmp->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day054_v2_comparison_vault_ref_invalid'; end if; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day054_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_18_46_confirmed','lamed_aleph_vav_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day054_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_18_46_confirmed','lamed_aleph_vav_confirmed','three_observable_facts_named_confirmed','one_subjective_experience_named_confirmed','one_open_hypothesis_named_confirmed','body_moved_confirmed','environment_oriented_confirmed','natural_breathing_confirmed','thanks_to_god_confirmed','subjective_traditional_objective_separated_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day054_v2_middle_boundary_required:%',k; end if; end loop;
 if m ? 'vault_entry_ref' then r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day054_v2_middle_vault_ref_invalid'; end if; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','script_prepared',p->'script_prepared_confirmed','targets_predeclared',p->'targets_predeclared_confirmed','active_recording_completed',a->'recording_completed_confirmed','control_recording_completed',c->'recording_completed_confirmed','local_analysis_completed',(a->>'local_analysis_completed_confirmed')::boolean and (c->>'local_analysis_completed_confirmed')::boolean,'raw_audio_not_uploaded',(a->>'raw_audio_not_uploaded_confirmed')::boolean and (c->>'raw_audio_not_uploaded_confirmed')::boolean,'comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','consent_only',cmp->'consent_only_confirmed','subconscious_access_not_claimed',cmp->'subconscious_access_not_claimed_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','target_words_marked',p->'target_words_marked');
 perform hnk_private.validate_day054_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_lauviah_054_056_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day not in (54,55,56) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
 if v_status is distinct from 'canon' then raise exception 'lauviah_canonical_day_not_available'; end if;
 if new.day=54 then
  if v_source_sha is distinct from '5ea33f99975868290d5371c8c1ac67f6de4b9c69' then raise exception 'day054_canonical_source_sha_mismatch'; end if;
  if new.evidence->>'protocol_version'='HNK-CHOKMAH-D054-V2' then perform hnk_private.validate_day054_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day054_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=55 then
  if v_source_sha is distinct from '03dce9f662c05cb720bce4419f58126031ca9be6' then raise exception 'day055_canonical_source_sha_mismatch'; end if;
  perform hnk_private.validate_day055_scalar_evidence_v1(new.evidence);
 else
  if v_source_sha is distinct from '9eb847d460768615d2e6fb9173c2557a21c705c7' then raise exception 'day056_canonical_source_sha_mismatch'; end if;
  perform hnk_private.validate_day056_scalar_evidence_v1(new.evidence);
 end if;
 return new;
end$$;

do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day054_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day054_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day054_v2'' then perform hnk_private.validate_day054_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D054-COMP-V2','HNK-CHOKMAH-D054-V2',54,'5ea33f99975868290d5371c8c1ac67f6de4b9c69','2.0.0','day054_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();