create or replace function hnk_private.kether_portal_evidence_is_complete(p_evidence jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    coalesce(p_evidence -> 'portal_condition_completed' = 'true'::jsonb, false)
    and coalesce(p_evidence -> 'base_condition_completed' = 'true'::jsonb, false)
    and coalesce(p_evidence -> 'portal_base_comparison_completed' = 'true'::jsonb, false)
    and coalesce(p_evidence -> 'return_confirmed' = 'true'::jsonb, false)
    and coalesce(p_evidence -> 'review_001_035_completed' = 'true'::jsonb, false)
    and case
      when jsonb_typeof(p_evidence -> 'consolidated_competencies_count') = 'number'
        then (p_evidence ->> 'consolidated_competencies_count')::numeric >= 3
      else false
    end
    and case
      when jsonb_typeof(p_evidence -> 'fragile_competencies_count') = 'number'
        then (p_evidence ->> 'fragile_competencies_count')::numeric >= 3
      else false
    end
    and case
      when jsonb_typeof(p_evidence -> 'attribute_evidence_count') = 'number'
        then (p_evidence ->> 'attribute_evidence_count')::numeric >= 7
      else false
    end
    and coalesce(p_evidence -> 'premature_promotion_criterion_declared' = 'true'::jsonb, false)
    and coalesce(p_evidence -> 'kether_synthesis_completed' = 'true'::jsonb, false)
    and coalesce(p_evidence -> 'journal_update_confirmed' = 'true'::jsonb, false)
    and coalesce(p_evidence -> 'safety_blocking_state' = 'false'::jsonb, false);
$$;

revoke all on function hnk_private.kether_portal_evidence_is_complete(jsonb)
from public, anon, authenticated;

create or replace function hnk_private.enforce_kether_portal_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_evidence jsonb;
  v_prior_count integer;
  v_has_vault_entry boolean;
begin
  if new.day <> 36 then
    return new;
  end if;

  if new.first_completion_session_id is null then
    raise exception 'kether_portal_session_required';
  end if;

  select ps.evidence
    into v_evidence
  from public.practice_sessions ps
  where ps.id = new.first_completion_session_id
    and ps.user_id = new.user_id
    and ps.day = 36
    and ps.state in ('evidence_pending', 'complete');

  if not found then
    raise exception 'kether_portal_session_not_ready';
  end if;

  if not hnk_private.kether_portal_evidence_is_complete(v_evidence) then
    raise exception 'kether_portal_evidence_incomplete';
  end if;

  select count(*)::integer
    into v_prior_count
  from public.day_completions dc
  where dc.user_id = new.user_id
    and dc.day between 1 and 35;

  if v_prior_count <> 35 then
    raise exception 'kether_portal_locked';
  end if;

  select exists(
    select 1
    from public.journal_vault jv
    where jv.user_id = new.user_id
      and jv.day = 36
      and char_length(jv.ciphertext) > 0
      and char_length(jv.nonce) > 0
  ) into v_has_vault_entry;

  if not v_has_vault_entry then
    raise exception 'kether_portal_journal_required';
  end if;

  return new;
end;
$$;

revoke all on function hnk_private.enforce_kether_portal_completion()
from public, anon, authenticated;

drop trigger if exists day_completions_enforce_kether_portal on public.day_completions;
create trigger day_completions_enforce_kether_portal
before insert on public.day_completions
for each row
when (new.day = 36)
execute function hnk_private.enforce_kether_portal_completion();
