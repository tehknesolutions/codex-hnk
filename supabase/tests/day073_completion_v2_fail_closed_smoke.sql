-- Portal073 V2 fail-closed smoke.
-- This test deliberately proves the CURRENT unpublished boundary only.
-- It MUST be revised when the authoritative Portal073 release gate is opened.
-- All QA data is transactional and rolled back.

begin;

-- Current release state must not expose an ACTIVE Day073 completion contract.
do $$
begin
  if exists (
    select 1
    from hnk_private.completion_contract_registry
    where day = 73 and status = 'active'
  ) then
    raise exception 'qa_day073_unexpected_active_contract';
  end if;
end $$;

-- Current operator set is approved but intentionally not published.
do $$
declare
  v_status text;
begin
  select status into v_status
  from hnk_private.portal_operator_sets
  where portal_day = 73;

  if v_status is distinct from 'approved' then
    raise exception 'qa_day073_operator_state_drift:%', coalesce(v_status, '<missing>');
  end if;
end $$;

-- Historical structural gate must fail closed before accepting evidence while
-- operators remain unpublished. No user/vault fixture is needed for this gate.
do $$
begin
  begin
    perform hnk_private.assert_portal_completion_evidence(
      73::smallint,
      jsonb_build_object(
        'schema_version', 'HNK-PORTAL-073-EVIDENCE-V1',
        'tuner_preset_id', 'HNK-ANGELIC-TUNER-D073-V1',
        'transition_preset_id', 'HNK-PORTAL073-CHOKHMAH-BINAH-ACTIVE-V1',
        'sigil_asset_id', 'HNK-REF-MAGICIAN-MERCURY-V1',
        'induction_completed', true,
        'return_gate_confirmed', true,
        'tuner_completed', true,
        'transition_audio_completed', true,
        'sigil_completed', true,
        'operator_ids_verified', true,
        'volume_control_available', true,
        'immediate_stop_available', true,
        'safety_clear', true,
        'audio_seconds', 600,
        'vault_receipt', gen_random_uuid()::text
      )
    );
    raise exception 'qa_day073_gate_unexpectedly_open';
  exception
    when others then
      if sqlerrm <> 'portal_operators_not_published' then
        raise exception 'qa_day073_wrong_fail_closed_error:%', sqlerrm;
      end if;
  end;
end $$;

-- The modern V2 path must also remain unavailable without an ACTIVE contract.
-- We intentionally stop at registry state rather than fabricate a completion.
do $$
declare
  v_impl text;
begin
  select pg_get_functiondef(
    'hnk_private.complete_codex_day_v2_impl(smallint,uuid,text,text,text,text,text,timestamptz)'::regprocedure
  ) into v_impl;

  if v_impl not like '%if p_day=73 then%' and v_impl not like '%if p_day = 73 then%' then
    raise exception 'qa_day073_frozen_progression_branch_missing';
  end if;

  if v_impl not like '%p_day<>73%' and v_impl not like '%p_day <> 73%' then
    raise exception 'qa_day073_next_day_suppression_missing';
  end if;

  if has_function_privilege('anon', 'hnk_private.complete_codex_day_v2_impl(smallint,uuid,text,text,text,text,text,timestamptz)', 'EXECUTE')
     or has_function_privilege('authenticated', 'hnk_private.complete_codex_day_v2_impl(smallint,uuid,text,text,text,text,text,timestamptz)', 'EXECUTE') then
    raise exception 'qa_day073_private_impl_execute_exposed';
  end if;
end $$;

select 'PORTAL073_V2_FAIL_CLOSED_SMOKE_PASS' as result;
rollback;
