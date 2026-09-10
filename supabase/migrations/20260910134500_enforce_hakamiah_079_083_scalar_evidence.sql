-- Strict first-completion evidence for canonical Binah / Hakamiah Days 079-083.

create or replace function hnk_private.validate_day079_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day079_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','master_verified','asset_sha_verified','upright_not_mirrored','visualization_completed','visualization_dissolved','attack_not_claimed','invulnerability_not_claimed','third_party_accusation_avoided','concrete_safety_preserved','safety_clear','effect_present','active_seconds']) then raise exception 'day079_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'master_verified' is distinct from 'true'::jsonb or p->'asset_sha_verified' is distinct from 'true'::jsonb or p->'upright_not_mirrored' is distinct from 'true'::jsonb or p->'visualization_completed' is distinct from 'true'::jsonb or p->'visualization_dissolved' is distinct from 'true'::jsonb or p->'attack_not_claimed' is distinct from 'true'::jsonb or p->'invulnerability_not_claimed' is distinct from 'true'::jsonb or p->'third_party_accusation_avoided' is distinct from 'true'::jsonb or p->'concrete_safety_preserved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day079_required_flag_missing'; end if;
 if jsonb_typeof(p->'effect_present')<>'boolean' then raise exception 'day079_effect_boolean_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or (p->>'active_seconds')::int<1 then raise exception 'day079_practice_required'; end if;
end $$;

create or replace function hnk_private.validate_day080_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day080_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','five_rules_recorded','sources_recorded','consequences_recorded','classifications_recorded','one_rule_maintained','one_rule_reformulated','one_rule_questioned','legal_family_professional_safety_duties_preserved','third_party_reaction_not_inferred','automatic_rebellion_avoided','vault_saved','safety_clear','rules_count','classifications_count']) then raise exception 'day080_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'five_rules_recorded' is distinct from 'true'::jsonb or p->'sources_recorded' is distinct from 'true'::jsonb or p->'consequences_recorded' is distinct from 'true'::jsonb or p->'classifications_recorded' is distinct from 'true'::jsonb or p->'one_rule_maintained' is distinct from 'true'::jsonb or p->'one_rule_reformulated' is distinct from 'true'::jsonb or p->'one_rule_questioned' is distinct from 'true'::jsonb or p->'legal_family_professional_safety_duties_preserved' is distinct from 'true'::jsonb or p->'third_party_reaction_not_inferred' is distinct from 'true'::jsonb or p->'automatic_rebellion_avoided' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day080_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'rules_count'),false) or (p->>'rules_count')::int<>5 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'classifications_count'),false) or (p->>'classifications_count')::int<>5 then raise exception 'day080_five_rules_required'; end if;
end $$;

create or replace function hnk_private.validate_day081_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day081_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','three_limitations_recorded','impediments_recorded','classifications_recorded','unsafe_tests_avoided','medical_limits_respected','universal_overcoming_not_claimed','safe_path_selected','vault_saved','safety_clear','microtest_performed','alternative_path_used','limitations_count','classifications_count']) then raise exception 'day081_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'three_limitations_recorded' is distinct from 'true'::jsonb or p->'impediments_recorded' is distinct from 'true'::jsonb or p->'classifications_recorded' is distinct from 'true'::jsonb or p->'unsafe_tests_avoided' is distinct from 'true'::jsonb or p->'medical_limits_respected' is distinct from 'true'::jsonb or p->'universal_overcoming_not_claimed' is distinct from 'true'::jsonb or p->'safe_path_selected' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day081_required_flag_missing'; end if;
 if jsonb_typeof(p->'microtest_performed')<>'boolean' or jsonb_typeof(p->'alternative_path_used')<>'boolean' then raise exception 'day081_path_boolean_required'; end if;
 if p->'microtest_performed' is distinct from 'true'::jsonb and p->'alternative_path_used' is distinct from 'true'::jsonb then raise exception 'day081_safe_path_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'limitations_count'),false) or (p->>'limitations_count')::int<>3 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'classifications_count'),false) or (p->>'classifications_count')::int<>3 then raise exception 'day081_three_limitations_required'; end if;
end $$;

