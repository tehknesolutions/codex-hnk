do $$
declare ok boolean;
begin
 select exists(
   select 1 from public.asset_registry ar
   where ar.asset_key='hnk.tetragrammaton.day070.v1.master'
     and ar.day=70 and ar.approval_state='approved'
     and ar.checksum_sha256='26cd747bc3397c5dba08dbaf159f55b6a90c19b7b0e64b326a12bee389760989'
     and coalesce(ar.metadata->>'repo_path','')='assets/canonical/chokmah/pantaculo-tetragrammaton-hnk-master-v1.svg'
     and coalesce((ar.metadata->>'upright')::boolean,false)=true
     and coalesce((ar.metadata->>'mirrored')::boolean,true)=false
 ) into ok;
 if not ok then raise exception 'day070_superseded_reference_not_ready_for_activation'; end if;
end $$;

update hnk_private.completion_contract_registry
set status='active',updated_at=now()
where completion_contract_id='HNK-CHOKMAH-D070-COMP-V2'
  and day=70
  and canonical_source_sha='bb1e47aee510fe9df58a46f697ebafb9005e223e'
  and validator_key='day070_v2';

do $$
begin
 if not exists(select 1 from hnk_private.completion_contract_registry where completion_contract_id='HNK-CHOKMAH-D070-COMP-V2' and status='active') then raise exception 'day070_activation_failed'; end if;
end $$;
