begin;

select plan(20);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vault-a@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('55555555-5555-4555-8555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vault-b@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

select has_table('public', 'vault_key_envelopes', 'VKE-001 recovery envelope table exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.vault_key_envelopes'::regclass),
  'VKE-002 RLS is enabled'
);

select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vault_key_envelopes'
      and lower(column_name) in ('plaintext', 'recovery_root_secret', 'recovery_secret', 'rrs', 'raw_key', 'raw_vdk', 'vdk')
  ),
  'VKE-003 schema exposes no plaintext/RRS/unwrapped-key column'
);

select ok(has_table_privilege('authenticated', 'public.vault_key_envelopes', 'SELECT'), 'VKE-004 authenticated may SELECT own envelope');
select ok(has_table_privilege('authenticated', 'public.vault_key_envelopes', 'INSERT'), 'VKE-005 authenticated may INSERT own envelope');
select ok(has_table_privilege('authenticated', 'public.vault_key_envelopes', 'UPDATE'), 'VKE-006 authenticated may UPDATE own envelope');
select ok(has_table_privilege('authenticated', 'public.vault_key_envelopes', 'DELETE'), 'VKE-007 authenticated may DELETE own envelope');

insert into public.vault_key_envelopes (
  user_id, key_version, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
) values (
  '55555555-5555-4555-8555-555555555555', 1,
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB==',
  'AES-KW-256', 'HKDF-SHA-256', 'VVVVVVVVVVVVVVVVVVVVVV==', 1
);

set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';

select lives_ok(
  $$insert into public.vault_key_envelopes (
      user_id, key_version, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
    ) values (
      '44444444-4444-4444-8444-444444444444', 1,
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
      'AES-KW-256', 'HKDF-SHA-256', 'UUUUUUUUUUUUUUUUUUUUUU==', 1
    )$$,
  'VKE-008 owner may insert own recovery envelope'
);

select throws_ok(
  $$insert into public.vault_key_envelopes (
      user_id, key_version, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
    ) values (
      '55555555-5555-4555-8555-555555555555', 2,
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC==',
      'AES-KW-256', 'HKDF-SHA-256', 'WWWWWWWWWWWWWWWWWWWWWW==', 1
    )$$,
  '42501', null,
  'VKE-009 RLS rejects cross-user insert'
);

select is(
  (select count(*) from public.vault_key_envelopes),
  1::bigint,
  'VKE-010 owner SELECT sees only own envelope'
);

update public.vault_key_envelopes
set wrapped_key = 'ATTACKER-SHOULD-NOT-CHANGE-THIS-ENVELOPE-XXXXXXXXXXXXXXXX=='
where user_id = '55555555-5555-4555-8555-555555555555';

reset role;
select is(
  (select wrapped_key from public.vault_key_envelopes where user_id = '55555555-5555-4555-8555-555555555555'),
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=='::text,
  'VKE-011 RLS prevents cross-user update'
);

set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
delete from public.vault_key_envelopes
where user_id = '55555555-5555-4555-8555-555555555555';
reset role;
select is(
  (select count(*) from public.vault_key_envelopes where user_id = '55555555-5555-4555-8555-555555555555'),
  1::bigint,
  'VKE-012 RLS prevents cross-user delete'
);

set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
select throws_ok(
  $$update public.vault_key_envelopes
    set user_id = '55555555-5555-4555-8555-555555555555'
    where user_id = '44444444-4444-4444-8444-444444444444'$$,
  '42501', null,
  'VKE-013 WITH CHECK prevents ownership reassignment'
);

select throws_ok(
  $$insert into public.vault_key_envelopes (
      user_id, key_version, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
    ) values (
      '44444444-4444-4444-8444-444444444444', 1,
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD==',
      'AES-KW-256', 'HKDF-SHA-256', 'XXXXXXXXXXXXXXXXXXXXXXXX==', 1
    )$$,
  '23505', null,
  'VKE-014 only one active recovery envelope exists per key version'
);

select lives_ok(
  $$update public.vault_key_envelopes
    set revoked_at = now()
    where user_id = '44444444-4444-4444-8444-444444444444' and key_version = 1 and revoked_at is null$$,
  'VKE-015 owner may revoke active recovery envelope'
);

select lives_ok(
  $$insert into public.vault_key_envelopes (
      user_id, key_version, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
    ) values (
      '44444444-4444-4444-8444-444444444444', 1,
      'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE==',
      'AES-KW-256', 'HKDF-SHA-256', 'YYYYYYYYYYYYYYYYYYYYYYYY==', 1
    )$$,
  'VKE-016 revoked envelope permits a replacement active envelope'
);

select is(
  (select count(*) from public.vault_key_envelopes where user_id = '44444444-4444-4444-8444-444444444444' and key_version = 1 and revoked_at is null),
  1::bigint,
  'VKE-017 exactly one active recovery envelope remains after rotation'
);

select throws_ok(
  $$insert into public.vault_key_envelopes (
      user_id, key_version, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
    ) values (
      '44444444-4444-4444-8444-444444444444', 2,
      'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF==',
      'AES-GCM', 'HKDF-SHA-256', 'ZZZZZZZZZZZZZZZZZZZZZZ==', 1
    )$$,
  '23514', null,
  'VKE-018 schema rejects unapproved wrapping algorithm'
);

select throws_ok(
  $$insert into public.vault_key_envelopes (
      user_id, key_version, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
    ) values (
      '44444444-4444-4444-8444-444444444444', 2,
      'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG==',
      'AES-KW-256', 'PBKDF2-SHA-256', '1111111111111111111111==', 1
    )$$,
  '23514', null,
  'VKE-019 schema rejects unapproved recovery KDF'
);

select throws_ok(
  $$insert into public.vault_key_envelopes (
      user_id, key_version, envelope_kind, wrapped_key, wrap_alg, kdf_alg, kdf_salt, kdf_info_version
    ) values (
      '44444444-4444-4444-8444-444444444444', 2, 'device',
      'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH==',
      'AES-KW-256', 'HKDF-SHA-256', '2222222222222222222222==', 1
    )$$,
  '23514', null,
  'VKE-020 server table rejects device-envelope material'
);

reset role;
select * from finish();
rollback;
