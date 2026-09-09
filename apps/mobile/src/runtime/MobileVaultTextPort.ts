import type { VaultTextPort } from '@hnk/vault-contract';
import { saveEncryptedVaultEntry, type HnkSupabaseClient } from '@hnk/supabase-client';
import { encryptVaultText } from '../features/vault/vault-crypto';

export function createMobileVaultTextPort(client: HnkSupabaseClient): VaultTextPort {
  return {
    capability() {
      return { encryptedText: true, serverReceivesPlaintext: false, deviceBound: true, recoveryConfigured: false };
    },
    async saveText(input) {
      const payload = await encryptVaultText({
        userId: input.userId,
        day: input.day,
        kind: input.kind,
        plaintext: input.plaintext,
      });
      const entry = await saveEncryptedVaultEntry(client, { day: input.day, payload });
      return {
        entryId: entry.id,
        day: input.day,
        kind: input.kind,
        cryptoAlg: 'AES-256-GCM',
        cryptoVersion: 1,
        recoveryState: 'DEVICE_BOUND',
      };
    },
  };
}
