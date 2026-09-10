-- Mirrors Supabase migration 20260910231152.
-- Canon requires similar, not mathematically identical, volume. V1 accepts a
-- maximum 50 permille (5 percentage-point) spread across the three blocks.

do $$
declare
  v_oid oid;
  v_def text;
  v_pattern text := 'if\s+v_j_volume\s*<>\s*v_b_volume\s+or\s+v_j_volume\s*<>\s*v_m_volume\s+then\s+raise\s+exception\s+''day030_audio_volume_mismatch'';\s*end\s+if;';
  v_replacement text := 'if greatest(v_j_volume,v_b_volume,v_m_volume)-least(v_j_volume,v_b_volume,v_m_volume)>50 then raise exception ''day030_audio_volume_difference_too_large''; end if;';
begin
  select p.oid into v_oid
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='hnk_private' and p.proname='validate_day030_completion_v1'
    and pg_get_function_identity_arguments(p.oid)='p_evidence jsonb, p_expected_source_sha text';
  if v_oid is null then raise exception 'day030_validator_missing_before_volume_tolerance'; end if;
  v_def := pg_get_functiondef(v_oid);
  if v_def !~* v_pattern then raise exception 'day030_exact_volume_guard_not_found'; end if;
  execute regexp_replace(v_def,v_pattern,v_replacement,'i');
end$$;
