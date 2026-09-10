-- Strict first-completion evidence for canonical Chokmah Day 072.
-- Visual descriptions and interpretations remain encrypted in the Vault.

create or replace function hnk_private.validate_day072_scalar_evidence_v1(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  k text;
  seconds integer;
begin
  if p is null or p = '{}'::jsonb or jsonb_typeof(p) <> 'object' then
    raise exception 'day072_evidence_required';
  end if;

  for k in select jsonb_object_keys(p) loop
    if k <> all(array[
      'protocol_completed','return_confirmed','active_completed','support_selected',
      'visual_preregister_saved','interpretation_separated','external_presence_not_claimed',
      'high_impact_decision_not_used','fire_safety_preserved','lighting_restored',
      'orientation_restored','vault_saved','safety_clear','electric_fallback_used',
      'visual_form_present','active_seconds'
    ]) then
      raise exception 'day072_evidence_unknown_field';
    end if;
  end loop;

  if p->'protocol_completed' is distinct from 'true'::jsonb
     or p->'return_confirmed' is distinct from 'true'::jsonb
     or p->'active_completed' is distinct from 'true'::jsonb
     or p->'support_selected' is distinct from 'true'::jsonb
     or p->'visual_preregister_saved' is distinct from 'true'::jsonb
     or p->'interpretation_separated' is distinct from 'true'::jsonb
     or p->'external_presence_not_claimed' is distinct from 'true'::jsonb
     or p->'high_impact_decision_not_used' is distinct from 'true'::jsonb
     or p->'fire_safety_preserved' is distinct from 'true'::jsonb
     or p->'lighting_restored' is distinct from 'true'::jsonb
     or p->'orientation_restored' is distinct from 'true'::jsonb
     or p->'vault_saved' is distinct from 'true'::jsonb
     or p->'safety_clear' is distinct from 'true'::jsonb
  then
    raise exception 'day072_required_flag_missing';
  end if;

  if jsonb_typeof(p->'electric_fallback_used') is distinct from 'boolean'
     or jsonb_typeof(p->'visual_form_present') is distinct from 'boolean'
  then
    raise exception 'day072_boolean_field_invalid';
  end if;

  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p->'active_seconds'), false) then
    raise exception 'day072_duration_invalid';
  end if;

  seconds := (p->>'active_seconds')::integer;
  if seconds <> 900 then
    raise exception 'day072_fifteen_minutes_required';
  end if;
end;
$$;

revoke all on function hnk_private.validate_day072_scalar_evidence_v1(jsonb)
from public, anon, authenticated;

create or replace function hnk_private.enforce_chokmah_day072_scalar_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing boolean;
  source_sha text;
  source_status text;
begin
  if new.day <> 72 or new.state not in ('evidence_pending', 'complete') then
    return new;
  end if;

  select exists(
    select 1 from public.day_completions
    where user_id = new.user_id and day = 72
  ) into existing;

  if existing then
    return new;
  end if;

  select source_sha, status into source_sha, source_status
  from public.codex_days where day = 72;

  if source_status is distinct from 'canon' then
    raise exception 'day072_canonical_day_not_available';
  end if;

  if source_sha is distinct from '44c11fee26aef72ebb686ab5f8fd8f27f1239cb2' then
    raise exception 'day072_canonical_source_sha_mismatch';
  end if;

  perform hnk_private.validate_day072_scalar_evidence_v1(new.evidence);
  return new;
end;
$$;

revoke all on function hnk_private.enforce_chokmah_day072_scalar_evidence()
from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_chokmah_day072_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_chokmah_day072_evidence
before insert or update of state, evidence, day, user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_chokmah_day072_scalar_evidence();
