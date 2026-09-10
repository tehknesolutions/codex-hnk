-- Strict first-completion evidence for canonical Binah / Caliel Days 089-093.

create or replace function hnk_private.validate_day089_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day089_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','six_hour_window_completed','necessary_speech_allowed','necessary_speech_not_failure','care_work_health_consent_preserved','silence_not_used_as_punishment','others_not_coerced','return_to_speech_completed','anti_ascetic_scoring','safety_clear','necessary_speech_count','speech_impulse_count','monitoring_seconds']) then raise exception 'day089_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'six_hour_window_completed' is distinct from 'true'::jsonb or p->'necessary_speech_allowed' is distinct from 'true'::jsonb or p->'necessary_speech_not_failure' is distinct from 'true'::jsonb or p->'care_work_health_consent_preserved' is distinct from 'true'::jsonb or p->'silence_not_used_as_punishment' is distinct from 'true'::jsonb or p->'others_not_coerced' is distinct from 'true'::jsonb or p->'return_to_speech_completed' is distinct from 'true'::jsonb or p->'anti_ascetic_scoring' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day089_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'monitoring_seconds'),false) or (p->>'monitoring_seconds')::int<>21600 then raise exception 'day089_six_hours_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'necessary_speech_count'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'speech_impulse_count'),false) then raise exception 'day089_counts_invalid'; end if;
end $$;

create or replace function hnk_private.validate_day090_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day090_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','dispersion_reviewed','futile_conversation_reviewed','justified_lie_reviewed','idea_instability_reviewed','memory_not_fabricated','legitimate_light_conversation_preserved','legitimate_opinion_change_preserved','privacy_not_forced_open','manipulation_not_auto_justified','rumination_avoided','proportional_alternative_defined','vault_saved','safety_clear','dispersion_count','futile_conversation_count','justified_lie_count','idea_instability_count']) then raise exception 'day090_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'dispersion_reviewed' is distinct from 'true'::jsonb or p->'futile_conversation_reviewed' is distinct from 'true'::jsonb or p->'justified_lie_reviewed' is distinct from 'true'::jsonb or p->'idea_instability_reviewed' is distinct from 'true'::jsonb or p->'memory_not_fabricated' is distinct from 'true'::jsonb or p->'legitimate_light_conversation_preserved' is distinct from 'true'::jsonb or p->'legitimate_opinion_change_preserved' is distinct from 'true'::jsonb or p->'privacy_not_forced_open' is distinct from 'true'::jsonb or p->'manipulation_not_auto_justified' is distinct from 'true'::jsonb or p->'rumination_avoided' is distinct from 'true'::jsonb or p->'proportional_alternative_defined' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day090_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'dispersion_count'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'futile_conversation_count'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'justified_lie_count'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'idea_instability_count'),false) then raise exception 'day090_counts_invalid'; end if;
end $$;

create or replace function hnk_private.validate_day091_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day091_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','clarity_reviewed','precise_communication_reviewed','optimism_reviewed','learning_reviewed','evidence_or_gap_recorded','limits_recorded','no_intelligence_ranking','no_spiritual_superiority','difficulty_not_denied','feedback_space_preserved','proportional_application_defined','vault_saved','safety_clear','categories_reviewed','evidence_examples_count']) then raise exception 'day091_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'clarity_reviewed' is distinct from 'true'::jsonb or p->'precise_communication_reviewed' is distinct from 'true'::jsonb or p->'optimism_reviewed' is distinct from 'true'::jsonb or p->'learning_reviewed' is distinct from 'true'::jsonb or p->'evidence_or_gap_recorded' is distinct from 'true'::jsonb or p->'limits_recorded' is distinct from 'true'::jsonb or p->'no_intelligence_ranking' is distinct from 'true'::jsonb or p->'no_spiritual_superiority' is distinct from 'true'::jsonb or p->'difficulty_not_denied' is distinct from 'true'::jsonb or p->'feedback_space_preserved' is distinct from 'true'::jsonb or p->'proportional_application_defined' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day091_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'categories_reviewed'),false) or (p->>'categories_reviewed')::int<>4 then raise exception 'day091_four_categories_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'evidence_examples_count'),false) then raise exception 'day091_evidence_examples_invalid'; end if;
end $$;

create or replace function hnk_private.validate_day092_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day092_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','five_causal_claims_recorded','mechanisms_reviewed','alternatives_reviewed','evidence_strength_reviewed','real_causality_not_denied','dangerous_experiments_avoided','neuroplasticity_not_claimed_as_measured','spiritual_causality_not_auto_claimed','uncertainty_preserved','vault_saved','safety_clear','causal_claims_count']) then raise exception 'day092_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'five_causal_claims_recorded' is distinct from 'true'::jsonb or p->'mechanisms_reviewed' is distinct from 'true'::jsonb or p->'alternatives_reviewed' is distinct from 'true'::jsonb or p->'evidence_strength_reviewed' is distinct from 'true'::jsonb or p->'real_causality_not_denied' is distinct from 'true'::jsonb or p->'dangerous_experiments_avoided' is distinct from 'true'::jsonb or p->'neuroplasticity_not_claimed_as_measured' is distinct from 'true'::jsonb or p->'spiritual_causality_not_auto_claimed' is distinct from 'true'::jsonb or p->'uncertainty_preserved' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day092_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'causal_claims_count'),false) or (p->>'causal_claims_count')::int<>5 then raise exception 'day092_five_claims_required'; end if;
end $$;

