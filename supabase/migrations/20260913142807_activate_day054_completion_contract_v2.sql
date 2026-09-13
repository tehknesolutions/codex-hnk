do $$
declare v_count integer;
begin
  update hnk_private.completion_contract_registry
     set status='active', updated_at=now()
   where completion_contract_id='HNK-CHOKMAH-D054-COMP-V2'
     and day=54
     and quest_definition_id='HNK-CHOKMAH-D054-V2'
     and canonical_source_sha='5ea33f99975868290d5371c8c1ac67f6de4b9c69'
     and validator_key='day054_v2'
     and contract_version='2.0.0'
     and status='draft';
  get diagnostics v_count = row_count;
  if v_count <> 1 then
    raise exception 'day054_activation_expected_one_draft_row_got:%', v_count;
  end if;
end $$;