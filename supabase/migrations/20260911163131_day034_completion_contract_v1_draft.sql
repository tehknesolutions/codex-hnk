create or replace function hnk_private.validate_day034_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; k text; v_j jsonb; v_b jsonb; v_m jsonb; v_s jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day034_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day034_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D034-V1' then raise exception 'day034_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '6d8fb4dc7923691a38677881db902efc47c37ac2' then raise exception 'day034_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day034_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day034_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day034_voluntary_completion_required'; end if;
 if not(p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day034_safety_stop_invalid'; end if;

 v_j:=p_evidence->'jachin'; if jsonb_typeof(v_j) is distinct from 'object' then raise exception 'day034_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_j) x where x not in ('stable_comfortable_oriented_esdaile_confirmed','three_breaths_observed_confirmed','phrase_exact_confirmed','gesture_repetitions','gesture_seconds_each','silence_seconds_each','gesture_force_not_increased_confirmed','initial_depth_score','state_intensity_score','gesture_pressure_score','silence_score','presence_score','comfort_score','clarity_score','cancel_voluntarily_confirmed','jachin_vault_entry_ref')) then raise exception 'day034_jachin_unknown_field'; end if;
 if v_j->'stable_comfortable_oriented_esdaile_confirmed' is distinct from 'true'::jsonb or v_j->'three_breaths_observed_confirmed' is distinct from 'true'::jsonb or v_j->'phrase_exact_confirmed' is distinct from 'true'::jsonb or v_j->'gesture_force_not_increased_confirmed' is distinct from 'true'::jsonb or v_j->'cancel_voluntarily_confirmed' is distinct from 'true'::jsonb then raise exception 'day034_jachin_boundaries_required'; end if;
 if (v_j->>'gesture_repetitions')::numeric is distinct from 3 or (v_j->>'gesture_seconds_each')::numeric is distinct from 5 or (v_j->>'silence_seconds_each')::numeric is distinct from 60 then raise exception 'day034_jachin_timing_required'; end if;
 foreach k in array array['initial_depth_score','state_intensity_score','gesture_pressure_score','silence_score','presence_score','comfort_score','clarity_score'] loop if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day034_jachin_score_invalid'; end if; n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day034_jachin_score_invalid'; end if; end loop;
 r:=v_j->>'jachin_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day034_jachin_vault_ref_invalid'; end if;

 v_b:=p_evidence->'boaz'; if jsonb_typeof(v_b) is distinct from 'object' then raise exception 'day034_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_b) x where x not in ('count_one_to_five_return_confirmed','body_moved_confirmed','awake_interval_seconds','control_gesture_seconds','control_phrase_absent_confirmed','control_evocation_intention_absent_confirmed','control_silence_score','control_presence_score','control_relaxation_score','control_depth_score','inter_condition_wait_seconds','anchor_gesture_seconds','anchor_phrase_absent_confirmed','anchor_pre_trance_absent_confirmed','anchor_silence_score','anchor_presence_score','anchor_relaxation_score','anchor_depth_score','evocation_latency_seconds','expectation_competitor_recorded_confirmed','deep_breath_cancel_confirmed','hands_opened_cancel_confirmed','response_cancelled_voluntarily_confirmed','boaz_vault_entry_ref')) then raise exception 'day034_boaz_unknown_field'; end if;
 if v_b->'count_one_to_five_return_confirmed' is distinct from 'true'::jsonb or v_b->'body_moved_confirmed' is distinct from 'true'::jsonb or v_b->'control_phrase_absent_confirmed' is distinct from 'true'::jsonb or v_b->'control_evocation_intention_absent_confirmed' is distinct from 'true'::jsonb or v_b->'anchor_phrase_absent_confirmed' is distinct from 'true'::jsonb or v_b->'anchor_pre_trance_absent_confirmed' is distinct from 'true'::jsonb or v_b->'expectation_competitor_recorded_confirmed' is distinct from 'true'::jsonb or v_b->'deep_breath_cancel_confirmed' is distinct from 'true'::jsonb or v_b->'hands_opened_cancel_confirmed' is distinct from 'true'::jsonb or v_b->'response_cancelled_voluntarily_confirmed' is distinct from 'true'::jsonb then raise exception 'day034_boaz_boundaries_required'; end if;
 if (v_b->>'awake_interval_seconds')::numeric is distinct from 300 or (v_b->>'control_gesture_seconds')::numeric is distinct from 5 or (v_b->>'inter_condition_wait_seconds')::numeric is distinct from 60 or (v_b->>'anchor_gesture_seconds')::numeric is distinct from 5 then raise exception 'day034_boaz_timing_required'; end if;
 foreach k in array array['control_silence_score','control_presence_score','control_relaxation_score','control_depth_score','anchor_silence_score','anchor_presence_score','anchor_relaxation_score','anchor_depth_score'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day034_boaz_score_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day034_boaz_score_invalid'; end if; end loop;
 if jsonb_typeof(v_b->'evocation_latency_seconds') is distinct from 'number' then raise exception 'day034_boaz_latency_invalid'; end if; n:=(v_b->>'evocation_latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>300 then raise exception 'day034_boaz_latency_invalid'; end if;
 r:=v_b->>'boaz_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day034_boaz_vault_ref_invalid'; end if;

 v_m:=p_evidence->'middle'; if jsonb_typeof(v_m) is distinct from 'object' then raise exception 'day034_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_m) x where x not in ('psalm_3_5_orientation_confirmed','aleph_cheth_aleph_once_confirmed','stable_esdaile_confirmed','phrase_exact_confirmed','gesture_repetitions','gesture_seconds_each','silence_seconds_each','count_one_to_five_return_confirmed','awake_test_interval_seconds','gesture_only_test_confirmed','silence_score','presence_score','stability_score','evocation_latency_seconds','hands_opened_cancel_confirmed','deep_breath_cancel_confirmed','response_cancelled_voluntarily_confirmed','consciousness_responsibility_discernment_preserved_confirmed','durability_is_hypothesis_not_guarantee_confirmed','middle_vault_entry_ref')) then raise exception 'day034_middle_unknown_field'; end if;
 if v_m->'psalm_3_5_orientation_confirmed' is distinct from 'true'::jsonb or v_m->'aleph_cheth_aleph_once_confirmed' is distinct from 'true'::jsonb or v_m->'stable_esdaile_confirmed' is distinct from 'true'::jsonb or v_m->'phrase_exact_confirmed' is distinct from 'true'::jsonb or v_m->'count_one_to_five_return_confirmed' is distinct from 'true'::jsonb or v_m->'gesture_only_test_confirmed' is distinct from 'true'::jsonb or v_m->'hands_opened_cancel_confirmed' is distinct from 'true'::jsonb or v_m->'deep_breath_cancel_confirmed' is distinct from 'true'::jsonb or v_m->'response_cancelled_voluntarily_confirmed' is distinct from 'true'::jsonb or v_m->'consciousness_responsibility_discernment_preserved_confirmed' is distinct from 'true'::jsonb or v_m->'durability_is_hypothesis_not_guarantee_confirmed' is distinct from 'true'::jsonb then raise exception 'day034_middle_boundaries_required'; end if;
 if (v_m->>'gesture_repetitions')::numeric is distinct from 3 or (v_m->>'gesture_seconds_each')::numeric is distinct from 5 or (v_m->>'silence_seconds_each')::numeric is distinct from 60 or (v_m->>'awake_test_interval_seconds')::numeric is distinct from 300 then raise exception 'day034_middle_timing_required'; end if;
 foreach k in array array['silence_score','presence_score','stability_score'] loop if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day034_middle_score_invalid'; end if; n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day034_middle_score_invalid'; end if; end loop;
 if jsonb_typeof(v_m->'evocation_latency_seconds') is distinct from 'number' then raise exception 'day034_middle_latency_invalid'; end if; n:=(v_m->>'evocation_latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>300 then raise exception 'day034_middle_latency_invalid'; end if;
 r:=v_m->>'middle_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day034_middle_vault_ref_invalid'; end if;

 v_s:=p_evidence->'soul_mirror'; if jsonb_typeof(v_s) is distinct from 'object' then raise exception 'day034_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_s) x where x not in ('completed','comparison_vault_entry_ref')) then raise exception 'day034_soul_unknown_field'; end if;
 if v_s->'completed' is distinct from 'true'::jsonb then raise exception 'day034_soul_mirror_required'; end if;
 r:=v_s->>'comparison_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day034_soul_vault_ref_invalid'; end if;
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D034-COMP-V1','HNK-KETHER-D034-V1',34,'6d8fb4dc7923691a38677881db902efc47c37ac2','1.0.0','day034_v1','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();