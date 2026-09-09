-- Strict first-completion evidence for canonical Aladiah Day 048.
-- Narrative prose remains Vault-only; operational evidence is scalar/boolean.

create or replace function hnk_private.validate_day048_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day048_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','loop_structure_completed','linear_control_completed','all_threads_closed',
      'comparison_completed','interpretation_separated','consent_only','coercion_not_used','vault_saved','safety_clear',
      'loop_effect_present','linear_effect_present','loops_opened','loops_closed','linear_stories_completed'
    ]) then raise exception 'day048_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'loop_structure_completed' is distinct from 'true'::jsonb
     or p_evidence->'linear_control_completed' is distinct from 'true'::jsonb
     or p_evidence->'all_threads_closed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'consent_only' is distinct from 'true'::jsonb
     or p_evidence->'coercion_not_used' is distinct from 'true'::jsonb
     or p_evidence->'vault_saved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day048_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'loop_effect_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'linear_effect_present') is distinct from 'boolean'
  then raise exception 'day048_effect_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'loops_opened'),false) or (p_evidence->>'loops_opened')::integer < 3
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'loops_closed'),false) or (p_evidence->>'loops_closed')::integer < 3
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'linear_stories_completed'),false) or (p_evidence->>'linear_stories_completed')::integer < 3
  then raise exception 'day048_structure_incomplete'; end if;
end; $$;

revoke all on function hnk_private.validate_day048_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_aladiah_048_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day <> 48 or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=48) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=48;
  if v_status is distinct from 'canon' then raise exception 'aladiah_day048_canonical_day_not_available'; end if;
  if v_source_sha is distinct from 'ff8cae22023e70359768023dfc927ce94c1a27d5' then raise exception 'day048_canonical_source_sha_mismatch'; end if;
  perform hnk_private.validate_day048_scalar_evidence_v1(new.evidence);
  return new;
end; $$;

revoke all on function hnk_private.enforce_aladiah_048_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_aladiah_048_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_aladiah_048_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_aladiah_048_scalar_evidence();
