begin;

select plan(3);

select ok(
  not has_table_privilege('authenticated', 'public.xp_events', 'INSERT')
  and not has_table_privilege('authenticated', 'public.xp_events', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.xp_events', 'DELETE'),
  'XP-001 authenticated client has no direct INSERT/UPDATE/DELETE on xp_events'
);

select ok(
  not has_table_privilege('authenticated', 'public.day_completions', 'INSERT')
  and not has_table_privilege('authenticated', 'public.day_completions', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.day_completions', 'DELETE'),
  'XP-002 authenticated client has no direct INSERT/UPDATE/DELETE on day_completions'
);

select ok(
  not has_table_privilege('authenticated', 'public.user_progress', 'INSERT')
  and not has_table_privilege('authenticated', 'public.user_progress', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.user_progress', 'DELETE'),
  'XP-003 authenticated client has no direct INSERT/UPDATE/DELETE on canonical progress'
);

select * from finish();
rollback;
