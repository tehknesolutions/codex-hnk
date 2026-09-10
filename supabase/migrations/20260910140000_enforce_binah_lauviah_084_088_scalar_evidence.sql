-- Strict first-completion evidence for canonical Binah / Lauviah Days 084-088.

create or replace function hnk_private.validate_day084_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; path_code integer; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day084_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','setup_checked','mirror_practice_completed','blinking_allowed','voluntary_stop_available','objective_entity_not_claimed','diagnosis_not_claimed','intensity_not_scored','fire_safety_preserved','electric_fallback_truthfully_labeled','orientation_restored','safety_clear','illumination_path_code','effect_present','comparison_used','active_seconds']) then raise exception 'day084_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'setup_checked' is distinct from 'true'::jsonb or p->'mirror_practice_completed' is distinct from 'true'::jsonb or p->'blinking_allowed' is distinct from 'true'::jsonb or p->'voluntary_stop_available' is distinct from 'true'::jsonb or p->'objective_entity_not_claimed' is distinct from 'true'::jsonb or p->'diagnosis_not_claimed' is distinct from 'true'::jsonb or p->'intensity_not_scored' is distinct from 'true'::jsonb or p->'fire_safety_preserved' is distinct from 'true'::jsonb or p->'electric_fallback_truthfully_labeled' is distinct from 'true'::jsonb or p->'orientation_restored' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day084_required_flag_missing'; end if;
 if jsonb_typeof(p->'effect_present')<>'boolean' or jsonb_typeof(p->'comparison_used')<>'boolean' then raise exception 'day084_observation_boolean_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'illumination_path_code'),false) then raise exception 'day084_illumination_path_invalid'; end if; path_code:=(p->>'illumination_path_code')::int; if path_code not in (1,2) then raise exception 'day084_illumination_path_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or (p->>'active_seconds')::int<1 then raise exception 'day084_practice_required'; end if;
end $$;

create or replace function hnk_private.validate_day085_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; field text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day085_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','year_review_completed','anger_reviewed','impatience_reviewed','spiritual_pride_reviewed','intellectual_arrogance_reviewed','memory_not_fabricated','uncertainty_preserved','emotion_behavior_identity_separated','rumination_avoided','safe_repair_considered','vault_saved','safety_clear','anger_count','impatience_count','spiritual_pride_count','intellectual_arrogance_count']) then raise exception 'day085_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'year_review_completed' is distinct from 'true'::jsonb or p->'anger_reviewed' is distinct from 'true'::jsonb or p->'impatience_reviewed' is distinct from 'true'::jsonb or p->'spiritual_pride_reviewed' is distinct from 'true'::jsonb or p->'intellectual_arrogance_reviewed' is distinct from 'true'::jsonb or p->'memory_not_fabricated' is distinct from 'true'::jsonb or p->'uncertainty_preserved' is distinct from 'true'::jsonb or p->'emotion_behavior_identity_separated' is distinct from 'true'::jsonb or p->'rumination_avoided' is distinct from 'true'::jsonb or p->'safe_repair_considered' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day085_required_flag_missing'; end if;
 foreach field in array array['anger_count','impatience_count','spiritual_pride_count','intellectual_arrogance_count'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->field),false) then raise exception 'day085_count_invalid'; end if; end loop;
end $$;

create or replace function hnk_private.validate_day086_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day086_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','initiative_reviewed','courage_reviewed','mental_dynamism_reviewed','vigorous_devotion_reviewed','evidence_or_gap_recorded','limits_recorded','no_spiritual_ranking','no_superiority_claim','rest_and_consent_preserved','proportional_application_defined','vault_saved','safety_clear','categories_reviewed','evidence_examples_count']) then raise exception 'day086_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'initiative_reviewed' is distinct from 'true'::jsonb or p->'courage_reviewed' is distinct from 'true'::jsonb or p->'mental_dynamism_reviewed' is distinct from 'true'::jsonb or p->'vigorous_devotion_reviewed' is distinct from 'true'::jsonb or p->'evidence_or_gap_recorded' is distinct from 'true'::jsonb or p->'limits_recorded' is distinct from 'true'::jsonb or p->'no_spiritual_ranking' is distinct from 'true'::jsonb or p->'no_superiority_claim' is distinct from 'true'::jsonb or p->'rest_and_consent_preserved' is distinct from 'true'::jsonb or p->'proportional_application_defined' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day086_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'categories_reviewed'),false) or (p->>'categories_reviewed')::int<>4 then raise exception 'day086_four_categories_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'evidence_examples_count'),false) then raise exception 'day086_evidence_count_invalid'; end if;
end $$;

