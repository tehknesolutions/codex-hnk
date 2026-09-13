-- LIVE MIGRATION RECONCILIATION
-- version: 20260913223215
-- name: day063_completion_contract_v2_draft
-- This file mirrors the migration applied live. The first attempted draft failed before history insert because the registry table has no metadata column; see Issue #86.

create or replace function hnk_private.validate_day063_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare v_key text; v_legacy jsonb;
begin
 if p_evidence is null or jsonb_typeof(p_evidence)<>'object' then raise exception 'day063_v2_evidence_required';end if;
 for v_key in select jsonb_object_keys(p_evidence) loop
  if v_key <> all(array['protocol_version','source_sha','session_id','mode','preregistration','caricature','neutral_reframe','comparison','middle','private_vault_entry_ref','private_vault_e2ee_confirmed','practice_record_no_criticism_free_text_confirmed','external_or_involuntary_persistent_voice_detected','external_voice_not_reinforced_confirmed','psychological_care_not_replaced_confirmed','safety_alerts_not_silenced_confirmed','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason']) then raise exception 'day063_v2_unknown_top_level_field:%',v_key;end if;
 end loop;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D063-V2' then raise exception 'day063_v2_protocol_mismatch';end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'b9c9872ddf618aff3f515f601b3abfd611dace46' then raise exception 'day063_v2_source_sha_mismatch';end if;
 if not coalesce(hnk_private.jsonb_is_uuid(p_evidence->'session_id'),false) then raise exception 'day063_v2_session_id_invalid';end if;
 if p_evidence->>'mode' is distinct from 'first_completion' then raise exception 'day063_v2_mode_invalid';end if;
 if jsonb_typeof(p_evidence->'preregistration') is distinct from 'object' then raise exception 'day063_v2_preregistration_required';end if;
 if (select array_agg(k order by k) from jsonb_object_keys(p_evidence->'preregistration') k) is distinct from array['credibility_before','criticism_preregistered_confirmed','intensity_before']::text[] then raise exception 'day063_v2_preregistration_shape_invalid';end if;
 if p_evidence->'preregistration'->'criticism_preregistered_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_criticism_preregistration_required';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'preregistration'->'intensity_before'),false) or (p_evidence->'preregistration'->>'intensity_before')::int>10 then raise exception 'day063_v2_intensity_before_invalid';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'preregistration'->'credibility_before'),false) or (p_evidence->'preregistration'->>'credibility_before')::int>10 then raise exception 'day063_v2_credibility_before_invalid';end if;
 if jsonb_typeof(p_evidence->'caricature') is distinct from 'object' then raise exception 'day063_v2_caricature_required';end if;
 if (select array_agg(k order by k) from jsonb_object_keys(p_evidence->'caricature') k) is distinct from array['completed_confirmed','credibility_after','faster_pace_confirmed','intensity_after','left_foot_location_confirmed','no_self_insult_added_confirmed','repeated_once_confirmed','returned_to_silence_confirmed','timbre_caricature_confirmed']::text[] then raise exception 'day063_v2_caricature_shape_invalid';end if;
 if p_evidence->'caricature'->'completed_confirmed' is distinct from 'true'::jsonb or p_evidence->'caricature'->'timbre_caricature_confirmed' is distinct from 'true'::jsonb or p_evidence->'caricature'->'faster_pace_confirmed' is distinct from 'true'::jsonb or p_evidence->'caricature'->'left_foot_location_confirmed' is distinct from 'true'::jsonb or p_evidence->'caricature'->'repeated_once_confirmed' is distinct from 'true'::jsonb or p_evidence->'caricature'->'no_self_insult_added_confirmed' is distinct from 'true'::jsonb or p_evidence->'caricature'->'returned_to_silence_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_caricature_boundary_missing';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'caricature'->'intensity_after'),false) or (p_evidence->'caricature'->>'intensity_after')::int>10 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'caricature'->'credibility_after'),false) or (p_evidence->'caricature'->>'credibility_after')::int>10 then raise exception 'day063_v2_caricature_rating_invalid';end if;
 if jsonb_typeof(p_evidence->'neutral_reframe') is distinct from 'object' then raise exception 'day063_v2_neutral_reframe_required';end if;
 if (select array_agg(k order by k) from jsonb_object_keys(p_evidence->'neutral_reframe') k) is distinct from array['action_component_reviewed_confirmed','action_needed','clarity','completed_confirmed','fact_component_confirmed','intensity','judgment_component_confirmed','neutral_internal_voice_confirmed','small_verifiable_action_or_none_confirmed','utility']::text[] then raise exception 'day063_v2_neutral_reframe_shape_invalid';end if;
 if p_evidence->'neutral_reframe'->'completed_confirmed' is distinct from 'true'::jsonb or p_evidence->'neutral_reframe'->'fact_component_confirmed' is distinct from 'true'::jsonb or p_evidence->'neutral_reframe'->'judgment_component_confirmed' is distinct from 'true'::jsonb or p_evidence->'neutral_reframe'->'action_component_reviewed_confirmed' is distinct from 'true'::jsonb or p_evidence->'neutral_reframe'->'neutral_internal_voice_confirmed' is distinct from 'true'::jsonb or p_evidence->'neutral_reframe'->'small_verifiable_action_or_none_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_neutral_reframe_boundary_missing';end if;
 if jsonb_typeof(p_evidence->'neutral_reframe'->'action_needed') is distinct from 'boolean' then raise exception 'day063_v2_action_needed_invalid';end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'neutral_reframe'->'intensity'),false) or (p_evidence->'neutral_reframe'->>'intensity')::int>10 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'neutral_reframe'->'clarity'),false) or (p_evidence->'neutral_reframe'->>'clarity')::int>10 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'neutral_reframe'->'utility'),false) or (p_evidence->'neutral_reframe'->>'utility')::int>10 then raise exception 'day063_v2_neutral_rating_invalid';end if;
 if jsonb_typeof(p_evidence->'comparison') is distinct from 'object' then raise exception 'day063_v2_comparison_required';end if;
 if (select array_agg(k order by k) from jsonb_object_keys(p_evidence->'comparison') k) is distinct from array['caricature_and_neutral_compared_confirmed','completed_confirmed','content_reality_not_suppressed_confirmed','immediate_relief_not_only_criterion_confirmed','legitimate_alerts_preserved_confirmed','responsible_response_prioritized_confirmed']::text[] then raise exception 'day063_v2_comparison_shape_invalid';end if;
 if p_evidence->'comparison'->'completed_confirmed' is distinct from 'true'::jsonb or p_evidence->'comparison'->'caricature_and_neutral_compared_confirmed' is distinct from 'true'::jsonb or p_evidence->'comparison'->'immediate_relief_not_only_criterion_confirmed' is distinct from 'true'::jsonb or p_evidence->'comparison'->'responsible_response_prioritized_confirmed' is distinct from 'true'::jsonb or p_evidence->'comparison'->'content_reality_not_suppressed_confirmed' is distinct from 'true'::jsonb or p_evidence->'comparison'->'legitimate_alerts_preserved_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_comparison_boundary_missing';end if;
 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day063_v2_middle_required';end if;
 if (select array_agg(k order by k) from jsonb_object_keys(p_evidence->'middle') k) is distinct from array['criticism_recalled_without_caricature_confirmed','error_repair_or_distortion_released_confirmed','fact_only_named_count','not_reduced_to_internal_phrase_confirmed','orientation_autonomy_action_possible_confirmed','proportional_response_selected_confirmed','psalm_98_4_confirmed','thanks_to_god_confirmed','yod_zayin_lamed_confirmed']::text[] then raise exception 'day063_v2_middle_shape_invalid';end if;
 if p_evidence->'middle'->'psalm_98_4_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'yod_zayin_lamed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'criticism_recalled_without_caricature_confirmed' is distinct from 'true'::jsonb or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'middle'->'fact_only_named_count'),false) or (p_evidence->'middle'->>'fact_only_named_count')::int<>1 or p_evidence->'middle'->'proportional_response_selected_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'error_repair_or_distortion_released_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'not_reduced_to_internal_phrase_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'orientation_autonomy_action_possible_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_middle_incomplete';end if;
 if not coalesce(hnk_private.jsonb_is_uuid(p_evidence->'private_vault_entry_ref'),false) or p_evidence->'private_vault_e2ee_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_vault_required';end if;
 if p_evidence->'practice_record_no_criticism_free_text_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_privacy_boundary_missing';end if;
 if p_evidence->'external_or_involuntary_persistent_voice_detected' is distinct from 'false'::jsonb then raise exception 'day063_v2_persistent_external_voice_requires_stop';end if;
 if p_evidence->'external_voice_not_reinforced_confirmed' is distinct from 'true'::jsonb or p_evidence->'psychological_care_not_replaced_confirmed' is distinct from 'true'::jsonb or p_evidence->'safety_alerts_not_silenced_confirmed' is distinct from 'true'::jsonb then raise exception 'day063_v2_safety_boundary_missing';end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb or p_evidence->'safety_stop_occurred' is distinct from 'false'::jsonb or p_evidence->>'safety_stop_reason' is distinct from 'NONE' then raise exception 'day063_v2_completion_safety_invalid';end if;
 v_legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',true,'criticism_preregistered',true,'caricature_completed',true,'neutral_reframe_completed',true,'comparison_completed',true,'action_reviewed',true,'external_voice_not_reinforced',true,'self_insult_not_added',true,'vault_saved',true,'safety_clear',true,'action_needed',p_evidence->'neutral_reframe'->'action_needed');
 perform hnk_private.validate_day063_scalar_evidence_v1(v_legacy);
