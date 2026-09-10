-- Strict first-completion evidence for canonical Hahaiah Days 057-061.
-- Relational/private prose remains encrypted in Vault; Practice Record stays structured.

create or replace function hnk_private.validate_day057_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day057_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','partner_consent','closed_set_defined','target_preregistered',
      'receiver_response_preregistered','feedback_after_response','control_completed','errors_included','possible_cues_logged',
      'telepathy_not_claimed','high_impact_not_used','vault_saved','safety_clear','active_match','control_match','target_set_size'
    ]) then raise exception 'day057_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'partner_consent' is distinct from 'true'::jsonb
     or p_evidence->'closed_set_defined' is distinct from 'true'::jsonb
     or p_evidence->'target_preregistered' is distinct from 'true'::jsonb
     or p_evidence->'receiver_response_preregistered' is distinct from 'true'::jsonb
     or p_evidence->'feedback_after_response' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'errors_included' is distinct from 'true'::jsonb
     or p_evidence->'possible_cues_logged' is distinct from 'true'::jsonb
     or p_evidence->'telepathy_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'high_impact_not_used' is distinct from 'true'::jsonb
     or p_evidence->'vault_saved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day057_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'active_match') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_match') is distinct from 'boolean'
  then raise exception 'day057_match_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'target_set_size'),false)
     or (p_evidence->>'target_set_size')::integer < 2
  then raise exception 'day057_target_set_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day058_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day058_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','self_use_only','three_scripts_completed','real_refusal_option_present',
      'direct_comparison_completed','comparison_completed','autonomy_preserved','no_clinical_promise','no_covert_command',
      'no_high_impact_use','vault_saved','safety_clear','scripts_logged'
    ]) then raise exception 'day058_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'self_use_only' is distinct from 'true'::jsonb
     or p_evidence->'three_scripts_completed' is distinct from 'true'::jsonb
     or p_evidence->'real_refusal_option_present' is distinct from 'true'::jsonb
     or p_evidence->'direct_comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'autonomy_preserved' is distinct from 'true'::jsonb
     or p_evidence->'no_clinical_promise' is distinct from 'true'::jsonb
     or p_evidence->'no_covert_command' is distinct from 'true'::jsonb
     or p_evidence->'no_high_impact_use' is distinct from 'true'::jsonb
     or p_evidence->'vault_saved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day058_required_flag_missing'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'scripts_logged'),false)
     or (p_evidence->>'scripts_logged')::integer < 3
  then raise exception 'day058_scripts_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day059_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day059_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','blue_completed','gray_completed','comparison_completed','interpretation_separated',
      'clarivoyance_not_claimed','reason_preserved','safety_clear','blue_image_present','gray_image_present','blue_seconds','gray_seconds'
    ]) then raise exception 'day059_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'blue_completed' is distinct from 'true'::jsonb
     or p_evidence->'gray_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'clarivoyance_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'reason_preserved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day059_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'blue_image_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'gray_image_present') is distinct from 'boolean'
  then raise exception 'day059_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'blue_seconds'),false)
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'gray_seconds'),false)
     or (p_evidence->>'blue_seconds')::integer < 1
     or (p_evidence->>'gray_seconds')::integer < 1
  then raise exception 'day059_duration_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day060_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day060_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','five_public_observations_completed','camera_not_used','identity_not_stored',
      'partner_consent','partner_comparison_completed','diagnosis_not_claimed','mind_reading_not_claimed','vulnerable_people_not_targeted',
      'vault_saved','safety_clear','public_observations_count'
    ]) then raise exception 'day060_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'five_public_observations_completed' is distinct from 'true'::jsonb
     or p_evidence->'camera_not_used' is distinct from 'true'::jsonb
     or p_evidence->'identity_not_stored' is distinct from 'true'::jsonb
     or p_evidence->'partner_consent' is distinct from 'true'::jsonb
     or p_evidence->'partner_comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'diagnosis_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'mind_reading_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'vulnerable_people_not_targeted' is distinct from 'true'::jsonb
     or p_evidence->'vault_saved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day060_required_flag_missing'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'public_observations_count'),false)
     or (p_evidence->>'public_observations_count')::integer < 5
  then raise exception 'day060_observations_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day061_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day061_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','baseline_completed','manual_reorganization_completed','after_window_completed',
      'comparison_completed','critical_alerts_preserved','security_auth_preserved','family_emergency_preserved',
      'no_automatic_critical_change','sustainable_configuration_selected','review_time_selected','safety_clear',
      'interruptions_before','interruptions_after','unlocks_before','unlocks_after'
    ]) then raise exception 'day061_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'baseline_completed' is distinct from 'true'::jsonb
     or p_evidence->'manual_reorganization_completed' is distinct from 'true'::jsonb
     or p_evidence->'after_window_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'critical_alerts_preserved' is distinct from 'true'::jsonb
     or p_evidence->'security_auth_preserved' is distinct from 'true'::jsonb
     or p_evidence->'family_emergency_preserved' is distinct from 'true'::jsonb
     or p_evidence->'no_automatic_critical_change' is distinct from 'true'::jsonb
     or p_evidence->'sustainable_configuration_selected' is distinct from 'true'::jsonb
     or p_evidence->'review_time_selected' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day061_required_flag_missing'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'interruptions_before'),false)
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'interruptions_after'),false)
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'unlocks_before'),false)
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'unlocks_after'),false)
  then raise exception 'day061_count_invalid'; end if;
end; $$;

revoke all on function hnk_private.validate_day057_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day058_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day059_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day060_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day061_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_hahaiah_057_061_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day not in (57,58,59,60,61) or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
  if v_status is distinct from 'canon' then raise exception 'hahaiah_canonical_day_not_available'; end if;
  if new.day=57 then
    if v_source_sha is distinct from 'deb6305d38b89a4168ad5cff083d2b96e7a7fec4' then raise exception 'day057_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day057_scalar_evidence_v1(new.evidence);
  elsif new.day=58 then
    if v_source_sha is distinct from 'e32753a57daab23d378e881451194b0dd77d8aac' then raise exception 'day058_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day058_scalar_evidence_v1(new.evidence);
  elsif new.day=59 then
    if v_source_sha is distinct from 'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8' then raise exception 'day059_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day059_scalar_evidence_v1(new.evidence);
  elsif new.day=60 then
    if v_source_sha is distinct from 'e98e8925c8e03555c39b033813999d6a488149a9' then raise exception 'day060_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day060_scalar_evidence_v1(new.evidence);
  else
    if v_source_sha is distinct from '12e4c2da623f2f78d3fea3ff65e23f9446f9784b' then raise exception 'day061_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day061_scalar_evidence_v1(new.evidence);
  end if;
  return new;
end; $$;

revoke all on function hnk_private.enforce_hahaiah_057_061_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_hahaiah_057_061_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_hahaiah_057_061_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_hahaiah_057_061_scalar_evidence();
