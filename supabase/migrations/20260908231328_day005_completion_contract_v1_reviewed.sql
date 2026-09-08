-- HNK Day 005 Completion V1 — reviewed registry + strict evidence validator.
create or replace function hnk_private.validate_day005_completion_v1(p_evidence jsonb, p_expected_source_sha text)
returns void language plpgsql set search_path = '' as $$
declare v_allowed text[] := array['protocol_version','source_sha','session_id','mode','baseline','jachin','audio_theta432','boaz','middle','phenomenology','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred']; v_key text;
begin
  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then raise exception 'day005_evidence_invalid'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop if not (v_key = any(v_allowed)) then raise exception 'day005_unknown_field:%',v_key; end if; end loop;
  if p_evidence->>'protocol_version' <> 'HNK-KETHER-D005-V1' then raise exception 'day005_protocol_version_invalid'; end if;
  if p_evidence->>'source_sha' <> p_expected_source_sha then raise exception 'day005_source_sha_invalid'; end if;
  if nullif(p_evidence->>'session_id','') is null then raise exception 'day005_session_id_required'; end if;
  if (p_evidence->>'voluntary_completion_confirmed')::boolean is not true then raise exception 'day005_voluntary_completion_required'; end if;
  if (p_evidence#>>'{baseline,tension_before}')::int not between 0 and 10 or (p_evidence#>>'{baseline,tension_after}')::int not between 0 and 10 then raise exception 'day005_baseline_rating_invalid'; end if;
  if (p_evidence#>>'{jachin,breath_completed}')::boolean is not true or (p_evidence#>>'{jachin,natural_breathing_confirmed}')::boolean is not true or (p_evidence#>>'{jachin,return_confirmed}')::boolean is not true then raise exception 'day005_jachin_invalid'; end if;
  if coalesce((p_evidence#>>'{jachin,duration_seconds}')::int,-1) < 0 then raise exception 'day005_jachin_duration_invalid'; end if;
  if (p_evidence#>>'{audio_theta432,started}')::boolean is not true or p_evidence#>>'{audio_theta432,profile_id}' <> 'HNK-THETA432-BINAURAL-V1' then raise exception 'day005_audio_invalid'; end if;
  if (p_evidence#>>'{boaz,gesture_completed}')::boolean is not true or (p_evidence#>>'{boaz,empty_hand_confirmed}')::boolean is not true or (p_evidence#>>'{boaz,forced_exhalation_avoided}')::boolean is not true or (p_evidence#>>'{boaz,journal_entry_recorded}')::boolean is not true or (p_evidence#>>'{boaz,return_confirmed}')::boolean is not true then raise exception 'day005_boaz_invalid'; end if;
  if (p_evidence#>>'{middle,dai_koo_myo_focus_completed}')::boolean is not true or p_evidence#>>'{middle,asset_id}' <> 'HNK-KETHER-DAI-KOO-MYO-USUI-MASTER-V1' or (p_evidence#>>'{middle,return_confirmed}')::boolean is not true then raise exception 'day005_middle_invalid'; end if;
  if coalesce((p_evidence#>>'{middle,duration_seconds}')::int,-1) < 0 then raise exception 'day005_middle_duration_invalid'; end if;
  if (p_evidence#>>'{soul_mirror,completed}')::boolean is not true then raise exception 'day005_soul_mirror_required'; end if;
  if p_evidence#>>'{soul_mirror,difficulty_rating}' is not null and (p_evidence#>>'{soul_mirror,difficulty_rating}')::int not between 0 and 10 then raise exception 'day005_soul_mirror_rating_invalid'; end if;
end; $$;
revoke all on function hnk_private.validate_day005_completion_v1(jsonb,text) from public,anon,authenticated;
insert into hnk_private.completion_contract_registry(completion_contract_id,day,contract_version,quest_definition_id,canonical_source_sha,validator_key,status)
values('HNK-KETHER-D005-COMP-V1',5,'1','HNK-KETHER-D005-V1','eb9f078bdc7654135f83fbcdf0aa7d5d38412cff','day005_v1','reviewed')
on conflict(completion_contract_id) do update set day=excluded.day,contract_version=excluded.contract_version,quest_definition_id=excluded.quest_definition_id,canonical_source_sha=excluded.canonical_source_sha,validator_key=excluded.validator_key,status='reviewed',updated_at=now();
create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$ begin
  case p_validator_key
    when 'day001_v2' then perform hnk_private.validate_day001_completion_v2(p_evidence,p_expected_source_sha);
    when 'day002_v1' then perform hnk_private.validate_day002_completion_v1(p_evidence,p_expected_source_sha);
    when 'day003_v1' then perform hnk_private.validate_day003_completion_v1(p_evidence,p_expected_source_sha);
    when 'day004_v1' then perform hnk_private.validate_day004_completion_v1(p_evidence,p_expected_source_sha);
    when 'day005_v1' then perform hnk_private.validate_day005_completion_v1(p_evidence,p_expected_source_sha);
    else raise exception 'completion_validator_not_supported';
  end case;
end; $$;
revoke all on function hnk_private.validate_completion_contract_v2(text,jsonb,text) from public,anon,authenticated;
