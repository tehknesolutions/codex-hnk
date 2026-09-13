do $$
declare v_count integer;
begin
  update hnk_private.completion_contract_registry
     set status='active', updated_at=now()
   where completion_contract_id='HNK-CHOKMAH-D055-COMP-V2'
     and day=55
     and quest_definition_id='HNK-CHOKMAH-D055-V2'
     and canonical_source_sha='03dce9f662c05cb720bce4419f58126031ca9be6'
     and validator_key='day055_v2'
     and contract_version='2.0.0'
     and status='draft';
  get diagnostics v_count = row_count;
  if v_count <> 1 then raise exception 'day055_activation_expected_one_draft_row_got:%',v_count; end if;
end $$;