create or replace function hnk_private.validate_day093_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; attempted boolean; stopped boolean; adaptation integer; reason integer; cycles integer; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day093_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','safety_preflight_received','voluntary_start_preserved','gentle_count_confirmed','no_maximal_breath','natural_breath_returned','no_driving_water_high_consequence','no_physiological_claims','no_endurance_scoring','safety_clear','attempted','safety_stop','adaptation_code','safety_stop_reason_code','completed_cycles']) then raise exception 'day093_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'safety_preflight_received' is distinct from 'true'::jsonb or p->'voluntary_start_preserved' is distinct from 'true'::jsonb or p->'gentle_count_confirmed' is distinct from 'true'::jsonb or p->'no_maximal_breath' is distinct from 'true'::jsonb or p->'natural_breath_returned' is distinct from 'true'::jsonb or p->'no_driving_water_high_consequence' is distinct from 'true'::jsonb or p->'no_physiological_claims' is distinct from 'true'::jsonb or p->'no_endurance_scoring' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day093_required_flag_missing'; end if;
 if jsonb_typeof(p->'attempted')<>'boolean' or jsonb_typeof(p->'safety_stop')<>'boolean' then raise exception 'day093_boolean_state_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'adaptation_code'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'safety_stop_reason_code'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'completed_cycles'),false) then raise exception 'day093_state_code_invalid'; end if;
 attempted:=(p->>'attempted')::boolean; stopped:=(p->>'safety_stop')::boolean; adaptation:=(p->>'adaptation_code')::int; reason:=(p->>'safety_stop_reason_code')::int; cycles:=(p->>'completed_cycles')::int;
 if adaptation not in (0,1) or reason not in (0,1,2,3) then raise exception 'day093_state_code_invalid'; end if;
 if adaptation=0 and (not attempted or stopped or reason<>0) then raise exception 'day093_canonical_state_inconsistent'; end if;
 if adaptation=1 and (not stopped or reason=0) then raise exception 'day093_adaptation_state_inconsistent'; end if;
 if not attempted and (adaptation<>1 or reason not in (2,3) or cycles<>0) then raise exception 'day093_pre_attempt_adaptation_inconsistent'; end if;
 if attempted and adaptation=1 and reason<>1 then raise exception 'day093_attempted_adaptation_reason_invalid'; end if;
end $$;

revoke all on function hnk_private.validate_day089_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day090_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day091_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day092_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day093_scalar_evidence_v1(jsonb) from public,anon,authenticated;

create or replace function hnk_private.enforce_caliel_089_093_scalar_evidence() returns trigger language plpgsql security definer set search_path='' as $$
declare existing boolean; sha text; st text; begin
 if new.day not in (89,90,91,92,93) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into existing; if existing then return new; end if;
 select source_sha,status into sha,st from public.codex_days where day=new.day; if st is distinct from 'canon' then raise exception 'caliel_canonical_day_not_available'; end if;
 if new.day=89 then if sha is distinct from 'dd664c8fb6e02060b5d30d417a63cd204e7ac95d' then raise exception 'day089_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day089_scalar_evidence_v1(new.evidence);
 elsif new.day=90 then if sha is distinct from 'd6197a2c11f64c32c36cb60f4d2b9d1645988aeb' then raise exception 'day090_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day090_scalar_evidence_v1(new.evidence);
 elsif new.day=91 then if sha is distinct from '356bc15e10eb5891414576f19358e291f0b8e2d8' then raise exception 'day091_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day091_scalar_evidence_v1(new.evidence);
 elsif new.day=92 then if sha is distinct from '43a6471da8f3fda575e0d9b5cfaf7432a62bfd02' then raise exception 'day092_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day092_scalar_evidence_v1(new.evidence);
 else if sha is distinct from '293b2f65bb1209f8be0efb19aaca6af7228bc7d3' then raise exception 'day093_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day093_scalar_evidence_v1(new.evidence); end if;
 return new;
end $$;
revoke all on function hnk_private.enforce_caliel_089_093_scalar_evidence() from public,anon,authenticated;
drop trigger if exists practice_sessions_enforce_caliel_089_093_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_caliel_089_093_evidence before insert or update of state,evidence,day,user_id on public.practice_sessions for each row execute function hnk_private.enforce_caliel_089_093_scalar_evidence();
