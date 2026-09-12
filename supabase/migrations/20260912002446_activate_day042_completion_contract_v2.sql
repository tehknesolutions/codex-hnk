update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-CHOKMAH-D042-COMP-V2'
  and quest_definition_id='HNK-CHOKMAH-D042-V2'
  and day=42
  and canonical_source_sha='b7f4da850f8c724cf48e980bd30882283efbb822'
  and validator_key='day042_v2';
