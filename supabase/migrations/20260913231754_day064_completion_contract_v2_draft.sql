create or replace function hnk_private.validate_day064_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path=''
as $function$
declare a jsonb;c jsonb;p jsonb;m jsonb;s jsonb;k text;r text;cls text;ri integer;ca integer;vp integer;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day064_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','active','control','comparison','middle','private_vault_entry_ref','private_vault_e2ee_confirmed','practice_record_no_private_prose_confirmed','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day064_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D064-V2' then raise exception 'day064_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'fb05d22be494099a5a1d3e1e0f5480ecc6c072cb' then raise exception 'day064_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day064_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day064_v2_mode_invalid'; end if;
 r:=p_evidence->>'private_vault_entry_ref';if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day064_v2_vault_ref_invalid';end if;
 if p_evidence->'private_vault_e2ee_confirmed' is distinct from 'true'::jsonb or p_evidence->'practice_record_no_private_prose_confirmed' is distinct from 'true'::jsonb or p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day064_v2_completion_boundary_missing'; end if;
 if p_evidence->'safety_stop_occurred' is distinct from 'false'::jsonb or p_evidence->>'safety_stop_reason' is distinct from 'NONE' then raise exception 'day064_v2_unresolved_safety_stop'; end if;
 a:=p_evidence->'active';if jsonb_typeof(a) is distinct from 'object' then raise exception 'day064_v2_active_required';end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('vocal_seconds','active_write_seconds','pause_count','scores','vocalization_completed_confirmed','comfortable_volume_confirmed','free_breathing_confirmed','stop_available_confirmed','immediate_transition_confirmed','active_writing_completed_confirmed','continuous_writing_confirmed','no_style_editing_confirmed','review_delay_observed_confirmed','content_classified_confirmed')) then raise exception 'day064_v2_active_unknown_field';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'vocal_seconds'),false) or (a->>'vocal_seconds')::integer<1 or (a->>'vocal_seconds')::integer>600 then raise exception 'day064_v2_vocal_duration_out_of_contract';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'active_write_seconds'),false) or (a->>'active_write_seconds')::integer<300 then raise exception 'day064_v2_active_write_duration_out_of_contract';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'pause_count'),false) then raise exception 'day064_v2_pause_count_invalid';end if;
 foreach k in array array['vocalization_completed_confirmed','comfortable_volume_confirmed','free_breathing_confirmed','stop_available_confirmed','immediate_transition_confirmed','active_writing_completed_confirmed','continuous_writing_confirmed','no_style_editing_confirmed','review_delay_observed_confirmed','content_classified_confirmed'] loop if a->k is distinct from 'true'::jsonb then raise exception 'day064_v2_active_boundary_required:%',k;end if;end loop;
 s:=a->'scores';if jsonb_typeof(s) is distinct from 'object' or exists(select 1 from jsonb_object_keys(s) x where x not in ('fluidity','surprise','coherence','emotion','ease_to_start')) then raise exception 'day064_v2_active_scores_invalid';end if;
 foreach k in array array['fluidity','surprise','coherence','emotion','ease_to_start'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->k),false) or (s->>k)::integer>10 then raise exception 'day064_v2_active_score_invalid:%',k;end if;end loop;
 c:=p_evidence->'control';if jsonb_typeof(c) is distinct from 'object' then raise exception 'day064_v2_control_required';end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('control_write_seconds','scores','control_writing_completed_confirmed','other_session_confirmed','no_prior_vocalization_confirmed','open_theme_confirmed','approximate_environment_preserved_confirmed','approximate_time_preserved_confirmed')) then raise exception 'day064_v2_control_unknown_field';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'control_write_seconds'),false) or (c->>'control_write_seconds')::integer<300 then raise exception 'day064_v2_control_write_duration_out_of_contract';end if;
 foreach k in array array['control_writing_completed_confirmed','other_session_confirmed','no_prior_vocalization_confirmed','open_theme_confirmed','approximate_environment_preserved_confirmed','approximate_time_preserved_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day064_v2_control_boundary_required:%',k;end if;end loop;
 s:=c->'scores';if jsonb_typeof(s) is distinct from 'object' or exists(select 1 from jsonb_object_keys(s) x where x not in ('fluidity','surprise','coherence','emotion','ease_to_start')) then raise exception 'day064_v2_control_scores_invalid';end if;
 foreach k in array array['fluidity','surprise','coherence','emotion','ease_to_start'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->k),false) or (s->>k)::integer>10 then raise exception 'day064_v2_control_score_invalid:%',k;end if;end loop;
 p:=p_evidence->'comparison';if jsonb_typeof(p) is distinct from 'object' then raise exception 'day064_v2_comparison_required';end if;
 if exists(select 1 from jsonb_object_keys(p) x where x not in ('completed_confirmed','after_both_conditions_confirmed','no_winner_declared_confirmed','no_cherry_pick_confirmed','relevant_insight_count','common_origin_alternative_count','real_world_verification_plan_count','automatic_authority_not_claimed_confirmed','accusations_forbidden_confirmed','treatment_not_suspended_confirmed','irreversible_decisions_forbidden_confirmed','high_impact_decision_suspended_confirmed','threatening_content_not_reinforced_confirmed','return_to_daily_task_confirmed')) then raise exception 'day064_v2_comparison_unknown_field';end if;
 foreach k in array array['completed_confirmed','after_both_conditions_confirmed','no_winner_declared_confirmed','no_cherry_pick_confirmed','automatic_authority_not_claimed_confirmed','accusations_forbidden_confirmed','treatment_not_suspended_confirmed','irreversible_decisions_forbidden_confirmed','high_impact_decision_suspended_confirmed','threatening_content_not_reinforced_confirmed','return_to_daily_task_confirmed'] loop if p->k is distinct from 'true'::jsonb then raise exception 'day064_v2_comparison_boundary_required:%',k;end if;end loop;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'relevant_insight_count'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'common_origin_alternative_count'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'real_world_verification_plan_count'),false) then raise exception 'day064_v2_insight_counts_invalid';end if;
 ri:=(p->>'relevant_insight_count')::integer;ca:=(p->>'common_origin_alternative_count')::integer;vp:=(p->>'real_world_verification_plan_count')::integer;if ca<>ri or vp<>ri then raise exception 'day064_v2_each_insight_requires_alternative_and_verification';end if;
 m:=p_evidence->'middle';if jsonb_typeof(m) is distinct from 'object' then raise exception 'day064_v2_middle_required';end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_98_4_confirmed','yod_zayin_lamed_confirmed','classification','action_safe_reversible_step_defined','fact_independent_verification_defined','thanks_to_god_confirmed','journal_closed_confirmed','returned_to_environment_confirmed','automatic_authority_denied_confirmed','sensitive_content_private_encrypted_confirmed')) then raise exception 'day064_v2_middle_unknown_field';end if;
 foreach k in array array['psalm_98_4_confirmed','yod_zayin_lamed_confirmed','thanks_to_god_confirmed','journal_closed_confirmed','returned_to_environment_confirmed','automatic_authority_denied_confirmed','sensitive_content_private_encrypted_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day064_v2_middle_boundary_required:%',k;end if;end loop;
 cls:=m->>'classification';if cls not in ('IMAGE','EMOTION','HYPOTHESIS','ACTION','FACT') then raise exception 'day064_v2_classification_invalid';end if;
 if jsonb_typeof(m->'action_safe_reversible_step_defined') is distinct from 'boolean' or jsonb_typeof(m->'fact_independent_verification_defined') is distinct from 'boolean' then raise exception 'day064_v2_middle_conditional_flag_invalid';end if;
 if cls='ACTION' and m->'action_safe_reversible_step_defined' is distinct from 'true'::jsonb then raise exception 'day064_v2_action_requires_safe_reversible_step';end if;
 if cls='FACT' and m->'fact_independent_verification_defined' is distinct from 'true'::jsonb then raise exception 'day064_v2_fact_requires_independent_verification';end if;
 perform hnk_private.validate_day064_scalar_evidence_v1(jsonb_build_object('protocol_completed',true,'return_confirmed',m->'returned_to_environment_confirmed','vocalization_completed',a->'vocalization_completed_confirmed','active_writing_completed',a->'active_writing_completed_confirmed','control_writing_completed',c->'control_writing_completed_confirmed','comparison_completed',p->'completed_confirmed','content_classified',a->'content_classified_confirmed','automatic_authority_not_claimed',p->'automatic_authority_not_claimed_confirmed','high_impact_decision_suspended',p->'high_impact_decision_suspended_confirmed','threatening_content_not_reinforced',p->'threatening_content_not_reinforced_confirmed','vault_saved',true,'safety_clear',p_evidence->'final_safety_clear_confirmed','vocal_seconds',a->'vocal_seconds','active_write_seconds',a->'active_write_seconds','control_write_seconds',c->'control_write_seconds'));
end$function$;

create or replace function hnk_private.enforce_iezalel_062_066_scalar_evidence()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_existing boolean;v_source_sha text;v_status text;
begin
 if new.day not in (62,63,64,65,66) or new.state not in ('evidence_pending','complete') then return new;end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;if v_existing then return new;end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;if v_status is distinct from 'canon' then raise exception 'iezalel_canonical_day_not_available';end if;
 if new.day=62 then if v_source_sha is distinct from '56a8aaafbd2d602324ecfb9c06da39563fefaaf6' then raise exception 'day062_canonical_source_sha_mismatch';end if;if new.evidence->>'protocol_version'='HNK-CHOKMAH-D062-V2' then perform hnk_private.validate_day062_completion_v2(new.evidence,v_source_sha);else perform hnk_private.validate_day062_scalar_evidence_v1(new.evidence);end if;
 elsif new.day=63 then if v_source_sha is distinct from 'b9c9872ddf618aff3f515f601b3abfd611dace46' then raise exception 'day063_canonical_source_sha_mismatch';end if;if new.evidence->>'protocol_version'='HNK-CHOKMAH-D063-V2' then perform hnk_private.validate_day063_completion_v2(new.evidence,v_source_sha);else perform hnk_private.validate_day063_scalar_evidence_v1(new.evidence);end if;
 elsif new.day=64 then if v_source_sha is distinct from 'fb05d22be494099a5a1d3e1e0f5480ecc6c072cb' then raise exception 'day064_canonical_source_sha_mismatch';end if;if new.evidence->>'protocol_version'='HNK-CHOKMAH-D064-V2' then perform hnk_private.validate_day064_completion_v2(new.evidence,v_source_sha);else perform hnk_private.validate_day064_scalar_evidence_v1(new.evidence);end if;
 elsif new.day=65 then if v_source_sha is distinct from '8d8cd2a39fb05be283b8326fa258ed547b40f442' then raise exception 'day065_canonical_source_sha_mismatch';end if;perform hnk_private.validate_day065_scalar_evidence_v1(new.evidence);
 else if v_source_sha is distinct from 'a6d48785ee355f734cadda61b0bb3810b125bf5e' then raise exception 'day066_canonical_source_sha_mismatch';end if;perform hnk_private.validate_day066_scalar_evidence_v1(new.evidence);end if;
 return new;
end$function$;

do $patch$
declare d text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into d;
 if position('when ''day064_v2''' in d)=0 then
  d:=replace(d,'  when ''day063_v2'' then perform hnk_private.validate_day063_completion_v2(p_evidence,p_expected_source_sha);','  when ''day063_v2'' then perform hnk_private.validate_day063_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||'  when ''day064_v2'' then perform hnk_private.validate_day064_completion_v2(p_evidence,p_expected_source_sha);');
  execute d;
 end if;
end$patch$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D064-COMP-V2','HNK-CHOKMAH-D064-V2',64,'fb05d22be494099a5a1d3e1e0f5480ecc6c072cb','2.0.0','day064_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
