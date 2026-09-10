create or replace function hnk_private.validate_day019_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare
 r text; n numeric; a jsonb; sr numeric; rd numeric; ratio_sum numeric;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day019_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day019_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D019-V1' then raise exception 'day019_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'b37705700bcf5e0a976b5eba65af3f48ad4b7907' then raise exception 'day019_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day019_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day019_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day019_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day019_safety_stop_invalid'; end if;

 if jsonb_typeof(p_evidence->'jachin') is distinct from 'object' then raise exception 'day019_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('recording_duration_seconds','vocalization_performed_confirmed','moderate_volume_confirmed','natural_breathing_confirmed','comfortable_device_distance_confirmed','graph_observed_confirmed','graph_not_spiritual_translation_confirmed','audio_encrypted_local_confirmed','raw_audio_not_uploaded_to_server_confirmed','media_ciphertext_checksum_sha256','media_byte_length','media_mime_type','analysis','observation_hypothesis_vault_entry_ref')) then raise exception 'day019_jachin_unknown_field'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'recording_duration_seconds') is distinct from 'number' then raise exception 'day019_recording_duration_invalid'; end if;
 rd:=(p_evidence->'jachin'->>'recording_duration_seconds')::numeric; if rd<>trunc(rd) or rd<1 or rd>180 then raise exception 'day019_recording_duration_invalid'; end if;
 if p_evidence->'jachin'->'vocalization_performed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'moderate_volume_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'natural_breathing_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'comfortable_device_distance_confirmed' is distinct from 'true'::jsonb then raise exception 'day019_capture_safety_required'; end if;
 if p_evidence->'jachin'->'graph_observed_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'graph_not_spiritual_translation_confirmed' is distinct from 'true'::jsonb then raise exception 'day019_graph_boundary_required'; end if;
 if p_evidence->'jachin'->'audio_encrypted_local_confirmed' is distinct from 'true'::jsonb or p_evidence->'jachin'->'raw_audio_not_uploaded_to_server_confirmed' is distinct from 'true'::jsonb then raise exception 'day019_media_privacy_required'; end if;
 r:=p_evidence->'jachin'->>'media_ciphertext_checksum_sha256'; if r is null or r!~'^[a-f0-9]{64}$' then raise exception 'day019_media_checksum_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin'->'media_byte_length') is distinct from 'number' then raise exception 'day019_media_byte_length_invalid'; end if; n:=(p_evidence->'jachin'->>'media_byte_length')::numeric; if n<>trunc(n) or n<1 or n>12582912 then raise exception 'day019_media_byte_length_invalid'; end if;
 r:=p_evidence->'jachin'->>'media_mime_type'; if r is null or length(btrim(r))<1 or length(r)>128 or r~E'[\r\n]' then raise exception 'day019_media_mime_invalid'; end if;
 r:=p_evidence->'jachin'->>'observation_hypothesis_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day019_observation_vault_ref_invalid'; end if;
 a:=p_evidence->'jachin'->'analysis'; if jsonb_typeof(a) is distinct from 'object' then raise exception 'day019_analysis_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) k where k not in ('schema','sample_rate_hz','analyzed_sample_count','duration_seconds','rms','peak','zero_crossing_rate','spectral_centroid_hz','dominant_frequency_hz','low_band_energy_ratio','mid_band_energy_ratio','high_band_energy_ratio','spectral_frames')) then raise exception 'day019_analysis_unknown_field'; end if;
 if a->>'schema' is distinct from 'hnk-acoustic-analysis-v1' then raise exception 'day019_analysis_schema_invalid'; end if;
 if jsonb_typeof(a->'sample_rate_hz') is distinct from 'number' then raise exception 'day019_analysis_sample_rate_invalid'; end if; sr:=(a->>'sample_rate_hz')::numeric; if sr<>trunc(sr) or sr<8000 or sr>192000 then raise exception 'day019_analysis_sample_rate_invalid'; end if;
 if jsonb_typeof(a->'analyzed_sample_count') is distinct from 'number' then raise exception 'day019_analysis_sample_count_invalid'; end if; n:=(a->>'analyzed_sample_count')::numeric; if n<>trunc(n) or n<1 or n>100000000 then raise exception 'day019_analysis_sample_count_invalid'; end if;
 if jsonb_typeof(a->'duration_seconds') is distinct from 'number' then raise exception 'day019_analysis_duration_invalid'; end if; n:=(a->>'duration_seconds')::numeric; if n<=0 or n>180.5 or abs(n-rd)>2 then raise exception 'day019_analysis_duration_invalid'; end if;
 if jsonb_typeof(a->'rms') is distinct from 'number' or (a->>'rms')::numeric<0 or (a->>'rms')::numeric>1 then raise exception 'day019_analysis_rms_invalid'; end if;
 if jsonb_typeof(a->'peak') is distinct from 'number' or (a->>'peak')::numeric<0 or (a->>'peak')::numeric>1 then raise exception 'day019_analysis_peak_invalid'; end if;
 if jsonb_typeof(a->'zero_crossing_rate') is distinct from 'number' or (a->>'zero_crossing_rate')::numeric<0 or (a->>'zero_crossing_rate')::numeric>1 then raise exception 'day019_analysis_zcr_invalid'; end if;
 if jsonb_typeof(a->'spectral_centroid_hz') is distinct from 'number' or (a->>'spectral_centroid_hz')::numeric<0 or (a->>'spectral_centroid_hz')::numeric>sr/2 then raise exception 'day019_analysis_centroid_invalid'; end if;
 if jsonb_typeof(a->'dominant_frequency_hz') is distinct from 'number' or (a->>'dominant_frequency_hz')::numeric<0 or (a->>'dominant_frequency_hz')::numeric>sr/2 then raise exception 'day019_analysis_dominant_invalid'; end if;
 if jsonb_typeof(a->'low_band_energy_ratio') is distinct from 'number' or jsonb_typeof(a->'mid_band_energy_ratio') is distinct from 'number' or jsonb_typeof(a->'high_band_energy_ratio') is distinct from 'number' then raise exception 'day019_analysis_band_ratio_invalid'; end if;
 if (a->>'low_band_energy_ratio')::numeric<0 or (a->>'low_band_energy_ratio')::numeric>1 or (a->>'mid_band_energy_ratio')::numeric<0 or (a->>'mid_band_energy_ratio')::numeric>1 or (a->>'high_band_energy_ratio')::numeric<0 or (a->>'high_band_energy_ratio')::numeric>1 then raise exception 'day019_analysis_band_ratio_invalid'; end if;
 ratio_sum:=(a->>'low_band_energy_ratio')::numeric+(a->>'mid_band_energy_ratio')::numeric+(a->>'high_band_energy_ratio')::numeric; if ratio_sum<>0 and (ratio_sum<0.97 or ratio_sum>1.03) then raise exception 'day019_analysis_band_ratio_sum_invalid'; end if;
 if jsonb_typeof(a->'spectral_frames') is distinct from 'number' then raise exception 'day019_analysis_spectral_frames_invalid'; end if; n:=(a->>'spectral_frames')::numeric; if n<>trunc(n) or n<1 or n>1000000 then raise exception 'day019_analysis_spectral_frames_invalid'; end if;

 if jsonb_typeof(p_evidence->'boaz') is distinct from 'object' then raise exception 'day019_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('microphone_distance_bucket','environment_bucket','intended_volume','device_input','three_measurement_factors_recorded','dramatic_graph_chasing_avoided','acoustic_data_insufficient_for_spiritual_cause_confirmed','measurement_context_vault_entry_ref')) then raise exception 'day019_boaz_unknown_field'; end if;
 if p_evidence->'boaz'->>'microphone_distance_bucket' not in ('NEAR_10_20_CM','MID_21_50_CM','FAR_OVER_50_CM','UNKNOWN') then raise exception 'day019_microphone_distance_invalid'; end if;
 if p_evidence->'boaz'->>'environment_bucket' not in ('QUIET','MODERATE','NOISY') then raise exception 'day019_environment_invalid'; end if;
 if p_evidence->'boaz'->>'intended_volume' not in ('LOW','MODERATE') then raise exception 'day019_intended_volume_invalid'; end if;
 if p_evidence->'boaz'->>'device_input' not in ('BUILT_IN','EXTERNAL','UNKNOWN') then raise exception 'day019_device_input_invalid'; end if;
 if p_evidence->'boaz'->'three_measurement_factors_recorded' is distinct from 'true'::jsonb or p_evidence->'boaz'->'dramatic_graph_chasing_avoided' is distinct from 'true'::jsonb or p_evidence->'boaz'->'acoustic_data_insufficient_for_spiritual_cause_confirmed' is distinct from 'true'::jsonb then raise exception 'day019_boaz_measurement_boundary_required'; end if;
 r:=p_evidence->'boaz'->>'measurement_context_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day019_measurement_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'middle') is distinct from 'object' then raise exception 'day019_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('encrypted_audio_replayed_confirmed','comfortable_playback_volume_confirmed','two_concrete_acoustic_observations_confirmed','analysis_closed_before_prayer_confirmed','psalm_6_4_prayer_confirmed','measured_felt_interpreted_separated_confirmed','discernment_score','integration_vault_entry_ref')) then raise exception 'day019_middle_unknown_field'; end if;
 if p_evidence->'middle'->'encrypted_audio_replayed_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'comfortable_playback_volume_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'two_concrete_acoustic_observations_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'analysis_closed_before_prayer_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'psalm_6_4_prayer_confirmed' is distinct from 'true'::jsonb or p_evidence->'middle'->'measured_felt_interpreted_separated_confirmed' is distinct from 'true'::jsonb then raise exception 'day019_middle_integration_required'; end if;
 if jsonb_typeof(p_evidence->'middle'->'discernment_score') is distinct from 'number' then raise exception 'day019_discernment_score_invalid'; end if; n:=(p_evidence->'middle'->>'discernment_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day019_discernment_score_invalid'; end if;
 r:=p_evidence->'middle'->>'integration_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day019_integration_vault_ref_invalid'; end if;

 if jsonb_typeof(p_evidence->'soul_mirror') is distinct from 'object' then raise exception 'day019_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','signal_subjective_spiritual_open_interpretation_vault_entry_ref')) then raise exception 'day019_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed' is distinct from 'true'::jsonb then raise exception 'day019_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'signal_subjective_spiritual_open_interpretation_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day019_soul_mirror_vault_ref_invalid'; end if;
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
  else raise exception 'completion_validator_not_supported'; end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D019-COMP-V1','HNK-KETHER-D019-V1',19,'b37705700bcf5e0a976b5eba65af3f48ad4b7907','1.0.0','day019_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status=excluded.status;