create or replace function hnk_private.validate_day082_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day082_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','five_universals_recorded','counterexamples_recorded','periods_recorded','five_rewrites_recorded','frequent_pattern_not_erased','sparse_data_uncertainty_preserved','statistical_certainty_not_claimed','responsibility_preserved','vault_saved','safety_clear','universals_count','rewrites_count']) then raise exception 'day082_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'five_universals_recorded' is distinct from 'true'::jsonb or p->'counterexamples_recorded' is distinct from 'true'::jsonb or p->'periods_recorded' is distinct from 'true'::jsonb or p->'five_rewrites_recorded' is distinct from 'true'::jsonb or p->'frequent_pattern_not_erased' is distinct from 'true'::jsonb or p->'sparse_data_uncertainty_preserved' is distinct from 'true'::jsonb or p->'statistical_certainty_not_claimed' is distinct from 'true'::jsonb or p->'responsibility_preserved' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day082_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'universals_count'),false) or (p->>'universals_count')::int<>5 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'rewrites_count'),false) or (p->>'rewrites_count')::int<>5 then raise exception 'day082_five_rewrites_required'; end if;
end $$;

create or replace function hnk_private.validate_day083_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; path_code integer; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day083_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','space_checked','exit_unobstructed','floor_stable','child_animal_safe','material_or_fallback_completed','fallback_truthfully_labeled','ritual_ended','cleanup_completed','material_movement_not_interpreted_as_intrusion','symbolic_protection_not_substitute_for_safety','anti_compulsion_rule_confirmed','concrete_boundary_named','orientation_restored','safety_clear','material_path_code','effect_present','active_seconds']) then raise exception 'day083_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'space_checked' is distinct from 'true'::jsonb or p->'exit_unobstructed' is distinct from 'true'::jsonb or p->'floor_stable' is distinct from 'true'::jsonb or p->'child_animal_safe' is distinct from 'true'::jsonb or p->'material_or_fallback_completed' is distinct from 'true'::jsonb or p->'fallback_truthfully_labeled' is distinct from 'true'::jsonb or p->'ritual_ended' is distinct from 'true'::jsonb or p->'cleanup_completed' is distinct from 'true'::jsonb or p->'material_movement_not_interpreted_as_intrusion' is distinct from 'true'::jsonb or p->'symbolic_protection_not_substitute_for_safety' is distinct from 'true'::jsonb or p->'anti_compulsion_rule_confirmed' is distinct from 'true'::jsonb or p->'concrete_boundary_named' is distinct from 'true'::jsonb or p->'orientation_restored' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day083_required_flag_missing'; end if;
 if jsonb_typeof(p->'effect_present')<>'boolean' then raise exception 'day083_effect_boolean_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'material_path_code'),false) then raise exception 'day083_material_path_invalid'; end if; path_code:=(p->>'material_path_code')::int; if path_code not in (1,2,3) then raise exception 'day083_material_path_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or (p->>'active_seconds')::int<1 then raise exception 'day083_practice_required'; end if;
end $$;

revoke all on function hnk_private.validate_day079_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day080_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day081_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day082_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day083_scalar_evidence_v1(jsonb) from public,anon,authenticated;

create or replace function hnk_private.enforce_hakamiah_079_083_scalar_evidence() returns trigger language plpgsql security definer set search_path='' as $$
declare existing boolean; sha text; st text; begin
 if new.day not in (79,80,81,82,83) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into existing; if existing then return new; end if;
 select source_sha,status into sha,st from public.codex_days where day=new.day; if st is distinct from 'canon' then raise exception 'hakamiah_canonical_day_not_available'; end if;
 if new.day=79 then if sha is distinct from '84a0c0b1445d93e6c05cf76c15f8a34e0300fef6' then raise exception 'day079_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day079_scalar_evidence_v1(new.evidence);
 elsif new.day=80 then if sha is distinct from 'c56b8aa84ac5184ec927a1f8dee9f96d04d00dd8' then raise exception 'day080_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day080_scalar_evidence_v1(new.evidence);
 elsif new.day=81 then if sha is distinct from '2d578f1f1369b7b71bc2cab861242f1d19d39b61' then raise exception 'day081_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day081_scalar_evidence_v1(new.evidence);
 elsif new.day=82 then if sha is distinct from '3429025bf627cf6e9954153872e69c777baf8838' then raise exception 'day082_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day082_scalar_evidence_v1(new.evidence);
 else if sha is distinct from '7b96756fd1b827af4d268328a0b4398598b2acea' then raise exception 'day083_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day083_scalar_evidence_v1(new.evidence); end if;
 return new;
end $$;
revoke all on function hnk_private.enforce_hakamiah_079_083_scalar_evidence() from public,anon,authenticated;
drop trigger if exists practice_sessions_enforce_hakamiah_079_083_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_hakamiah_079_083_evidence before insert or update of state,evidence,day,user_id on public.practice_sessions for each row execute function hnk_private.enforce_hakamiah_079_083_scalar_evidence();
