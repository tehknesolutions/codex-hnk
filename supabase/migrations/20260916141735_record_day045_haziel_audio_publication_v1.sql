-- Records the already verified Day045 Haziel master publication.
-- This does not promote QA state or unlock completion.
update public.asset_registry
set storage_path = case asset_key
  when 'hnk.haziel.day045.active.v1' then 'hnk-audio-public/day-045/HNK-HAZIEL-D045-ACTIVE-V1.33b8e3567cba0ad1f05d080c437eecfe51e1993dba0d20ecfe6f600bb52f42a3.wav'
  when 'hnk.haziel.day045.control.v1' then 'hnk-audio-public/day-045/HNK-HAZIEL-D045-CONTROL-V1.012100633f1548d00e62a79b0e7a0cd67a8121d198f38c1e758cf30bdaec3002.wav'
end,
checksum_sha256 = case asset_key
  when 'hnk.haziel.day045.active.v1' then '33b8e3567cba0ad1f05d080c437eecfe51e1993dba0d20ecfe6f600bb52f42a3'
  when 'hnk.haziel.day045.control.v1' then '012100633f1548d00e62a79b0e7a0cd67a8121d198f38c1e758cf30bdaec3002'
end,
published_at = coalesce(published_at, now()),
metadata = jsonb_set(
  jsonb_set(coalesce(metadata,'{}'::jsonb),'{published}','true'::jsonb,true),
  '{master_asset_pending}','false'::jsonb,true
)
where asset_key in (
  'hnk.haziel.day045.active.v1',
  'hnk.haziel.day045.control.v1'
)
and approval_state = 'approved';
