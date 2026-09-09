update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-KETHER-D008-COMP-V1'
  and validator_key='day008_v1'
  and canonical_source_sha='df7c39ced019ead6eb0be817a1ac638789d40c3c';

do $$ begin
  if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-KETHER-D008-COMP-V1' and status='active') then
    raise exception 'day008_completion_activation_failed';
  end if;
end $$;
