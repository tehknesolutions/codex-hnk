update hnk_private.completion_contract_registry
set status='active', updated_at=now()
where completion_contract_id='HNK-KETHER-D006-COMP-V1' and validator_key='day006_v1';

do $$ begin
  if not exists(
    select 1 from hnk_private.completion_contract_registry
    where completion_contract_id='HNK-KETHER-D006-COMP-V1'
      and day=6
      and validator_key='day006_v1'
      and status='active'
      and canonical_source_sha='923c43ae0a68d63a4c88f67d83076b72e0b06c39'
  ) then raise exception 'day006_activation_failed'; end if;
end $$;
