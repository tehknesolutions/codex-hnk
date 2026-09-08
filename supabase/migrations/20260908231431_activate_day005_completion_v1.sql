-- Activate Day 005 Completion Contract V1 after Web/Expo integration.
update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-KETHER-D005-COMP-V1'
  and validator_key='day005_v1'
  and canonical_source_sha='eb9f078bdc7654135f83fbcdf0aa7d5d38412cff';

do $$
begin
  if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-KETHER-D005-COMP-V1' and status='active') then
    raise exception 'day005_completion_activation_failed';
  end if;
end $$;
