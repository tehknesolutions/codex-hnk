-- Strict first-completion evidence for canonical Aladiah Day 051.
-- Phrase, reduction rule and drawing remain Vault-only; operational evidence is scalar/boolean.

create or replace function hnk_private.validate_day051_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day051_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','reduction_documented','sigil_drawn','observation_completed','text_control_completed',
      'comparison_completed','interpretation_separated','symbolic_anchor_only','no_guaranteed_protection_claim','panic_rule_acknowledged',
      'vault_saved','safety_clear','sigil_effect_present','text_effect_present','sigil_observation_seconds'
    ]) then raise exception 'day051_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'reduction_documented' is distinct from 'true'::jsonb
     or p_evidence->'sigil_drawn' is distinct from 'true'::jsonb
     or p_evidence->'observation_completed' is distinct from 'true'::jsonb
     or p_evidence->'text_control_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'symbolic_anchor_only' is distinct from 'true'::jsonb
     or p_evidence->'no_guaranteed_protection_claim' is distinct from 'true'::jsonb
     or p_evidence->'panic_rule_acknowledged' is distinct from 'true'::jsonb
     or p_evidence->'vault_saved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day051_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'sigil_effect_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'text_effect_present') is distinct from 'boolean'
  then raise exception 'day051_effect_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'sigil_observation_seconds'),false)
     or (p_evidence->>'sigil_observation_seconds')::integer < 180
  then raise exception 'day051_observation_incomplete'; end if;
end; $$;

revoke all on function hnk_private.validate_day051_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_aladiah_051_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day <> 51 or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=51) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=51;
  if v_status is distinct from 'canon' then raise exception 'aladiah_day051_canonical_day_not_available'; end if;
  if v_source_sha is distinct from 'e70910495dbbe0c70cece9b694271ded7799c7fd' then raise exception 'day051_canonical_source_sha_mismatch'; end if;
  perform hnk_private.validate_day051_scalar_evidence_v1(new.evidence);
  return new;
end; $$;

revoke all on function hnk_private.enforce_aladiah_051_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_aladiah_051_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_aladiah_051_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_aladiah_051_scalar_evidence();
