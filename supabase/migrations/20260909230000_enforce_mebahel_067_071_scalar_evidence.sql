-- Strict first-completion evidence for canonical Mebahel Days 067-071.

create or replace function hnk_private.validate_day067_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day067_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','anchor_first_completed','anchor_return_completed','control_completed','cancellation_completed','comparison_completed','objective_space_power_not_claimed','risk_movement_avoided','orientation_preserved','safety_clear','active_effect_present','control_effect_present','active_seconds','control_seconds']) then raise exception 'day067_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'anchor_first_completed' is distinct from 'true'::jsonb or p->'anchor_return_completed' is distinct from 'true'::jsonb or p->'control_completed' is distinct from 'true'::jsonb or p->'cancellation_completed' is distinct from 'true'::jsonb or p->'comparison_completed' is distinct from 'true'::jsonb or p->'objective_space_power_not_claimed' is distinct from 'true'::jsonb or p->'risk_movement_avoided' is distinct from 'true'::jsonb or p->'orientation_preserved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day067_required_flag_missing'; end if;
 if jsonb_typeof(p->'active_effect_present') is distinct from 'boolean' or jsonb_typeof(p->'control_effect_present') is distinct from 'boolean' then raise exception 'day067_effect_flag_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'control_seconds'),false) or (p->>'active_seconds')::int<1 or (p->>'control_seconds')::int<1 then raise exception 'day067_duration_incomplete'; end if;
end $$;

create or replace function hnk_private.validate_day068_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; f int; c int; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day068_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','three_sources_identified','essential_exceptions_defined','fast_completed','control_completed','comparison_completed','early_exit_allowed','critical_alerts_preserved','responsibilities_preserved','egregore_not_literalized','sustainable_rule_defined','vault_saved','safety_clear','sources_count','fast_seconds','control_seconds']) then raise exception 'day068_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'three_sources_identified' is distinct from 'true'::jsonb or p->'essential_exceptions_defined' is distinct from 'true'::jsonb or p->'fast_completed' is distinct from 'true'::jsonb or p->'control_completed' is distinct from 'true'::jsonb or p->'comparison_completed' is distinct from 'true'::jsonb or p->'early_exit_allowed' is distinct from 'true'::jsonb or p->'critical_alerts_preserved' is distinct from 'true'::jsonb or p->'responsibilities_preserved' is distinct from 'true'::jsonb or p->'egregore_not_literalized' is distinct from 'true'::jsonb or p->'sustainable_rule_defined' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day068_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'sources_count'),false) or (p->>'sources_count')::int<3 then raise exception 'day068_sources_incomplete'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'fast_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'control_seconds'),false) then raise exception 'day068_duration_invalid'; end if; f=(p->>'fast_seconds')::int; c=(p->>'control_seconds')::int;
 if f<1 or c<1 or f>43200 or c>43200 then raise exception 'day068_duration_out_of_contract'; end if;
end $$;

create or replace function hnk_private.validate_day069_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day069_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','no_forced_repetition','no_extreme_speed','brainwave_claim_not_made','therapy_substitute_not_claimed','relevant_condition_guidance_respected','orientation_restored','safety_clear','repetitions_completed','active_seconds','control_seconds']) then raise exception 'day069_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'active_completed' is distinct from 'true'::jsonb or p->'control_completed' is distinct from 'true'::jsonb or p->'comparison_completed' is distinct from 'true'::jsonb or p->'no_forced_repetition' is distinct from 'true'::jsonb or p->'no_extreme_speed' is distinct from 'true'::jsonb or p->'brainwave_claim_not_made' is distinct from 'true'::jsonb or p->'therapy_substitute_not_claimed' is distinct from 'true'::jsonb or p->'relevant_condition_guidance_respected' is distinct from 'true'::jsonb or p->'orientation_restored' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day069_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'repetitions_completed'),false) or (p->>'repetitions_completed')::int<1 then raise exception 'day069_repetitions_incomplete'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'control_seconds'),false) or (p->>'active_seconds')::int<1 or (p->>'control_seconds')::int<1 then raise exception 'day069_duration_incomplete'; end if;
end $$;

