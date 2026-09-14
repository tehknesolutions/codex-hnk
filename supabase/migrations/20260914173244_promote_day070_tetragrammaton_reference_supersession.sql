insert into public.asset_registry(
  id,asset_key,day,scope,slot,kind,storage_path,source_tool,model_version,prompt,negative_prompt,
  reference_assets,seed,checksum_sha256,approval_state,width,height,duration_seconds,metadata,scope_id,
  asset_version,prompt_ref,license,approved_by,approved_at,published_at
) values (
  gen_random_uuid(),'hnk.tetragrammaton.day070.v1.master',70,'day','tetragrammaton-master','vector',null,
  'hnk-canonical-supersession',null,null,null,'{}'::text[],null,
  '26cd747bc3397c5dba08dbaf159f55b6a90c19b7b0e64b326a12bee389760989','approved',1024,1024,null,
  jsonb_build_object(
    'repo','tehknesolutions/codex-hnk','repo_path','assets/canonical/chokmah/pantaculo-tetragrammaton-hnk-master-v1.svg',
    'upright',true,'mirrored',false,'project_generated',true,'repo_asset_materialized',true,
    'storage_publication_pending',true,'canonical_source_sha','bb1e47aee510fe9df58a46f697ebafb9005e223e',
    'canonical_reference_status','REFERENCE_APPROVED__SUPERSESSION_V1',
    'historical_superseded_sha256','16cd1d9ff1cc256f570d526bc6c6bfd249d06957d972f87f51168011cb78451b',
    'candidate_parent_asset_key','hnk.tetragrammaton.day070.candidate.v1',
    'candidate_parent_sha256','bf0e187137457b969695906fbabfce876a72500c21d115e18266220fc1bb6f52',
    'reference_freeze_path','docs/design/canonical-references/HNK_TETRAGRAMMATON_D070_REFERENCE_FREEZE_V1.md',
    'supersession_path','docs/design/canonical-references/HNK_TETRAGRAMMATON_D070_SUPERSESSION_V1.md',
    'canonical_registry_path','docs/design/canonical-references/HNK_CANONICAL_REFERENCE_REGISTRY_V1.json'
  ),'day070',1,null,'project-generated',null,now(),null
)
on conflict(asset_key) do update set
  day=excluded.day,scope=excluded.scope,slot=excluded.slot,kind=excluded.kind,source_tool=excluded.source_tool,
  checksum_sha256=excluded.checksum_sha256,approval_state='approved',width=excluded.width,height=excluded.height,
  metadata=excluded.metadata,asset_version=excluded.asset_version,license=excluded.license,approved_at=now(),updated_at=now();

do $$
declare d text;
begin
  d:=pg_get_functiondef('hnk_private.validate_day070_completion_v2(jsonb,text)'::regprocedure);
  if position('16cd1d9ff1cc256f570d526bc6c6bfd249d06957d972f87f51168011cb78451b' in d)=0 then raise exception 'day070_historical_reference_hash_not_found_in_validator'; end if;
  d:=replace(d,'16cd1d9ff1cc256f570d526bc6c6bfd249d06957d972f87f51168011cb78451b','26cd747bc3397c5dba08dbaf159f55b6a90c19b7b0e64b326a12bee389760989');
  execute d;
end $$;

update hnk_private.completion_contract_registry set status='draft',updated_at=now() where completion_contract_id='HNK-CHOKMAH-D070-COMP-V2';
