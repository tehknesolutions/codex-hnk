create or replace function hnk_private.validate_day038_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare j jsonb; b jsonb; m jsonb; s jsonb; k text; r text; li int; ai int; ri int;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day038_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day038_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D038-V1' then raise exception 'day038_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'db42ffb5a78fb9f3d816c2921b02b227bb7c7652' then raise exception 'day038_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day038_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day038_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day038_voluntary_completion_required'; end if;
 if not(p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day038_safety_stop_invalid'; end if;

 j:=p_evidence->'jachin'; if jsonb_typeof(j) is distinct from 'object' then raise exception 'day038_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(j) x where x not in ('observation_seconds','thoughts_accompanied_count','pacing_statement_count','leading_count','accepted_leading_count','rejected_leading_count','three_acknowledgements_before_leading_confirmed','leading_permissive_confirmed','suggestion_rejectable_confirmed','thought_not_fact_confirmed','pacing_not_agreement_confirmed','tension_initial','tension_final','mental_rhythm_initial','mental_rhythm_final','breathing_change_recorded_confirmed','distraction_count','attention_return_count','subjective_depth','vault_entry_ref')) then raise exception 'day038_jachin_unknown_field'; end if;
 if j->'observation_seconds' is distinct from '360'::jsonb then raise exception 'day038_jachin_360_required'; end if;
 if j->'thoughts_accompanied_count' is distinct from '10'::jsonb then raise exception 'day038_ten_thoughts_required'; end if;
 foreach k in array array['pacing_statement_count','leading_count','accepted_leading_count','rejected_leading_count','tension_initial','tension_final','mental_rhythm_initial','mental_rhythm_final','distraction_count','attention_return_count','subjective_depth'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(j->k),false) then raise exception 'day038_jachin_scalar_invalid:%',k; end if; end loop;
 if (j->>'pacing_statement_count')::int<10 then raise exception 'day038_pacing_count_invalid'; end if;
 li:=(j->>'leading_count')::int; ai:=(j->>'accepted_leading_count')::int; ri:=(j->>'rejected_leading_count')::int;
 if li<1 then raise exception 'day038_leading_count_invalid'; end if; if ai+ri<>li then raise exception 'day038_every_leading_must_be_classified'; end if;
 foreach k in array array['tension_initial','tension_final','mental_rhythm_initial','mental_rhythm_final','subjective_depth'] loop if (j->>k)::int>10 then raise exception 'day038_scale_invalid:%',k; end if; end loop;
 if j->'three_acknowledgements_before_leading_confirmed' is distinct from 'true'::jsonb or j->'leading_permissive_confirmed' is distinct from 'true'::jsonb or j->'suggestion_rejectable_confirmed' is distinct from 'true'::jsonb or j->'thought_not_fact_confirmed' is distinct from 'true'::jsonb or j->'pacing_not_agreement_confirmed' is distinct from 'true'::jsonb or j->'breathing_change_recorded_confirmed' is distinct from 'true'::jsonb then raise exception 'day038_jachin_boundaries_required'; end if;
 r:=j->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day038_jachin_vault_ref_invalid'; end if;

 b:=p_evidence->'boaz'; if jsonb_typeof(b) is distinct from 'object' then raise exception 'day038_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(b) x where x not in ('duration_seconds','original_thought_to_description_completed','pacing_statement_count','leading_count','discomfort_stops_leading_confirmed','observation_only_return_supported_confirmed','resistance_recorded_confirmed','tension_recorded_confirmed','body_response_recorded_confirmed','leading_effect','voluntary_interruption_count','change_or_no_change_valid_confirmed','personal_limit_declared_confirmed','vault_entry_ref')) then raise exception 'day038_boaz_unknown_field'; end if;
 if b->'duration_seconds' is distinct from '300'::jsonb then raise exception 'day038_boaz_300_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->'pacing_statement_count'),false) or (b->>'pacing_statement_count')::int<3 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->'leading_count'),false) or (b->>'leading_count')::int<1 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->'voluntary_interruption_count'),false) then raise exception 'day038_boaz_scalar_invalid'; end if;
 if b->>'leading_effect' not in ('INCREASED_RESISTANCE','REDUCED_CONFLICT','NO_PERCEPTIBLE_CHANGE','MIXED') then raise exception 'day038_leading_effect_invalid'; end if;
 if b->'original_thought_to_description_completed' is distinct from 'true'::jsonb or b->'discomfort_stops_leading_confirmed' is distinct from 'true'::jsonb or b->'observation_only_return_supported_confirmed' is distinct from 'true'::jsonb or b->'resistance_recorded_confirmed' is distinct from 'true'::jsonb or b->'tension_recorded_confirmed' is distinct from 'true'::jsonb or b->'body_response_recorded_confirmed' is distinct from 'true'::jsonb or b->'change_or_no_change_valid_confirmed' is distinct from 'true'::jsonb or b->'personal_limit_declared_confirmed' is distinct from 'true'::jsonb then raise exception 'day038_boaz_boundaries_required'; end if;
 r:=b->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day038_boaz_vault_ref_invalid'; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day038_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('thoughts_observed_count','pacing_statement_count','leading_count','leading_target','psalm_11_7_confirmed','kaph_he_tav_confirmed','truthful_pacing_confirmed','two_breath_wordless_pause_confirmed','thanks_to_god_confirmed','conscious_trance_exit_confirmed','given_interpreted_chosen_triplet_completed','voluntary_choice_preserved_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day038_middle_unknown_field'; end if;
 if m->'thoughts_observed_count' is distinct from '3'::jsonb then raise exception 'day038_middle_three_thoughts_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(m->'pacing_statement_count'),false) or (m->>'pacing_statement_count')::int<3 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(m->'leading_count'),false) or (m->>'leading_count')::int<1 then raise exception 'day038_middle_scalar_invalid'; end if;
 if m->>'leading_target' not in ('CALM','FOCUS','PRAYER','MIXED') then raise exception 'day038_middle_target_invalid'; end if;
 if m->'psalm_11_7_confirmed' is distinct from 'true'::jsonb or m->'kaph_he_tav_confirmed' is distinct from 'true'::jsonb or m->'truthful_pacing_confirmed' is distinct from 'true'::jsonb or m->'two_breath_wordless_pause_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'conscious_trance_exit_confirmed' is distinct from 'true'::jsonb or m->'given_interpreted_chosen_triplet_completed' is distinct from 'true'::jsonb or m->'voluntary_choice_preserved_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb then raise exception 'day038_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day038_middle_vault_ref_invalid'; end if;

 s:=p_evidence->'soul_mirror'; if jsonb_typeof(s) is distinct from 'object' or s->'completed' is distinct from 'true'::jsonb then raise exception 'day038_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(s) x where x not in ('completed','vault_entry_ref')) then raise exception 'day038_soul_unknown_field'; end if;
 r:=s->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day038_soul_vault_ref_invalid'; end if;
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D038-COMP-V1','HNK-CHOKMAH-D038-V1',38,'db42ffb5a78fb9f3d816c2921b02b227bb7c7652','1.0.0','day038_v1','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
