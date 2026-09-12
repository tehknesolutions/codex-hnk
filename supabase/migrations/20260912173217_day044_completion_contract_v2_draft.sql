create or replace function hnk_private.validate_day044_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare a jsonb; n jsonb; e jsonb; m jsonb; soul jsonb; r text; k text; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day044_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','active','neutral','ethical_review','middle','soul_mirror','voluntary_completion_confirmed','final_autonomy_preserved_confirmed')) then raise exception 'day044_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D044-V2' then raise exception 'day044_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9' then raise exception 'day044_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day044_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day044_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day044_v2_voluntary_completion_required'; end if;
 if p_evidence->'final_autonomy_preserved_confirmed' is distinct from 'true'::jsonb then raise exception 'day044_v2_final_autonomy_required'; end if;
 a:=p_evidence->'active'; if jsonb_typeof(a) is distinct from 'object' then raise exception 'day044_v2_active_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('active_read_seconds','truisms_count','suggestions_count','truisms_verified_confirmed','connector_sequence_confirmed','suggestions_permissive_confirmed','suggestions_rejectable_confirmed','absolute_promises_absent_confirmed','coercive_phrasing_absent_confirmed','content_response_traditional_meaning_separated_confirmed','tension_before','tension_after','acceptance','resistance','clarity','coercive_phrase_detected','rewrite_marked_if_needed_confirmed','choice_preserved_confirmed','ethical_limit_defined_confirmed','vault_entry_ref')) then raise exception 'day044_v2_active_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->'active_read_seconds'),false) or (a->>'active_read_seconds')::int<1 or (a->>'active_read_seconds')::int>7200 then raise exception 'day044_v2_active_duration_invalid'; end if;
 if a->'truisms_count' is distinct from '6'::jsonb then raise exception 'day044_v2_exactly_6_truisms_required'; end if;
 if a->'suggestions_count' is distinct from '3'::jsonb then raise exception 'day044_v2_exactly_3_suggestions_required'; end if;
 foreach k in array array['tension_before','tension_after','acceptance','resistance','clarity'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->k),false) or (a->>k)::int>10 then raise exception 'day044_v2_active_scalar_invalid:%',k; end if; end loop;
 if jsonb_typeof(a->'coercive_phrase_detected') is distinct from 'boolean' then raise exception 'day044_v2_coercive_detection_invalid'; end if;
 if a->'truisms_verified_confirmed' is distinct from 'true'::jsonb or a->'connector_sequence_confirmed' is distinct from 'true'::jsonb or a->'suggestions_permissive_confirmed' is distinct from 'true'::jsonb or a->'suggestions_rejectable_confirmed' is distinct from 'true'::jsonb or a->'absolute_promises_absent_confirmed' is distinct from 'true'::jsonb or a->'coercive_phrasing_absent_confirmed' is distinct from 'true'::jsonb or a->'content_response_traditional_meaning_separated_confirmed' is distinct from 'true'::jsonb or a->'rewrite_marked_if_needed_confirmed' is distinct from 'true'::jsonb or a->'choice_preserved_confirmed' is distinct from 'true'::jsonb or a->'ethical_limit_defined_confirmed' is distinct from 'true'::jsonb then raise exception 'day044_v2_active_boundaries_required'; end if;
 r:=a->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day044_v2_active_vault_ref_invalid'; end if;
 n:=p_evidence->'neutral'; if jsonb_typeof(n) is distinct from 'object' then raise exception 'day044_v2_neutral_required'; end if;
 if exists(select 1 from jsonb_object_keys(n) x where x not in ('neutral_read_seconds','similar_duration_confirmed','neutral_informative_text_confirmed','linked_truisms_absent_confirmed','suggestions_absent_confirmed','theurgic_formula_absent_confirmed','posture_environment_equivalent_confirmed','preselected_winner_absent_confirmed','focus','tension','comfort','recall','willingness_to_continue','vault_entry_ref')) then raise exception 'day044_v2_neutral_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(n->'neutral_read_seconds'),false) or (n->>'neutral_read_seconds')::int<1 or (n->>'neutral_read_seconds')::int>7200 then raise exception 'day044_v2_neutral_duration_invalid'; end if;
 foreach k in array array['focus','tension','comfort','recall','willingness_to_continue'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(n->k),false) or (n->>k)::int>10 then raise exception 'day044_v2_neutral_scalar_invalid:%',k; end if; end loop;
 if n->'similar_duration_confirmed' is distinct from 'true'::jsonb or n->'neutral_informative_text_confirmed' is distinct from 'true'::jsonb or n->'linked_truisms_absent_confirmed' is distinct from 'true'::jsonb or n->'suggestions_absent_confirmed' is distinct from 'true'::jsonb or n->'theurgic_formula_absent_confirmed' is distinct from 'true'::jsonb or n->'posture_environment_equivalent_confirmed' is distinct from 'true'::jsonb or n->'preselected_winner_absent_confirmed' is distinct from 'true'::jsonb then raise exception 'day044_v2_neutral_boundaries_required'; end if;
 r:=n->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day044_v2_neutral_vault_ref_invalid'; end if;
 e:=p_evidence->'ethical_review'; if jsonb_typeof(e) is distinct from 'object' then raise exception 'day044_v2_ethical_review_required'; end if;
 if exists(select 1 from jsonb_object_keys(e) x where x not in ('logical_leaps_reviewed_confirmed','pressure_reviewed_confirmed','healing_promises_removed_confirmed','superiority_claims_removed_confirmed','spiritual_certainty_claims_removed_confirmed','resisted_phrases_rewritten_or_removed_confirmed','consent_preserved_confirmed','health_care_not_replaced_confirmed','legal_decision_not_replaced_confirmed','spiritual_authority_not_replaced_confirmed','comparison_completed_confirmed','vault_entry_ref')) then raise exception 'day044_v2_ethical_review_unknown_field'; end if;
 if e->'logical_leaps_reviewed_confirmed' is distinct from 'true'::jsonb or e->'pressure_reviewed_confirmed' is distinct from 'true'::jsonb or e->'healing_promises_removed_confirmed' is distinct from 'true'::jsonb or e->'superiority_claims_removed_confirmed' is distinct from 'true'::jsonb or e->'spiritual_certainty_claims_removed_confirmed' is distinct from 'true'::jsonb or e->'resisted_phrases_rewritten_or_removed_confirmed' is distinct from 'true'::jsonb or e->'consent_preserved_confirmed' is distinct from 'true'::jsonb or e->'health_care_not_replaced_confirmed' is distinct from 'true'::jsonb or e->'legal_decision_not_replaced_confirmed' is distinct from 'true'::jsonb or e->'spiritual_authority_not_replaced_confirmed' is distinct from 'true'::jsonb or e->'comparison_completed_confirmed' is distinct from 'true'::jsonb then raise exception 'day044_v2_ethical_boundaries_required'; end if;
 r:=e->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day044_v2_ethical_vault_ref_invalid'; end if;
 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day044_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('integration_seconds','psalm_25_6_confirmed','he_zayin_yod_confirmed','only_true_or_freely_acceptable_phrases_confirmed','silent_breath_between_blocks_confirmed','resistance_allows_stop_rewrite_confirmed','resume_only_voluntarily_confirmed','active_vs_neutral_compared_confirmed','thanks_to_god_confirmed','influence_power_not_claimed_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day044_v2_middle_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(m->'integration_seconds'),false) or (m->>'integration_seconds')::int<1 or (m->>'integration_seconds')::int>7200 then raise exception 'day044_v2_middle_duration_invalid'; end if;
 if m->'psalm_25_6_confirmed' is distinct from 'true'::jsonb or m->'he_zayin_yod_confirmed' is distinct from 'true'::jsonb or m->'only_true_or_freely_acceptable_phrases_confirmed' is distinct from 'true'::jsonb or m->'silent_breath_between_blocks_confirmed' is distinct from 'true'::jsonb or m->'resistance_allows_stop_rewrite_confirmed' is distinct from 'true'::jsonb or m->'resume_only_voluntarily_confirmed' is distinct from 'true'::jsonb or m->'active_vs_neutral_compared_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'influence_power_not_claimed_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb then raise exception 'day044_v2_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day044_v2_middle_vault_ref_invalid'; end if;
 soul:=p_evidence->'soul_mirror'; if jsonb_typeof(soul) is distinct from 'object' or soul->'completed' is distinct from 'true'::jsonb then raise exception 'day044_v2_soul_required'; end if;
 if exists(select 1 from jsonb_object_keys(soul) x where x not in ('completed','vault_entry_ref')) then raise exception 'day044_v2_soul_unknown_field'; end if;
 r:=soul->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day044_v2_soul_vault_ref_invalid'; end if;
 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','active_script_completed',true,'neutral_comparison_completed',e->'comparison_completed_confirmed','ethical_review_completed',true,'autonomy_preserved',p_evidence->'final_autonomy_preserved_confirmed','truisms_logged',a->'truisms_count','suggestions_logged',a->'suggestions_count');
 perform hnk_private.validate_day044_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_haziel_042_044_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day not in (42,43,44) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
 if v_status is distinct from 'canon' then raise exception 'haziel_canonical_day_not_available'; end if;
 if new.day=42 then
   if v_source_sha is distinct from 'b7f4da850f8c724cf48e980bd30882283efbb822' then raise exception 'day042_canonical_source_sha_mismatch'; end if;
   if new.evidence->>'protocol_version'='HNK-CHOKMAH-D042-V2' then perform hnk_private.validate_day042_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day042_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=43 then
   if v_source_sha is distinct from 'f1c8fa153f91ab0e7b3536c8b900ea438fa3b616' then raise exception 'day043_canonical_source_sha_mismatch'; end if;
   if new.evidence->>'protocol_version'='HNK-CHOKMAH-D043-V2' then perform hnk_private.validate_day043_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day043_scalar_evidence_v1(new.evidence); end if;
 else
   if v_source_sha is distinct from '94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9' then raise exception 'day044_canonical_source_sha_mismatch'; end if;
   if new.evidence->>'protocol_version'='HNK-CHOKMAH-D044-V2' then perform hnk_private.validate_day044_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day044_scalar_evidence_v1(new.evidence); end if;
 end if;
 return new;
end$$;

do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day044_v2''' in v_def)=0 then
   v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
   if position(v_old in v_def)=0 then raise exception 'day044_dispatcher_patch_anchor_missing'; end if;
   v_new:='  when ''day044_v2'' then perform hnk_private.validate_day044_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
   v_def:=replace(v_def,v_old,v_new);
   execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D044-COMP-V2','HNK-CHOKMAH-D044-V2',44,'94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9','2.0.0','day044_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
