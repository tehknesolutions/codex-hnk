-- Portal 109 canonical operator set approval.
-- IMPORTANT: status remains 'approved', not 'published'.
-- hnk_private.assert_portal_completion_evidence requires 'published', so Day 109 remains runtime fail-closed through G7/G8 QA.

update hnk_private.portal_operator_sets
set
  status = 'approved',
  evidence_schema_version = 'HNK-PORTAL-109-EVIDENCE-V1',
  tuner_preset_id = 'HNK-ANGELIC-TUNER-D109-V1',
  transition_preset_id = 'HNK-PORTAL109-SATURN-JUPITER-ACTIVE-V1',
  sigil_asset_id = 'HNK-PORTAL109-ORACLE-ASSETSET-V1',
  approval_ref = 'docs/experience/binah/HNK_BINAH_PORTAL_109_OPERATOR_FREEZE_V1.md',
  provenance_ref = 'docs/experience/binah/HNK_BINAH_PORTAL_109_OPERATOR_FREEZE_V1.md',
  updated_at = now()
where portal_day = 109;

-- Fail loudly if the seed row is unexpectedly absent.
do $$
begin
  if not exists (
    select 1
    from hnk_private.portal_operator_sets
    where portal_day = 109
      and status = 'approved'
      and tuner_preset_id = 'HNK-ANGELIC-TUNER-D109-V1'
      and transition_preset_id = 'HNK-PORTAL109-SATURN-JUPITER-ACTIVE-V1'
      and sigil_asset_id = 'HNK-PORTAL109-ORACLE-ASSETSET-V1'
  ) then
    raise exception 'portal109_operator_set_approval_failed';
  end if;
end
$$;
