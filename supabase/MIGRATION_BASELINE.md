# Supabase Migration Baseline

Source of truth for the currently applied migration sequence in the live `codex-hnk-app` project.

Historical migrations before the consolidation cutover remain in `Tehkne-Solutions/codex-hnk-app` until they are mirrored byte-for-byte into this repository.

Applied sequence observed before/including Day 001 Completion V2:

```text
20260902005100 initial_hnk_schema
20260902005127 harden_rls_and_indexes
20260902010505 enable_http_for_codex_sync
20260902010654 add_private_codex_sync
20260902011314 refine_asset_registry_v1
20260902011756 index_asset_approval_fk
20260902175556 kether_practice_progression_core
20260902175751 harden_day_completion_atomicity
20260902180059 use_invoker_for_crown_state
20260902231052 enforce_kether_portal_evidence
20260905011011 add_vault_key_envelopes
20260906181341 create_hnk_linguas_l02_pilot_sessions
20260906181558 create_hnk_linguas_l02_pilot_access
20260906181928 add_hnk_linguas_l02_pilot_scoring_views
20260906214833 hnk_linguas_l03_automated_evidence_inbox_v1
20260906215201 hnk_linguas_l03_atomic_pilot_submit_v1
20260906233900 add_campaign_runtime_state_v1
20260907002042 hnk_l04_automated_evidence_inbox_v1
20260907125020 add_portal_encrypted_reports_v1
20260907130433 harden_portal_encrypted_reports_grants_v1
20260908011647 day001_completion_contract_v2
```

## Consolidation rule

1. Never reorder or rename an already applied migration.
2. Historical files copied from the legacy repository must retain their original filename and bytes whenever possible.
3. New migrations after `20260908011647` are authored in `tehknesolutions/codex-hnk`.
4. Do not revoke the legacy completion RPC until both Web and Expo use V2 and replay/concurrency tests are green.
