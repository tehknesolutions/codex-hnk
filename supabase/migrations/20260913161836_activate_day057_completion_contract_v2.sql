do $$
begin
 if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-CHOKMAH-D057-COMP-V2' and quest_definition_id='HNK-CHOKMAH-D057-V2' and day=57 and canonical_source_sha='deb6305d38b89a4168ad5cff083d2b96e7a7fec4' and validator_key='day057_v2') then raise exception 'day057_v2_registry_missing'; end if;
 if (select source_sha from public.codex_days where day=57) is distinct from 'deb6305d38b89a4168ad5cff083d2b96e7a7fec4' then raise exception 'day057_v2_canonical_sha_mismatch'; end if;
 update hnk_private.completion_contract_registry set status='active',updated_at=now() where completion_contract_id='HNK-CHOKMAH-D057-COMP-V2';
end$$;
