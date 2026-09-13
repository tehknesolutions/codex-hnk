update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-CHOKMAH-D064-COMP-V2'
  and validator_key='day064_v2'
  and canonical_source_sha='fb05d22be494099a5a1d3e1e0f5480ecc6c072cb';
