create or replace function hnk_private.validate_day008_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare
  v_allowed text[]:=array['protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred'];
  v_jachin text[]:=array['body_relaxation_completed','countdown_completed','final_number','attention_returns','easiest_body_region_vault_ref','return_confirmed'];
  v_boaz text[]:=array['countdown_completed','final_number','distractions_noted_count','adjustment_recorded','adjustment_vault_entry_ref','return_confirmed'];
  v_middle text[]:=array['sequence_completed','final_number','silent_observation_seconds','return_confirmed'];
  v_mirror text[]:=array['completed','relaxation_rating','attention_stability_rating','forcing_rating','vault_entry_ref'];
  v_key text;
begin
  if p_evidence is null or jsonb_typeof(p_evidence)<>'object' then raise exception 'day008_evidence_invalid';end if;
  for v_key in select jsonb_object_keys(p_evidence) loop if not(v_key=any(v_allowed)) then raise exception 'day008_unknown_field:%',v_key;end if;end loop;
  if p_evidence->>'protocol_version'<>'HNK-KETHER-D008-V1' then raise exception 'day008_protocol_version_invalid';end if;
  if p_evidence->>'source_sha'<>p_expected_source_sha then raise exception 'day008_source_sha_invalid';end if;
  if nullif(p_evidence->>'session_id','') is null then raise exception 'day008_session_id_required';end if;
  if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day008_voluntary_completion_required';end if;
  if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day008_jachin_invalid';end if;
  for v_key in select jsonb_object_keys(p_evidence->'jachin') loop if not(v_key=any(v_jachin)) then raise exception 'day008_jachin_unknown_field:%',v_key;end if;end loop;
  if p_evidence#>'{jachin,body_relaxation_completed}'<>'true'::jsonb or p_evidence#>'{jachin,countdown_completed}'<>'true'::jsonb or p_evidence#>'{jachin,return_confirmed}'<>'true'::jsonb then raise exception 'day008_jachin_required_invalid';end if;
  if jsonb_typeof(p_evidence#>'{jachin,final_number}')<>'number' or (p_evidence#>>'{jachin,final_number}')::int not between 1 and 100 then raise exception 'day008_jachin_final_number_invalid';end if;
  if jsonb_typeof(p_evidence#>'{jachin,attention_returns}')<>'number' or (p_evidence#>>'{jachin,attention_returns}')::int<0 then raise exception 'day008_attention_returns_invalid';end if;
  if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day008_boaz_invalid';end if;
  for v_key in select jsonb_object_keys(p_evidence->'boaz') loop if not(v_key=any(v_boaz)) then raise exception 'day008_boaz_unknown_field:%',v_key;end if;end loop;
  if p_evidence#>'{boaz,countdown_completed}'<>'true'::jsonb or p_evidence#>'{boaz,adjustment_recorded}'<>'true'::jsonb or p_evidence#>'{boaz,return_confirmed}'<>'true'::jsonb then raise exception 'day008_boaz_required_invalid';end if;
  if jsonb_typeof(p_evidence#>'{boaz,final_number}')<>'number' or (p_evidence#>>'{boaz,final_number}')::int not between 1 and 100 then raise exception 'day008_boaz_final_number_invalid';end if;
  if jsonb_typeof(p_evidence#>'{boaz,distractions_noted_count}')<>'number' or (p_evidence#>>'{boaz,distractions_noted_count}')::int<0 then raise exception 'day008_distractions_invalid';end if;
  if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day008_middle_invalid';end if;
  for v_key in select jsonb_object_keys(p_evidence->'middle') loop if not(v_key=any(v_middle)) then raise exception 'day008_middle_unknown_field:%',v_key;end if;end loop;
  if p_evidence#>'{middle,sequence_completed}'<>'true'::jsonb or p_evidence#>'{middle,return_confirmed}'<>'true'::jsonb then raise exception 'day008_middle_required_invalid';end if;
  if jsonb_typeof(p_evidence#>'{middle,final_number}')<>'number' or (p_evidence#>>'{middle,final_number}')::int not between 1 and 100 then raise exception 'day008_middle_final_number_invalid';end if;
  if jsonb_typeof(p_evidence#>'{middle,silent_observation_seconds}')<>'number' or (p_evidence#>>'{middle,silent_observation_seconds}')::int<60 then raise exception 'day008_silent_observation_min_60';end if;
  if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day008_soul_mirror_invalid';end if;
  for v_key in select jsonb_object_keys(p_evidence->'soul_mirror') loop if not(v_key=any(v_mirror)) then raise exception 'day008_mirror_unknown_field:%',v_key;end if;end loop;
  if p_evidence#>'{soul_mirror,completed}'<>'true'::jsonb then raise exception 'day008_soul_mirror_required';end if;
  if jsonb_typeof(p_evidence#>'{soul_mirror,relaxation_rating}')<>'number' or (p_evidence#>>'{soul_mirror,relaxation_rating}')::int not between 0 and 10 then raise exception 'day008_relaxation_rating_invalid';end if;
  if jsonb_typeof(p_evidence#>'{soul_mirror,attention_stability_rating}')<>'number' or (p_evidence#>>'{soul_mirror,attention_stability_rating}')::int not between 0 and 10 then raise exception 'day008_attention_rating_invalid';end if;
  if jsonb_typeof(p_evidence#>'{soul_mirror,forcing_rating}')<>'number' or (p_evidence#>>'{soul_mirror,forcing_rating}')::int not between 0 and 10 then raise exception 'day008_forcing_rating_invalid';end if;
end $$;

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$ begin case p_validator_key
 when 'day001_v2' then perform hnk_private.validate_day001_completion_v2(p_evidence,p_expected_source_sha);
 when 'day002_v1' then perform hnk_private.validate_day002_completion_v1(p_evidence,p_expected_source_sha);
 when 'day003_v1' then perform hnk_private.validate_day003_completion_v1(p_evidence,p_expected_source_sha);
 when 'day004_v1' then perform hnk_private.validate_day004_completion_v1(p_evidence,p_expected_source_sha);
 when 'day005_v1' then perform hnk_private.validate_day005_completion_v1(p_evidence,p_expected_source_sha);
 when 'day006_v1' then perform hnk_private.validate_day006_completion_v1(p_evidence,p_expected_source_sha);
 when 'day007_v1' then perform hnk_private.validate_day007_completion_v1(p_evidence,p_expected_source_sha);
 when 'day008_v1' then perform hnk_private.validate_day008_completion_v1(p_evidence,p_expected_source_sha);
 else raise exception 'completion_validator_not_supported';end case;end $$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status,updated_at)
values('HNK-KETHER-D008-COMP-V1','HNK-KETHER-D008-V1',8,'df7c39ced019ead6eb0be817a1ac638789d40c3c','1.0.0','day008_v1','reviewed',now())
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='reviewed',updated_at=now();
