import { saveEncryptedVaultEntry, type HnkSupabaseClient } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';

export const PORTAL073_VAULT_SCHEMA = 'hnk-portal073-vault-v1' as const;

export interface SavePortal073VaultInput {
  client: HnkSupabaseClient;
  userId: string;
  diary: string;
}

export interface Portal073VaultReceipt {
  receiptId: string;
  checksumSha256: string;
}

/**
 * Portal073 plaintext boundary.
 * Sensitive prose is encrypted on-device before the persistence adapter is called.
 * The network/storage adapter receives only ciphertext metadata.
 */
export async function savePortal073EncryptedVault(
  input: SavePortal073VaultInput,
): Promise<Portal073VaultReceipt> {
  const diary = input.diary.trim();
  if (diary.length < 2) throw new Error('portal073_vault_diary_required');
  if (!input.userId.trim()) throw new Error('portal073_vault_user_required');

  const encrypted = await encryptVaultText({
    userId: input.userId,
    day: 73,
    kind: 'journal',
    plaintext: JSON.stringify({ schema: PORTAL073_VAULT_SCHEMA, diary }),
  });

  const entry = await saveEncryptedVaultEntry(input.client, {
    day: 73,
    payload: encrypted,
  });

  if (entry.userId !== input.userId) throw new Error('portal073_vault_receipt_user_mismatch');
  if (entry.day !== 73) throw new Error('portal073_vault_receipt_day_mismatch');
  if (entry.checksumSha256 !== encrypted.checksumSha256) {
    throw new Error('portal073_vault_receipt_checksum_mismatch');
  }

  return {
    receiptId: entry.id,
    checksumSha256: encrypted.checksumSha256,
  };
}
