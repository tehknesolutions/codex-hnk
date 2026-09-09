create or replace function hnk_private.validate_day007_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare v_allowed text[]:=array['protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred'];v_key text;
begin
 if p_evidence is null or jsonb_typeof(p_evidence)<>'object' then raise exception 'day007_evidence_invalid';end if;
 for v_key in select jsonb_object_keys(p_evidence) loop if not(v_key=any(v_allowed)) then raise exception 'day007_unknown_field:%',v_key;end if;end loop;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D007-V1' then raise exception 'day007_protocol_version_invalid';end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha then raise exception 'day007_source_sha_invalid';end if;
 if nullif(p_evidence->>'session_id','') is null then raise exception 'day007_session_id_required';end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day007_voluntary_completion_required';end if;
 if jsonb_typeof(p_evidence->'jachin')<>'object' or p_evidence#>'{jachin,relaxation_completed}'<>'true'::jsonb or p_evidence#>'{jachin,test_performed}'<>'true'::jsonb or p_evidence#>'{jachin,release_confirmed}'<>'true'::jsonb or p_evidence#>'{jachin,return_confirmed}'<>'true'::jsonb then raise exception 'day007_jachin_invalid';end if;
 if jsonb_typeof(p_evidence#>'{jachin,relaxation_rating}')<>'number' or (p_evidence#>>'{jachin,relaxation_rating}')::int not between 0 and 10 then raise exception 'day007_relaxation_rating_invalid';end if;
 if jsonb_typeof(p_evidence#>'{jachin,catalepsy_reported}')<>'boolean' then raise exception 'day007_jachin_catalepsy_type_invalid';end if;
 if jsonb_typeof(p_evidence->'boaz')<>'object' or p_evidence#>'{boaz,comparison_completed}'<>'true'::jsonb or p_evidence#>'{boaz,release_confirmed}'<>'true'::jsonb or p_evidence#>'{boaz,return_confirmed}'<>'true'::jsonb then raise exception 'day007_boaz_invalid';end if;
 if jsonb_typeof(p_evidence#>'{boaz,spontaneous_sensation_rating}')<>'number' or (p_evidence#>>'{boaz,spontaneous_sensation_rating}')::int not between 0 and 10 then raise exception 'day007_spontaneous_rating_invalid';end if;
 if jsonb_typeof(p_evidence#>'{boaz,muscular_effort_rating}')<>'number' or (p_evidence#>>'{boaz,muscular_effort_rating}')::int not between 0 and 10 then raise exception 'day007_effort_rating_invalid';end if;
 if jsonb_typeof(p_evidence#>'{boaz,second_attempt_performed}')<>'boolean' or jsonb_typeof(p_evidence#>'{boaz,catalepsy_reported}')<>'boolean' then raise exception 'day007_boaz_boolean_invalid';end if;
 if jsonb_typeof(p_evidence->'middle')<>'object' or p_evidence#>'{middle,sequence_completed}'<>'true'::jsonb or p_evidence#>'{middle,release_confirmed}'<>'true'::jsonb or p_evidence#>'{middle,return_confirmed}'<>'true'::jsonb then raise exception 'day007_middle_invalid';end if;
 if jsonb_typeof(p_evidence#>'{middle,silent_observation_seconds}')<>'number' or (p_evidence#>>'{middle,silent_observation_seconds}')::int<60 then raise exception 'day007_silent_observation_min_60';end if;
 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' or p_evidence#>'{soul_mirror,completed}'<>'true'::jsonb then raise exception 'day007_soul_mirror_required';end if;
 if (p_evidence#>>'{soul_mirror,relaxation_spontaneous_rating}')::int not between 0 and 10 or (p_evidence#>>'{soul_mirror,muscular_effort_rating}')::int not between 0 and 10 or (p_evidence#>>'{soul_mirror,perception_change_rating}')::int not between 0 and 10 then raise exception 'day007_soul_mirror_rating_invalid';end if;
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
 else raise exception 'completion_validator_not_supported';end case;end $$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status,updated_at)
values('HNK-KETHER-D007-COMP-V1','HNK-KETHER-D007-V1',7,'bc12709d5a346870405cf41e62f99ac28d70186d','1.0.0','day007_v1','reviewed',now())
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='reviewed',updated_at=now();
