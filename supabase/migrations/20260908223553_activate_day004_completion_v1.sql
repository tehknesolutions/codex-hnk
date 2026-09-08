-- HNK CODEX — activate Day 004 Completion Contract V1.
-- Applied to Supabase project codex-hnk-app as migration 20260908223553.

do $$
declare v_xp integer; v_sha text;
begin
  select xp,source_sha into v_xp,v_sha from public.codex_days where day=4 and status='canon';
  if v_xp<>100 then raise exception 'day004_canonical_xp_mismatch'; end if;
  if v_sha<>'376964a263f3d4f07542fcf55ca3bf2c18c5fd94' then raise exception 'day004_canonical_sha_mismatch'; end if;
  if not exists(
    select 1 from hnk_private.completion_contract_registry
    where completion_contract_id='HNK-KETHER-D004-COMP-V1'
      and day=4 and validator_key='day004_v1'
      and quest_definition_id='HNK-KETHER-D004-V1'
      and canonical_source_sha='376964a263f3d4f07542fcf55ca3bf2c18c5fd94'
      and status='reviewed'
  ) then raise exception 'day004_reviewed_contract_missing'; end if;
end $$;

update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-KETHER-D004-COMP-V1'
  and validator_key='day004_v1'
  and canonical_source_sha='376964a263f3d4f07542fcf55ca3bf2c18c5fd94';

do $$
begin
  if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-KETHER-D004-COMP-V1' and status='active') then
    raise exception 'day004_completion_activation_failed';
  end if;
end $$;
