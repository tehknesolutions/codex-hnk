-- Strict first-completion evidence for canonical Haziel Day 046.
-- Presence/absence of sensation is explicitly recorded as boolean; false is valid.
-- Unknown fields are rejected so interpretive/private prose remains outside operational evidence.

create or replace function hnk_private.validate_day046_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence = '{}'::jsonb or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'day046_evidence_required';
  end if;

  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','plant_completed','rest_confirmed','control_completed',
      'comparison_completed','interpretation_separated','null_results_preserved','alternatives_considered',
      'aura_not_claimed','safety_clear','plant_sensation_present','control_sensation_present',
      'plant_seconds','control_seconds'
    ]) then
      raise exception 'day046_evidence_unknown_field';
    end if;
  end loop;

  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'plant_completed' is distinct from 'true'::jsonb
     or p_evidence->'rest_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'null_results_preserved' is distinct from 'true'::jsonb
     or p_evidence->'alternatives_considered' is distinct from 'true'::jsonb
     or p_evidence->'aura_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then
    raise exception 'day046_required_flag_missing';
  end if;

  if jsonb_typeof(p_evidence->'plant_sensation_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_sensation_present') is distinct from 'boolean'
  then
    raise exception 'day046_sensation_presence_flag_invalid';
  end if;

  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'plant_seconds'), false)
     or (p_evidence->>'plant_seconds')::integer < 420
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'), false)
     or (p_evidence->>'control_seconds')::integer < 420
  then
    raise exception 'day046_duration_incomplete';
  end if;
end;
$$;

revoke all on function hnk_private.validate_day046_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_haziel_046_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_existing boolean;
  v_source_sha text;
  v_status text;
begin
  if new.day <> 46 or new.state not in ('evidence_pending','complete') then
    return new;
  end if;

  select exists(
    select 1 from public.day_completions
    where user_id = new.user_id and day = 46
  ) into v_existing;

  if v_existing then
    return new;
  end if;

  select source_sha, status
    into v_source_sha, v_status
  from public.codex_days
  where day = 46;

  if v_status is distinct from 'canon' then
    raise exception 'haziel_day046_canonical_day_not_available';
  end if;

  if v_source_sha is distinct from 'e8a812598e885222d42b0ddf968fa93c83d3432b' then
    raise exception 'day046_canonical_source_sha_mismatch';
  end if;

  perform hnk_private.validate_day046_scalar_evidence_v1(new.evidence);
  return new;
end;
$$;

revoke all on function hnk_private.enforce_haziel_046_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_haziel_046_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_haziel_046_evidence
before insert or update of state, evidence, day, user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_haziel_046_scalar_evidence();
