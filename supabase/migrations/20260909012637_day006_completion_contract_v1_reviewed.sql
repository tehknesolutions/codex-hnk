create or replace function hnk_private.validate_day006_completion_v1(p_evidence jsonb, p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare v_allowed text[]:=array['protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred']; v_key text;
begin
  if p_evidence is null or jsonb_typeof(p_evidence)<>'object' then raise exception 'day006_evidence_invalid'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop if not(v_key=any(v_allowed)) then raise exception 'day006_unknown_field:%',v_key; end if; end loop;
  if p_evidence->>'protocol_version'<>'HNK-KETHER-D006-V1' then raise exception 'day006_protocol_version_invalid'; end if;
  if p_evidence->>'source_sha'<>p_expected_source_sha then raise exception 'day006_source_sha_invalid'; end if;
  if nullif(p_evidence->>'session_id','') is null then raise exception 'day006_session_id_required'; end if;
  if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day006_voluntary_completion_required'; end if;
  if jsonb_typeof(p_evidence->'jachin')<>'object' or p_evidence#>'{jachin,listening_completed}'<>'true'::jsonb or p_evidence#>'{jachin,return_confirmed}'<>'true'::jsonb then raise exception 'day006_jachin_invalid'; end if;
  if jsonb_typeof(p_evidence#>'{jachin,duration_seconds}')<>'number' or coalesce((p_evidence#>>'{jachin,duration_seconds}')::int,-1)<0 then raise exception 'day006_jachin_duration_invalid'; end if;
  if jsonb_typeof(p_evidence#>'{jachin,sounds_noted_count}')<>'number' or coalesce((p_evidence#>>'{jachin,sounds_noted_count}')::int,-1)<0 then raise exception 'day006_sounds_count_invalid'; end if;
  if jsonb_typeof(p_evidence->'boaz')<>'object' or p_evidence#>'{boaz,silence_practice_completed}'<>'true'::jsonb or p_evidence#>'{boaz,return_confirmed}'<>'true'::jsonb then raise exception 'day006_boaz_invalid'; end if;
  if jsonb_typeof(p_evidence#>'{boaz,duration_seconds}')<>'number' or coalesce((p_evidence#>>'{boaz,duration_seconds}')::int,-1)<0 then raise exception 'day006_boaz_duration_invalid'; end if;
  if jsonb_typeof(p_evidence#>'{boaz,thought_returns}')<>'number' or coalesce((p_evidence#>>'{boaz,thought_returns}')::int,-1)<0 then raise exception 'day006_thought_returns_invalid'; end if;
  if jsonb_typeof(p_evidence#>'{boaz,difficulties_recorded_count}')<>'number' or coalesce((p_evidence#>>'{boaz,difficulties_recorded_count}')::int,-1)<3 then raise exception 'day006_difficulties_min_3'; end if;
  if jsonb_typeof(p_evidence->'middle')<>'object' or p_evidence#>'{middle,voice_practice_completed}'<>'true'::jsonb or p_evidence#>'{middle,return_confirmed}'<>'true'::jsonb then raise exception 'day006_middle_invalid'; end if;
  if jsonb_typeof(p_evidence#>'{middle,voice_recorded}')<>'boolean' then raise exception 'day006_voice_recorded_type_invalid'; end if;
  if p_evidence#>'{middle,voice_recorded}'='true'::jsonb and nullif(p_evidence#>>'{middle,encrypted_voice_ref}','') is null then raise exception 'day006_encrypted_voice_ref_required'; end if;
  if jsonb_typeof(p_evidence->'soul_mirror')<>'object' or p_evidence#>'{soul_mirror,completed}'<>'true'::jsonb then raise exception 'day006_soul_mirror_required'; end if;
end $$;

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$ begin case p_validator_key
  when 'day001_v2' then perform hnk_private.validate_day001_completion_v2(p_evidence,p_expected_source_sha);
  when 'day002_v1' then perform hnk_private.validate_day002_completion_v1(p_evidence,p_expected_source_sha);
  when 'day003_v1' then perform hnk_private.validate_day003_completion_v1(p_evidence,p_expected_source_sha);
  when 'day004_v1' then perform hnk_private.validate_day004_completion_v1(p_evidence,p_expected_source_sha);
  when 'day005_v1' then perform hnk_private.validate_day005_completion_v1(p_evidence,p_expected_source_sha);
  when 'day006_v1' then perform hnk_private.validate_day006_completion_v1(p_evidence,p_expected_source_sha);
  else raise exception 'completion_validator_not_supported'; end case; end $$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status,updated_at)
values('HNK-KETHER-D006-COMP-V1','HNK-KETHER-D006-V1',6,'923c43ae0a68d63a4c88f67d83076b72e0b06c39','1.0.0','day006_v1','reviewed',now())
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='reviewed',updated_at=now();