create or replace function hnk_private.validate_day070_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day070_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','master_verified','upright_not_mirrored','three_positions_completed','control_completed','comparison_completed','invulnerability_not_claimed','real_safety_preserved','risk_measure_named','orientation_restored','safety_clear','tetragrammaton_master_id','active_seconds','control_seconds']) then raise exception 'day070_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'master_verified' is distinct from 'true'::jsonb or p->'upright_not_mirrored' is distinct from 'true'::jsonb or p->'three_positions_completed' is distinct from 'true'::jsonb or p->'control_completed' is distinct from 'true'::jsonb or p->'comparison_completed' is distinct from 'true'::jsonb or p->'invulnerability_not_claimed' is distinct from 'true'::jsonb or p->'real_safety_preserved' is distinct from 'true'::jsonb or p->'risk_measure_named' is distinct from 'true'::jsonb or p->'orientation_restored' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day070_required_flag_missing'; end if;
 if p->>'tetragrammaton_master_id' is distinct from 'pantaculo-tetragrammaton-hnk-master-v1.svg' then raise exception 'day070_master_mismatch'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'control_seconds'),false) or (p->>'active_seconds')::int<1 or (p->>'control_seconds')::int<1 then raise exception 'day070_duration_incomplete'; end if;
end $$;

create or replace function hnk_private.validate_day071_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day071_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','imaginary_flame_only','entity_diagnosis_not_claimed','anti_compulsion_rule_confirmed','no_repeat_to_neutralize_fear','practical_boundary_considered','vault_saved','orientation_restored','safety_clear','active_effect_present','control_effect_present','active_seconds','control_seconds']) then raise exception 'day071_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'active_completed' is distinct from 'true'::jsonb or p->'control_completed' is distinct from 'true'::jsonb or p->'comparison_completed' is distinct from 'true'::jsonb or p->'imaginary_flame_only' is distinct from 'true'::jsonb or p->'entity_diagnosis_not_claimed' is distinct from 'true'::jsonb or p->'anti_compulsion_rule_confirmed' is distinct from 'true'::jsonb or p->'no_repeat_to_neutralize_fear' is distinct from 'true'::jsonb or p->'practical_boundary_considered' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'orientation_restored' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day071_required_flag_missing'; end if;
 if jsonb_typeof(p->'active_effect_present') is distinct from 'boolean' or jsonb_typeof(p->'control_effect_present') is distinct from 'boolean' then raise exception 'day071_effect_flag_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'control_seconds'),false) or (p->>'active_seconds')::int<1 or (p->>'control_seconds')::int<1 then raise exception 'day071_duration_incomplete'; end if;
end $$;

revoke all on function hnk_private.validate_day067_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day068_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day069_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day070_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day071_scalar_evidence_v1(jsonb) from public,anon,authenticated;

create or replace function hnk_private.enforce_mebahel_067_071_scalar_evidence() returns trigger language plpgsql security definer set search_path='' as $$
declare existing boolean; sha text; st text; begin
 if new.day not in (67,68,69,70,71) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into existing; if existing then return new; end if;
 select source_sha,status into sha,st from public.codex_days where day=new.day; if st is distinct from 'canon' then raise exception 'mebahel_canonical_day_not_available'; end if;
 if new.day=67 then if sha is distinct from '1fe06968c724f74311e4fd567075fabc181f1125' then raise exception 'day067_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day067_scalar_evidence_v1(new.evidence);
 elsif new.day=68 then if sha is distinct from '176ebffccc845a909f5d1d2bdb88181b94809afb' then raise exception 'day068_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day068_scalar_evidence_v1(new.evidence);
 elsif new.day=69 then if sha is distinct from '5ec5e7ade94e1a20c348028d75517475a6920e5a' then raise exception 'day069_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day069_scalar_evidence_v1(new.evidence);
 elsif new.day=70 then if sha is distinct from 'bb1e47aee510fe9df58a46f697ebafb9005e223e' then raise exception 'day070_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day070_scalar_evidence_v1(new.evidence);
 else if sha is distinct from '6dfa6b5768bd7cdc2812d5dbfc68a8bc66ad90c3' then raise exception 'day071_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day071_scalar_evidence_v1(new.evidence); end if;
 return new;
end $$;
revoke all on function hnk_private.enforce_mebahel_067_071_scalar_evidence() from public,anon,authenticated;
drop trigger if exists practice_sessions_enforce_mebahel_067_071_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_mebahel_067_071_evidence before insert or update of state,evidence,day,user_id on public.practice_sessions for each row execute function hnk_private.enforce_mebahel_067_071_scalar_evidence();
