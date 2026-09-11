update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-KETHER-D033-COMP-V1'
  and quest_definition_id='HNK-KETHER-D033-V1'
  and day=33
  and canonical_source_sha='97c1562b8b285b8b5d9ead934c3702844c7bd837'
  and validator_key='day033_v1';
