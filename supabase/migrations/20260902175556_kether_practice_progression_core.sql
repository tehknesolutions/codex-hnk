alter table public.user_progress rename column level to initiatory_grade;

alter table public.user_progress
  add column initiatory_title text not null default 'Neófito';

alter table public.user_progress
  add constraint user_progress_initiatory_title_check
  check (initiatory_title in ('Neófito','Iniciado','Teurgo','Praticante','Adepto','Iluminado','Mestre de Graus','Filósofo Tecnomago','Astralnauta','Magus do Reino'));

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day smallint not null references public.codex_days(day) on delete cascade,
  client_session_id text not null,
  mode text not null default 'first_completion' check (mode in ('first_completion','revisit')),
  state text not null default 'active' check (state in ('active','interrupted','evidence_pending','complete')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  metrics jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  local_record_hash text,
  app_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_session_id)
);

create index practice_sessions_user_day_idx on public.practice_sessions(user_id, day, created_at desc);
create index practice_sessions_day_idx on public.practice_sessions(day);

create trigger practice_sessions_set_updated_at
before update on public.practice_sessions
for each row execute function hnk_private.set_updated_at();

alter table public.practice_sessions enable row level security;
revoke all on table public.practice_sessions from anon, authenticated;
grant select, insert, update on table public.practice_sessions to authenticated;

create policy practice_sessions_select_own on public.practice_sessions
for select to authenticated
using ((select auth.uid()) = user_id);

create policy practice_sessions_insert_own on public.practice_sessions
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy practice_sessions_update_own on public.practice_sessions
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter table public.day_completions
  add column first_completion_session_id uuid references public.practice_sessions(id) on delete set null;

create index day_completions_first_session_idx on public.day_completions(first_completion_session_id);

revoke insert, update, delete on table public.day_completions from authenticated;
drop policy if exists day_completions_insert_own on public.day_completions;
drop policy if exists day_completions_update_own on public.day_completions;
drop policy if exists day_completions_delete_own on public.day_completions;

create or replace function public.get_kether_crown_state()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_days_completed integer;
  v_fragments_lit integer;
  v_cycles jsonb;
begin
  if v_uid is null then
    raise exception 'authentication_required';
  end if;

  select count(*)::integer
    into v_days_completed
  from public.day_completions
  where user_id = v_uid and day between 1 and 36;

  with cycles(fragment, angel, day_start, day_end) as (
    values
      (1, 'Vehuiah'::text, 1, 5),
      (2, 'Jeliel'::text, 6, 10),
      (3, 'Sitael'::text, 11, 15),
      (4, 'Elemiah'::text, 16, 20),
      (5, 'Mahasiah'::text, 21, 25),
      (6, 'Lelahel'::text, 26, 30),
      (7, 'Achaiah'::text, 31, 35)
  ), states as (
    select c.*,
      (select count(*) from public.day_completions dc
       where dc.user_id = v_uid and dc.day between c.day_start and c.day_end)::integer as completed_days
    from cycles c
  )
  select
    coalesce(sum(case when completed_days = 5 then 1 else 0 end),0)::integer,
    jsonb_agg(jsonb_build_object(
      'fragment', fragment,
      'angel', angel,
      'days', jsonb_build_array(day_start, day_end),
      'completed_days', completed_days,
      'lit', completed_days = 5
    ) order by fragment)
  into v_fragments_lit, v_cycles
  from states;

  return jsonb_build_object(
    'sephira', 'Kether',
    'days_completed', v_days_completed,
    'fragments_lit', v_fragments_lit,
    'fragments_total', 7,
    'portal_unlocked', (select count(*) = 35 from public.day_completions where user_id = v_uid and day between 1 and 35),
    'kether_complete', (select count(*) = 36 from public.day_completions where user_id = v_uid and day between 1 and 36),
    'cycles', v_cycles
  );
end;
$$;

revoke all on function public.get_kether_crown_state() from public, anon;
grant execute on function public.get_kether_crown_state() to authenticated;

create or replace function public.complete_codex_day(
  p_day smallint,
  p_session_id uuid,
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
  v_session public.practice_sessions%rowtype;
  v_new_completion boolean := false;
  v_existing boolean;
  v_prev_complete boolean;
  v_prior_count integer;
  v_xp_total integer;
  v_grade smallint;
  v_title text;
begin
  if v_uid is null then
    raise exception 'authentication_required';
  end if;

  if p_day < 1 or p_day > 365 then
    raise exception 'invalid_day';
  end if;

  select xp into v_xp
  from public.codex_days
  where day = p_day and status = 'canon';

  if v_xp is null then
    raise exception 'canonical_day_not_found';
  end if;

  select * into v_session
  from public.practice_sessions
  where id = p_session_id and user_id = v_uid and day = p_day
  for update;

  if not found then
    raise exception 'practice_session_not_found';
  end if;

  if v_session.state not in ('active','evidence_pending','complete') then
    raise exception 'practice_session_not_ready';
  end if;

  select exists(
    select 1 from public.day_completions
    where user_id = v_uid and day = p_day
  ) into v_existing;

  if not v_existing then
    if p_day between 2 and 35 then
      select exists(
        select 1 from public.day_completions
        where user_id = v_uid and day = p_day - 1
      ) into v_prev_complete;
      if not v_prev_complete then
        raise exception 'previous_day_required';
      end if;
    elsif p_day = 36 then
      select count(*)::integer into v_prior_count
      from public.day_completions
      where user_id = v_uid and day between 1 and 35;
      if v_prior_count <> 35 then
        raise exception 'kether_portal_locked';
      end if;
    end if;

    insert into public.day_completions(
      user_id, day, completion_version, local_record_hash,
      client_completed_at, first_completion_session_id
    ) values (
      v_uid, p_day, '2', p_local_record_hash,
      p_client_completed_at, p_session_id
    );

    v_new_completion := true;

    insert into public.xp_events(user_id, day, source, amount, idempotency_key, metadata)
    values (
      v_uid,
      p_day,
      'canonical_day_completion',
      v_xp,
      v_uid::text || ':day:' || p_day::text || ':completion:v2',
      jsonb_build_object('practice_session_id', p_session_id, 'completion_version', '2')
    )
    on conflict (idempotency_key) do nothing;

    insert into public.user_progress(user_id)
    values (v_uid)
    on conflict (user_id) do nothing;

    update public.user_progress
    set
      xp_total = xp_total + v_xp,
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

  select xp_total, initiatory_grade, initiatory_title
  into v_xp_total, v_grade, v_title
  from public.user_progress
  where user_id = v_uid;

  return jsonb_build_object(
    'day', p_day,
    'first_completion', v_new_completion,
    'xp_awarded', case when v_new_completion then v_xp else 0 end,
    'xp_total', v_xp_total,
    'initiatory_grade', v_grade,
    'initiatory_title', v_title,
    'crown', public.get_kether_crown_state()
  );
end;
$$;

revoke all on function public.complete_codex_day(smallint, uuid, text, timestamptz) from public, anon;
grant execute on function public.complete_codex_day(smallint, uuid, text, timestamptz) to authenticated;
