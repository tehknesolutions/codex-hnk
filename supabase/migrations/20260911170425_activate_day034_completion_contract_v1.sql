update hnk_private.completion_contract_registry
set status='active', updated_at=now()
where completion_contract_id='HNK-KETHER-D034-COMP-V1'
  and quest_definition_id='HNK-KETHER-D034-V1'
  and day=34
  and canonical_source_sha='6d8fb4dc7923691a38677881db902efc47c37ac2'
  and validator_key='day034_v1';
