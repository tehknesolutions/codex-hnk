create table public.vault_key_envelopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key_version integer not null check (key_version > 0),
  envelope_kind text not null default 'recovery' check (envelope_kind = 'recovery'),
  wrapped_key text not null check (char_length(wrapped_key) between 16 and 4096),
  wrap_alg text not null check (wrap_alg = 'AES-KW-256'),
  kdf_alg text not null check (kdf_alg = 'HKDF-SHA-256'),
  kdf_salt text not null check (char_length(kdf_salt) between 16 and 512),
  kdf_info_version smallint not null default 1 check (kdf_info_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  rotated_at timestamptz,
  revoked_at timestamptz,
  check (rotated_at is null or rotated_at >= created_at),
  check (revoked_at is null or revoked_at >= created_at)
);

comment on table public.vault_key_envelopes is
  'Ciphertext-only Web Vault recovery key envelopes. Never store RRS, plaintext prose or unwrapped VDK material here.';

create index vault_key_envelopes_user_key_idx
  on public.vault_key_envelopes(user_id, key_version, created_at desc);

create unique index vault_key_envelopes_one_active_recovery_idx
  on public.vault_key_envelopes(user_id, key_version, envelope_kind)
  where revoked_at is null;

create trigger vault_key_envelopes_set_updated_at
before update on public.vault_key_envelopes
for each row execute function hnk_private.set_updated_at();

alter table public.vault_key_envelopes enable row level security;

revoke all on table public.vault_key_envelopes from anon, authenticated;
grant select, insert, update, delete on table public.vault_key_envelopes to authenticated;

create policy vault_key_envelopes_select_own on public.vault_key_envelopes
for select to authenticated
using ((select auth.uid()) = user_id);

create policy vault_key_envelopes_insert_own on public.vault_key_envelopes
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy vault_key_envelopes_update_own on public.vault_key_envelopes
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy vault_key_envelopes_delete_own on public.vault_key_envelopes
for delete to authenticated
using ((select auth.uid()) = user_id);
