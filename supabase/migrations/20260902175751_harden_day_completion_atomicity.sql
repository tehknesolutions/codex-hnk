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
  v_awarded_xp integer := 0;
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

  if v_session.state not in ('evidence_pending','complete') then
    raise exception 'practice_session_not_ready';
  end if;

  select exists(
    select 1 from public.day_completions
    where user_id = v_uid and day = p_day
  ) into v_existing;

  if not v_existing and (v_session.evidence is null or v_session.evidence = '{}'::jsonb) then
    raise exception 'evidence_required';
  end if;

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
    )
    on conflict (user_id, day) do nothing
    returning true into v_new_completion;

    v_new_completion := coalesce(v_new_completion, false);

    if v_new_completion then
      insert into public.xp_events(user_id, day, source, amount, idempotency_key, metadata)
      values (
        v_uid,
        p_day,
        'canonical_day_completion',
        v_xp,
        v_uid::text || ':day:' || p_day::text || ':completion:v2',
        jsonb_build_object('practice_session_id', p_session_id, 'completion_version', '2')
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

  select xp_total, initiatory_grade, initiatory_title
  into v_xp_total, v_grade, v_title
  from public.user_progress
  where user_id = v_uid;

  return jsonb_build_object(
    'day', p_day,
    'first_completion', v_new_completion,
    'xp_awarded', v_awarded_xp,
    'xp_total', v_xp_total,
    'initiatory_grade', v_grade,
    'initiatory_title', v_title,
    'crown', public.get_kether_crown_state()
  );
end;
$$;