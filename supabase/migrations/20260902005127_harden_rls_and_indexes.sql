create policy codex_import_runs_deny_client_access on public.codex_import_runs
for all to authenticated
using (false)
with check (false);

create index xp_events_day_idx on public.xp_events(day);
