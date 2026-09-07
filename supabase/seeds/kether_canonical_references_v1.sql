-- Kether canonical reference sync V1
-- Canon source: Tehkne-Solutions/hnk-codex-365@2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8
-- `approved` means reference/artifact identity is approved. Only `published` is eligible for final user-facing production.

insert into public.asset_registry (
  asset_key, day, scope, scope_id, slot, kind, storage_path,
  source_tool, checksum_sha256, approval_state, asset_version, license, metadata
)
values
  (
    'oracle-dai-ko-myo-usui-hnk-master-v1', 22, 'oracle', 'dai-ko-myo-usui', 'symbol-master', 'vector', null,
    'hnk-canonical-reference',
    '25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0',
    'approved', 1, 'project-generated',
    jsonb_build_object(
      'canonical_reference_id','reiki-usui-dai-ko-myo-v1',
      'semantic_master','大光明',
      'orientation','vertical',
      'canonical_repo','Tehkne-Solutions/hnk-codex-365',
      'canonical_source_sha','2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8',
      'canonical_source_path','canon/references/approved/DAI_KOO_MYO_USUI_HNK_V1.md',
      'stroke_order_sha256','52cf6921ccd6ede63a6f83d05b31faf787d2881b99d5b8ce1ee6095a86b4fe6b',
      'published_asset_pending',true
    )
  ),
  (
    'hnk.gneo_geo.v1.master', 28, 'day', '028', 'gneo-geo-master', 'vector', null,
    'hnk-canonical-reference',
    '2547d18241651980ed1668408b189ecfd1eb28acb400cdf6c1d96e7514d90436',
    'approved', 1, 'project-generated',
    jsonb_build_object(
      'canonical_reference_id','hnk.gneo_geo.v1',
      'canonical_repo','Tehkne-Solutions/hnk-codex-365',
      'canonical_source_sha','2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8',
      'canonical_source_path','canon/references/approved/GNEO_GEO_V1.md',
      'fixed_north',true,
      'circuit_count',8,
      'traversal','1>2>3>4>5>6>7>8>O',
      'published_asset_pending',true
    )
  ),
  (
    'hnk.kether.sigil.v1.master', 36, 'day', '036', 'kether-sigil-master', 'vector', null,
    'hnk-canonical-reference',
    '7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a',
    'approved', 1, 'project-generated',
    jsonb_build_object(
      'canonical_reference_id','hnk.kether.sigil.v1',
      'canonical_repo','Tehkne-Solutions/hnk-codex-365',
      'canonical_source_sha','2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8',
      'canonical_source_path','canon/references/approved/KETHER_SIGIL_V1.md',
      'rings',3,'gates',12,'day_marks',36,'fixed_north',true,
      'published_asset_pending',true
    )
  ),
  (
    'hnk.tuner.kether.v1', 36, 'day', '036', 'angelic-tuner', 'ui', null,
    'hnk-canonical-reference', null,
    'approved', 1, 'project-generated',
    jsonb_build_object(
      'canonical_reference_id','hnk.tuner.kether.v1',
      'canonical_repo','Tehkne-Solutions/hnk-codex-365',
      'canonical_source_sha','2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8',
      'canonical_source_path','canon/references/approved/SINTONIZADOR_ANGELICAL_KETHER_V1.md',
      'entity_detector',false,
      'published_component_pending',true
    )
  ),
  (
    'hnk.audio.kether_chokmah.transition.v1', 36, 'day', '036', 'transition-audio', 'audio', null,
    'hnk-canonical-reference',
    '5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168',
    'review', 1, 'project-generated',
    jsonb_build_object(
      'canonical_reference_id','hnk.audio.kether_chokmah.transition.v1',
      'canonical_repo','Tehkne-Solutions/hnk-codex-365',
      'canonical_source_sha','2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8',
      'canonical_source_path','canon/references/approved/KETHER_CHOKMAH_TRANSITION_AUDIO_V1.md',
      'canonical_recipe_approved',true,
      'master_rendered',true,
      'listening_qa_pending',true,
      'published',false,
      'duration_seconds',720,
      'carrier_left_hz',429,
      'carrier_right_hz',435,
      'carrier_center_hz',432,
      'binaural_difference_hz',6,
      'ritual_tone_hz',528
    )
  )
on conflict (asset_key) do update set
  day = excluded.day,
  scope = excluded.scope,
  scope_id = excluded.scope_id,
  slot = excluded.slot,
  kind = excluded.kind,
  storage_path = excluded.storage_path,
  source_tool = excluded.source_tool,
  checksum_sha256 = excluded.checksum_sha256,
  approval_state = excluded.approval_state,
  asset_version = excluded.asset_version,
  license = excluded.license,
  metadata = excluded.metadata;
