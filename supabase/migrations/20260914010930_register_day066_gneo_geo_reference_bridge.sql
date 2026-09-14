update public.asset_registry
set metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
  'repo_asset_materialized', true,
  'current_repo', 'tehknesolutions/codex-hnk',
  'current_repo_path', 'assets/canonical/shared/gneo-geo/cockpit-gneo-geo-hnk-master-v1.svg',
  'day066_display_master_asset_key', 'hnk.gneo_geo.day066.v1.master',
  'day066_display_master_sha256', 'c8ac82fc3ccb2155a6c9f289c438a01894f0fd6666322720b95dde434c208ed6',
  'reference_freeze_path', 'docs/design/canonical-references/HNK_GNEO_GEO_REFERENCE_FREEZE_V1.md',
  'storage_publication_pending', true
), updated_at = now()
where asset_key='hnk.gneo_geo.v1.master';

insert into public.asset_registry(asset_key,day,scope,scope_id,slot,kind,storage_path,source_tool,model_version,checksum_sha256,approval_state,width,height,metadata,asset_version,license)
values('hnk.gneo_geo.day066.v1.master',66,'day','066','gneo-geo-master','vector',null,'hnk-canonical-reference-bridge',null,'c8ac82fc3ccb2155a6c9f289c438a01894f0fd6666322720b95dde434c208ed6','approved',1200,1200,
jsonb_build_object('canonical_reference_id','hnk.gneo_geo.v1','parent_master_asset_id','hnk.gneo_geo.v1.master','parent_master_sha256','2547d18241651980ed1668408b189ecfd1eb28acb400cdf6c1d96e7514d90436','canonical_source_day',66,'canonical_source_sha','a6d48785ee355f734cadda61b0bb3810b125bf5e','canonical_reference_status','REFERENCE_APPROVED','repo','tehknesolutions/codex-hnk','repo_path','assets/canonical/shared/gneo-geo/cockpit-gneo-geo-hnk-master-v1.svg','reference_freeze_path','docs/design/canonical-references/HNK_GNEO_GEO_REFERENCE_FREEZE_V1.md','blue_pearl_centered',true,'cardinal_axes_visible',true,'node_count',8,'nodes_circuits_equivalent',false,'ritual_route_defined',false,'fixed_north',true,'repo_asset_materialized',true,'storage_publication_pending',true,'provenance','Canonical Day066 presentation derivative of approved HNK Gneo Geo V1; historical Day028 master preserved unchanged.'),1,'project-generated')
on conflict(asset_key) do update set checksum_sha256=excluded.checksum_sha256,approval_state='approved',width=excluded.width,height=excluded.height,metadata=excluded.metadata,updated_at=now();
