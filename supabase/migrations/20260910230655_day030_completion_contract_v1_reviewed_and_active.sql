-- Mirrors Supabase migration 20260910230655.
-- Day 030 initially froze exact volume equality; the immediately following
-- 20260910231152 migration widens this to the canon-faithful 50 permille tolerance.

create or replace function hnk_private.validate_day030_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare
  r text; n numeric; k text;
  v_j jsonb; v_b jsonb; v_m jsonb; v_s jsonb;
  v_j_volume numeric; v_b_volume numeric; v_m_volume numeric;
  v_deep boolean; v_three boolean;
begin
  if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day030_evidence_object_required'; end if;
  if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day030_unknown_top_field'; end if;
  if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D030-V1' then raise exception 'day030_protocol_invalid'; end if;
  if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'a9bea648b20595579ef70c11ba3f319e477845dd' then raise exception 'day030_source_sha_invalid'; end if;
  if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day030_session_required'; end if;
  if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day030_mode_invalid'; end if;
  if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day030_voluntary_completion_required'; end if;
  if not (p_evidence ? 'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day030_safety_stop_invalid'; end if;

  v_j:=p_evidence->'jachin';
  if jsonb_typeof(v_j) is distinct from 'object' then raise exception 'day030_jachin_required'; end if;
  if exists(select 1 from jsonb_object_keys(v_j) x where x not in ('duration_seconds','audio_profile_id','volume_permille','headphones_confirmed','supported_posture_confirmed','eyes_closed_or_safe_equivalent_confirmed','comfortable_volume_confirmed','latency_seconds','distraction_count','relaxation_score','absorption_score','tingles_score','imagery_score','global_intensity_score','lateralization','no_specific_sensation_required_confirmed','active_vault_entry_ref')) then raise exception 'day030_jachin_unknown_field'; end if;
  if jsonb_typeof(v_j->'duration_seconds') is distinct from 'number' or (v_j->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day030_jachin_requires_600_seconds'; end if;
  if v_j->>'audio_profile_id' is distinct from 'HNK-KETHER-D030-ASMR-ACTIVE-V1' then raise exception 'day030_jachin_profile_invalid'; end if;
  if jsonb_typeof(v_j->'volume_permille') is distinct from 'number' then raise exception 'day030_volume_invalid'; end if;
  v_j_volume:=(v_j->>'volume_permille')::numeric;
  if v_j_volume<>trunc(v_j_volume) or v_j_volume<1 or v_j_volume>1000 then raise exception 'day030_volume_invalid'; end if;
  if v_j->'headphones_confirmed' is distinct from 'true'::jsonb or v_j->'supported_posture_confirmed' is distinct from 'true'::jsonb or v_j->'eyes_closed_or_safe_equivalent_confirmed' is distinct from 'true'::jsonb or v_j->'comfortable_volume_confirmed' is distinct from 'true'::jsonb or v_j->'no_specific_sensation_required_confirmed' is distinct from 'true'::jsonb then raise exception 'day030_jachin_requirements'; end if;
  if not (v_j ? 'latency_seconds') then raise exception 'day030_jachin_latency_required'; end if;
  if v_j->'latency_seconds' <> 'null'::jsonb then
    if jsonb_typeof(v_j->'latency_seconds') is distinct from 'number' then raise exception 'day030_jachin_latency_invalid'; end if;
    n:=(v_j->>'latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day030_jachin_latency_invalid'; end if;
  end if;
  if jsonb_typeof(v_j->'distraction_count') is distinct from 'number' then raise exception 'day030_jachin_distractions_invalid'; end if;
  n:=(v_j->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day030_jachin_distractions_invalid'; end if;
  foreach k in array array['relaxation_score','absorption_score','tingles_score','imagery_score','global_intensity_score'] loop
    if jsonb_typeof(v_j->k) is distinct from 'number' then raise exception 'day030_jachin_score_invalid'; end if;
    n:=(v_j->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day030_jachin_score_invalid'; end if;
  end loop;
  if coalesce(v_j->>'lateralization','') not in ('LEFT','RIGHT','BILATERAL','VARIABLE','NONE') then raise exception 'day030_jachin_lateralization_invalid'; end if;
  r:=v_j->>'active_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day030_active_vault_ref_invalid'; end if;

  v_b:=p_evidence->'boaz';
  if jsonb_typeof(v_b) is distinct from 'object' then raise exception 'day030_boaz_required'; end if;
  if exists(select 1 from jsonb_object_keys(v_b) x where x not in ('duration_seconds','audio_profile_id','volume_permille','same_headphones_confirmed','same_posture_confirmed','approximately_same_volume_confirmed','control_not_sabotaged_confirmed','comfortable_volume_confirmed','latency_seconds','distraction_count','relaxation_score','absorption_score','sleepiness_score','tingles_score','imagery_score','clarity_after_score','lateralization','data_may_correct_expectation_confirmed','control_vault_entry_ref')) then raise exception 'day030_boaz_unknown_field'; end if;
  if jsonb_typeof(v_b->'duration_seconds') is distinct from 'number' or (v_b->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day030_boaz_requires_600_seconds'; end if;
  if v_b->>'audio_profile_id' is distinct from 'HNK-KETHER-D030-CONTROL-V1' then raise exception 'day030_boaz_profile_invalid'; end if;
  if jsonb_typeof(v_b->'volume_permille') is distinct from 'number' then raise exception 'day030_volume_invalid'; end if;
  v_b_volume:=(v_b->>'volume_permille')::numeric;
  if v_b_volume<>trunc(v_b_volume) or v_b_volume<1 or v_b_volume>1000 then raise exception 'day030_volume_invalid'; end if;
  if v_b->'same_headphones_confirmed' is distinct from 'true'::jsonb or v_b->'same_posture_confirmed' is distinct from 'true'::jsonb or v_b->'approximately_same_volume_confirmed' is distinct from 'true'::jsonb or v_b->'control_not_sabotaged_confirmed' is distinct from 'true'::jsonb or v_b->'comfortable_volume_confirmed' is distinct from 'true'::jsonb or v_b->'data_may_correct_expectation_confirmed' is distinct from 'true'::jsonb then raise exception 'day030_boaz_requirements'; end if;
  if not (v_b ? 'latency_seconds') then raise exception 'day030_boaz_latency_required'; end if;
  if v_b->'latency_seconds' <> 'null'::jsonb then
    if jsonb_typeof(v_b->'latency_seconds') is distinct from 'number' then raise exception 'day030_boaz_latency_invalid'; end if;
    n:=(v_b->>'latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day030_boaz_latency_invalid'; end if;
  end if;
  if jsonb_typeof(v_b->'distraction_count') is distinct from 'number' then raise exception 'day030_boaz_distractions_invalid'; end if;
  n:=(v_b->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day030_boaz_distractions_invalid'; end if;
  foreach k in array array['relaxation_score','absorption_score','sleepiness_score','tingles_score','imagery_score','clarity_after_score'] loop
    if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day030_boaz_score_invalid'; end if;
    n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day030_boaz_score_invalid'; end if;
  end loop;
  if coalesce(v_b->>'lateralization','') not in ('LEFT','RIGHT','BILATERAL','VARIABLE','NONE') then raise exception 'day030_boaz_lateralization_invalid'; end if;
  r:=v_b->>'control_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day030_control_vault_ref_invalid'; end if;

  v_m:=p_evidence->'middle';
  if jsonb_typeof(v_m) is distinct from 'object' then raise exception 'day030_middle_required'; end if;
  if exists(select 1 from jsonb_object_keys(v_m) x where x not in ('duration_seconds','audio_profile_id','volume_permille','lamed_lamed_he_once_confirmed','psalm_9_11_orientation_confirmed','comfortable_volume_confirmed','latency_seconds','depth_score','stability_score','exit_clarity_score','deepest_state_noticed','three_natural_breaths_if_deepest_state_noticed_confirmed','signature','e1_e5_recorded_confirmed','future_mastery_criterion_defined_confirmed','single_session_not_definitive_confirmed','eyes_open_confirmed','headphones_removed_confirmed','environmental_orientation_confirmed','integration_vault_entry_ref')) then raise exception 'day030_middle_unknown_field'; end if;
  if jsonb_typeof(v_m->'duration_seconds') is distinct from 'number' or (v_m->>'duration_seconds')::numeric is distinct from 600::numeric then raise exception 'day030_middle_requires_600_seconds'; end if;
  if v_m->>'audio_profile_id' is distinct from 'HNK-KETHER-D030-ASMR-ACTIVE-V1' then raise exception 'day030_middle_profile_invalid'; end if;
  if jsonb_typeof(v_m->'volume_permille') is distinct from 'number' then raise exception 'day030_volume_invalid'; end if;
  v_m_volume:=(v_m->>'volume_permille')::numeric;
  if v_m_volume<>trunc(v_m_volume) or v_m_volume<1 or v_m_volume>1000 then raise exception 'day030_volume_invalid'; end if;
  if v_j_volume<>v_b_volume or v_j_volume<>v_m_volume then raise exception 'day030_audio_volume_mismatch'; end if;
  if v_m->'lamed_lamed_he_once_confirmed' is distinct from 'true'::jsonb or v_m->'psalm_9_11_orientation_confirmed' is distinct from 'true'::jsonb or v_m->'comfortable_volume_confirmed' is distinct from 'true'::jsonb or v_m->'e1_e5_recorded_confirmed' is distinct from 'true'::jsonb or v_m->'future_mastery_criterion_defined_confirmed' is distinct from 'true'::jsonb or v_m->'single_session_not_definitive_confirmed' is distinct from 'true'::jsonb or v_m->'eyes_open_confirmed' is distinct from 'true'::jsonb or v_m->'headphones_removed_confirmed' is distinct from 'true'::jsonb or v_m->'environmental_orientation_confirmed' is distinct from 'true'::jsonb then raise exception 'day030_middle_requirements'; end if;
  if not (v_m ? 'latency_seconds') then raise exception 'day030_middle_latency_required'; end if;
  if v_m->'latency_seconds' <> 'null'::jsonb then
    if jsonb_typeof(v_m->'latency_seconds') is distinct from 'number' then raise exception 'day030_middle_latency_invalid'; end if;
    n:=(v_m->>'latency_seconds')::numeric; if n<>trunc(n) or n<0 or n>600 then raise exception 'day030_middle_latency_invalid'; end if;
  end if;
  foreach k in array array['depth_score','stability_score','exit_clarity_score'] loop
    if jsonb_typeof(v_m->k) is distinct from 'number' then raise exception 'day030_middle_score_invalid'; end if;
    n:=(v_m->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day030_middle_score_invalid'; end if;
  end loop;
  if jsonb_typeof(v_m->'deepest_state_noticed') is distinct from 'boolean' or jsonb_typeof(v_m->'three_natural_breaths_if_deepest_state_noticed_confirmed') is distinct from 'boolean' then raise exception 'day030_deepest_state_flags_invalid'; end if;
  v_deep:=(v_m->>'deepest_state_noticed')::boolean; v_three:=(v_m->>'three_natural_breaths_if_deepest_state_noticed_confirmed')::boolean;
  if v_deep and not v_three then raise exception 'day030_three_breaths_required_when_deepest_state_noticed'; end if;
  if coalesce(v_m->>'signature','') not in ('RELAXATION','SLEEPINESS','ABSORPTION','TINGLES','IMAGERY','LATERALITY','SILENCE','MIXED','NONE') then raise exception 'day030_signature_invalid'; end if;
  r:=v_m->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day030_integration_vault_ref_invalid'; end if;

  v_s:=p_evidence->'soul_mirror';
  if jsonb_typeof(v_s) is distinct from 'object' then raise exception 'day030_soul_mirror_required'; end if;
  if exists(select 1 from jsonb_object_keys(v_s) x where x not in ('completed','acoustic_discernment_vault_entry_ref')) then raise exception 'day030_soul_mirror_unknown_field'; end if;
  if v_s->'completed' is distinct from 'true'::jsonb then raise exception 'day030_soul_mirror_required'; end if;
  r:=v_s->>'acoustic_discernment_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day030_soul_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D030-COMP-V1','HNK-KETHER-D030-V1',30,'a9bea648b20595579ef70c11ba3f319e477845dd','1.0.0','day030_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
