alter table public.asset_registry
  add column scope_id text,
  add column asset_version integer not null default 1 check (asset_version > 0),
  add column prompt_ref text,
  add column license text not null default 'project-generated',
  add column approved_by uuid references auth.users(id) on delete set null,
  add column approved_at timestamptz,
  add column published_at timestamptz;

alter table public.asset_registry drop constraint asset_registry_scope_check;
alter table public.asset_registry
  add constraint asset_registry_scope_check
  check (scope in ('global','day','chapter','sephira','cycle','oracle'));

alter table public.asset_registry drop constraint asset_registry_approval_state_check;
alter table public.asset_registry
  add constraint asset_registry_approval_state_check
  check (approval_state in ('planned','generated','draft','review','approved','published','rejected','retired','archived'));

create index asset_registry_scope_idx on public.asset_registry(scope, scope_id);
create index asset_registry_day_slot_idx on public.asset_registry(day, slot);