create or replace function hnk_private.validate_day087_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day087_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','three_hypotheses_recorded','evidence_types_separated','direct_speech_not_erased','inference_named_as_inference','unknown_acknowledged','privacy_preserved','no_surveillance','no_compulsive_interrogation','third_party_identity_not_sent','vault_saved','safety_clear','hypotheses_count']) then raise exception 'day087_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'three_hypotheses_recorded' is distinct from 'true'::jsonb or p->'evidence_types_separated' is distinct from 'true'::jsonb or p->'direct_speech_not_erased' is distinct from 'true'::jsonb or p->'inference_named_as_inference' is distinct from 'true'::jsonb or p->'unknown_acknowledged' is distinct from 'true'::jsonb or p->'privacy_preserved' is distinct from 'true'::jsonb or p->'no_surveillance' is distinct from 'true'::jsonb or p->'no_compulsive_interrogation' is distinct from 'true'::jsonb or p->'third_party_identity_not_sent' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day087_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'hypotheses_count'),false) or (p->>'hypotheses_count')::int<>3 then raise exception 'day087_three_hypotheses_required'; end if;
end $$;

create or replace function hnk_private.validate_day088_scalar_evidence_v1(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; pre_i integer; post_i integer; begin
 if p is null or p='{}'::jsonb or jsonb_typeof(p)<>'object' then raise exception 'day088_evidence_required'; end if;
 for k in select jsonb_object_keys(p) loop if k <> all(array['protocol_completed','return_confirmed','manageable_memory_selected','current_danger_absent','natural_breath_preserved','no_forced_retention','visualization_completed','anger_reason_not_erased','intensity_drop_not_required','high_stakes_action_deferred_if_activated','energy_transfer_not_claimed','safe_action_defined','vault_saved','orientation_restored','safety_clear','pre_intensity','post_intensity','active_seconds']) then raise exception 'day088_evidence_unknown_field'; end if; end loop;
 if p->'protocol_completed' is distinct from 'true'::jsonb or p->'return_confirmed' is distinct from 'true'::jsonb or p->'manageable_memory_selected' is distinct from 'true'::jsonb or p->'current_danger_absent' is distinct from 'true'::jsonb or p->'natural_breath_preserved' is distinct from 'true'::jsonb or p->'no_forced_retention' is distinct from 'true'::jsonb or p->'visualization_completed' is distinct from 'true'::jsonb or p->'anger_reason_not_erased' is distinct from 'true'::jsonb or p->'intensity_drop_not_required' is distinct from 'true'::jsonb or p->'high_stakes_action_deferred_if_activated' is distinct from 'true'::jsonb or p->'energy_transfer_not_claimed' is distinct from 'true'::jsonb or p->'safe_action_defined' is distinct from 'true'::jsonb or p->'vault_saved' is distinct from 'true'::jsonb or p->'orientation_restored' is distinct from 'true'::jsonb or p->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day088_required_flag_missing'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'pre_intensity'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'post_intensity'),false) then raise exception 'day088_intensity_invalid'; end if; pre_i:=(p->>'pre_intensity')::int; post_i:=(p->>'post_intensity')::int; if pre_i>10 or post_i>10 then raise exception 'day088_intensity_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'),false) or (p->>'active_seconds')::int<1 then raise exception 'day088_practice_required'; end if;
 -- Deliberately no post<pre requirement: no XP depends on calming down.
end $$;

revoke all on function hnk_private.validate_day084_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day085_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day086_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day087_scalar_evidence_v1(jsonb) from public,anon,authenticated;
revoke all on function hnk_private.validate_day088_scalar_evidence_v1(jsonb) from public,anon,authenticated;

create or replace function hnk_private.enforce_binah_lauviah_084_088_scalar_evidence() returns trigger language plpgsql security definer set search_path='' as $$
declare existing boolean; sha text; st text; begin
 if new.day not in (84,85,86,87,88) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into existing; if existing then return new; end if;
 select source_sha,status into sha,st from public.codex_days where day=new.day; if st is distinct from 'canon' then raise exception 'binah_lauviah_canonical_day_not_available'; end if;
 if new.day=84 then if sha is distinct from '01d26332f0ce92d5c89fefc62c44dfd5051fdb7b' then raise exception 'day084_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day084_scalar_evidence_v1(new.evidence);
 elsif new.day=85 then if sha is distinct from '28048b337092c20989fe96252c4baf09d495b271' then raise exception 'day085_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day085_scalar_evidence_v1(new.evidence);
 elsif new.day=86 then if sha is distinct from 'bce3886fed360aedf87c57ca87e5c535a82f82a9' then raise exception 'day086_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day086_scalar_evidence_v1(new.evidence);
 elsif new.day=87 then if sha is distinct from '6561d3ec143a27648c406c2664071194560c15c5' then raise exception 'day087_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day087_scalar_evidence_v1(new.evidence);
 else if sha is distinct from 'ad546b6a512dbe086b05da7a4e508913d7d2c249' then raise exception 'day088_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day088_scalar_evidence_v1(new.evidence); end if;
 return new;
end $$;
revoke all on function hnk_private.enforce_binah_lauviah_084_088_scalar_evidence() from public,anon,authenticated;
drop trigger if exists practice_sessions_enforce_binah_lauviah_084_088_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_binah_lauviah_084_088_evidence before insert or update of state,evidence,day,user_id on public.practice_sessions for each row execute function hnk_private.enforce_binah_lauviah_084_088_scalar_evidence();
