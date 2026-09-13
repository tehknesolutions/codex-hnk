-- version: 20260913223451
-- name: activate_day063_completion_contract_v2
update hnk_private.completion_contract_registry set status='active',updated_at=now() where completion_contract_id='HNK-CHOKMAH-D063-COMP-V2' and day=63 and canonical_source_sha='b9c9872ddf618aff3f515f601b3abfd611dace46' and validator_key='day063_v2';
do $$ begin if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-CHOKMAH-D063-COMP-V2' and status='active') then raise exception 'day063_activation_failed';end if;end$$;
