-- HNK CODEX
-- DRAFT ONLY — do not apply until the canonical supabase/ scaffold is migrated.
-- Completion Backend Migration V1
--
-- Derived from the existing Kether progression transaction in:
-- Tehkne-Solutions/codex-hnk-app
--   20260902175556_kether_practice_progression_core.sql
--   20260902175751_harden_day_completion_atomicity.sql

create table if not exists hnk_private.completion_contract_registry (
  completion_contract_id text primary key,
  quest_definition_id text not null,
  day smallint not null references public.codex_days(day) on delete cascade,
  canonical_source_sha text not null,
  contract_version text not null,
  validator_key text not null,
  status text not null default 'draft'
    check (status in ('draft','reviewed','active','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day, quest_definition_id, canonical_source_sha)
);

revoke all on table hnk_private.completion_contract_registry
from public, anon, authenticated;

create table if not exists hnk_private.completion_request_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_completion_id text not null,
  day smallint not null references public.codex_days(day) on delete cascade,
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  completion_contract_id text not null,
  quest_definition_id text not null,
  canonical_source_sha text not null,
  response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, client_completion_id)
);

revoke all on table hnk_private.completion_request_receipts
from public, anon, authenticated;

insert into hnk_private.completion_contract_registry (
  completion_contract_id,
  quest_definition_id,
  day,
  canonical_source_sha,
  contract_version,
  validator_key,
  status
) values (
  'HNK-KETHER-D001-COMP-V2',
  'HNK-KETHER-D001-V2',
  1,
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29',
  '2',
  'day001_v2',
  'active'
)
on conflict (completion_contract_id) do update
set
  quest_definition_id = excluded.quest_definition_id,
  day = excluded.day,
  canonical_source_sha = excluded.canonical_source_sha,
  contract_version = excluded.contract_version,
  validator_key = excluded.validator_key,
  status = excluded.status,
  updated_at = now();

