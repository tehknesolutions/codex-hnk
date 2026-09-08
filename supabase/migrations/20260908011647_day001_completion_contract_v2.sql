-- HNK CODEX — Day 001 Completion Contract V2
-- Applied to Supabase project codex-hnk-app as migration 20260908011647.
-- Additive rollout: legacy public.complete_codex_day(...) remains available
-- until Web/Expo clients migrate to V2.

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

revoke all on table hnk_private.completion_contract_registry from public, anon, authenticated;

create table if not exists hnk_private.completion_request_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_completion_id text not null check (char_length(client_completion_id) between 1 and 160),
  day smallint not null references public.codex_days(day) on delete cascade,
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  completion_contract_id text not null references hnk_private.completion_contract_registry(completion_contract_id) on delete restrict,
  quest_definition_id text not null,
  canonical_source_sha text not null,
  response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, client_completion_id)
);

revoke all on table hnk_private.completion_request_receipts from public, anon, authenticated;

create index if not exists completion_request_receipts_day_idx
  on hnk_private.completion_request_receipts(day);
create index if not exists completion_request_receipts_session_idx
  on hnk_private.completion_request_receipts(session_id);
create index if not exists completion_request_receipts_contract_idx
  on hnk_private.completion_request_receipts(completion_contract_id);

insert into hnk_private.completion_contract_registry (
  completion_contract_id, quest_definition_id, day, canonical_source_sha,
  contract_version, validator_key, status
) values (
  'HNK-KETHER-D001-COMP-V2', 'HNK-KETHER-D001-V2', 1,
  'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29', '2', 'day001_v2', 'active'
)
on conflict (completion_contract_id) do update
set quest_definition_id = excluded.quest_definition_id,
    day = excluded.day,
    canonical_source_sha = excluded.canonical_source_sha,
    contract_version = excluded.contract_version,
    validator_key = excluded.validator_key,
    status = excluded.status,
    updated_at = now();

