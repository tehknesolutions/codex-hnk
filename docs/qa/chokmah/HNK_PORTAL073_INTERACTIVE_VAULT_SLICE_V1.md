# HNK Portal073 — Interactive Vault Slice V1

Status: `MATERIALIZED__EXECUTION_QA_PENDING__FAIL_CLOSED`

This slice materializes the first interactive/Vault boundary for Portal073 without publishing the portal.

## Included

- canonical mobile sigil renderer `MagicianMercurySigilV1` with frozen ID/SHA-256;
- `savePortal073EncryptedVault()` bridge;
- on-device encryption before persistence;
- Day073-bound AAD/persistence;
- authenticated receipt checks for same user, Day073 and checksum;
- static materialization validator.

## Intentional adaptation from historical runtime

The historical Portal073 experience used `kind: 'portal073-synchronicity-diary'`, but the current Vault crypto contract only licenses `mirror | intention | dream | distraction | journal`. This slice does **not** expand the global Vault enum by inference. Portal073 uses the already licensed `journal` kind while preserving the Portal-specific inner encrypted schema `hnk-portal073-vault-v1`.

## Not proven by this slice

- validator execution;
- Expo/mobile TypeScript execution;
- device SecureStore/AES execution;
- Supabase E2E insert/RLS;
- decrypt round-trip;
- concurrent completion;
- Portal073 publication;
- +500 XP;
- Iniciado→Teurgo;
- Binah/Day074 release.

`PORTAL073_PRODUCTION_ENABLED` remains `false`.
