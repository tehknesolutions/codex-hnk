-- HNK Portal completion evidence gate V1
-- Prevents canonical Portal rewards/promotions from being unlocked by a generic non-empty JSON evidence object.
-- Portal 073 and 109 remain closed until their exact operator sets are explicitly published.

create table if not exists hnk_private.portal_operator_sets (
  portal_day smallint primary key check (portal_day in (73, 109)),
  status text not null check (status in ('draft', 'approved', 'published', 'retired')),
  evidence_schema_version text not null,
  tuner_preset_id text,
  transition_preset_id text,
  sigil_asset_id text,
  approval_ref text,
  provenance_ref text,
  updated_at timestamptz not null default now(),
  constraint portal_operator_set_publishable check (
    status not in ('approved', 'published')
    or (
      nullif(btrim(tuner_preset_id), '') is not null
      and nullif(btrim(transition_preset_id), '') is not null
      and nullif(btrim(sigil_asset_id), '') is not null
      and nullif(btrim(approval_ref), '') is not null
      and nullif(btrim(provenance_ref), '') is not null
    )
  )
);

revoke all on hnk_private.portal_operator_sets from public, anon, authenticated;

insert into hnk_private.portal_operator_sets (
  portal_day,
  status,
  evidence_schema_version,
  tuner_preset_id,
  transition_preset_id,
  sigil_asset_id,
  approval_ref,
  provenance_ref
)
values
  (73, 'draft', 'HNK-PORTAL-073-EVIDENCE-V1', null, null, null,
   'docs/experience/chokmah/HNK_CHOKMAH_PORTAL_073_EXECUTABLE_SPEC_V1.md',
   'docs/experience/chokmah/editorial/HNK_CHOKMAH_PORTAL_072_073_BATCH_V1.md'),
  (109, 'draft', 'HNK-PORTAL-109-EVIDENCE-V1', null, null, null,
   'docs/experience/binah/HNK_BINAH_PORTAL_109_EXECUTABLE_SPEC_V1.md',
   'docs/experience/binah/editorial/HNK_BINAH_PORTAL_109_BATCH_V1.md')
on conflict (portal_day) do nothing;

create or replace function hnk_private.assert_portal_completion_evidence(
  p_day smallint,
  p_evidence jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cfg hnk_private.portal_operator_sets%rowtype;
begin
  if p_day not in (73, 109) then
    return;
  end if;

  select * into v_cfg
  from hnk_private.portal_operator_sets
  where portal_day = p_day;

  if not found or v_cfg.status <> 'published' then
    raise exception 'portal_operators_not_published';
  end if;

  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'portal_structural_evidence_required';
  end if;

  if coalesce(p_evidence ->> 'schema_version', '') <> v_cfg.evidence_schema_version then
    raise exception 'portal_evidence_schema_mismatch';
  end if;

  if coalesce(p_evidence ->> 'tuner_preset_id', '') <> v_cfg.tuner_preset_id
     or coalesce(p_evidence ->> 'transition_preset_id', '') <> v_cfg.transition_preset_id
     or coalesce(p_evidence ->> 'sigil_asset_id', '') <> v_cfg.sigil_asset_id then
    raise exception 'portal_operator_version_mismatch';
  end if;

  if coalesce(p_evidence ->> 'induction_completed', 'false') <> 'true' then
    raise exception 'portal_induction_required';
  end if;

  if coalesce(p_evidence ->> 'return_gate_confirmed', 'false') <> 'true' then
    raise exception 'portal_return_gate_required';
  end if;

  if nullif(btrim(coalesce(p_evidence ->> 'vault_receipt', '')), '') is null then
    raise exception 'portal_encrypted_vault_receipt_required';
  end if;

  if p_evidence ? 'diary_plaintext'
     or p_evidence ? 'notes_plaintext'
     or p_evidence ? 'journal_plaintext' then
    raise exception 'portal_plaintext_evidence_forbidden';
  end if;
end;
$$;

revoke all on function hnk_private.assert_portal_completion_evidence(smallint, jsonb)
from public, anon, authenticated;

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
    where user_id = v_uid and day = p_day
  ) into v_existing;

  if not v_existing and (v_session.evidence is null or v_session.evidence = '{}'::jsonb) then
    raise exception 'evidence_required';
  end if;

  -- Portal-specific structural evidence is stricter than ordinary Day evidence.
  -- It remains fail-closed until the exact canonical operator set is published.
  if not v_existing and p_day in (73, 109) then
    perform hnk_private.assert_portal_completion_evidence(p_day, v_session.evidence);
  end if;

  if not v_existing then
    if p_day = 36 then
      select count(*)::integer into v_prior_count
      from public.day_completions
      where user_id = v_uid and day between 1 and 35;

      if v_prior_count <> 35 then
        raise exception 'kether_portal_locked';
      end if;

    elsif p_day = 73 then
      select count(*)::integer into v_prior_count
      from public.day_completions
      where user_id = v_uid and day between 37 and 72;

      if v_prior_count <> 36 then
        raise exception 'chokmah_portal_locked';
      end if;

    elsif p_day = 109 then
      select count(*)::integer into v_prior_count
      from public.day_completions
      where user_id = v_uid and day between 74 and 108;

      if v_prior_count <> 35 then
        raise exception 'binah_portal_locked';
      end if;

    elsif p_day between 2 and 108 then
      select exists(
        select 1
        from public.day_completions
        where user_id = v_uid and day = p_day - 1
      ) into v_prev_complete;

      if not v_prev_complete then
        raise exception 'previous_day_required';
      end if;
    end if;

    insert into public.day_completions(
      user_id,
      day,
      completion_version,
      local_record_hash,
      client_completed_at,
      first_completion_session_id
    ) values (
      v_uid,
      p_day,
      '3',
      p_local_record_hash,
      p_client_completed_at,
      p_session_id
    )
    on conflict (user_id, day) do nothing
    returning true into v_new_completion;

    v_new_completion := coalesce(v_new_completion, false);

    if v_new_completion then
      insert into public.xp_events(
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
        v_uid::text || ':day:' || p_day::text || ':completion:v3',
        jsonb_build_object(
          'practice_session_id', p_session_id,
          'completion_version', '3'
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
      elsif p_day = 73 then
        update public.user_progress
        set
          initiatory_grade = 3,
          initiatory_title = 'Teurgo',
          current_day = 74,
          current_chapter = 3,
          current_sephira = 'Binah',
          updated_at = now()
        where user_id = v_uid;
      elsif p_day = 109 then
        update public.user_progress
        set
          initiatory_grade = 4,
          initiatory_title = 'Praticante',
          current_day = 110,
          current_chapter = 4,
          current_sephira = 'Chesed',
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

revoke all on function public.complete_codex_day(smallint, uuid, text, timestamptz)
from public, anon;
grant execute on function public.complete_codex_day(smallint, uuid, text, timestamptz)
to authenticated;
