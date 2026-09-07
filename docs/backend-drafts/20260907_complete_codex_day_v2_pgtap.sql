-- HNK CODEX — DRAFT pgTAP tests for complete_codex_day_v2
-- Move to supabase/tests only after the canonical Supabase scaffold is migrated.

begin;

select plan(14);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'completion-v2@example.invalid',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.codex_days (
  day, chapter, sephira, world, level, xp, title, slug,
  source_path, source_sha, status
) values (
  1, 1, 'Kether', 'Atziluth', 1, 150,
  'Day 001 V2 Test',
  'day-001-v2-test',
  'canon/capitulo-01-kether/dia-001.md',
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  'canon'
)
on conflict (day) do update set
  xp = excluded.xp,
  source_sha = excluded.source_sha,
  status = excluded.status;

insert into public.practice_sessions (
  id, user_id, day, client_session_id, mode, state, evidence
) values
(
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  '44444444-4444-4444-4444-444444444444',
  1,
  'd1-v2-valid',
  'first_completion',
  'evidence_pending',
  '{
    "protocol_version":"HNK-KETHER-D001-V2",
    "source_sha":"a01d13b43cbddb92236fc1e3b6c2a7e140d87d29",
    "jachin":{"started":true,"completed":true,"duration_seconds":600,"attention_returns":2,"return_confirmed":true},
    "ritual_tone_528":{"started":true},
    "boaz":{"started":true,"completed":true,"duration_seconds":300,"environment_distractions_count":3,"return_confirmed":true},
    "middle":{"voice_practice_completed":true,"duration_seconds":180,"voice_recorded":false,"return_confirmed":true},
    "soul_mirror":{"completed":true},
    "voluntary_completion_confirmed":true
  }'::jsonb
),
(
  'dddddddd-dddd-dddd-dddd-dddddddd0002',
  '44444444-4444-4444-4444-444444444444',
  1,
  'd1-v2-bad-boaz',
  'first_completion',
  'evidence_pending',
  '{
    "protocol_version":"HNK-KETHER-D001-V2",
    "source_sha":"a01d13b43cbddb92236fc1e3b6c2a7e140d87d29",
    "jachin":{"started":true,"completed":true,"return_confirmed":true},
    "ritual_tone_528":{"started":true},
    "boaz":{"started":true,"completed":true,"environment_distractions_count":2,"return_confirmed":true},
    "middle":{"voice_practice_completed":true,"voice_recorded":false,"return_confirmed":true},
    "soul_mirror":{"completed":true},
    "voluntary_completion_confirmed":true
  }'::jsonb
);

