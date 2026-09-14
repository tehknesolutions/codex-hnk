update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-CHOKMAH-D067-COMP-V2'
  and validator_key='day067_v2'
  and canonical_source_sha='1fe06968c724f74311e4fd567075fabc181f1125';
