update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-CHOKMAH-D066-COMP-V2'
  and validator_key='day066_v2'
  and day=66
  and canonical_source_sha='a6d48785ee355f734cadda61b0bb3810b125bf5e';
