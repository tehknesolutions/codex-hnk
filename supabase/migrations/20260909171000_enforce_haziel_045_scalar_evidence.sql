-- HNK Haziel Day 045 strict scalar evidence V1.
-- First-completion evidence is fail-closed and bound to the immutable canonical source blob.

create or replace function hnk_private.validate_day045_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then
    raise exception 'day045_evidence_required';
  end if;

  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','active_completed','control_completed',
      'rest_confirmed','post_silence_completed','comparison_completed',
      'interpretation_separated','safety_clear','active_seconds','control_seconds',
      'post_silence_seconds'
    ]) then
      raise exception 'day045_evidence_unknown_field';
    end if;
  end loop;

  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'active_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'rest_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'post_silence_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then
    raise exception 'day045_required_flag_missing';
  end if;

  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_seconds'),false)
     or (p_evidence->>'active_seconds')::integer < 600
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'),false)
     or (p_evidence->>'control_seconds')::integer < 600
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'post_silence_seconds'),false)
     or (p_evidence->>'post_silence_seconds')::integer < 60
  then
    raise exception 'day045_duration_incomplete';
  end if;
end; $$;

revoke all on function hnk_private.validate_day045_scalar_evidence_v1(jsonb)
from public, anon, authenticated;

create or replace function hnk_private.enforce_haziel_045_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_existing boolean;
  v_source_sha text;
  v_status text;
begin
  if new.day <> 45 or new.state not in ('evidence_pending','complete') then
    return new;
  end if;

  select exists(
    select 1 from public.day_completions
    where user_id = new.user_id and day = 45
  ) into v_existing;

  if v_existing then return new; end if;

  select source_sha,status into v_source_sha,v_status
  from public.codex_days where day = 45;

  if v_status is distinct from 'canon' then
    raise exception 'haziel_day045_canonical_not_available';
  end if;

  if v_source_sha is distinct from '67e6d708444ae1fd62713ebebfb8da4d79a100e5' then
    raise exception 'day045_canonical_source_sha_mismatch';
  end if;

  perform hnk_private.validate_day045_scalar_evidence_v1(new.evidence);
  return new;
end; $$;

revoke all on function hnk_private.enforce_haziel_045_scalar_evidence()
from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_haziel_045_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_haziel_045_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_haziel_045_scalar_evidence();
