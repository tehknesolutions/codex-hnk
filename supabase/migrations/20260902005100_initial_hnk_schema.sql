create schema if not exists hnk_private;
revoke all on schema hnk_private from public, anon, authenticated;

create or replace function hnk_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function hnk_private.set_updated_at() from public, anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  avatar_path text,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.codex_days (
  day smallint primary key check (day between 1 and 365),
  chapter smallint not null check (chapter between 1 and 10),
  sephira text not null,
  world text not null,
  angel text,
  level smallint not null check (level between 1 and 10),
  xp integer not null default 0 check (xp >= 0),
  title text not null,
  slug text not null unique,
  editorial_version text not null default '1.1',
  epistemic_protocol text not null default 'HNK-EP-1.1',
  source_path text not null,
  source_sha text not null,
  status text not null default 'canon' check (status in ('draft','reviewed','canon')),
  tracks text[] not null default '{}',
  content jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  synced_at timestamptz not null default now()
);

create table public.asset_registry (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  day smallint references public.codex_days(day) on delete cascade,
  scope text not null default 'day' check (scope in ('global','day','chapter','sephira')),
  slot text not null,
  kind text not null check (kind in ('image','vector','audio','video','3d','qr','ui','other')),
  storage_path text,
  source_tool text,
  model_version text,
  prompt text,
  negative_prompt text,
  reference_assets text[] not null default '{}',
  seed text,
  checksum_sha256 text,
  approval_state text not null default 'planned' check (approval_state in ('planned','generated','review','approved','rejected','archived')),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_seconds numeric check (duration_seconds is null or duration_seconds >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audio_presets (
  day smallint primary key references public.codex_days(day) on delete cascade,
  engine_version text not null default '1',
  carrier_left_hz numeric,
  carrier_right_hz numeric,
  beat_hz numeric,
  solfeggio_hz numeric,
  waveform text not null default 'sine' check (waveform in ('sine','triangle','square','sawtooth','custom')),
  duration_seconds integer not null default 600 check (duration_seconds > 0),
  fade_in_seconds numeric not null default 5 check (fade_in_seconds >= 0),
  fade_out_seconds numeric not null default 10 check (fade_out_seconds >= 0),
  layers jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','reviewed','approved','archived')),
  updated_at timestamptz not null default now()
);

create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp_total integer not null default 0 check (xp_total >= 0),
  level smallint not null default 1 check (level between 1 and 10),
  current_day smallint not null default 1 check (current_day between 1 and 365),
  current_chapter smallint not null default 1 check (current_chapter between 1 and 10),
  current_sephira text not null default 'Kether',
  streak_days integer not null default 0 check (streak_days >= 0),
  updated_at timestamptz not null default now()
);

create table public.attribute_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hip integer not null default 5 check (hip >= 0),
  vnt integer not null default 5 check (vnt >= 0),
  per integer not null default 5 check (per >= 0),
  sin integer not null default 5 check (sin >= 0),
  bio integer not null default 5 check (bio >= 0),
  int integer not null default 5 check (int >= 0),
  dis integer not null default 5 check (dis >= 0),
  updated_at timestamptz not null default now()
);

create table public.day_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  day smallint not null references public.codex_days(day) on delete cascade,
  completion_version text not null default '1',
  local_record_hash text,
  client_completed_at timestamptz,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  day smallint references public.codex_days(day) on delete set null,
  source text not null,
  amount integer not null check (amount <> 0),
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.journal_vault (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day smallint references public.codex_days(day) on delete set null,
  ciphertext text not null,
  nonce text not null,
  aad text,
  crypto_alg text not null default 'AES-256-GCM',
  crypto_version smallint not null default 1 check (crypto_version > 0),
  checksum_sha256 text,
  client_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.codex_import_runs (
  id uuid primary key default gen_random_uuid(),
  source_repo text not null default 'Tehkne-Solutions/hnk-codex-365',
  source_sha text not null,
  days_imported integer not null default 0 check (days_imported >= 0),
  status text not null check (status in ('started','success','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index asset_registry_day_idx on public.asset_registry(day);
create index asset_registry_approval_idx on public.asset_registry(approval_state);
create index day_completions_day_idx on public.day_completions(day);
create index xp_events_user_created_idx on public.xp_events(user_id, created_at desc);
create index journal_vault_user_created_idx on public.journal_vault(user_id, created_at desc);
create index journal_vault_day_idx on public.journal_vault(day);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function hnk_private.set_updated_at();
create trigger asset_registry_set_updated_at before update on public.asset_registry for each row execute function hnk_private.set_updated_at();
create trigger audio_presets_set_updated_at before update on public.audio_presets for each row execute function hnk_private.set_updated_at();
create trigger user_progress_set_updated_at before update on public.user_progress for each row execute function hnk_private.set_updated_at();
create trigger attribute_state_set_updated_at before update on public.attribute_state for each row execute function hnk_private.set_updated_at();
create trigger day_completions_set_updated_at before update on public.day_completions for each row execute function hnk_private.set_updated_at();
create trigger journal_vault_set_updated_at before update on public.journal_vault for each row execute function hnk_private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.codex_days enable row level security;
alter table public.asset_registry enable row level security;
alter table public.audio_presets enable row level security;
alter table public.user_progress enable row level security;
alter table public.attribute_state enable row level security;
alter table public.day_completions enable row level security;
alter table public.xp_events enable row level security;
alter table public.journal_vault enable row level security;
alter table public.codex_import_runs enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.codex_days from anon, authenticated;
revoke all on table public.asset_registry from anon, authenticated;
revoke all on table public.audio_presets from anon, authenticated;
revoke all on table public.user_progress from anon, authenticated;
revoke all on table public.attribute_state from anon, authenticated;
revoke all on table public.day_completions from anon, authenticated;
revoke all on table public.xp_events from anon, authenticated;
revoke all on table public.journal_vault from anon, authenticated;
revoke all on table public.codex_import_runs from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select on table public.codex_days to authenticated;
grant select on table public.asset_registry to authenticated;
grant select on table public.audio_presets to authenticated;
grant select on table public.user_progress to authenticated;
grant select on table public.attribute_state to authenticated;
grant select, insert, update, delete on table public.day_completions to authenticated;
grant select on table public.xp_events to authenticated;
grant select, insert, update, delete on table public.journal_vault to authenticated;

create policy profiles_select_own on public.profiles
for select to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy profiles_update_own on public.profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy codex_days_read_authenticated on public.codex_days
for select to authenticated using (true);

create policy asset_registry_read_authenticated on public.asset_registry
for select to authenticated using (true);

create policy audio_presets_read_authenticated on public.audio_presets
for select to authenticated using (true);

create policy user_progress_select_own on public.user_progress
for select to authenticated
using ((select auth.uid()) = user_id);

create policy attribute_state_select_own on public.attribute_state
for select to authenticated
using ((select auth.uid()) = user_id);

create policy day_completions_select_own on public.day_completions
for select to authenticated
using ((select auth.uid()) = user_id);

create policy day_completions_insert_own on public.day_completions
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy day_completions_update_own on public.day_completions
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy day_completions_delete_own on public.day_completions
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy xp_events_select_own on public.xp_events
for select to authenticated
using ((select auth.uid()) = user_id);

create policy journal_vault_select_own on public.journal_vault
for select to authenticated
using ((select auth.uid()) = user_id);

create policy journal_vault_insert_own on public.journal_vault
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy journal_vault_update_own on public.journal_vault
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy journal_vault_delete_own on public.journal_vault
for delete to authenticated
using ((select auth.uid()) = user_id);
