-- Strict first-completion evidence for canonical Aladiah Day 049.
-- Manual pulse counts are observational inputs only; no diagnostic interpretation is performed.

create or replace function hnk_private.validate_day049_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day049_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','active_rest_completed','active_count_completed','thermal_visualization_completed',
      'control_rest_completed','control_count_completed','comparison_completed','interpretation_separated','no_diagnosis_claim','safety_clear',
      'active_pulse_count','control_pulse_count','active_heat_present','control_heat_present',
      'active_rest_seconds','active_count_seconds','control_rest_seconds','control_count_seconds'
    ]) then raise exception 'day049_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'active_rest_completed' is distinct from 'true'::jsonb
     or p_evidence->'active_count_completed' is distinct from 'true'::jsonb
     or p_evidence->'thermal_visualization_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_rest_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_count_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'no_diagnosis_claim' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day049_required_flag_missing'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_pulse_count'),false)
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_pulse_count'),false)
  then raise exception 'day049_pulse_count_invalid'; end if;
  if jsonb_typeof(p_evidence->'active_heat_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_heat_present') is distinct from 'boolean'
  then raise exception 'day049_heat_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_rest_seconds'),false) or (p_evidence->>'active_rest_seconds')::integer < 300
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_count_seconds'),false) or (p_evidence->>'active_count_seconds')::integer < 30
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_rest_seconds'),false) or (p_evidence->>'control_rest_seconds')::integer < 300
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_count_seconds'),false) or (p_evidence->>'control_count_seconds')::integer < 30
  then raise exception 'day049_duration_incomplete'; end if;
end; $$;

revoke all on function hnk_private.validate_day049_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_aladiah_049_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day <> 49 or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=49) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=49;
  if v_status is distinct from 'canon' then raise exception 'aladiah_day049_canonical_day_not_available'; end if;
  if v_source_sha is distinct from '63932dceb3e412a5f6a067049d8a57e0374ed68e' then raise exception 'day049_canonical_source_sha_mismatch'; end if;
  perform hnk_private.validate_day049_scalar_evidence_v1(new.evidence);
  return new;
end; $$;

revoke all on function hnk_private.enforce_aladiah_049_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_aladiah_049_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_aladiah_049_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_aladiah_049_scalar_evidence();