select ok(
  not has_function_privilege(
    'anon',
    'public.complete_codex_day_v2(smallint,uuid,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ),
  'V2-PRIV-001 anon cannot execute complete_codex_day_v2'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.complete_codex_day_v2(smallint,uuid,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ),
  'V2-PRIV-002 authenticated may execute complete_codex_day_v2'
);

set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select throws_ok(
  $$select public.complete_codex_day_v2(
    1::smallint,
    'dddddddd-dddd-dddd-dddd-dddddddd0001'::uuid,
    'WRONG-CONTRACT',
    'HNK-KETHER-D001-V2',
    'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
    'cmp-wrong-contract',
    null,
    now()
  )$$,
  'P0001',
  'completion_contract_not_found',
  'V2-CTR-001 unknown completion contract is rejected'
);

select throws_ok(
  $$select public.complete_codex_day_v2(
    1::smallint,
    'dddddddd-dddd-dddd-dddd-dddddddd0001'::uuid,
    'HNK-KETHER-D001-COMP-V2',
    'WRONG-QUEST',
    'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
    'cmp-wrong-quest',
    null,
    now()
  )$$,
  'P0001',
  'quest_definition_mismatch',
  'V2-CTR-002 mismatched quest definition is rejected'
);

select throws_ok(
  $$select public.complete_codex_day_v2(
    1::smallint,
    'dddddddd-dddd-dddd-dddd-dddddddd0001'::uuid,
    'HNK-KETHER-D001-COMP-V2',
    'HNK-KETHER-D001-V2',
    'ffffffffffffffffffffffffffffffffffffffff',
    'cmp-wrong-sha',
    null,
    now()
  )$$,
  'P0001',
  'canonical_source_sha_mismatch',
  'V2-CTR-003 mismatched canonical SHA is rejected'
);

select throws_ok(
  $$select public.complete_codex_day_v2(
    1::smallint,
    'dddddddd-dddd-dddd-dddd-dddddddd0002'::uuid,
    'HNK-KETHER-D001-COMP-V2',
    'HNK-KETHER-D001-V2',
    'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
    'cmp-bad-evidence',
    null,
    now()
  )$$,
  'P0001',
  'day001_boaz_distractions_incomplete',
  'V2-EVD-001 incomplete structural evidence is rejected'
);

select is(
  (
    public.complete_codex_day_v2(
      1::smallint,
      'dddddddd-dddd-dddd-dddd-dddddddd0001'::uuid,
      'HNK-KETHER-D001-COMP-V2',
      'HNK-KETHER-D001-V2',
      'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
      'cmp-valid-001',
      'hash-v2',
      now()
    ) ->> 'xp_awarded'
  )::integer,
  150,
  'V2-XP-001 first valid completion awards canonical +150 XP'
);

select is(
  (select count(*) from public.day_completions
   where user_id = '44444444-4444-4444-4444-444444444444' and day = 1),
  1::bigint,
  'V2-IDEM-001 one canonical Day Completion exists'
);

select is(
  (select count(*) from public.xp_events
   where user_id = '44444444-4444-4444-4444-444444444444' and day = 1),
  1::bigint,
  'V2-IDEM-002 exactly one XP event exists'
);

select is(
  (
    public.complete_codex_day_v2(
      1::smallint,
      'dddddddd-dddd-dddd-dddd-dddddddd0001'::uuid,
      'HNK-KETHER-D001-COMP-V2',
      'HNK-KETHER-D001-V2',
      'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
      'cmp-valid-001',
      'hash-v2',
      now()
    ) ->> 'xp_awarded'
  )::integer,
  150,
  'V2-REPLAY-001 exact client replay returns the original authoritative response'
);

select is(
  (
    public.complete_codex_day_v2(
      1::smallint,
      'dddddddd-dddd-dddd-dddd-dddddddd0001'::uuid,
      'HNK-KETHER-D001-COMP-V2',
      'HNK-KETHER-D001-V2',
      'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
      'cmp-valid-002',
      'hash-v2',
      now()
    ) ->> 'xp_awarded'
  )::integer,
  0,
  'V2-IDEM-003 new request id after existing completion awards zero XP'
);

select is(
  (select xp_total from public.user_progress
   where user_id = '44444444-4444-4444-4444-444444444444'),
  150,
  'V2-XP-002 xp_total remains 150 after retries'
);

select is(
  (
    select response -> 'progression_events'
    from hnk_private.completion_request_receipts
    where user_id = '44444444-4444-4444-4444-444444444444'
      and client_completion_id = 'cmp-valid-001'
  ),
  '["KETHER_FIRST_SPARK", "NEXT_DAY_UNLOCKED"]'::jsonb,
  'V2-PROG-001 first Day 001 response emits First Spark + next Day'
);

select throws_ok(
  $$select public.complete_codex_day_v2(
    1::smallint,
    'dddddddd-dddd-dddd-dddd-dddddddd0002'::uuid,
    'HNK-KETHER-D001-COMP-V2',
    'HNK-KETHER-D001-V2',
    'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
    'cmp-valid-001',
    'DIFFERENT',
    now()
  )$$,
  'P0001',
  'client_completion_id_conflict',
  'V2-REPLAY-002 client completion id cannot be rebound to different request identity'
);

select * from finish();
rollback;
