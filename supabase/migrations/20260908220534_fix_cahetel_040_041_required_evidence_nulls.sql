-- Applied Supabase migration: 20260908220534_fix_cahetel_040_041_required_evidence_nulls
-- SQL three-valued-logic hardening: missing JSONB keys must fail closed.

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

  if p_evidence -> 'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence -> 'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence -> 'verbal_condition_completed' is distinct from 'true'::jsonb
     or p_evidence -> 'silent_condition_completed' is distinct from 'true'::jsonb
     or p_evidence -> 'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence -> 'autonomy_preserved' is distinct from 'true'::jsonb
  then
    raise exception 'day040_required_flag_missing';
  end if;

  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'verbal_seconds'), false)
     or (p_evidence ->> 'verbal_seconds')::integer < 360
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'silent_seconds'), false)
     or (p_evidence ->> 'silent_seconds')::integer < 360
  then
    raise exception 'day040_duration_incomplete';
  end if;

  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'truisms_logged'), false)
     or (p_evidence ->> 'truisms_logged')::integer < 3
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'suggestions_logged'), false)
     or (p_evidence ->> 'suggestions_logged')::integer < 1
  then
    raise exception 'day040_protocol_count_incomplete';
  end if;
end;
$$;

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

  if p_evidence -> 'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence -> 'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence -> 'question_defined' is distinct from 'true'::jsonb
     or p_evidence -> 'active_reception_completed' is distinct from 'true'::jsonb
     or p_evidence -> 'open_reception_completed' is distinct from 'true'::jsonb
     or p_evidence -> 'interpretation_delayed' is distinct from 'true'::jsonb
     or p_evidence -> 'alternative_recorded' is distinct from 'true'::jsonb
     or p_evidence -> 'verification_defined' is distinct from 'true'::jsonb
  then
    raise exception 'day041_required_flag_missing';
  end if;

  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'active_reception_seconds'), false)
     or (p_evidence ->> 'active_reception_seconds')::integer < 420
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence -> 'open_reception_seconds'), false)
     or (p_evidence ->> 'open_reception_seconds')::integer < 420
  then
    raise exception 'day041_duration_incomplete';
  end if;

  if jsonb_typeof(p_evidence -> 'active_content_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence -> 'open_content_present') is distinct from 'boolean'
  then
    raise exception 'day041_content_presence_flag_invalid';
  end if;
end;
$$;
