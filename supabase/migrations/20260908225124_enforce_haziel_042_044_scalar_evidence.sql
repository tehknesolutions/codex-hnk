-- Applied Supabase migration: 20260908225124_enforce_haziel_042_044_scalar_evidence
-- Strict first-completion evidence for canonical Haziel Days 042-044.
-- Unknown fields are rejected so free-form/private text remains Vault-only.

create or replace function hnk_private.validate_day042_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day042_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','massage_completed','residual_completed','control_completed','comparison_completed','interpretation_separated','safety_clear','frontal_sensation_present','control_sensation_present','massage_seconds','residual_seconds','control_seconds']) then raise exception 'day042_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'massage_completed' is distinct from 'true'::jsonb
     or p_evidence->'residual_completed' is distinct from 'true'::jsonb
     or p_evidence->'control_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day042_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'frontal_sensation_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'control_sensation_present') is distinct from 'boolean'
  then raise exception 'day042_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'massage_seconds'),false)
     or (p_evidence->>'massage_seconds')::integer < 180
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'residual_seconds'),false)
     or (p_evidence->>'residual_seconds')::integer < 300
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'),false)
     or (p_evidence->>'control_seconds')::integer < 300
  then raise exception 'day042_duration_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day043_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day043_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','blue_completed','gray_completed','comparison_completed','interpretation_separated','clairvoyance_not_claimed','safety_clear','blue_content_present','gray_content_present','blue_seconds','gray_seconds']) then raise exception 'day043_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'blue_completed' is distinct from 'true'::jsonb
     or p_evidence->'gray_completed' is distinct from 'true'::jsonb
     or p_evidence->'comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb
     or p_evidence->'clairvoyance_not_claimed' is distinct from 'true'::jsonb
     or p_evidence->'safety_clear' is distinct from 'true'::jsonb
  then raise exception 'day043_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'blue_content_present') is distinct from 'boolean'
     or jsonb_typeof(p_evidence->'gray_content_present') is distinct from 'boolean'
  then raise exception 'day043_content_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'blue_seconds'),false)
     or (p_evidence->>'blue_seconds')::integer < 600
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'gray_seconds'),false)
     or (p_evidence->>'gray_seconds')::integer < 600
  then raise exception 'day043_duration_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day044_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day044_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','active_script_completed','neutral_comparison_completed','ethical_review_completed','autonomy_preserved','truisms_logged','suggestions_logged']) then raise exception 'day044_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb
     or p_evidence->'return_confirmed' is distinct from 'true'::jsonb
     or p_evidence->'active_script_completed' is distinct from 'true'::jsonb
     or p_evidence->'neutral_comparison_completed' is distinct from 'true'::jsonb
     or p_evidence->'ethical_review_completed' is distinct from 'true'::jsonb
     or p_evidence->'autonomy_preserved' is distinct from 'true'::jsonb
  then raise exception 'day044_required_flag_missing'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'truisms_logged'),false)
     or (p_evidence->>'truisms_logged')::integer < 6
     or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'suggestions_logged'),false)
     or (p_evidence->>'suggestions_logged')::integer < 3
  then raise exception 'day044_protocol_count_incomplete'; end if;
end; $$;

revoke all on function hnk_private.validate_day042_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day043_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day044_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_haziel_042_044_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day not in (42,43,44) or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
  if v_status is distinct from 'canon' then raise exception 'haziel_canonical_day_not_available'; end if;
  if new.day=42 then
    if v_source_sha is distinct from 'b7f4da850f8c724cf48e980bd30882283efbb822' then raise exception 'day042_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day042_scalar_evidence_v1(new.evidence);
  elsif new.day=43 then
    if v_source_sha is distinct from 'f1c8fa153f91ab0e7b3536c8b900ea438fa3b616' then raise exception 'day043_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day043_scalar_evidence_v1(new.evidence);
  else
    if v_source_sha is distinct from '94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9' then raise exception 'day044_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day044_scalar_evidence_v1(new.evidence);
  end if;
  return new;
end; $$;

revoke all on function hnk_private.enforce_haziel_042_044_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_haziel_042_044_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_haziel_042_044_evidence
before insert or update of state,evidence,day,user_id
on public.practice_sessions
for each row execute function hnk_private.enforce_haziel_042_044_scalar_evidence();
