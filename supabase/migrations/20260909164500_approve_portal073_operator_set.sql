update hnk_private.portal_operator_sets
set
  status = 'approved',
  evidence_schema_version = 'HNK-PORTAL-073-EVIDENCE-V1',
  tuner_preset_id = 'HNK-ANGELIC-TUNER-D073-V1',
  transition_preset_id = 'HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1',
  sigil_asset_id = 'HNK-REF-MAGICIAN-MERCURY-V1',
  approval_ref = 'docs/experience/chokmah/HNK_CHOKMAH_PORTAL_073_OPERATOR_FREEZE_V1.md',
  provenance_ref = 'docs/audio/source-locks/HNK_PORTAL073_SOLFEGGIO_SOURCE_RECONCILIATION_V1.md',
  updated_at = now()
where portal_day = 73;
