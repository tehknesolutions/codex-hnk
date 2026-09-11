create or replace function hnk_private.validate_day031_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; k text; v_j jsonb; v_a jsonb; v_b jsonb; v_m jsonb; v_s jsonb; impulses integer;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day031_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz_analysis','boaz_surrender','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day031_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D031-V1' then raise exception 'day031_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '2de71dbcf341774916d544f6aad55ab186bd3b68' then raise exception 'day031_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day031_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day031_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day031_voluntary_completion_required'; end if;
 if not (p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day031_safety_stop_invalid'; end if;

 v_j:=p_evidence->'jachin'; if jsonb_typeof(v_j) is distinct from 'object' then raise exception 'day031_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_j) x where x not in ('duration_seconds','stable_posture_confirmed','hands_open_confirmed','eyes_closed_or_safe_equivalent_confirmed','natural_breathing_confirmed','thoughts_not_force_suppressed_confirmed','no_answers_or_images_sought_confirmed','identity_dignity_will_preserved_confirmed','responsibility_not_abandoned_confirmed','silence_latency_seconds','analytic_impulse_count','average_return_seconds','quiet_depth_score','presence_score','trust_score','clarity_after_score','jachin_vault_entry_ref')) then raise exception 'day031_jachin_unknown_field'; end if;
 if jsonb_typeof(v_j->'duration_seconds') is distinct from 'number' or (v_j->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day031_jachin_requires_600_seconds'; end if;
 if v_j->'stable_posture_confirmed' is distinct from 'true'::jsonb or v_j->'hands_open_confirmed' is distinct from 'true'::jsonb or v_j->'eyes_closed_or_safe_equivalent_confirmed' is distinct from 'true'::jsonb or v_j->'natural_breathing_confirmed' is distinct from 'true'::jsonb or v_j->'thoughts_not_force_suppressed_confirmed' is distinct from 'true'::jsonb or v_j->'no_answers_or_images_sought_confirmed' is distinct from 'true'::jsonb or v_j->'identity_dignity_will_preserved_confirmed' is distinct from 'true'::jsonb or v_j->'responsibility_not_abandoned_confirmed' is distinct from 'true'::jsonb then raise exception 'day031_jachin_boundaries_required'; end if;
 if not(v_j?'silence_latency_seconds') then raise exception 'day031_jachin_latency_required'; end if; if v_j->'silence_latency_seconds'<>'null'::jsonb then if jsonb_typeof(v_j->'silence_latency_seconds') is distinct from 'number' then raise exception 'day031_jachin_latency_invalid'; end if; n:=(v_j->>'silence_latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day031_jachin_latency_invalid'; end if; end if;
 if jsonb_typeof(v_j->'analytic_impulse_count') is distinct from 'number' then raise exception 'day031_impulse_count_invalid'; end if; n:=(v_j->>'analytic_impulse_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day031_impulse_count_invalid'; end if; impulses:=n::integer;
 if not(v_j?'average_return_seconds') then raise exception 'day031_average_return_required'; end if; if v_j->'average_return_seconds'='null'::jsonb then if impulses>0 then raise exception 'day031_average_return_required_when_impulses_present'; end if; else if impulses=0 then raise exception 'day031_average_return_requires_impulse'; end if; if jsonb_typeof(v_j->'average_return_seconds') is distinct from 'number' then raise exception 'day031_average_return_invalid'; end if; n:=(v_j->>'average_return_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day031_average_return_invalid'; end if; end if;
 foreach k in array array['quiet_depth_score','presence_score','trust_score','clarity_after_score'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day031_jachin_score_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day031_jachin_score_invalid'; end if; end loop;
 r:=v_j->>'jachin_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day031_jachin_vault_ref_invalid'; end if;

 v_a:=p_evidence->'boaz_analysis'; if jsonb_typeof(v_a) is distinct from 'object' then raise exception 'day031_analysis_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_a) x where x not in ('duration_seconds','simple_question_selected_confirmed','deliberate_analysis_confirmed','arguments_alternatives_solutions_observed_confirmed','mental_speed_score','tension_score','effort_score','clarity_score','rumination_score','analysis_vault_entry_ref')) then raise exception 'day031_analysis_unknown_field'; end if;
 if jsonb_typeof(v_a->'duration_seconds') is distinct from 'number' or (v_a->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day031_analysis_requires_600_seconds'; end if;
 if v_a->'simple_question_selected_confirmed' is distinct from 'true'::jsonb or v_a->'deliberate_analysis_confirmed' is distinct from 'true'::jsonb or v_a->'arguments_alternatives_solutions_observed_confirmed' is distinct from 'true'::jsonb then raise exception 'day031_analysis_requirements'; end if;
 foreach k in array array['mental_speed_score','tension_score','effort_score','clarity_score','rumination_score'] loop if jsonb_typeof(v_a->k) is distinct from 'number' then raise exception 'day031_analysis_score_invalid'; end if; n:=(v_a->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day031_analysis_score_invalid'; end if; end loop;
 r:=v_a->>'analysis_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day031_analysis_vault_ref_invalid'; end if;

 v_b:=p_evidence->'boaz_surrender'; if jsonb_typeof(v_b) is distinct from 'object' then raise exception 'day031_boaz_surrender_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_b) x where x not in ('duration_seconds','same_or_comparable_posture_environment_confirmed','no_answer_sought_confirmed','silent_surrender_confirmed','identity_preserved_confirmed','discernment_preserved_confirmed','blind_obedience_rejected_confirmed','self_hatred_rejected_confirmed','functional_thought_return_confirmed','five_objects_named_after_confirmed','silence_latency_seconds','tension_score','rumination_score','presence_score','return_clarity_score','sleepiness_score','fatigue_not_silence_confirmed','data_may_correct_expectation_confirmed','comparison_vault_entry_ref')) then raise exception 'day031_boaz_surrender_unknown_field'; end if;
 if jsonb_typeof(v_b->'duration_seconds') is distinct from 'number' or (v_b->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day031_boaz_surrender_requires_600_seconds'; end if;
 if v_b->'same_or_comparable_posture_environment_confirmed' is distinct from 'true'::jsonb or v_b->'no_answer_sought_confirmed' is distinct from 'true'::jsonb or v_b->'silent_surrender_confirmed' is distinct from 'true'::jsonb or v_b->'identity_preserved_confirmed' is distinct from 'true'::jsonb or v_b->'discernment_preserved_confirmed' is distinct from 'true'::jsonb or v_b->'blind_obedience_rejected_confirmed' is distinct from 'true'::jsonb or v_b->'self_hatred_rejected_confirmed' is distinct from 'true'::jsonb or v_b->'functional_thought_return_confirmed' is distinct from 'true'::jsonb or v_b->'five_objects_named_after_confirmed' is distinct from 'true'::jsonb or v_b->'fatigue_not_silence_confirmed' is distinct from 'true'::jsonb or v_b->'data_may_correct_expectation_confirmed' is distinct from 'true'::jsonb then raise exception 'day031_boaz_boundaries_required'; end if;
 if not(v_b?'silence_latency_seconds') then raise exception 'day031_boaz_latency_required'; end if; if v_b->'silence_latency_seconds'<>'null'::jsonb then if jsonb_typeof(v_b->'silence_latency_seconds') is distinct from 'number' then raise exception 'day031_boaz_latency_invalid'; end if; n:=(v_b->>'silence_latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day031_boaz_latency_invalid'; end if; end if;
 foreach k in array array['tension_score','rumination_score','presence_score','return_clarity_score','sleepiness_score'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day031_boaz_score_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day031_boaz_score_invalid'; end if; end loop;
 r:=v_b->>'comparison_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day031_comparison_vault_ref_invalid'; end if;

 v_m:=p_evidence->'middle'; if jsonb_typeof(v_m) is distinct from 'object' then raise exception 'day031_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_m) x where x not in ('duration_seconds','psalm_3_5_orientation_confirmed','aleph_cheth_aleph_once_confirmed','cross_visualized_as_voluntary_surrender_axis_confirmed','thoughts_not_force_suppressed_confirmed','surrender_to_god_confirmed','identity_discernment_responsibility_preserved_confirmed','silence_latency_seconds','resistance_score','presence_score','quiet_depth_score','return_clarity_score','eyes_opened_after_confirmed','hands_and_feet_moved_after_confirmed','concrete_responsibility_resumed_immediately_confirmed','single_session_not_definitive_confirmed','reversibility_confirmed','integration_vault_entry_ref')) then raise exception 'day031_middle_unknown_field'; end if;
 if jsonb_typeof(v_m->'duration_seconds') is distinct from 'number' or (v_m->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day031_middle_requires_600_seconds'; end if;
 if v_m->'psalm_3_5_orientation_confirmed' is distinct from 'true'::jsonb or v_m->'aleph_cheth_aleph_once_confirmed' is distinct from 'true'::jsonb or v_m->'cross_visualized_as_voluntary_surrender_axis_confirmed' is distinct from 'true'::jsonb or v_m->'thoughts_not_force_suppressed_confirmed' is distinct from 'true'::jsonb or v_m->'surrender_to_god_confirmed' is distinct from 'true'::jsonb or v_m->'identity_discernment_responsibility_preserved_confirmed' is distinct from 'true'::jsonb or v_m->'eyes_opened_after_confirmed' is distinct from 'true'::jsonb or v_m->'hands_and_feet_moved_after_confirmed' is distinct from 'true'::jsonb or v_m->'concrete_responsibility_resumed_immediately_confirmed' is distinct from 'true'::jsonb or v_m->'single_session_not_definitive_confirmed' is distinct from 'true'::jsonb or v_m->'reversibility_confirmed' is distinct from 'true'::jsonb then raise exception 'day031_middle_boundaries_required'; end if;
 if not(v_m?'silence_latency_seconds') then raise exception 'day031_middle_latency_required'; end if; if v_m->'silence_latency_seconds'<>'null'::jsonb then if jsonb_typeof(v_m->'silence_latency_seconds') is distinct from 'number' then raise exception 'day031_middle_latency_invalid'; end if; n:=(v_m->>'silence_latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day031_middle_latency_invalid'; end if; end if;
 foreach k in array array['resistance_score','presence_score','quiet_depth_score','return_clarity_score'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day031_middle_score_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day031_middle_score_invalid'; end if; end loop;
 r:=v_m->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day031_integration_vault_ref_invalid'; end if;

 v_s:=p_evidence->'soul_mirror'; if jsonb_typeof(v_s) is distinct from 'object' then raise exception 'day031_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_s) x where x not in ('completed','explanation_surrender_discernment_responsibility_vault_entry_ref')) then raise exception 'day031_soul_mirror_unknown_field'; end if;
 if v_s->'completed' is distinct from 'true'::jsonb then raise exception 'day031_soul_mirror_required'; end if;
 r:=v_s->>'explanation_surrender_discernment_responsibility_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day031_soul_vault_ref_invalid'; end if;
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
  when 'day030_v1' then perform hnk_private.validate_day030_completion_v1(p_evidence,p_expected_source_sha);
  when 'day031_v1' then perform hnk_private.validate_day031_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'completion_validator_not_supported'; end case;
end$$;
insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D031-COMP-V1','HNK-KETHER-D031-V1',31,'2de71dbcf341774916d544f6aad55ab186bd3b68','1.0.0','day031_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
