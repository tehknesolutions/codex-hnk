update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-KETHER-D007-COMP-V1' and validator_key='day007_v1';

do $$ begin
 if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-KETHER-D007-COMP-V1' and day=7 and validator_key='day007_v1' and status='active' and canonical_source_sha='bc12709d5a346870405cf41e62f99ac28d70186d') then raise exception 'day007_activation_failed'; end if;
end $$;
