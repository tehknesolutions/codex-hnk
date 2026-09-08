export const HNK_VAULT_INTEROP_VECTOR_V1 = {
  id: 'HNK Native ↔ Web vector 001',
  userId: '00000000-0000-4000-8000-000000000001',
  keyVersion: 1,
  day: 1,
  kind: 'mirror' as const,
  plaintext: 'HNK Native ↔ Web vector 001',
  vdkHex: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
  recoveryRootSecretBase64: 'ICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj8=',
  recoverySaltBase64: 'UFFSU1RVVldYWVpbXF1eXw==',
  recoveryInfo: 'hnk-vault-recovery-v1:00000000-0000-4000-8000-000000000001:1',
  wrappedVdkBase64: 'eGVk3ZwifTM/mQoglrFfrQwRf9IgEu+0nceoY7frh/E9ic5zKCcMuA==',
  nonceBase64: 'oKGio6Slpqeoqaqr',
  aadBase64: 'eyJzY2hlbWEiOiJobmstdmF1bHQtdjEiLCJ1c2VyIjoiMDAwMDAwMDAtMDAwMC00MDAwLTgwMDAtMDAwMDAwMDAwMDAxIiwiZGF5IjoxLCJraW5kIjoibWlycm9yIn0=',
  ciphertextBase64: 'rlY3DQuqdtYUAKcxge7giRXOeWb31DYD7i4Wtk7+QTyClBdr/hBC26icyGSt',
  checksumSha256: '157c92b5e1b1da403003fe1fd244bb7d46f3a3f085bc407373388491055a4020',
} as const;

export type HnkVaultInteropVectorV1 = typeof HNK_VAULT_INTEROP_VECTOR_V1;
