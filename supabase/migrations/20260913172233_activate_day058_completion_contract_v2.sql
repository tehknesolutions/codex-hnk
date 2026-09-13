do $$
begin
 if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-CHOKMAH-D058-COMP-V2' and quest_definition_id='HNK-CHOKMAH-D058-V2' and day=58 and canonical_source_sha='e32753a57daab23d378e881451194b0dd77d8aac' and validator_key='day058_v2' and status='draft') then raise exception 'day058_v2_registry_draft_missing'; end if;
 if (select source_sha from public.codex_days where day=58) is distinct from 'e32753a57daab23d378e881451194b0dd77d8aac' then raise exception 'day058_v2_canonical_sha_mismatch'; end if;
 if position('when ''day058_v2''' in pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure))=0 then raise exception 'day058_v2_dispatcher_missing'; end if;
 if position('HNK-CHOKMAH-D058-V2' in pg_get_functiondef('hnk_private.enforce_hahaiah_057_061_scalar_evidence()'::regprocedure))=0 then raise exception 'day058_v2_trigger_branch_missing'; end if;
 update hnk_private.completion_contract_registry set status='active',updated_at=now() where completion_contract_id='HNK-CHOKMAH-D058-COMP-V2';
end$$;