create or replace function hnk_private.jsonb_is_nonnegative_integer(p_value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(p_value) = 'number'
    and (p_value #>> '{}')::numeric >= 0
    and trunc((p_value #>> '{}')::numeric) = (p_value #>> '{}')::numeric;
$$;
revoke all on function hnk_private.jsonb_is_nonnegative_integer(jsonb) from public, anon, authenticated;

create or replace function hnk_private.jsonb_is_rating_or_null(p_value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_value is null
    or p_value = 'null'::jsonb
    or (
      jsonb_typeof(p_value) = 'number'
      and (p_value #>> '{}')::numeric between 0 and 10
      and trunc((p_value #>> '{}')::numeric) = (p_value #>> '{}')::numeric
    );
$$;
revoke all on function hnk_private.jsonb_is_rating_or_null(jsonb) from public, anon, authenticated;

create or replace function hnk_private.jsonb_is_opaque_ref_or_null(p_value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_value is null
    or p_value = 'null'::jsonb
    or (
      jsonb_typeof(p_value) = 'string'
      and char_length(p_value #>> '{}') between 1 and 256
      and (p_value #>> '{}') !~ '\\s'
    );
$$;
revoke all on function hnk_private.jsonb_is_opaque_ref_or_null(jsonb) from public, anon, authenticated;

create or replace function hnk_private.validate_day001_completion_v2(
  p_evidence jsonb,
  p_expected_source_sha text
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_key text;
  v_item text;
  v_allowed_phenomenology constant text[] := array[
    'MANY_THOUGHTS','SLEEPINESS','CALM','AGITATION','IMAGES',
    'BODY_SENSATIONS','SILENCE','STRONG_EMOTION','NOTHING_SPECIAL','OTHER'
  ];
begin
  if p_evidence is null or p_evidence = '{}'::jsonb or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'evidence_required';
  end if;

  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_version','source_sha','session_id','mode','jachin','ritual_tone_528',
      'boaz','middle','phenomenology','soul_mirror','voluntary_completion_confirmed',
      'safety_stop_occurred'
    ]) then raise exception 'day001_evidence_unknown_field'; end if;
  end loop;

  if jsonb_typeof(p_evidence -> 'protocol_version') <> 'string'
     or p_evidence ->> 'protocol_version' <> 'HNK-KETHER-D001-V2'
  then raise exception 'completion_evidence_protocol_mismatch'; end if;

  if jsonb_typeof(p_evidence -> 'source_sha') <> 'string'
     or p_evidence ->> 'source_sha' <> p_expected_source_sha
  then raise exception 'completion_evidence_source_sha_mismatch'; end if;

  if jsonb_typeof(p_evidence -> 'session_id') <> 'string'
     or nullif(btrim(p_evidence ->> 'session_id'), '') is null
  then raise exception 'day001_session_id_required'; end if;

  if p_evidence ? 'mode' and (
    jsonb_typeof(p_evidence -> 'mode') <> 'string'
    or p_evidence ->> 'mode' not in ('first_completion','revisit')
  ) then raise exception 'day001_mode_invalid'; end if;

  if jsonb_typeof(p_evidence -> 'jachin') <> 'object' then raise exception 'day001_jachin_evidence_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'jachin') loop
    if v_key <> all(array['started','completed','duration_seconds','attention_returns','focus_rating','silence_rating','comfort_rating','return_confirmed'])
    then raise exception 'day001_jachin_unknown_field'; end if;
  end loop;
  if p_evidence #> '{jachin,started}' <> 'true'::jsonb
     or p_evidence #> '{jachin,completed}' <> 'true'::jsonb
     or p_evidence #> '{jachin,return_confirmed}' <> 'true'::jsonb
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{jachin,duration_seconds}')
  then raise exception 'day001_jachin_evidence_incomplete'; end if;
  if p_evidence #> '{jachin,attention_returns}' is not null
     and not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{jachin,attention_returns}')
  then raise exception 'day001_attention_returns_invalid'; end if;
  if not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{jachin,focus_rating}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{jachin,silence_rating}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{jachin,comfort_rating}')
  then raise exception 'day001_jachin_rating_invalid'; end if;

  if jsonb_typeof(p_evidence -> 'ritual_tone_528') <> 'object' then raise exception 'day001_ritual_tone_evidence_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'ritual_tone_528') loop
    if v_key <> all(array['started','duration_seconds','stopped_for_discomfort'])
    then raise exception 'day001_ritual_tone_unknown_field'; end if;
  end loop;
  if p_evidence #> '{ritual_tone_528,started}' <> 'true'::jsonb then raise exception 'day001_ritual_tone_evidence_incomplete'; end if;
  if p_evidence #> '{ritual_tone_528,duration_seconds}' is not null
     and p_evidence #> '{ritual_tone_528,duration_seconds}' <> 'null'::jsonb
     and not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{ritual_tone_528,duration_seconds}')
  then raise exception 'day001_ritual_tone_duration_invalid'; end if;
  if p_evidence #> '{ritual_tone_528,stopped_for_discomfort}' is not null
     and jsonb_typeof(p_evidence #> '{ritual_tone_528,stopped_for_discomfort}') <> 'boolean'
  then raise exception 'day001_ritual_tone_stop_invalid'; end if;

  if jsonb_typeof(p_evidence -> 'boaz') <> 'object' then raise exception 'day001_boaz_evidence_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'boaz') loop
    if v_key <> all(array['started','completed','duration_seconds','relaxation_rating','subjective_depth_rating','comfort_rating','environment_distractions_count','vault_entry_ref','return_confirmed'])
    then raise exception 'day001_boaz_unknown_field'; end if;
  end loop;
  if p_evidence #> '{boaz,started}' <> 'true'::jsonb
     or p_evidence #> '{boaz,completed}' <> 'true'::jsonb
     or p_evidence #> '{boaz,return_confirmed}' <> 'true'::jsonb
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{boaz,duration_seconds}')
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{boaz,environment_distractions_count}')
     or (p_evidence #>> '{boaz,environment_distractions_count}')::integer < 3
  then raise exception 'day001_boaz_evidence_incomplete'; end if;
  if not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{boaz,relaxation_rating}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{boaz,subjective_depth_rating}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{boaz,comfort_rating}')
     or not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence #> '{boaz,vault_entry_ref}')
  then raise exception 'day001_boaz_optional_field_invalid'; end if;

  if jsonb_typeof(p_evidence -> 'middle') <> 'object' then raise exception 'day001_middle_evidence_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'middle') loop
    if v_key <> all(array['voice_practice_completed','duration_seconds','voice_recorded','encrypted_voice_ref','return_confirmed'])
    then raise exception 'day001_middle_unknown_field'; end if;
  end loop;
  if p_evidence #> '{middle,voice_practice_completed}' <> 'true'::jsonb
     or p_evidence #> '{middle,return_confirmed}' <> 'true'::jsonb
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{middle,duration_seconds}')
     or jsonb_typeof(p_evidence #> '{middle,voice_recorded}') <> 'boolean'
  then raise exception 'day001_middle_evidence_incomplete'; end if;
  if not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence #> '{middle,encrypted_voice_ref}')
  then raise exception 'day001_voice_ref_invalid'; end if;
  if p_evidence #> '{middle,voice_recorded}' = 'true'::jsonb
     and (p_evidence #> '{middle,encrypted_voice_ref}' is null or p_evidence #> '{middle,encrypted_voice_ref}' = 'null'::jsonb)
  then raise exception 'encrypted_voice_ref_required'; end if;

  if p_evidence ? 'phenomenology' then
    if jsonb_typeof(p_evidence -> 'phenomenology') <> 'array' then raise exception 'day001_phenomenology_invalid'; end if;
    if jsonb_array_length(p_evidence -> 'phenomenology') <> (
      select count(distinct value) from jsonb_array_elements_text(p_evidence -> 'phenomenology')
    ) then raise exception 'day001_phenomenology_duplicate'; end if;
    for v_item in select value from jsonb_array_elements_text(p_evidence -> 'phenomenology') loop
      if v_item <> all(v_allowed_phenomenology) then raise exception 'day001_phenomenology_invalid'; end if;
    end loop;
  end if;

  if jsonb_typeof(p_evidence -> 'soul_mirror') <> 'object' then raise exception 'day001_soul_mirror_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'soul_mirror') loop
    if v_key <> all(array['completed','state_before','state_after','difficulty_rating','vault_entry_ref'])
    then raise exception 'day001_soul_mirror_unknown_field'; end if;
  end loop;
  if p_evidence #> '{soul_mirror,completed}' <> 'true'::jsonb then raise exception 'day001_soul_mirror_incomplete'; end if;
  if not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{soul_mirror,state_before}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{soul_mirror,state_after}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{soul_mirror,difficulty_rating}')
     or not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence #> '{soul_mirror,vault_entry_ref}')
  then raise exception 'day001_soul_mirror_optional_field_invalid'; end if;

  if p_evidence -> 'voluntary_completion_confirmed' <> 'true'::jsonb then raise exception 'voluntary_completion_required'; end if;
  if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence -> 'safety_stop_occurred') <> 'boolean'
  then raise exception 'day001_safety_stop_invalid'; end if;
end;
$$;
revoke all on function hnk_private.validate_day001_completion_v2(jsonb, text) from public, anon, authenticated;

create or replace function hnk_private.complete_codex_day_v2_impl(
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
  if v_uid is null then raise exception 'authentication_required'; end if;
  if p_day < 1 or p_day > 365 then raise exception 'invalid_day'; end if;
  if nullif(btrim(p_client_completion_id), '') is null then raise exception 'client_completion_id_required'; end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_uid::text || ':' || p_client_completion_id, 0)
  );

  select * into v_receipt
  from hnk_private.completion_request_receipts
  where user_id = v_uid and client_completion_id = p_client_completion_id
  for update;

  if found then
    if v_receipt.day <> p_day
       or v_receipt.session_id <> p_session_id
       or v_receipt.completion_contract_id <> p_completion_contract_id
       or v_receipt.quest_definition_id <> p_quest_definition_id
       or v_receipt.canonical_source_sha <> p_canonical_source_sha
    then raise exception 'client_completion_id_conflict'; end if;
    if v_receipt.response is not null then return v_receipt.response; end if;
  end if;

  select * into v_contract
  from hnk_private.completion_contract_registry
  where completion_contract_id = p_completion_contract_id and status = 'active';
  if not found then raise exception 'completion_contract_not_found'; end if;
  if v_contract.day <> p_day then raise exception 'completion_contract_day_mismatch'; end if;
  if v_contract.quest_definition_id <> p_quest_definition_id then raise exception 'quest_definition_mismatch'; end if;
  if v_contract.canonical_source_sha <> p_canonical_source_sha then raise exception 'canonical_source_sha_mismatch'; end if;

  select xp, source_sha into v_xp, v_day_source_sha
  from public.codex_days where day = p_day and status = 'canon';
  if v_xp is null then raise exception 'canonical_day_not_found'; end if;
  if v_day_source_sha <> p_canonical_source_sha then raise exception 'canonical_source_sha_stale'; end if;

  select * into v_session
  from public.practice_sessions
  where id = p_session_id and user_id = v_uid and day = p_day
  for update;
  if not found then raise exception 'practice_session_not_found'; end if;
  if v_session.state not in ('evidence_pending','complete') then raise exception 'practice_session_not_ready'; end if;
  if v_session.evidence ->> 'session_id' <> p_session_id::text then raise exception 'completion_evidence_session_mismatch'; end if;

  select exists(
    select 1 from public.day_completions where user_id = v_uid and day = p_day
  ) into v_existing;

  if not v_existing then
    case v_contract.validator_key
      when 'day001_v2' then
        perform hnk_private.validate_day001_completion_v2(v_session.evidence, p_canonical_source_sha);
      else raise exception 'completion_validator_not_supported';
    end case;

    if p_day between 2 and 35 then
      select exists(
        select 1 from public.day_completions where user_id = v_uid and day = p_day - 1
      ) into v_prev_complete;
      if not v_prev_complete then raise exception 'previous_day_required'; end if;
    elsif p_day = 36 then
      select count(*)::integer into v_prior_count
      from public.day_completions where user_id = v_uid and day between 1 and 35;
      if v_prior_count <> 35 then raise exception 'kether_portal_locked'; end if;
    end if;
  end if;

  insert into hnk_private.completion_request_receipts (
    user_id, client_completion_id, day, session_id,
    completion_contract_id, quest_definition_id, canonical_source_sha
  ) values (
    v_uid, p_client_completion_id, p_day, p_session_id,
    p_completion_contract_id, p_quest_definition_id, p_canonical_source_sha
  ) on conflict (user_id, client_completion_id) do nothing;

  if not v_existing then
    insert into public.day_completions (
      user_id, day, completion_version, local_record_hash,
      client_completed_at, first_completion_session_id
    ) values (
      v_uid, p_day, v_contract.contract_version, p_local_record_hash,
      p_client_completed_at, p_session_id
    ) on conflict (user_id, day) do nothing
    returning true into v_new_completion;

    v_new_completion := coalesce(v_new_completion, false);

    if v_new_completion then
      insert into public.xp_events (
        user_id, day, source, amount, idempotency_key, metadata
      ) values (
        v_uid, p_day, 'canonical_day_completion', v_xp,
        v_uid::text || ':day:' || p_day::text || ':completion:' || v_contract.contract_version,
        jsonb_build_object(
          'practice_session_id', p_session_id,
          'completion_contract_id', p_completion_contract_id,
          'quest_definition_id', p_quest_definition_id,
          'canonical_source_sha', p_canonical_source_sha,
          'completion_version', v_contract.contract_version,
          'client_completion_id', p_client_completion_id
        )
      ) on conflict (idempotency_key) do nothing
      returning amount into v_awarded_xp;

      v_awarded_xp := coalesce(v_awarded_xp, 0);
      insert into public.user_progress(user_id) values (v_uid)
      on conflict (user_id) do nothing;

      update public.user_progress
      set xp_total = xp_total + v_awarded_xp,
          current_day = greatest(current_day, least(p_day + 1, 365)),
          updated_at = now()
      where user_id = v_uid;

      if p_day = 36 then
        update public.user_progress
        set initiatory_grade = 2,
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
  set state = 'complete',
      ended_at = coalesce(ended_at, now()),
      local_record_hash = coalesce(p_local_record_hash, local_record_hash),
      updated_at = now()
  where id = p_session_id;

  insert into public.user_progress(user_id) values (v_uid)
  on conflict (user_id) do nothing;

  select xp_total, initiatory_grade, initiatory_title, current_day, current_chapter, current_sephira
  into v_xp_total, v_grade, v_title, v_current_day, v_current_chapter, v_current_sephira
  from public.user_progress where user_id = v_uid;

  v_crown := public.get_kether_crown_state();
  if v_new_completion and p_day = 1 then v_progression_events := v_progression_events || '["KETHER_FIRST_SPARK"]'::jsonb; end if;
  if v_new_completion then v_progression_events := v_progression_events || '["NEXT_DAY_UNLOCKED"]'::jsonb; end if;
  if v_new_completion and p_day in (5,10,15,20,25,30,35) then v_progression_events := v_progression_events || '["KETHER_FRAGMENT_LIT"]'::jsonb; end if;
  if v_new_completion and p_day = 35 then v_progression_events := v_progression_events || '["KETHER_PORTAL_UNLOCKED"]'::jsonb; end if;
  if v_new_completion and p_day = 36 then v_progression_events := v_progression_events || '["KETHER_COMPLETE","INITIATORY_GRADE_CHANGED"]'::jsonb; end if;

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
  set response = v_response, updated_at = now()
  where user_id = v_uid and client_completion_id = p_client_completion_id;

  return v_response;
end;
$$;

revoke all on function hnk_private.complete_codex_day_v2_impl(smallint, uuid, text, text, text, text, text, timestamptz)
from public, anon, authenticated;
grant usage on schema hnk_private to authenticated;
grant execute on function hnk_private.complete_codex_day_v2_impl(smallint, uuid, text, text, text, text, text, timestamptz)
to authenticated;

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
language sql
security invoker
set search_path = ''
as $$
  select hnk_private.complete_codex_day_v2_impl(
    p_day, p_session_id, p_completion_contract_id, p_quest_definition_id,
    p_canonical_source_sha, p_client_completion_id, p_local_record_hash,
    p_client_completed_at
  );
$$;

revoke all on function public.complete_codex_day_v2(smallint, uuid, text, text, text, text, text, timestamptz)
from public, anon, authenticated;
grant execute on function public.complete_codex_day_v2(smallint, uuid, text, text, text, text, text, timestamptz)
to authenticated;
