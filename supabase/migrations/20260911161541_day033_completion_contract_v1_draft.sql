create or replace function hnk_private.validate_day033_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; k text; v_j jsonb; v_b jsonb; v_m jsonb; v_s jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day033_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz_control','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day033_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D033-V1' then raise exception 'day033_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '97c1562b8b285b8b5d9ead934c3702844c7bd837' then raise exception 'day033_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day033_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day033_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day033_voluntary_completion_required'; end if;
 if not(p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day033_safety_stop_invalid'; end if;

 v_j:=p_evidence->'jachin'; if jsonb_typeof(v_j) is distinct from 'object' then raise exception 'day033_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_j) x where x not in ('duration_seconds','supported_position_confirmed','eyes_closed_confirmed','three_slow_breaths_confirmed','natural_breathing_confirmed','orientation_preserved_confirmed','memory_continuity_confirmed','movement_available_at_will_confirmed','pain_not_suppressed_confirmed','growing_discomfort_not_ignored_confirmed','motor_impulse_count','movement_count','noise_reactivity_count','depth_score','tension_score','comfort_score','return_clarity_score','jachin_vault_entry_ref')) then raise exception 'day033_jachin_unknown_field'; end if;
 if jsonb_typeof(v_j->'duration_seconds') is distinct from 'number' or (v_j->>'duration_seconds')::numeric is distinct from 900::numeric then raise exception 'day033_jachin_duration_900_required'; end if;
 if v_j->'supported_position_confirmed' is distinct from 'true'::jsonb or v_j->'eyes_closed_confirmed' is distinct from 'true'::jsonb or v_j->'three_slow_breaths_confirmed' is distinct from 'true'::jsonb or v_j->'natural_breathing_confirmed' is distinct from 'true'::jsonb or v_j->'orientation_preserved_confirmed' is distinct from 'true'::jsonb or v_j->'memory_continuity_confirmed' is distinct from 'true'::jsonb or v_j->'movement_available_at_will_confirmed' is distinct from 'true'::jsonb or v_j->'pain_not_suppressed_confirmed' is distinct from 'true'::jsonb or v_j->'growing_discomfort_not_ignored_confirmed' is distinct from 'true'::jsonb then raise exception 'day033_jachin_boundaries_required'; end if;
 foreach k in array array['motor_impulse_count','movement_count','noise_reactivity_count'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day033_jachin_count_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day033_jachin_count_invalid'; end if; end loop;
 foreach k in array array['depth_score','tension_score','comfort_score','return_clarity_score'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day033_jachin_score_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day033_jachin_score_invalid'; end if; end loop;
 r:=v_j->>'jachin_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day033_jachin_vault_ref_invalid'; end if;

 v_b:=p_evidence->'boaz_control'; if jsonb_typeof(v_b) is distinct from 'object' then raise exception 'day033_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_b) x where x not in ('duration_seconds','same_posture_environment_duration_confirmed','no_elevator_or_esdaile_induction_confirmed','small_adjustment_each_minute_permitted_confirmed','natural_breathing_confirmed','pain_not_suppressed_confirmed','growing_discomfort_not_ignored_confirmed','motor_impulse_count','movement_count','noise_reactivity_count','tension_score','comfort_score','sleepiness_score','depth_score','return_clarity_score','hands_feet_head_moved_after_confirmed','functional_return_confirmed','control_vault_entry_ref')) then raise exception 'day033_boaz_unknown_field'; end if;
 if jsonb_typeof(v_b->'duration_seconds') is distinct from 'number' or (v_b->>'duration_seconds')::numeric is distinct from 900::numeric then raise exception 'day033_control_duration_900_required'; end if;
 if v_b->'same_posture_environment_duration_confirmed' is distinct from 'true'::jsonb or v_b->'no_elevator_or_esdaile_induction_confirmed' is distinct from 'true'::jsonb or v_b->'small_adjustment_each_minute_permitted_confirmed' is distinct from 'true'::jsonb or v_b->'natural_breathing_confirmed' is distinct from 'true'::jsonb or v_b->'pain_not_suppressed_confirmed' is distinct from 'true'::jsonb or v_b->'growing_discomfort_not_ignored_confirmed' is distinct from 'true'::jsonb or v_b->'hands_feet_head_moved_after_confirmed' is distinct from 'true'::jsonb or v_b->'functional_return_confirmed' is distinct from 'true'::jsonb then raise exception 'day033_control_boundaries_required'; end if;
 foreach k in array array['motor_impulse_count','movement_count','noise_reactivity_count'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day033_control_count_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day033_control_count_invalid'; end if; end loop;
 foreach k in array array['tension_score','comfort_score','sleepiness_score','depth_score','return_clarity_score'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day033_control_score_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day033_control_score_invalid'; end if; end loop;
 r:=v_b->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day033_control_vault_ref_invalid'; end if;

 v_m:=p_evidence->'middle'; if jsonb_typeof(v_m) is distinct from 'object' then raise exception 'day033_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_m) x where x not in ('duration_seconds','psalm_3_5_orientation_confirmed','aleph_cheth_aleph_once_confirmed','natural_breathing_confirmed','orientation_preserved_confirmed','movement_available_at_will_confirmed','pain_not_suppressed_confirmed','growing_discomfort_not_ignored_confirmed','motor_impulse_count','movement_count','noise_reactivity_count','depth_score','tension_score','comfort_score','silence_score','return_clarity_score','count_one_to_five_return_confirmed','fingers_hands_feet_head_moved_after_confirmed','eyes_opened_after_confirmed','functional_capacity_intact_confirmed','middle_vault_entry_ref')) then raise exception 'day033_middle_unknown_field'; end if;
 if jsonb_typeof(v_m->'duration_seconds') is distinct from 'number' then raise exception 'day033_middle_duration_invalid'; end if; n:=(v_m->>'duration_seconds')::numeric; if n<>trunc(n) or n<1 or n>1200 then raise exception 'day033_middle_duration_invalid'; end if;
 if v_m->'psalm_3_5_orientation_confirmed' is distinct from 'true'::jsonb or v_m->'aleph_cheth_aleph_once_confirmed' is distinct from 'true'::jsonb or v_m->'natural_breathing_confirmed' is distinct from 'true'::jsonb or v_m->'orientation_preserved_confirmed' is distinct from 'true'::jsonb or v_m->'movement_available_at_will_confirmed' is distinct from 'true'::jsonb or v_m->'pain_not_suppressed_confirmed' is distinct from 'true'::jsonb or v_m->'growing_discomfort_not_ignored_confirmed' is distinct from 'true'::jsonb or v_m->'count_one_to_five_return_confirmed' is distinct from 'true'::jsonb or v_m->'fingers_hands_feet_head_moved_after_confirmed' is distinct from 'true'::jsonb or v_m->'eyes_opened_after_confirmed' is distinct from 'true'::jsonb or v_m->'functional_capacity_intact_confirmed' is distinct from 'true'::jsonb then raise exception 'day033_middle_boundaries_required'; end if;
 foreach k in array array['motor_impulse_count','movement_count','noise_reactivity_count'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day033_middle_count_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day033_middle_count_invalid'; end if; end loop;
 foreach k in array array['depth_score','tension_score','comfort_score','silence_score','return_clarity_score'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day033_middle_score_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day033_middle_score_invalid'; end if; end loop;
 r:=v_m->>'middle_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day033_middle_vault_ref_invalid'; end if;

 v_s:=p_evidence->'soul_mirror'; if jsonb_typeof(v_s) is distinct from 'object' then raise exception 'day033_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_s) x where x not in ('completed','comparison_vault_entry_ref')) then raise exception 'day033_soul_mirror_unknown_field'; end if;
 if v_s->'completed' is distinct from 'true'::jsonb then raise exception 'day033_soul_mirror_required'; end if;
 r:=v_s->>'comparison_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day033_soul_vault_ref_invalid'; end if;
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D033-COMP-V1','HNK-KETHER-D033-V1',33,'97c1562b8b285b8b5d9ead934c3702844c7bd837','1.0.0','day033_v1','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