end$$;

create or replace function hnk_private.enforce_iezalel_062_066_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean;v_source_sha text;v_status text;
begin
 if new.day not in (62,63,64,65,66) or new.state not in ('evidence_pending','complete') then return new;end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;if v_existing then return new;end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;if v_status is distinct from 'canon' then raise exception 'iezalel_canonical_day_not_available';end if;
 if new.day=62 then if v_source_sha is distinct from '56a8aaafbd2d602324ecfb9c06da39563fefaaf6' then raise exception 'day062_canonical_source_sha_mismatch';end if;if new.evidence->>'protocol_version'='HNK-CHOKMAH-D062-V2' then perform hnk_private.validate_day062_completion_v2(new.evidence,v_source_sha);else perform hnk_private.validate_day062_scalar_evidence_v1(new.evidence);end if;
 elsif new.day=63 then if v_source_sha is distinct from 'b9c9872ddf618aff3f515f601b3abfd611dace46' then raise exception 'day063_canonical_source_sha_mismatch';end if;if new.evidence->>'protocol_version'='HNK-CHOKMAH-D063-V2' then perform hnk_private.validate_day063_completion_v2(new.evidence,v_source_sha);else perform hnk_private.validate_day063_scalar_evidence_v1(new.evidence);end if;
 elsif new.day=64 then if v_source_sha is distinct from 'fb05d22be494099a5a1d3e1e0f5480ecc6c072cb' then raise exception 'day064_canonical_source_sha_mismatch';end if;perform hnk_private.validate_day064_scalar_evidence_v1(new.evidence);
 elsif new.day=65 then if v_source_sha is distinct from '8d8cd2a39fb05be283b8326fa258ed547b40f442' then raise exception 'day065_canonical_source_sha_mismatch';end if;perform hnk_private.validate_day065_scalar_evidence_v1(new.evidence);
 else if v_source_sha is distinct from 'a6d48785ee355f734cadda61b0bb3810b125bf5e' then raise exception 'day066_canonical_source_sha_mismatch';end if;perform hnk_private.validate_day066_scalar_evidence_v1(new.evidence);end if;
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
  when 'day043_v2' then perform hnk_private.validate_day043_completion_v2(p_evidence,p_expected_source_sha);
  when 'day044_v2' then perform hnk_private.validate_day044_completion_v2(p_evidence,p_expected_source_sha);
  when 'day045_v2' then perform hnk_private.validate_day045_completion_v2(p_evidence,p_expected_source_sha);
  when 'day046_v2' then perform hnk_private.validate_day046_completion_v2(p_evidence,p_expected_source_sha);
  when 'day047_v2' then perform hnk_private.validate_day047_completion_v2(p_evidence,p_expected_source_sha);
  when 'day048_v2' then perform hnk_private.validate_day048_completion_v2(p_evidence,p_expected_source_sha);
  when 'day049_v2' then perform hnk_private.validate_day049_completion_v2(p_evidence,p_expected_source_sha);
  when 'day050_v2' then perform hnk_private.validate_day050_completion_v2(p_evidence,p_expected_source_sha);
  when 'day051_v2' then perform hnk_private.validate_day051_completion_v2(p_evidence,p_expected_source_sha);
  when 'day052_v2' then perform hnk_private.validate_day052_completion_v2(p_evidence,p_expected_source_sha);
  when 'day053_v2' then perform hnk_private.validate_day053_completion_v2(p_evidence,p_expected_source_sha);
  when 'day054_v2' then perform hnk_private.validate_day054_completion_v2(p_evidence,p_expected_source_sha);
  when 'day055_v2' then perform hnk_private.validate_day055_completion_v2(p_evidence,p_expected_source_sha);
  when 'day056_v2' then perform hnk_private.validate_day056_completion_v2(p_evidence,p_expected_source_sha);
  when 'day057_v2' then perform hnk_private.validate_day057_completion_v2(p_evidence,p_expected_source_sha);
  when 'day058_v2' then perform hnk_private.validate_day058_completion_v2(p_evidence,p_expected_source_sha);
  when 'day059_v2' then perform hnk_private.validate_day059_completion_v2(p_evidence,p_expected_source_sha);
  when 'day060_v2' then perform hnk_private.validate_day060_completion_v2(p_evidence,p_expected_source_sha);
  when 'day061_v2' then perform hnk_private.validate_day061_completion_v2(p_evidence,p_expected_source_sha);
  when 'day062_v2' then perform hnk_private.validate_day062_completion_v2(p_evidence,p_expected_source_sha);
  when 'day063_v2' then perform hnk_private.validate_day063_completion_v2(p_evidence,p_expected_source_sha);
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D063-COMP-V2','HNK-CHOKMAH-D063-V2',63,'b9c9872ddf618aff3f515f601b3abfd611dace46','2.0.0','day063_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
