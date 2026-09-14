update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-CHOKMAH-D068-COMP-V2'
  and validator_key='day068_v2'
  and canonical_source_sha='176ebffccc845a909f5d1d2bdb88181b94809afb';
