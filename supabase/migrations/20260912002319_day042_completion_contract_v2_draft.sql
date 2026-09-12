create or replace function hnk_private.validate_day042_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare j jsonb; b jsonb; m jsonb; soul jsonb; r text; k text; stopped boolean; reason text; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day042_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','final_protocol_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day042_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D042-V2' then raise exception 'day042_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'b7f4da850f8c724cf48e980bd30882283efbb822' then raise exception 'day042_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day042_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day042_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day042_v2_voluntary_completion_required'; end if;
 if p_evidence->'final_protocol_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day042_v2_final_safety_clear_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day042_v2_safety_stop_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean; reason:=p_evidence->>'safety_stop_reason';
 if reason not in ('NONE','EYE_PAIN','IMPORTANT_HEADACHE','DIZZINESS','PERSISTENT_NUMBNESS','VISUAL_CHANGE','OTHER_DISCOMFORT') then raise exception 'day042_v2_safety_reason_invalid'; end if;
 if stopped and reason='NONE' then raise exception 'day042_v2_safety_reason_required'; end if;
 if not stopped and reason<>'NONE' then raise exception 'day042_v2_safety_reason_without_stop'; end if;
 j:=p_evidence->'jachin'; if jsonb_typeof(j) is distinct from 'object' then raise exception 'day042_v2_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(j) x where x not in ('massage_seconds','residual_seconds','hands_washed_confirmed','comfortable_posture_confirmed','very_light_circular_contact_confirmed','eye_orbit_pressure_absent_confirmed','forceful_forehead_pressure_absent_confirmed','hands_removed_before_residual_confirmed','eyes_closed_without_squeezing_confirmed','frontal_sensation_present','latency_seconds','intensity','comfort','ocular_tension','internal_image_present','contact_experience_image_interpretation_separated_confirmed','cortical_activation_not_claimed_confirmed','energetic_opening_not_claimed_confirmed','vault_entry_ref')) then raise exception 'day042_v2_jachin_unknown_field'; end if;
 if j->'massage_seconds' is distinct from '180'::jsonb then raise exception 'day042_v2_massage_180_required'; end if;
 if j->'residual_seconds' is distinct from '300'::jsonb then raise exception 'day042_v2_residual_300_required'; end if;
 if jsonb_typeof(j->'frontal_sensation_present') is distinct from 'boolean' or jsonb_typeof(j->'internal_image_present') is distinct from 'boolean' then raise exception 'day042_v2_jachin_presence_flag_invalid'; end if;
 foreach k in array array['latency_seconds','intensity','comfort','ocular_tension'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(j->k),false) then raise exception 'day042_v2_jachin_scalar_invalid:%',k; end if; end loop;
 if (j->>'latency_seconds')::int>300 or (j->>'intensity')::int>10 or (j->>'comfort')::int>10 or (j->>'ocular_tension')::int>10 then raise exception 'day042_v2_jachin_scalar_invalid'; end if;
 if j->'hands_washed_confirmed' is distinct from 'true'::jsonb or j->'comfortable_posture_confirmed' is distinct from 'true'::jsonb or j->'very_light_circular_contact_confirmed' is distinct from 'true'::jsonb or j->'eye_orbit_pressure_absent_confirmed' is distinct from 'true'::jsonb or j->'forceful_forehead_pressure_absent_confirmed' is distinct from 'true'::jsonb or j->'hands_removed_before_residual_confirmed' is distinct from 'true'::jsonb or j->'eyes_closed_without_squeezing_confirmed' is distinct from 'true'::jsonb or j->'contact_experience_image_interpretation_separated_confirmed' is distinct from 'true'::jsonb or j->'cortical_activation_not_claimed_confirmed' is distinct from 'true'::jsonb or j->'energetic_opening_not_claimed_confirmed' is distinct from 'true'::jsonb then raise exception 'day042_v2_jachin_boundaries_required'; end if;
 r:=j->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day042_v2_jachin_vault_ref_invalid'; end if;
 b:=p_evidence->'boaz'; if jsonb_typeof(b) is distinct from 'object' then raise exception 'day042_v2_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(b) x where x not in ('control_seconds','neutral_point','forehead_massage_absent_confirmed','haziel_formula_absent_confirmed','same_or_comparable_posture_confirmed','control_sensation_present','latency_seconds','intensity','attention_stability','attention_effort','expectation','discomfort','preselected_winner_absent_confirmed','alternative_explanations_recorded_confirmed','brodmann_10_conclusion_avoided_confirmed','grounding_if_discomfort_confirmed','vault_entry_ref')) then raise exception 'day042_v2_boaz_unknown_field'; end if;
 if b->'control_seconds' is distinct from '300'::jsonb then raise exception 'day042_v2_control_300_required'; end if;
 if b->>'neutral_point' is distinct from 'TIP_OF_NOSE' then raise exception 'day042_v2_neutral_point_invalid'; end if;
 if jsonb_typeof(b->'control_sensation_present') is distinct from 'boolean' then raise exception 'day042_v2_control_presence_flag_invalid'; end if;
 foreach k in array array['latency_seconds','intensity','attention_stability','attention_effort','expectation','discomfort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->k),false) then raise exception 'day042_v2_boaz_scalar_invalid:%',k; end if; end loop;
 if (b->>'latency_seconds')::int>300 or (b->>'intensity')::int>10 or (b->>'attention_stability')::int>10 or (b->>'attention_effort')::int>10 or (b->>'expectation')::int>10 or (b->>'discomfort')::int>10 then raise exception 'day042_v2_boaz_scalar_invalid'; end if;
 if b->'forehead_massage_absent_confirmed' is distinct from 'true'::jsonb or b->'haziel_formula_absent_confirmed' is distinct from 'true'::jsonb or b->'same_or_comparable_posture_confirmed' is distinct from 'true'::jsonb or b->'preselected_winner_absent_confirmed' is distinct from 'true'::jsonb or b->'alternative_explanations_recorded_confirmed' is distinct from 'true'::jsonb or b->'brodmann_10_conclusion_avoided_confirmed' is distinct from 'true'::jsonb or b->'grounding_if_discomfort_confirmed' is distinct from 'true'::jsonb then raise exception 'day042_v2_boaz_boundaries_required'; end if;
 r:=b->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day042_v2_boaz_vault_ref_invalid'; end if;
 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day042_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('integration_seconds','psalm_25_6_confirmed','he_zayin_yod_confirmed','light_massage_protocol_confirmed','hands_removed_confirmed','natural_breathing_confirmed','forehead_pressure_absent_confirmed','frowning_absent_confirmed','eye_effort_absent_confirmed','qualities_before_interpretation_confirmed','eyes_opened_confirmed','three_real_objects_named_confirmed','thanks_to_god_confirmed','four_field_record_completed','unknown_preserved_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day042_v2_middle_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(m->'integration_seconds'),false) or (m->>'integration_seconds')::int<1 or (m->>'integration_seconds')::int>7200 then raise exception 'day042_v2_middle_duration_invalid'; end if;
 if m->'psalm_25_6_confirmed' is distinct from 'true'::jsonb or m->'he_zayin_yod_confirmed' is distinct from 'true'::jsonb or m->'light_massage_protocol_confirmed' is distinct from 'true'::jsonb or m->'hands_removed_confirmed' is distinct from 'true'::jsonb or m->'natural_breathing_confirmed' is distinct from 'true'::jsonb or m->'forehead_pressure_absent_confirmed' is distinct from 'true'::jsonb or m->'frowning_absent_confirmed' is distinct from 'true'::jsonb or m->'eye_effort_absent_confirmed' is distinct from 'true'::jsonb or m->'qualities_before_interpretation_confirmed' is distinct from 'true'::jsonb or m->'eyes_opened_confirmed' is distinct from 'true'::jsonb or m->'three_real_objects_named_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'four_field_record_completed' is distinct from 'true'::jsonb or m->'unknown_preserved_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb then raise exception 'day042_v2_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day042_v2_middle_vault_ref_invalid'; end if;
 soul:=p_evidence->'soul_mirror'; if jsonb_typeof(soul) is distinct from 'object' or soul->'completed' is distinct from 'true'::jsonb then raise exception 'day042_v2_soul_required'; end if;
 if exists(select 1 from jsonb_object_keys(soul) x where x not in ('completed','vault_entry_ref')) then raise exception 'day042_v2_soul_unknown_field'; end if;
 r:=soul->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day042_v2_soul_vault_ref_invalid'; end if;
 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','massage_completed',true,'residual_completed',true,'control_completed',true,'comparison_completed',true,'interpretation_separated',j->'contact_experience_image_interpretation_separated_confirmed','safety_clear',p_evidence->'final_protocol_safety_clear_confirmed','frontal_sensation_present',j->'frontal_sensation_present','control_sensation_present',b->'control_sensation_present','massage_seconds',180,'residual_seconds',300,'control_seconds',300);
 perform hnk_private.validate_day042_scalar_evidence_v1(legacy);
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
   perform hnk_private.validate_day043_scalar_evidence_v1(new.evidence);
 else
   if v_source_sha is distinct from '94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9' then raise exception 'day044_canonical_source_sha_mismatch'; end if;
   perform hnk_private.validate_day044_scalar_evidence_v1(new.evidence);
 end if;
 return new;
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
  when 'day036_v1' then perform hnk_private.validate_day036_completion_v1(p_evidence,p_expected_source_sha);
  when 'day037_v1' then perform hnk_private.validate_day037_completion_v1(p_evidence,p_expected_source_sha);
  when 'day038_v1' then perform hnk_private.validate_day038_completion_v1(p_evidence,p_expected_source_sha);
  when 'day039_v1' then perform hnk_private.validate_day039_completion_v1(p_evidence,p_expected_source_sha);
  when 'day040_v2' then perform hnk_private.validate_day040_completion_v2(p_evidence,p_expected_source_sha);
  when 'day041_v2' then perform hnk_private.validate_day041_completion_v2(p_evidence,p_expected_source_sha);
  when 'day042_v2' then perform hnk_private.validate_day042_completion_v2(p_evidence,p_expected_source_sha);
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D042-COMP-V2','HNK-CHOKMAH-D042-V2',42,'b7f4da850f8c724cf48e980bd30882283efbb822','2.0.0','day042_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
