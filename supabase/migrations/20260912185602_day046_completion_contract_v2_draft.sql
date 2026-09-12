create or replace function hnk_private.validate_day046_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare p jsonb; c jsonb; cmp jsonb; m jsonb; soul jsonb; r text; k text; legacy jsonb; hand text; thermal text; present boolean;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day046_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','plant','control','comparison','middle','soul_mirror','voluntary_completion_confirmed','final_safety_clear_confirmed')) then raise exception 'day046_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D046-V2' then raise exception 'day046_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'e8a812598e885222d42b0ddf968fa93c83d3432b' then raise exception 'day046_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day046_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day046_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day046_v2_voluntary_completion_required'; end if;
 if p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day046_v2_final_safety_required'; end if;

 p:=p_evidence->'plant'; if jsonb_typeof(p) is distinct from 'object' then raise exception 'day046_v2_plant_required'; end if;
 if exists(select 1 from jsonb_object_keys(p) x where x not in ('duration_seconds','dominant_hand','approx_distance_cm','approximately_three_cm_confirmed','contact_absent_confirmed','sensation_present','thermal_quality','tingling_present','pulsation_present','pressure_present','air_movement_present','magnetism_perceived','intensity','expectation','comfort','vault_entry_ref','healthy_plant_confirmed','eyes_closed_comfortably_confirmed','hand_relaxed_confirmed','natural_breathing_confirmed','arm_tension_absent_confirmed','magnetism_not_forced_confirmed','body_environment_recorded_before_interpretation_confirmed','external_aura_not_claimed_confirmed','plant_communication_not_claimed_confirmed')) then raise exception 'day046_v2_plant_unknown_field'; end if;
 if p->'duration_seconds' is distinct from '420'::jsonb then raise exception 'day046_v2_plant_420_required'; end if;
 hand:=p->>'dominant_hand'; if hand not in ('LEFT','RIGHT') then raise exception 'day046_v2_dominant_hand_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'approx_distance_cm'),false) or (p->>'approx_distance_cm')::int not between 1 and 10 then raise exception 'day046_v2_plant_distance_invalid'; end if;
 foreach k in array array['sensation_present','tingling_present','pulsation_present','pressure_present','air_movement_present','magnetism_perceived'] loop if jsonb_typeof(p->k) is distinct from 'boolean' then raise exception 'day046_v2_plant_presence_flag_invalid:%',k; end if; end loop;
 foreach k in array array['intensity','expectation','comfort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->k),false) or (p->>k)::int>10 then raise exception 'day046_v2_plant_scalar_invalid:%',k; end if; end loop;
 thermal:=p->>'thermal_quality'; if thermal not in ('NONE','WARM','COOL','MIXED') then raise exception 'day046_v2_plant_thermal_invalid'; end if; present:=(p->>'sensation_present')::boolean;
 if not present and (thermal<>'NONE' or (p->>'tingling_present')::boolean or (p->>'pulsation_present')::boolean or (p->>'pressure_present')::boolean or (p->>'air_movement_present')::boolean or (p->>'magnetism_perceived')::boolean or (p->>'intensity')::int<>0) then raise exception 'day046_v2_plant_absent_sensation_metrics_must_be_zero'; end if;
 if present and thermal='NONE' and not (p->>'tingling_present')::boolean and not (p->>'pulsation_present')::boolean and not (p->>'pressure_present')::boolean and not (p->>'air_movement_present')::boolean and not (p->>'magnetism_perceived')::boolean then raise exception 'day046_v2_plant_present_sensation_requires_descriptor'; end if;
 if p->'approximately_three_cm_confirmed' is distinct from 'true'::jsonb or p->'contact_absent_confirmed' is distinct from 'true'::jsonb or p->'healthy_plant_confirmed' is distinct from 'true'::jsonb or p->'eyes_closed_comfortably_confirmed' is distinct from 'true'::jsonb or p->'hand_relaxed_confirmed' is distinct from 'true'::jsonb or p->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p->'arm_tension_absent_confirmed' is distinct from 'true'::jsonb or p->'magnetism_not_forced_confirmed' is distinct from 'true'::jsonb or p->'body_environment_recorded_before_interpretation_confirmed' is distinct from 'true'::jsonb or p->'external_aura_not_claimed_confirmed' is distinct from 'true'::jsonb or p->'plant_communication_not_claimed_confirmed' is distinct from 'true'::jsonb then raise exception 'day046_v2_plant_boundaries_required'; end if;
 r:=p->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day046_v2_plant_vault_ref_invalid'; end if;

 c:=p_evidence->'control'; if jsonb_typeof(c) is distinct from 'object' then raise exception 'day046_v2_control_required'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('duration_seconds','dominant_hand','approx_distance_cm','approximately_three_cm_confirmed','contact_absent_confirmed','sensation_present','thermal_quality','tingling_present','pulsation_present','pressure_present','air_movement_present','magnetism_perceived','intensity','expectation','comfort','vault_entry_ref','rest_before_control_confirmed','inert_object_confirmed','similar_size_confirmed','same_hand_as_plant_confirmed','similar_distance_posture_environment_confirmed','simple_blinding_used','condition_not_interpreted_during_observation_confirmed','null_result_preserved_confirmed')) then raise exception 'day046_v2_control_unknown_field'; end if;
 if c->'duration_seconds' is distinct from '420'::jsonb then raise exception 'day046_v2_control_420_required'; end if;
 if c->>'dominant_hand' is distinct from hand then raise exception 'day046_v2_control_hand_mismatch'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->'approx_distance_cm'),false) or (c->>'approx_distance_cm')::int not between 1 and 10 then raise exception 'day046_v2_control_distance_invalid'; end if;
 foreach k in array array['sensation_present','tingling_present','pulsation_present','pressure_present','air_movement_present','magnetism_perceived','simple_blinding_used'] loop if jsonb_typeof(c->k) is distinct from 'boolean' then raise exception 'day046_v2_control_presence_flag_invalid:%',k; end if; end loop;
 foreach k in array array['intensity','expectation','comfort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) or (c->>k)::int>10 then raise exception 'day046_v2_control_scalar_invalid:%',k; end if; end loop;
 thermal:=c->>'thermal_quality'; if thermal not in ('NONE','WARM','COOL','MIXED') then raise exception 'day046_v2_control_thermal_invalid'; end if; present:=(c->>'sensation_present')::boolean;
 if not present and (thermal<>'NONE' or (c->>'tingling_present')::boolean or (c->>'pulsation_present')::boolean or (c->>'pressure_present')::boolean or (c->>'air_movement_present')::boolean or (c->>'magnetism_perceived')::boolean or (c->>'intensity')::int<>0) then raise exception 'day046_v2_control_absent_sensation_metrics_must_be_zero'; end if;
 if present and thermal='NONE' and not (c->>'tingling_present')::boolean and not (c->>'pulsation_present')::boolean and not (c->>'pressure_present')::boolean and not (c->>'air_movement_present')::boolean and not (c->>'magnetism_perceived')::boolean then raise exception 'day046_v2_control_present_sensation_requires_descriptor'; end if;
 if c->'approximately_three_cm_confirmed' is distinct from 'true'::jsonb or c->'contact_absent_confirmed' is distinct from 'true'::jsonb or c->'rest_before_control_confirmed' is distinct from 'true'::jsonb or c->'inert_object_confirmed' is distinct from 'true'::jsonb or c->'similar_size_confirmed' is distinct from 'true'::jsonb or c->'same_hand_as_plant_confirmed' is distinct from 'true'::jsonb or c->'similar_distance_posture_environment_confirmed' is distinct from 'true'::jsonb or c->'condition_not_interpreted_during_observation_confirmed' is distinct from 'true'::jsonb or c->'null_result_preserved_confirmed' is distinct from 'true'::jsonb then raise exception 'day046_v2_control_boundaries_required'; end if;
 r:=c->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day046_v2_control_vault_ref_invalid'; end if;

 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day046_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','circulation_considered_confirmed','ambient_temperature_considered_confirmed','posture_considered_confirmed','air_movement_considered_confirmed','surface_proximity_considered_confirmed','expectation_considered_confirmed','favorable_result_selection_absent_confirmed','aura_percentage_not_calculated_confirmed','external_aura_not_confirmed','automatic_spiritual_confirmation_not_claimed_confirmed','vault_entry_ref')) then raise exception 'day046_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','interpretation_separated_confirmed','null_results_preserved_confirmed','circulation_considered_confirmed','ambient_temperature_considered_confirmed','posture_considered_confirmed','air_movement_considered_confirmed','surface_proximity_considered_confirmed','expectation_considered_confirmed','favorable_result_selection_absent_confirmed','aura_percentage_not_calculated_confirmed','external_aura_not_confirmed','automatic_spiritual_confirmation_not_claimed_confirmed'] loop if cmp->k is distinct from 'true'::jsonb then raise exception 'day046_v2_comparison_boundary_required:%',k; end if; end loop;
 r:=cmp->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day046_v2_comparison_vault_ref_invalid'; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day046_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_25_6_confirmed','he_zayin_yod_confirmed','sensation_environment_traditional_interpretation_separated_confirmed','hands_shoulders_moved_confirmed','thanks_to_god_confirmed','creation_respected_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day046_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_25_6_confirmed','he_zayin_yod_confirmed','sensation_environment_traditional_interpretation_separated_confirmed','hands_shoulders_moved_confirmed','thanks_to_god_confirmed','creation_respected_confirmed','functional_return_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day046_v2_middle_boundary_required:%',k; end if; end loop;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day046_v2_middle_vault_ref_invalid'; end if;

 soul:=p_evidence->'soul_mirror'; if jsonb_typeof(soul) is distinct from 'object' or soul->'completed' is distinct from 'true'::jsonb then raise exception 'day046_v2_soul_required'; end if;
 if exists(select 1 from jsonb_object_keys(soul) x where x not in ('completed','vault_entry_ref')) then raise exception 'day046_v2_soul_unknown_field'; end if;
 r:=soul->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day046_v2_soul_vault_ref_invalid'; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','plant_completed',true,'rest_confirmed',c->'rest_before_control_confirmed','control_completed',true,'comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','null_results_preserved',cmp->'null_results_preserved_confirmed','alternatives_considered',cmp->'circulation_considered_confirmed','aura_not_claimed',p->'external_aura_not_claimed_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','plant_sensation_present',p->'sensation_present','control_sensation_present',c->'sensation_present','plant_seconds',420,'control_seconds',420);
 perform hnk_private.validate_day046_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_haziel_046_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day<>46 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=46) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=46;
 if v_status is distinct from 'canon' then raise exception 'haziel_day046_canonical_day_not_available'; end if;
 if v_source_sha is distinct from 'e8a812598e885222d42b0ddf968fa93c83d3432b' then raise exception 'day046_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D046-V2' then perform hnk_private.validate_day046_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day046_scalar_evidence_v1(new.evidence); end if;
 return new;
end$$;

do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day046_v2''' in v_def)=0 then
   v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
   if position(v_old in v_def)=0 then raise exception 'day046_dispatcher_patch_anchor_missing'; end if;
   v_new:='  when ''day046_v2'' then perform hnk_private.validate_day046_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
   v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D046-COMP-V2','HNK-CHOKMAH-D046-V2',46,'e8a812598e885222d42b0ddf968fa93c83d3432b','2.0.0','day046_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();