create or replace function hnk_private.validate_day001_completion_v2(
  p_evidence jsonb,
  p_expected_source_sha text
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_evidence is null or p_evidence = '{}'::jsonb then
    raise exception 'evidence_required';
  end if;

  if p_evidence ->> 'protocol_version' <> 'HNK-KETHER-D001-V2' then
    raise exception 'completion_evidence_protocol_mismatch';
  end if;

  if p_evidence ->> 'source_sha' <> p_expected_source_sha then
    raise exception 'completion_evidence_source_sha_mismatch';
  end if;

  if coalesce(p_evidence #>> '{jachin,started}', 'false') <> 'true'
     or coalesce(p_evidence #>> '{jachin,completed}', 'false') <> 'true'
     or coalesce(p_evidence #>> '{jachin,return_confirmed}', 'false') <> 'true'
  then
    raise exception 'day001_jachin_evidence_incomplete';
  end if;

  if coalesce(p_evidence #>> '{ritual_tone_528,started}', 'false') <> 'true' then
    raise exception 'day001_ritual_tone_evidence_incomplete';
  end if;

  if coalesce(p_evidence #>> '{boaz,started}', 'false') <> 'true'
     or coalesce(p_evidence #>> '{boaz,completed}', 'false') <> 'true'
     or coalesce(p_evidence #>> '{boaz,return_confirmed}', 'false') <> 'true'
  then
    raise exception 'day001_boaz_evidence_incomplete';
  end if;

  if coalesce(
       jsonb_typeof(p_evidence #> '{boaz,environment_distractions_count}'),
       'null'
     ) <> 'number'
  then
    raise exception 'day001_boaz_distractions_incomplete';
  end if;

  if (p_evidence #>> '{boaz,environment_distractions_count}')::integer < 3 then
    raise exception 'day001_boaz_distractions_incomplete';
  end if;

  if coalesce(p_evidence #>> '{middle,voice_practice_completed}', 'false') <> 'true'
     or coalesce(p_evidence #>> '{middle,return_confirmed}', 'false') <> 'true'
  then
    raise exception 'day001_middle_evidence_incomplete';
  end if;

  -- Recording is intentionally NOT required.
  if coalesce(p_evidence #>> '{soul_mirror,completed}', 'false') <> 'true' then
    raise exception 'day001_soul_mirror_incomplete';
  end if;

  if coalesce(p_evidence ->> 'voluntary_completion_confirmed', 'false') <> 'true' then
    raise exception 'voluntary_completion_required';
  end if;
end;
$$;

revoke all on function hnk_private.validate_day001_completion_v2(jsonb, text)
from public, anon, authenticated;

create or replace function public.complete_codex_day_v2(
  p_day smallint,
  p_session_id uuid,
  p_completion_contract_id text,
  p_quest_definition_id text,
  p_canonical_source_sha text,
  p_client_completion_id text,
  p_local_record_hash text default null,
  p_client_completed_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_xp integer;
  v_day_source_sha text;
  v_session public.practice_sessions%rowtype;
  v_contract hnk_private.completion_contract_registry%rowtype;
  v_receipt hnk_private.completion_request_receipts%rowtype;
  v_existing boolean;
  v_new_completion boolean := false;
  v_prev_complete boolean;
  v_prior_count integer;
  v_awarded_xp integer := 0;
  v_xp_total integer;
  v_grade smallint;
  v_title text;
  v_current_day smallint;
  v_current_chapter smallint;
  v_current_sephira text;
  v_crown jsonb;
  v_progression_events jsonb := '[]'::jsonb;
  v_response jsonb;
  v_server_completed_at timestamptz := now();
begin
  if v_uid is null then
    raise exception 'authentication_required';
  end if;

  if p_day < 1 or p_day > 365 then
    raise exception 'invalid_day';
  end if;

  if nullif(btrim(p_client_completion_id), '') is null then
    raise exception 'client_completion_id_required';
  end if;

  -- Serialize replays that share the same client completion identity.
  -- This prevents a concurrent retry from overwriting the original receipt
  -- with a later zero-XP response after the canonical completion already won.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_uid::text || ':' || p_client_completion_id,
      0
    )
  );

  select *
  into v_receipt
  from hnk_private.completion_request_receipts
  where user_id = v_uid
    and client_completion_id = p_client_completion_id
  for update;

  if found then
    if v_receipt.day <> p_day
       or v_receipt.session_id <> p_session_id
       or v_receipt.completion_contract_id <> p_completion_contract_id
       or v_receipt.quest_definition_id <> p_quest_definition_id
       or v_receipt.canonical_source_sha <> p_canonical_source_sha
    then
      raise exception 'client_completion_id_conflict';
    end if;

    if v_receipt.response is not null then
      return v_receipt.response;
    end if;
  end if;

  select *
  into v_contract
  from hnk_private.completion_contract_registry
  where completion_contract_id = p_completion_contract_id
    and status = 'active';

  if not found then
    raise exception 'completion_contract_not_found';
  end if;

  if v_contract.day <> p_day then
    raise exception 'completion_contract_day_mismatch';
  end if;

  if v_contract.quest_definition_id <> p_quest_definition_id then
    raise exception 'quest_definition_mismatch';
  end if;

  if v_contract.canonical_source_sha <> p_canonical_source_sha then
    raise exception 'canonical_source_sha_mismatch';
  end if;

  select xp, source_sha
  into v_xp, v_day_source_sha
  from public.codex_days
  where day = p_day
    and status = 'canon';

  if v_xp is null then
    raise exception 'canonical_day_not_found';
  end if;

  if v_day_source_sha <> p_canonical_source_sha then
    raise exception 'canonical_source_sha_stale';
  end if;

  select *
  into v_session
  from public.practice_sessions
  where id = p_session_id
    and user_id = v_uid
    and day = p_day
  for update;

  if not found then
    raise exception 'practice_session_not_found';
  end if;

  if v_session.state not in ('evidence_pending','complete') then
    raise exception 'practice_session_not_ready';
  end if;

  select exists(
    select 1
    from public.day_completions
    where user_id = v_uid
      and day = p_day
  )
  into v_existing;

  if not v_existing then
    case v_contract.validator_key
      when 'day001_v2' then
        perform hnk_private.validate_day001_completion_v2(
          v_session.evidence,
          p_canonical_source_sha
        );
      else
        raise exception 'completion_validator_not_supported';
    end case;

    if p_day between 2 and 35 then
      select exists(
        select 1
        from public.day_completions
        where user_id = v_uid
          and day = p_day - 1
      )
      into v_prev_complete;

      if not v_prev_complete then
        raise exception 'previous_day_required';
      end if;
    elsif p_day = 36 then
      select count(*)::integer
      into v_prior_count
      from public.day_completions
      where user_id = v_uid
        and day between 1 and 35;

      if v_prior_count <> 35 then
        raise exception 'kether_portal_locked';
      end if;
    end if;
  end if;

  insert into hnk_private.completion_request_receipts (
    user_id,
    client_completion_id,
    day,
    session_id,
    completion_contract_id,
    quest_definition_id,
    canonical_source_sha
  ) values (
    v_uid,
    p_client_completion_id,
    p_day,
    p_session_id,
    p_completion_contract_id,
    p_quest_definition_id,
    p_canonical_source_sha
  )
  on conflict (user_id, client_completion_id) do nothing;

  if not v_existing then
    insert into public.day_completions (
      user_id,
      day,
      completion_version,
      local_record_hash,
      client_completed_at,
      first_completion_session_id
    ) values (
      v_uid,
      p_day,
      v_contract.contract_version,
      p_local_record_hash,
      p_client_completed_at,
      p_session_id
    )
    on conflict (user_id, day) do nothing
    returning true into v_new_completion;

    v_new_completion := coalesce(v_new_completion, false);

    if v_new_completion then
      insert into public.xp_events (
        user_id,
        day,
        source,
        amount,
        idempotency_key,
        metadata
      ) values (
        v_uid,
        p_day,
        'canonical_day_completion',
        v_xp,
        v_uid::text || ':day:' || p_day::text || ':completion:' || v_contract.contract_version,
        jsonb_build_object(
          'practice_session_id', p_session_id,
          'completion_contract_id', p_completion_contract_id,
          'quest_definition_id', p_quest_definition_id,
          'canonical_source_sha', p_canonical_source_sha,
          'completion_version', v_contract.contract_version,
          'client_completion_id', p_client_completion_id
        )
      )
      on conflict (idempotency_key) do nothing
      returning amount into v_awarded_xp;

      v_awarded_xp := coalesce(v_awarded_xp, 0);

      insert into public.user_progress(user_id)
      values (v_uid)
      on conflict (user_id) do nothing;

      update public.user_progress
      set
        xp_total = xp_total + v_awarded_xp,
        current_day = greatest(current_day, least(p_day + 1, 365)),
        updated_at = now()
      where user_id = v_uid;

      if p_day = 36 then
        update public.user_progress
        set
          initiatory_grade = 2,
          initiatory_title = 'Iniciado',
          current_day = 37,
          current_chapter = 2,
          current_sephira = 'Chokmah',
          updated_at = now()
        where user_id = v_uid;
      end if;
    end if;
  end if;

  update public.practice_sessions
  set
    state = 'complete',
    ended_at = coalesce(ended_at, now()),
    local_record_hash = coalesce(p_local_record_hash, local_record_hash),
    updated_at = now()
  where id = p_session_id;

  insert into public.user_progress(user_id)
  values (v_uid)
  on conflict (user_id) do nothing;

  select
    xp_total,
    initiatory_grade,
    initiatory_title,
    current_day,
    current_chapter,
    current_sephira
  into
    v_xp_total,
    v_grade,
    v_title,
    v_current_day,
    v_current_chapter,
    v_current_sephira
  from public.user_progress
  where user_id = v_uid;

  v_crown := public.get_kether_crown_state();

  if v_new_completion and p_day = 1 then
    v_progression_events := v_progression_events || '["KETHER_FIRST_SPARK"]'::jsonb;
  end if;

  if v_new_completion then
    v_progression_events := v_progression_events || '["NEXT_DAY_UNLOCKED"]'::jsonb;
  end if;

  if v_new_completion
     and p_day in (5,10,15,20,25,30,35)
  then
    v_progression_events := v_progression_events || '["KETHER_FRAGMENT_LIT"]'::jsonb;
  end if;

  if v_new_completion and p_day = 35 then
    v_progression_events := v_progression_events || '["KETHER_PORTAL_UNLOCKED"]'::jsonb;
  end if;

  if v_new_completion and p_day = 36 then
    v_progression_events := v_progression_events
      || '["KETHER_COMPLETE","INITIATORY_GRADE_CHANGED"]'::jsonb;
  end if;

  v_response := jsonb_build_object(
    'day', p_day,
    'completion_contract_id', p_completion_contract_id,
    'quest_definition_id', p_quest_definition_id,
    'canonical_source_sha', p_canonical_source_sha,
    'first_completion', v_new_completion,
    'xp_awarded', v_awarded_xp,
    'xp_total', v_xp_total,
    'initiatory_grade', v_grade,
    'initiatory_title', v_title,
    'crown', v_crown,
    'progress', jsonb_build_object(
      'current_day', v_current_day,
      'current_chapter', v_current_chapter,
      'current_sephira', v_current_sephira,
      'initiatory_grade', v_grade,
      'initiatory_title', v_title,
      'xp_total', v_xp_total
    ),
    'progression_events', v_progression_events,
    'server_completed_at', v_server_completed_at
  );

  update hnk_private.completion_request_receipts
  set
    response = v_response,
    updated_at = now()
  where user_id = v_uid
    and client_completion_id = p_client_completion_id;

  return v_response;
end;
$$;

revoke all on function public.complete_codex_day_v2(
  smallint, uuid, text, text, text, text, text, timestamptz
) from public, anon;

grant execute on function public.complete_codex_day_v2(
  smallint, uuid, text, text, text, text, text, timestamptz
) to authenticated;

-- IMPORTANT ROLLOUT NOTE:
-- Do NOT revoke authenticated execution on legacy public.complete_codex_day(...)
-- in this draft. Revoke it only after Web + Expo have migrated to V2 and
-- contract/replay/concurrency tests are green in the canonical Supabase scaffold.
