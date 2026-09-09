-- Strict first-completion evidence for canonical Aladiah Day 050.
-- Third-party identity/image/prose never belongs in operational evidence.

create or replace function hnk_private.validate_day050_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day050_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','primary_completed','control_completed','comparison_completed','interpretation_separated',
      'consent_rule_respected','privacy_preserved','diagnosis_not_made','null_results_preserved','safety_clear',
      'primary_effect_present','control_effect_present','third_party_used','third_party_consent','primary_seconds','control_seconds'
    ]) then raise exception 'day050_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'primary_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'consent_rule_respected' is distinct from 'true'::jsonb
     or p_evidence->'privacy_preserved' is distinct from 'true'::jsonb
     or p_evidence->'diagnosis_not_made' is distinct from 'true'::jsonb
     or p_evidence->'null_results_preserved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day050_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'primary_effect_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_effect_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'third_party_used') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'third_party_consent') is distinct from 'boolean'
  then raise exception 'day050_boolean_field_invalid'; end if;
  if p_evidence->'third_party_used' = 'true'::jsonb and p_evidence->'third_party_consent' is distinct from 'true'::jsonb then
    raise exception 'day050_third_party_consent_required';
  end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'primary_seconds'),false) or (p_evidence->>'primary_seconds')::integer < 300
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'),false) or (p_evidence->>'control_seconds')::integer < 300
  then raise exception 'day050_duration_incomplete'; end if;
end; $$;

revoke all on function hnk_private.validate_day050_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_aladiah_050_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day <> 50 or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=50) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=50;
  if v_status is distinct from 'canon' then raise exception 'aladiah_day050_canonical_day_not_available'; end if;
  if v_source_sha is distinct from '99f56677fb57d8ddfe191b081cae44734b38ae50' then raise exception 'day050_canonical_source_sha_mismatch'; end if;
  perform hnk_private.validate_day050_scalar_evidence_v1(new.evidence);
  return new;
end; $$;

revoke all on function hnk_private.enforce_aladiah_050_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_aladiah_050_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_aladiah_050_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_aladiah_050_scalar_evidence();
