with foundational(asset_key, scope, scope_id, slot, kind, storage_path, metadata) as (
  values
  ('kether-key-art','sephira','kether','key-art','image','sephira/kether/hero/v1/kether-key-art.webp', jsonb_build_object('required',true,'family','foundational')),
  ('kether-background','sephira','kether','background','image','sephira/kether/background/v1/atziluth-kether.webp', jsonb_build_object('required',true,'family','foundational')),
  ('kether-tree-node-active','sephira','kether','tree-node-active','vector','sephira/kether/ui/v1/tree-node-active.svg', jsonb_build_object('required',true,'family','foundational')),
  ('portal-kether-chokmah','sephira','kether','portal-kether-chokmah','image','sephira/kether/portal/v1/kether-chokmah.webp', jsonb_build_object('required',true,'family','foundational')),
  ('attribute-hip-icon','global','attribute:HIP','attribute-icon','vector','global/attributes/hip/v1/icon.svg', jsonb_build_object('required',true,'attribute','HIP')),
  ('attribute-vnt-icon','global','attribute:VNT','attribute-icon','vector','global/attributes/vnt/v1/icon.svg', jsonb_build_object('required',true,'attribute','VNT')),
  ('attribute-per-icon','global','attribute:PER','attribute-icon','vector','global/attributes/per/v1/icon.svg', jsonb_build_object('required',true,'attribute','PER')),
  ('attribute-sin-icon','global','attribute:SIN','attribute-icon','vector','global/attributes/sin/v1/icon.svg', jsonb_build_object('required',true,'attribute','SIN')),
  ('attribute-bio-icon','global','attribute:BIO','attribute-icon','vector','global/attributes/bio/v1/icon.svg', jsonb_build_object('required',true,'attribute','BIO')),
  ('attribute-int-icon','global','attribute:INT','attribute-icon','vector','global/attributes/int/v1/icon.svg', jsonb_build_object('required',true,'attribute','INT')),
  ('attribute-dis-icon','global','attribute:DIS','attribute-icon','vector','global/attributes/dis/v1/icon.svg', jsonb_build_object('required',true,'attribute','DIS')),
  ('xp-level-hud','global','hnk','xp-level-hud','ui','global/ui/xp-level/v1/hud.json', jsonb_build_object('required',true,'family','foundational')),
  ('scanner-frame','global','hnk','scanner-frame','ui','global/ui/scanner/v1/frame.svg', jsonb_build_object('required',true,'family','foundational')),
  ('audio-player-skin','global','hnk','audio-player-skin','ui','global/ui/audio/v1/player.json', jsonb_build_object('required',true,'family','foundational')),
  ('journal-shell','global','hnk','journal-shell','ui','global/ui/journal/v1/shell.json', jsonb_build_object('required',true,'family','foundational'))
), cycle_defs(scope_id, first_day, last_day) as (
  values
  ('vehuiah',1,5),('jeliel',6,10),('sitael',11,15),('elemiah',16,20),('mahasiah',21,25),('lelahel',26,30),('achaiah',31,35)
), cycle_assets as (
  select format('cycle-%s-emblem', scope_id) asset_key, 'cycle'::text scope, scope_id, 'emblem'::text slot, 'vector'::text kind,
         format('cycle/%s/emblem/v1/%s.svg', scope_id, scope_id) storage_path,
         jsonb_build_object('required',true,'family','cycle','first_day',first_day,'last_day',last_day) metadata
  from cycle_defs
  union all
  select format('cycle-%s-background', scope_id), 'cycle', scope_id, 'background', 'image',
         format('cycle/%s/background/v1/%s.webp', scope_id, scope_id),
         jsonb_build_object('required',true,'family','cycle','first_day',first_day,'last_day',last_day)
  from cycle_defs
), day_assets as (
  select format('day-%s-thumbnail', lpad(d::text,3,'0')) asset_key,
         'day'::text scope,
         lpad(d::text,3,'0') scope_id,
         'thumbnail'::text slot,
         'image'::text kind,
         format('day/%s/thumbnail/v1/day-%s.webp', lpad(d::text,3,'0'), lpad(d::text,3,'0')) storage_path,
         d::smallint day_no,
         jsonb_build_object('required',true,'family','daily') metadata
  from generate_series(1,36) as gs(d)
  union all
  select format('day-%s-qr', lpad(d::text,3,'0')),
         'day', lpad(d::text,3,'0'), 'qr', 'qr',
         format('day/%s/qr/v1/day-%s.svg', lpad(d::text,3,'0'), lpad(d::text,3,'0')),
         d::smallint,
         jsonb_build_object('required',true,'family','daily','deep_link',format('hnk://day/%s',lpad(d::text,3,'0')))
  from generate_series(1,36) as gs(d)
), all_assets as (
  select asset_key, scope, scope_id, slot, kind, storage_path, null::smallint day_no, metadata from foundational
  union all
  select asset_key, scope, scope_id, slot, kind, storage_path, null::smallint day_no, metadata from cycle_assets
  union all
  select asset_key, scope, scope_id, slot, kind, storage_path, day_no, metadata from day_assets
)
insert into public.asset_registry(asset_key, scope, scope_id, slot, kind, storage_path, day, approval_state, asset_version, metadata)
select asset_key, scope, scope_id, slot, kind, storage_path, day_no, 'planned', 1, metadata
from all_assets
on conflict (asset_key) do nothing;
