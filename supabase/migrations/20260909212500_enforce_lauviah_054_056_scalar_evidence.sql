-- Strict first-completion evidence for canonical Lauviah Days 054-056.
-- Raw audio and narrative/VAKOG prose remain outside Practice Record.

create or replace function hnk_private.validate_day054_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day054_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','script_prepared','targets_predeclared','active_recording_completed',
      'control_recording_completed','local_analysis_completed','raw_audio_not_uploaded','comparison_completed',
      'interpretation_separated','consent_only','subconscious_access_not_claimed','safety_clear','target_words_marked'
    ]) then raise exception 'day054_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'script_prepared' is distinct from 'true'::jsonb
     or p_evidence->'targets_predeclared' is distinct from 'true'::jsonb
     or p_evidence->'active_recording_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_recording_completed' is distinct from 'true'::jsonb
     or p_evidence->'local_analysis_completed' is distinct from 'true'::jsonb
     or p_evidence->'raw_audio_not_uploaded' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'consent_only' is distinct from 'true'::jsonb
     or p_evidence->'subconscious_access_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day054_required_flag_missing'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'target_words_marked'),false)
     or (p_evidence->>'target_words_marked')::integer < 1
  then raise exception 'day054_target_count_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day055_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day055_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','target_selected_before_practice','vakog_preregistered','preregister_sealed',
      'verification_after_preregister','control_completed','memory_prior_recognized','coincidence_kept_open',
      'nonlocal_perception_not_claimed','risk_decision_not_used','vault_saved','safety_clear',
      'primary_correspondence_present','control_correspondence_present','primary_seconds'
    ]) then raise exception 'day055_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'target_selected_before_practice' is distinct from 'true'::jsonb
     or p_evidence->'vakog_preregistered' is distinct from 'true'::jsonb
     or p_evidence->'preregister_sealed' is distinct from 'true'::jsonb
     or p_evidence->'verification_after_preregister' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'memory_prior_recognized' is distinct from 'true'::jsonb
     or p_evidence->'coincidence_kept_open' is distinct from 'true'::jsonb
     or p_evidence->'nonlocal_perception_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'risk_decision_not_used' is distinct from 'true'::jsonb
     or p_evidence->'vault_saved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day055_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'primary_correspondence_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_correspondence_present') is distinct from 'boolean'
  then raise exception 'day055_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'primary_seconds'),false)
     or (p_evidence->>'primary_seconds')::integer < 600
  then raise exception 'day055_duration_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day056_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day056_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed',
      'interpretation_separated','no_hyperventilation','no_prolonged_retention','clinical_substitute_not_claimed',
      'entity_contamination_not_reinforced','null_results_preserved','safety_clear','active_effect_present','control_effect_present'
    ]) then raise exception 'day056_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'active_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'no_hyperventilation' is distinct from 'true'::jsonb
     or p_evidence->'no_prolonged_retention' is distinct from 'true'::jsonb
     or p_evidence->'clinical_substitute_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'entity_contamination_not_reinforced' is distinct from 'true'::jsonb
     or p_evidence->'null_results_preserved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day056_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'active_effect_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_effect_present') is distinct from 'boolean'
  then raise exception 'day056_presence_flag_invalid'; end if;
end; $$;

revoke all on function hnk_private.validate_day054_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day055_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day056_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_lauviah_054_056_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day not in (54,55,56) or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
  if v_status is distinct from 'canon' then raise exception 'lauviah_canonical_day_not_available'; end if;
  if new.day=54 then
    if v_source_sha is distinct from '5ea33f99975868290d5371c8c1ac67f6de4b9c69' then raise exception 'day054_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day054_scalar_evidence_v1(new.evidence);
  elsif new.day=55 then
    if v_source_sha is distinct from '03dce9f662c05cb720bce4419f58126031ca9be6' then raise exception 'day055_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day055_scalar_evidence_v1(new.evidence);
  else
    if v_source_sha is distinct from '9eb847d460768615d2e6fb9173c2557a21c705c7' then raise exception 'day056_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day056_scalar_evidence_v1(new.evidence);
  end if;
  return new;
end; $$;

revoke all on function hnk_private.enforce_lauviah_054_056_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_lauviah_054_056_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_lauviah_054_056_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_lauviah_054_056_scalar_evidence();
