-- Strict first-completion evidence for canonical Lauviah Days 052-053.
-- Free-form descriptions remain Vault-only; operational evidence is allowlisted scalars.

create or replace function hnk_private.validate_day052_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day052_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','expansion_completed','control_completed','comparison_completed',
      'interpretation_separated','outside_brain_claim_not_made','orientation_preserved','null_results_preserved','safety_clear',
      'expansion_effect_present','control_effect_present','expansion_seconds','control_seconds'
    ]) then raise exception 'day052_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'expansion_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'outside_brain_claim_not_made' is distinct from 'true'::jsonb
     or p_evidence->'orientation_preserved' is distinct from 'true'::jsonb
     or p_evidence->'null_results_preserved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day052_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'expansion_effect_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_effect_present') is distinct from 'boolean'
  then raise exception 'day052_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'expansion_seconds'),false)
     or (p_evidence->>'expansion_seconds')::integer < 600
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'),false)
     or (p_evidence->>'control_seconds')::integer < 600
  then raise exception 'day052_duration_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day053_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day053_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_completed','return_confirmed','six_digit_id_used','preregistered_before_feedback','preregister_sealed',
      'feedback_after_preregister','control_completed','errors_included','coincidences_included','risk_decision_not_used',
      'paranormal_not_claimed','vault_saved','safety_clear','target_identifier','control_identifier',
      'target_effect_present','control_effect_present'
    ]) then raise exception 'day053_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'six_digit_id_used' is distinct from 'true'::jsonb
     or p_evidence->'preregistered_before_feedback' is distinct from 'true'::jsonb
     or p_evidence->'preregister_sealed' is distinct from 'true'::jsonb
     or p_evidence->'feedback_after_preregister' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'errors_included' is distinct from 'true'::jsonb
     or p_evidence->'coincidences_included' is distinct from 'true'::jsonb
     or p_evidence->'risk_decision_not_used' is distinct from 'true'::jsonb
     or p_evidence->'paranormal_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'vault_saved' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day053_required_flag_missing'; end if;
  if coalesce(p_evidence->>'target_identifier','') !~ '^\d{6}$'
     or coalesce(p_evidence->>'control_identifier','') !~ '^\d{6}$'
     or p_evidence->>'target_identifier' = p_evidence->>'control_identifier'
  then raise exception 'day053_identifier_invalid'; end if;
  if jsonb_typeof(p_evidence->'target_effect_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_effect_present') is distinct from 'boolean'
  then raise exception 'day053_presence_flag_invalid'; end if;
end; $$;

revoke all on function hnk_private.validate_day052_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day053_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_lauviah_052_053_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day not in (52,53) or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
  if v_status is distinct from 'canon' then raise exception 'lauviah_canonical_day_not_available'; end if;
  if new.day=52 then
    if v_source_sha is distinct from '88ae2a1dc163f474b3afc82f2bcacdf4069c8f5e' then raise exception 'day052_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day052_scalar_evidence_v1(new.evidence);
  else
    if v_source_sha is distinct from '0bb908ec27feeed2023a3a93d7f481328e5056c2' then raise exception 'day053_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day053_scalar_evidence_v1(new.evidence);
  end if;
  return new;
end; $$;

revoke all on function hnk_private.enforce_lauviah_052_053_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_lauviah_052_053_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_lauviah_052_053_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_lauviah_052_053_scalar_evidence();
