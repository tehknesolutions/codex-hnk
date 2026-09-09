create or replace function hnk_private.validate_day014_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$
declare v jsonb; n numeric; r text;
begin
 if jsonb_typeof(p_evidence)<>'object' then raise exception 'day014_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) k where k not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day014_unknown_top_field'; end if;
 if p_evidence->>'protocol_version'<>'HNK-KETHER-D014-V1' then raise exception 'day014_protocol_invalid'; end if;
 if p_evidence->>'source_sha'<>p_expected_source_sha or p_expected_source_sha<>'31f7e171a5727926eac9a3e1c569ab9eff8ad245' then raise exception 'day014_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day014_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day014_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed'<>'true'::jsonb then raise exception 'day014_voluntary_completion_required'; end if;
 if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence->'safety_stop_occurred')<>'boolean' then raise exception 'day014_safety_stop_invalid'; end if;
 if jsonb_typeof(p_evidence->'jachin')<>'object' then raise exception 'day014_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'jachin') k where k not in ('duration_seconds','distraction_count','max_stability_seconds','returned_without_irritation_confirmed','return_strategy_vault_entry_ref')) then raise exception 'day014_jachin_unknown_field'; end if;
 if p_evidence->'jachin'->'duration_seconds'<>'300'::jsonb then raise exception 'day014_jachin_duration_invalid'; end if;
 foreach r in array array['distraction_count','max_stability_seconds'] loop v:=p_evidence->'jachin'->r; if jsonb_typeof(v)<>'number' then raise exception 'day014_jachin_metric_invalid'; end if; n:=(p_evidence->'jachin'->>r)::numeric; if n<>trunc(n) or n<0 or (r='max_stability_seconds' and n>300) or (r='distraction_count' and n>1000000) then raise exception 'day014_jachin_metric_invalid'; end if; end loop;
 if p_evidence->'jachin'->'returned_without_irritation_confirmed'<>'true'::jsonb then raise exception 'day014_jachin_return_required'; end if;
 r:=p_evidence->'jachin'->>'return_strategy_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day014_jachin_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'boaz')<>'object' then raise exception 'day014_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'boaz') k where k not in ('duration_seconds','return_count','spontaneous_change_count','relaxed_body_confirmed','no_punishment_confirmed','spontaneous_change_not_automatic_revelation_confirmed','persistent_distraction_vault_entry_ref')) then raise exception 'day014_boaz_unknown_field'; end if;
 if p_evidence->'boaz'->'duration_seconds'<>'300'::jsonb then raise exception 'day014_boaz_duration_invalid'; end if;
 foreach r in array array['return_count','spontaneous_change_count'] loop v:=p_evidence->'boaz'->r; if jsonb_typeof(v)<>'number' then raise exception 'day014_boaz_metric_invalid'; end if; n:=(p_evidence->'boaz'->>r)::numeric; if n<>trunc(n) or n<0 or n>1000000 then raise exception 'day014_boaz_metric_invalid'; end if; end loop;
 if p_evidence->'boaz'->'relaxed_body_confirmed'<>'true'::jsonb or p_evidence->'boaz'->'no_punishment_confirmed'<>'true'::jsonb then raise exception 'day014_boaz_method_required'; end if;
 if p_evidence->'boaz'->'spontaneous_change_not_automatic_revelation_confirmed'<>'true'::jsonb then raise exception 'day014_boaz_epistemic_boundary_required'; end if;
 r:=p_evidence->'boaz'->>'persistent_distraction_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day014_boaz_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'middle')<>'object' then raise exception 'day014_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'middle') k where k not in ('duration_seconds','psalm_91_2_prayer_confirmed','attention_stability_score','image_dismissed_voluntarily','three_real_objects_observed','imagine_perceive_interpret_distinguished','final_vault_entry_ref')) then raise exception 'day014_middle_unknown_field'; end if;
 if p_evidence->'middle'->'duration_seconds'<>'300'::jsonb then raise exception 'day014_middle_duration_invalid'; end if;
 v:=p_evidence->'middle'->'attention_stability_score'; if jsonb_typeof(v)<>'number' then raise exception 'day014_attention_score_invalid'; end if; n:=(p_evidence->'middle'->>'attention_stability_score')::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day014_attention_score_invalid'; end if;
 if p_evidence->'middle'->'psalm_91_2_prayer_confirmed'<>'true'::jsonb then raise exception 'day014_middle_prayer_required'; end if;
 if p_evidence->'middle'->'image_dismissed_voluntarily'<>'true'::jsonb or p_evidence->'middle'->'three_real_objects_observed'<>'true'::jsonb or p_evidence->'middle'->'imagine_perceive_interpret_distinguished'<>'true'::jsonb then raise exception 'day014_middle_grounding_required'; end if;
 r:=p_evidence->'middle'->>'final_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day014_middle_vault_ref_invalid'; end if;
 if jsonb_typeof(p_evidence->'soul_mirror')<>'object' then raise exception 'day014_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence->'soul_mirror') k where k not in ('completed','stability_change_return_vault_entry_ref')) then raise exception 'day014_soul_mirror_unknown_field'; end if;
 if p_evidence->'soul_mirror'->'completed'<>'true'::jsonb then raise exception 'day014_soul_mirror_required'; end if;
 r:=p_evidence->'soul_mirror'->>'stability_change_return_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day014_soul_mirror_vault_ref_invalid'; end if;
end$$;
create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path to '' as $$ begin case p_validator_key
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
 else raise exception 'completion_validator_not_supported'; end case; end$$;
insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D014-COMP-V1','HNK-KETHER-D014-V1',14,'31f7e171a5727926eac9a3e1c569ab9eff8ad245','1.0.0','day014_v1','active')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='active',updated_at=now();
