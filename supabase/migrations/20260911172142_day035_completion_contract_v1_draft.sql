create or replace function hnk_private.validate_day035_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; k text; v_j jsonb; v_b jsonb; v_m jsonb; v_s jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day035_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz_control','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day035_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D035-V1' then raise exception 'day035_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '7f20c0ed04243ccb9c21e6a3e0068adf8921e941' then raise exception 'day035_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day035_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day035_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day035_voluntary_completion_required'; end if;
 if not(p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day035_safety_stop_invalid'; end if;

 v_j:=p_evidence->'jachin'; if jsonb_typeof(v_j) is distinct from 'object' then raise exception 'day035_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_j) x where x not in ('construction_seconds','circle_count','tetragrammaton_hold_seconds','standing_free_space_confirmed','three_breaths_confirmed','god_above_symbols_confirmed','no_cutting_objects_confirmed','blue_closed_lines_confirmed','tetragrammaton_blue_flames_confirmed','distraction_count','circle_clarity_score','tetragrammaton_stability_score','boundary_score','presence_score','intrusion_count','final_clarity_score','invulnerability_claim_rejected_confirmed','concrete_risks_not_ignored_confirmed','jachin_vault_entry_ref')) then raise exception 'day035_jachin_unknown_field'; end if;
 foreach k in array array['construction_seconds'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day035_jachin_construction_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<1 or n>7200 then raise exception 'day035_jachin_construction_invalid'; end if; end loop;
 if jsonb_typeof(v_j->'circle_count') is distinct from 'number' or (v_j->>'circle_count')::numeric is distinct from 3::numeric then raise exception 'day035_jachin_three_circles_required'; end if;
 if jsonb_typeof(v_j->'tetragrammaton_hold_seconds') is distinct from 'number' or (v_j->>'tetragrammaton_hold_seconds')::numeric is distinct from 300::numeric then raise exception 'day035_jachin_hold_300_required'; end if;
 if v_j->'standing_free_space_confirmed' is distinct from 'true'::jsonb or v_j->'three_breaths_confirmed' is distinct from 'true'::jsonb or v_j->'god_above_symbols_confirmed' is distinct from 'true'::jsonb or v_j->'no_cutting_objects_confirmed' is distinct from 'true'::jsonb or v_j->'blue_closed_lines_confirmed' is distinct from 'true'::jsonb or v_j->'tetragrammaton_blue_flames_confirmed' is distinct from 'true'::jsonb or v_j->'invulnerability_claim_rejected_confirmed' is distinct from 'true'::jsonb or v_j->'concrete_risks_not_ignored_confirmed' is distinct from 'true'::jsonb then raise exception 'day035_jachin_boundaries_required'; end if;
 foreach k in array array['distraction_count','intrusion_count'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day035_jachin_count_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day035_jachin_count_invalid'; end if; end loop;
 foreach k in array array['circle_clarity_score','tetragrammaton_stability_score','boundary_score','presence_score','final_clarity_score'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day035_jachin_score_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day035_jachin_score_invalid'; end if; end loop;
 r:=v_j->>'jachin_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day035_jachin_vault_ref_invalid'; end if;

 v_b:=p_evidence->'boaz_control'; if jsonb_typeof(v_b) is distinct from 'object' then raise exception 'day035_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_b) x where x not in ('construction_seconds','circle_count','center_observation_seconds','same_or_comparable_environment_posture_time_confirmed','gray_neutral_lines_confirmed','no_sacred_name_confirmed','no_blue_fire_confirmed','no_achaiah_formula_confirmed','intrusion_count','tension_score','presence_score','spatial_stability_score','boundary_score','subjective_safety_score','final_clarity_score','control_not_sabotaged_confirmed','expectation_competitor_recorded_confirmed','control_vault_entry_ref')) then raise exception 'day035_boaz_unknown_field'; end if;
 if jsonb_typeof(v_b->'construction_seconds') is distinct from 'number' then raise exception 'day035_control_construction_invalid'; end if; n:=(v_b->>'construction_seconds')::numeric; if n<>trunc(n) or n<1 or n>7200 then raise exception 'day035_control_construction_invalid'; end if;
 if jsonb_typeof(v_b->'circle_count') is distinct from 'number' or (v_b->>'circle_count')::numeric is distinct from 3::numeric then raise exception 'day035_control_three_circles_required'; end if;
 if jsonb_typeof(v_b->'center_observation_seconds') is distinct from 'number' or (v_b->>'center_observation_seconds')::numeric is distinct from 300::numeric then raise exception 'day035_control_hold_300_required'; end if;
 if v_b->'same_or_comparable_environment_posture_time_confirmed' is distinct from 'true'::jsonb or v_b->'gray_neutral_lines_confirmed' is distinct from 'true'::jsonb or v_b->'no_sacred_name_confirmed' is distinct from 'true'::jsonb or v_b->'no_blue_fire_confirmed' is distinct from 'true'::jsonb or v_b->'no_achaiah_formula_confirmed' is distinct from 'true'::jsonb or v_b->'control_not_sabotaged_confirmed' is distinct from 'true'::jsonb or v_b->'expectation_competitor_recorded_confirmed' is distinct from 'true'::jsonb then raise exception 'day035_control_boundaries_required'; end if;
 if jsonb_typeof(v_b->'intrusion_count') is distinct from 'number' then raise exception 'day035_control_intrusions_invalid'; end if; n:=(v_b->>'intrusion_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day035_control_intrusions_invalid'; end if;
 foreach k in array array['tension_score','presence_score','spatial_stability_score','boundary_score','subjective_safety_score','final_clarity_score'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day035_control_score_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day035_control_score_invalid'; end if; end loop;
 r:=v_b->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day035_control_vault_ref_invalid'; end if;

 v_m:=p_evidence->'middle'; if jsonb_typeof(v_m) is distinct from 'object' then raise exception 'day035_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_m) x where x not in ('construction_seconds','circle_count','tetragrammaton_hold_seconds','psalm_3_5_orientation_confirmed','aleph_cheth_aleph_once_confirmed','standing_free_space_confirmed','no_cutting_objects_confirmed','blue_closed_lines_confirmed','tetragrammaton_blue_flames_confirmed','thoughts_allowed_without_forcing_confirmed','thanks_to_god_confirmed','image_consciously_dissolved_confirmed','feet_grounded_after_confirmed','deep_breath_after_confirmed','e1_e5_recorded_confirmed','portal_readiness_criterion_defined_confirmed','distraction_count','intrusion_count','spatial_stability_score','boundary_score','presence_score','final_clarity_score','prudence_preserved_confirmed','shared_reality_preserved_confirmed','invulnerability_claim_rejected_confirmed','concrete_risks_not_ignored_confirmed','functional_capacity_intact_confirmed','middle_vault_entry_ref')) then raise exception 'day035_middle_unknown_field'; end if;
 if jsonb_typeof(v_m->'construction_seconds') is distinct from 'number' then raise exception 'day035_middle_construction_invalid'; end if; n:=(v_m->>'construction_seconds')::numeric; if n<>trunc(n) or n<1 or n>7200 then raise exception 'day035_middle_construction_invalid'; end if;
 if jsonb_typeof(v_m->'circle_count') is distinct from 'number' or (v_m->>'circle_count')::numeric is distinct from 3::numeric then raise exception 'day035_middle_three_circles_required'; end if;
 if jsonb_typeof(v_m->'tetragrammaton_hold_seconds') is distinct from 'number' or (v_m->>'tetragrammaton_hold_seconds')::numeric is distinct from 300::numeric then raise exception 'day035_middle_hold_300_required'; end if;
 if v_m->'psalm_3_5_orientation_confirmed' is distinct from 'true'::jsonb or v_m->'aleph_cheth_aleph_once_confirmed' is distinct from 'true'::jsonb or v_m->'standing_free_space_confirmed' is distinct from 'true'::jsonb or v_m->'no_cutting_objects_confirmed' is distinct from 'true'::jsonb or v_m->'blue_closed_lines_confirmed' is distinct from 'true'::jsonb or v_m->'tetragrammaton_blue_flames_confirmed' is distinct from 'true'::jsonb or v_m->'thoughts_allowed_without_forcing_confirmed' is distinct from 'true'::jsonb or v_m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or v_m->'image_consciously_dissolved_confirmed' is distinct from 'true'::jsonb or v_m->'feet_grounded_after_confirmed' is distinct from 'true'::jsonb or v_m->'deep_breath_after_confirmed' is distinct from 'true'::jsonb or v_m->'e1_e5_recorded_confirmed' is distinct from 'true'::jsonb or v_m->'portal_readiness_criterion_defined_confirmed' is distinct from 'true'::jsonb or v_m->'prudence_preserved_confirmed' is distinct from 'true'::jsonb or v_m->'shared_reality_preserved_confirmed' is distinct from 'true'::jsonb or v_m->'invulnerability_claim_rejected_confirmed' is distinct from 'true'::jsonb or v_m->'concrete_risks_not_ignored_confirmed' is distinct from 'true'::jsonb or v_m->'functional_capacity_intact_confirmed' is distinct from 'true'::jsonb then raise exception 'day035_middle_boundaries_required'; end if;
 foreach k in array array['distraction_count','intrusion_count'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day035_middle_count_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day035_middle_count_invalid'; end if; end loop;
 foreach k in array array['spatial_stability_score','boundary_score','presence_score','final_clarity_score'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day035_middle_score_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day035_middle_score_invalid'; end if; end loop;
 r:=v_m->>'middle_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day035_middle_vault_ref_invalid'; end if;

 v_s:=p_evidence->'soul_mirror'; if jsonb_typeof(v_s) is distinct from 'object' then raise exception 'day035_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_s) x where x not in ('completed','comparison_vault_entry_ref')) then raise exception 'day035_soul_unknown_field'; end if;
 if v_s->'completed' is distinct from 'true'::jsonb then raise exception 'day035_soul_mirror_required'; end if;
 r:=v_s->>'comparison_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day035_soul_vault_ref_invalid'; end if;
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
  when 'day032_v1' then perform hnk_private.validate_day032_completion_v1(p_evidence,p_expected_source_sha);
  when 'day033_v1' then perform hnk_private.validate_day033_completion_v1(p_evidence,p_expected_source_sha);
  when 'day034_v1' then perform hnk_private.validate_day034_completion_v1(p_evidence,p_expected_source_sha);
  when 'day035_v1' then perform hnk_private.validate_day035_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D035-COMP-V1','HNK-KETHER-D035-V1',35,'7f20c0ed04243ccb9c21e6a3e0068adf8921e941','1.0.0','day035_v1','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
