-- Applied Supabase migration: 20260908220350_enforce_cahetel_040_041_scalar_evidence
-- Server-side scalar evidence boundary for Cahetel Days 040-041.
-- Private/free-form text remains client-encrypted in Vault and is rejected from
-- operational Practice Session evidence by strict field allowlists.

create or replace function hnk_private.validate_day040_scalar_evidence_v1(p_evidence jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_key text;
begin
  if p_evidence is null or p_evidence = '{}'::jsonb or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'day040_evidence_required';
  end if;

  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','verbal_condition_completed',
      'silent_condition_completed','comparison_completed','autonomy_preserved',
      'verbal_seconds','silent_seconds','truisms_logged','suggestions_logged'
    ]) then
      raise exception 'day040_evidence_unknown_field';
    end if;
  end loop;

  if p_evidence -> 'protocol_completed' <> 'true'::jsonb
     or p_evidence -> 'return_confirmed' <> 'true'::jsonb
     or p_evidence -> 'verbal_condition_completed' <> 'true'::jsonb
     or p_evidence -> 'silent_condition_completed' <> 'true'::jsonb
     or p_evidence -> 'comparison_completed' <> 'true'::jsonb
     or p_evidence -> 'autonomy_preserved' <> 'true'::jsonb
  then
    raise exception 'day040_required_flag_missing';
  end if;

  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'verbal_seconds')
     or (p_evidence ->> 'verbal_seconds')::integer < 360
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'silent_seconds')
     or (p_evidence ->> 'silent_seconds')::integer < 360
  then
    raise exception 'day040_duration_incomplete';
  end if;

  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'truisms_logged')
     or (p_evidence ->> 'truisms_logged')::integer < 3
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'suggestions_logged')
     or (p_evidence ->> 'suggestions_logged')::integer < 1
  then
    raise exception 'day040_protocol_count_incomplete';
  end if;
end;
$$;

revoke all on function hnk_private.validate_day040_scalar_evidence_v1(jsonb)
from public, anon, authenticated;

create or replace function hnk_private.validate_day041_scalar_evidence_v1(p_evidence jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_key text;
begin
  if p_evidence is null or p_evidence = '{}'::jsonb or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'day041_evidence_required';
  end if;

  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','question_defined',
      'active_reception_completed','open_reception_completed',
      'interpretation_delayed','alternative_recorded','verification_defined',
      'active_reception_seconds','open_reception_seconds',
      'active_content_present','open_content_present'
    ]) then
      raise exception 'day041_evidence_unknown_field';
    end if;
  end loop;

  if p_evidence -> 'protocol_completed' <> 'true'::jsonb
     or p_evidence -> 'return_confirmed' <> 'true'::jsonb
     or p_evidence -> 'question_defined' <> 'true'::jsonb
     or p_evidence -> 'active_reception_completed' <> 'true'::jsonb
     or p_evidence -> 'open_reception_completed' <> 'true'::jsonb
     or p_evidence -> 'interpretation_delayed' <> 'true'::jsonb
     or p_evidence -> 'alternative_recorded' <> 'true'::jsonb
     or p_evidence -> 'verification_defined' <> 'true'::jsonb
  then
    raise exception 'day041_required_flag_missing';
  end if;

  if not hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'active_reception_seconds')
     or (p_evidence ->> 'active_reception_seconds')::integer < 420
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'open_reception_seconds')
     or (p_evidence ->> 'open_reception_seconds')::integer < 420
  then
    raise exception 'day041_duration_incomplete';
  end if;

  if jsonb_typeof(p_evidence -> 'active_content_present') <> 'boolean'
     or jsonb_typeof(p_evidence -> 'open_content_present') <> 'boolean'
  then
    raise exception 'day041_content_presence_flag_invalid';
  end if;
end;
$$;

revoke all on function hnk_private.validate_day041_scalar_evidence_v1(jsonb)
from public, anon, authenticated;

create or replace function hnk_private.enforce_cahetel_040_041_scalar_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_completion boolean;
  v_source_sha text;
  v_status text;
begin
  if new.day not in (40, 41) or new.state not in ('evidence_pending', 'complete') then
    return new;
  end if;

  select exists(
    select 1 from public.day_completions
    where user_id = new.user_id and day = new.day
  ) into v_existing_completion;

  if v_existing_completion then
    return new;
  end if;

  select source_sha, status into v_source_sha, v_status
  from public.codex_days
  where day = new.day;

  if v_status is distinct from 'canon' then
    raise exception 'cahetel_canonical_day_not_available';
  end if;

  if new.day = 40 then
    if v_source_sha is distinct from '7a26302a35aa87b309e94abf516834019df29737' then
      raise exception 'day040_canonical_source_sha_mismatch';
    end if;
    perform hnk_private.validate_day040_scalar_evidence_v1(new.evidence);
  else
    if v_source_sha is distinct from 'f163bc7437efb0dfa70cdc5171e9a2e6acd7fdad' then
      raise exception 'day041_canonical_source_sha_mismatch';
    end if;
    perform hnk_private.validate_day041_scalar_evidence_v1(new.evidence);
  end if;

  return new;
end;
$$;

revoke all on function hnk_private.enforce_cahetel_040_041_scalar_evidence()
from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_cahetel_040_041_evidence
on public.practice_sessions;

create trigger practice_sessions_enforce_cahetel_040_041_evidence
before insert or update of state, evidence, day, user_id
on public.practice_sessions
for each row
execute function hnk_private.enforce_cahetel_040_041_scalar_evidence();
