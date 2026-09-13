do $$
begin
 if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-CHOKMAH-D056-COMP-V2' and quest_definition_id='HNK-CHOKMAH-D056-V2' and day=56 and canonical_source_sha='9eb847d460768615d2e6fb9173c2557a21c705c7' and validator_key='day056_v2') then raise exception 'day056_v2_registry_missing'; end if;
 if (select source_sha from public.codex_days where day=56) is distinct from '9eb847d460768615d2e6fb9173c2557a21c705c7' then raise exception 'day056_v2_canonical_sha_mismatch'; end if;
 update hnk_private.completion_contract_registry set status='active',updated_at=now() where completion_contract_id='HNK-CHOKMAH-D056-COMP-V2';
end$$;
