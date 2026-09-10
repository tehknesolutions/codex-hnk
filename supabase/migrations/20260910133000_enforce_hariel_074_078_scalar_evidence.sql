-- Strict first-completion evidence for canonical Binah / Hariel Days 074-078.

create or replace function hnk_private.validate_day074_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day074_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','three_accusations_recorded','three_reformulations_recorded','fact_inference_separated','uncertainty_preserved','false_memory_not_claimed','diagnosis_not_claimed','responsibility_preserved','vault_saved','safety_clear','accusations_count','reformulations_count']) then raise exception 'day074_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'three_accusations_recorded' is distinct from 'true'::jsonb or p->'three_reformulations_recorded' is distinct from 'true'::jsonb or p->'fact_inference_separated' is distinct from 'true'::jsonb or p->'uncertainty_preserved' is distinct from 'true'::jsonb or p->'false_memory_not_claimed' is distinct from 'true'::jsonb or p->'diagnosis_not_claimed' is distinct from 'true'::jsonb or p->'responsibility_preserved' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day074_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'accusations_count'),false) or (p->>'accusations_count')::int<>3 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'reformulations_count'),false) or (p->>'reformulations_count')::int<>3 then raise exception 'day074_three_items_required'; end if;
end $$;

create or replace function hnk_private.validate_day075_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day075_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','five_verbs_recorded','five_operational_definitions_recorded','five_criteria_recorded','unknowns_allowed','next_action_defined','productivity_compulsion_avoided','personal_value_not_scored','vault_saved','safety_clear','verbs_count','operational_definitions_count','criteria_count']) then raise exception 'day075_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'five_verbs_recorded' is distinct from 'true'::jsonb or p->'five_operational_definitions_recorded' is distinct from 'true'::jsonb or p->'five_criteria_recorded' is distinct from 'true'::jsonb or p->'unknowns_allowed' is distinct from 'true'::jsonb or p->'next_action_defined' is distinct from 'true'::jsonb or p->'productivity_compulsion_avoided' is distinct from 'true'::jsonb or p->'personal_value_not_scored' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day075_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'verbs_count'),false) or (p->>'verbs_count')::int<>5 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'operational_definitions_count'),false) or (p->>'operational_definitions_count')::int<>5 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'criteria_count'),false) or (p->>'criteria_count')::int<>5 then raise exception 'day075_five_items_required'; end if;
end $$;

create or replace function hnk_private.validate_day076_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day076_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','five_comparisons_recorded','references_identified','criteria_identified','useful_comparison_defined','one_comparison_abandoned','third_party_inner_state_not_inferred','no_spiritual_ranking','third_party_identity_not_sent','vault_saved','safety_clear','comparisons_count','references_count','criteria_count']) then raise exception 'day076_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'five_comparisons_recorded' is distinct from 'true'::jsonb or p->'references_identified' is distinct from 'true'::jsonb or p->'criteria_identified' is distinct from 'true'::jsonb or p->'useful_comparison_defined' is distinct from 'true'::jsonb or p->'one_comparison_abandoned' is distinct from 'true'::jsonb or p->'third_party_inner_state_not_inferred' is distinct from 'true'::jsonb or p->'no_spiritual_ranking' is distinct from 'true'::jsonb or p->'third_party_identity_not_sent' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day076_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'comparisons_count'),false) or (p->>'comparisons_count')::int<>5 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'references_count'),false) or (p->>'references_count')::int<>5 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'criteria_count'),false) or (p->>'criteria_count')::int<>5 then raise exception 'day076_five_items_required'; end if;
end $$;

create or replace function hnk_private.validate_day077_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day077_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','three_hour_window_completed','own_language_only','no_recording_of_third_parties','privacy_preserved','interrogation_avoided','legitimate_silence_identified','ethical_rule_defined','vault_saved','monitoring_ended','safety_clear','monitoring_seconds','reformulations_count']) then raise exception 'day077_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'three_hour_window_completed' is distinct from 'true'::jsonb or p->'own_language_only' is distinct from 'true'::jsonb or p->'no_recording_of_third_parties' is distinct from 'true'::jsonb or p->'privacy_preserved' is distinct from 'true'::jsonb or p->'interrogation_avoided' is distinct from 'true'::jsonb or p->'legitimate_silence_identified' is distinct from 'true'::jsonb or p->'ethical_rule_defined' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'monitoring_ended' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day077_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'monitoring_seconds'),false) or (p->>'monitoring_seconds')::int<>10800 then raise exception 'day077_three_hours_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'reformulations_count'),false) then raise exception 'day077_reformulations_invalid'; end if;
end $$;

create or replace function hnk_private.validate_day078_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day078_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','silence_practice_completed','thought_suppression_not_required','zero_thought_goal_rejected','natural_breath_preserved','important_content_not_ignored','anti_compulsion_rule_confirmed','orientation_restored','safety_clear','practice_seconds','attention_returns']) then raise exception 'day078_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'silence_practice_completed' is distinct from 'true'::jsonb or p->'thought_suppression_not_required' is distinct from 'true'::jsonb or p->'zero_thought_goal_rejected' is distinct from 'true'::jsonb or p->'natural_breath_preserved' is distinct from 'true'::jsonb or p->'important_content_not_ignored' is distinct from 'true'::jsonb or p->'anti_compulsion_rule_confirmed' is distinct from 'true'::jsonb or p->'orientation_restored' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day078_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'practice_seconds'),false) or (p->>'practice_seconds')::int<1 then raise exception 'day078_practice_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'attention_returns'),false) then raise exception 'day078_attention_returns_invalid'; end if;
end $$;

revoke all on function hnk_private.validate_day074_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day075_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day076_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day077_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day078_scalar_evidence_v1(jsonb) from public,anon,authenticated;

create or replace function hnk_private.enforce_hariel_074_078_scalar_evidence() returns trigger language plpgsql security definer set search_path='' as $$
declare existing boolean; sha text; st text; begin
 if new.day not in (74,75,76,77,78) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into existing; if existing then return new; end if;
 select source_sha,status into sha,st from public.codex_days where day=new.day; if st is distinct from 'canon' then raise exception 'hariel_canonical_day_not_available'; end if;
 if new.day=74 then if sha is distinct from '41abcd70bb9a5f98736b863883c89ca166c13cb8' then raise exception 'day074_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day074_scalar_evidence_v1(new.evidence);
 elsif new.day=75 then if sha is distinct from '48eb5fe1a17ef333623b9bfd23b511f81897a833' then raise exception 'day075_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day075_scalar_evidence_v1(new.evidence);
 elsif new.day=76 then if sha is distinct from '165821d942795ad7e7f01dec0da1f73c3d84ccdb' then raise exception 'day076_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day076_scalar_evidence_v1(new.evidence);
 elsif new.day=77 then if sha is distinct from '9dbb35e936b49829bd6b99b66017a189678dba13' then raise exception 'day077_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day077_scalar_evidence_v1(new.evidence);
 else if sha is distinct from '7e10777607778e29ada5983ef69ca4871f4ebb24' then raise exception 'day078_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day078_scalar_evidence_v1(new.evidence); end if;
 return new;
end $$;
revoke all on function hnk_private.enforce_hariel_074_078_scalar_evidence() from public,anon,authenticated;
drop trigger if exists practice_sessions_enforce_hariel_074_078_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_hariel_074_078_evidence before insert or update of state,evidence,day,user_id on public.practice_sessions for each row execute function hnk_private.enforce_hariel_074_078_scalar_evidence();
