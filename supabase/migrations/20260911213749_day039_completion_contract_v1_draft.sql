create or replace function hnk_private.validate_day039_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare j jsonb; b jsonb; m jsonb; s jsonb; k text; r text; stopped boolean; reason text;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day039_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day039_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D039-V1' then raise exception 'day039_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'be610c0d5cee2553e281ac08ef3db6c0d26b5d27' then raise exception 'day039_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day039_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day039_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day039_voluntary_completion_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day039_safety_stop_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean; reason:=p_evidence->>'safety_stop_reason';
 if reason not in ('NONE','PAIN','DIZZINESS','SHORTNESS_OF_BREATH','UNCOMFORTABLE_PALPITATION','RISING_ANXIETY','OTHER_DISCOMFORT') then raise exception 'day039_safety_stop_reason_invalid'; end if;
 if stopped and reason='NONE' then raise exception 'day039_safety_stop_reason_required'; end if;
 if not stopped and reason<>'NONE' then raise exception 'day039_safety_stop_reason_without_stop'; end if;

 j:=p_evidence->'jachin'; if jsonb_typeof(j) is distinct from 'object' then raise exception 'day039_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(j) x where x not in ('duration_seconds','hand_position','comfortable_spine_confirmed','hands_light_or_hovering_confirmed','airway_vessel_compression_absent_confirmed','natural_breathing_confirmed','visualization_on_exhale_confirmed','phenomenon_production_avoided_confirmed','heat_recorded_confirmed','pulsation_recorded_confirmed','vibration_recorded_confirmed','tension_recorded_confirmed','images_recorded_confirmed','breathing_change_recorded_confirmed','sensation_visualization_telepathy_hypothesis_separated_confirmed','discomfort_occurred','vault_entry_ref')) then raise exception 'day039_jachin_unknown_field'; end if;
 if j->'duration_seconds' is distinct from '420'::jsonb then raise exception 'day039_jachin_420_required'; end if;
 if j->>'hand_position' not in ('LIGHT_CONTACT','HOVERING','MIXED') then raise exception 'day039_hand_position_invalid'; end if;
 if j->'comfortable_spine_confirmed' is distinct from 'true'::jsonb or j->'hands_light_or_hovering_confirmed' is distinct from 'true'::jsonb or j->'airway_vessel_compression_absent_confirmed' is distinct from 'true'::jsonb or j->'natural_breathing_confirmed' is distinct from 'true'::jsonb or j->'visualization_on_exhale_confirmed' is distinct from 'true'::jsonb or j->'phenomenon_production_avoided_confirmed' is distinct from 'true'::jsonb or j->'heat_recorded_confirmed' is distinct from 'true'::jsonb or j->'pulsation_recorded_confirmed' is distinct from 'true'::jsonb or j->'vibration_recorded_confirmed' is distinct from 'true'::jsonb or j->'tension_recorded_confirmed' is distinct from 'true'::jsonb or j->'images_recorded_confirmed' is distinct from 'true'::jsonb or j->'breathing_change_recorded_confirmed' is distinct from 'true'::jsonb or j->'sensation_visualization_telepathy_hypothesis_separated_confirmed' is distinct from 'true'::jsonb then raise exception 'day039_jachin_boundaries_required'; end if;
 if jsonb_typeof(j->'discomfort_occurred') is distinct from 'boolean' then raise exception 'day039_jachin_discomfort_invalid'; end if;
 r:=j->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day039_jachin_vault_ref_invalid'; end if;

 b:=p_evidence->'boaz'; if jsonb_typeof(b) is distinct from 'object' then raise exception 'day039_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(b) x where x not in ('neutral_seconds','symbolic_seconds','neutral_without_visualization_confirmed','symbolic_visualization_confirmed','conditions_not_preferred_confirmed','associated_person_content_kept_internal_confirmed','action_on_impression_avoided_confirmed','telepathy_not_confirmed','sensation_image_interpretation_separated_confirmed','expectation_recorded_confirmed','certainty_blocking_criterion_declared_confirmed','neutral_intensity','symbolic_intensity','discomfort_count','vault_entry_ref')) then raise exception 'day039_boaz_unknown_field'; end if;
 if b->'neutral_seconds' is distinct from '180'::jsonb then raise exception 'day039_boaz_neutral_180_required'; end if;
 if b->'symbolic_seconds' is distinct from '240'::jsonb then raise exception 'day039_boaz_symbolic_240_required'; end if;
 if b->'neutral_without_visualization_confirmed' is distinct from 'true'::jsonb or b->'symbolic_visualization_confirmed' is distinct from 'true'::jsonb or b->'conditions_not_preferred_confirmed' is distinct from 'true'::jsonb or b->'associated_person_content_kept_internal_confirmed' is distinct from 'true'::jsonb or b->'action_on_impression_avoided_confirmed' is distinct from 'true'::jsonb or b->'telepathy_not_confirmed' is distinct from 'true'::jsonb or b->'sensation_image_interpretation_separated_confirmed' is distinct from 'true'::jsonb or b->'expectation_recorded_confirmed' is distinct from 'true'::jsonb or b->'certainty_blocking_criterion_declared_confirmed' is distinct from 'true'::jsonb then raise exception 'day039_boaz_boundaries_required'; end if;
 foreach k in array array['neutral_intensity','symbolic_intensity','discomfort_count'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->k),false) then raise exception 'day039_boaz_scalar_invalid:%',k; end if; end loop;
 if (b->>'neutral_intensity')::int>10 or (b->>'symbolic_intensity')::int>10 or (b->>'discomfort_count')::int>9999 then raise exception 'day039_boaz_scalar_invalid'; end if;
 r:=b->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day039_boaz_vault_ref_invalid'; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day039_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_11_7_confirmed','kaph_he_tav_confirmed','three_natural_breaths_confirmed','hands_without_compression_confirmed','visualization_only_on_exhale_confirmed','image_free_intervals_confirmed','four_layer_record_completed','thanks_to_god_confirmed','hands_removed_calmly_confirmed','functional_return_confirmed','telepathy_not_claimed_confirmed','vault_entry_ref')) then raise exception 'day039_middle_unknown_field'; end if;
 if m->'psalm_11_7_confirmed' is distinct from 'true'::jsonb or m->'kaph_he_tav_confirmed' is distinct from 'true'::jsonb or m->'three_natural_breaths_confirmed' is distinct from 'true'::jsonb or m->'hands_without_compression_confirmed' is distinct from 'true'::jsonb or m->'visualization_only_on_exhale_confirmed' is distinct from 'true'::jsonb or m->'image_free_intervals_confirmed' is distinct from 'true'::jsonb or m->'four_layer_record_completed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'hands_removed_calmly_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb or m->'telepathy_not_claimed_confirmed' is distinct from 'true'::jsonb then raise exception 'day039_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day039_middle_vault_ref_invalid'; end if;

 s:=p_evidence->'soul_mirror'; if jsonb_typeof(s) is distinct from 'object' or s->'completed' is distinct from 'true'::jsonb then raise exception 'day039_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(s) x where x not in ('completed','vault_entry_ref')) then raise exception 'day039_soul_unknown_field'; end if;
 r:=s->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day039_soul_vault_ref_invalid'; end if;
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D039-COMP-V1','HNK-CHOKMAH-D039-V1',39,'be610c0d5cee2553e281ac08ef3db6c0d26b5d27','1.0.0','day039_v1','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
