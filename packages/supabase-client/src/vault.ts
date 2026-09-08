import type { HnkSupabaseClient } from './index';

export interface EncryptedVaultPayload {
  ciphertext: string;
  nonce: string;
  aad: string;
  cryptoAlg: string;
  cryptoVersion: number;
  checksumSha256: string;
}

export interface SaveEncryptedVaultEntryInput {
  day?: number | null;
  payload: EncryptedVaultPayload;
  clientCreatedAt?: string;
}

export interface EncryptedVaultEntry {
  id: string;
  userId: string;
  day: number | null;
  ciphertext: string;
  nonce: string;
  aad: string | null;
  cryptoAlg: string;
  cryptoVersion: number;
  checksumSha256: string | null;
  clientCreatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const VAULT_SELECT =
  'id,user_id,day,ciphertext,nonce,aad,crypto_alg,crypto_version,checksum_sha256,client_created_at,created_at,updated_at';

async function requireAuthenticatedUserId(client: HnkSupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error('authentication_required');
  return data.user.id;
}

function assertDay(day: number | null | undefined): void {
  if (day == null) return;
  if (!Number.isInteger(day) || day < 1 || day > 365) throw new Error('vault_invalid_day');
}

function assertEncryptedPayload(payload: EncryptedVaultPayload): void {
  if (!payload.ciphertext.trim()) throw new Error('vault_ciphertext_required');
  if (!payload.nonce.trim()) throw new Error('vault_nonce_required');
  if (!payload.aad.trim()) throw new Error('vault_aad_required');
  if (!payload.cryptoAlg.trim()) throw new Error('vault_crypto_alg_required');
  if (!Number.isInteger(payload.cryptoVersion) || payload.cryptoVersion < 1) {
    throw new Error('vault_invalid_crypto_version');
  }
  if (!/^[a-f0-9]{64}$/i.test(payload.checksumSha256)) throw new Error('vault_invalid_checksum');
}

function toVaultEntry(row: {
  id: string;
  user_id: string;
  day: number | null;
  ciphertext: string;
  nonce: string;
  aad: string | null;
  crypto_alg: string;
  crypto_version: number;
  checksum_sha256: string | null;
  client_created_at: string | null;
  created_at: string;
  updated_at: string;
}): EncryptedVaultEntry {
  return {
    id: row.id,
    userId: row.user_id,
    day: row.day,
    ciphertext: row.ciphertext,
    nonce: row.nonce,
    aad: row.aad,
    cryptoAlg: row.crypto_alg,
    cryptoVersion: row.crypto_version,
    checksumSha256: row.checksum_sha256,
    clientCreatedAt: row.client_created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * The persistence boundary intentionally accepts no plaintext property.
 * Encryption must already have happened on the client before this adapter is
 * called. RLS still enforces that the authenticated user owns the inserted row.
 */
export async function saveEncryptedVaultEntry(
  client: HnkSupabaseClient,
  input: SaveEncryptedVaultEntryInput,
): Promise<EncryptedVaultEntry> {
  assertDay(input.day);
  assertEncryptedPayload(input.payload);
  const userId = await requireAuthenticatedUserId(client);

  const { data, error } = await client
    .from('journal_vault')
    .insert({
      user_id: userId,
      day: input.day ?? null,
      ciphertext: input.payload.ciphertext,
      nonce: input.payload.nonce,
      aad: input.payload.aad,
      crypto_alg: input.payload.cryptoAlg,
      crypto_version: input.payload.cryptoVersion,
      checksum_sha256: input.payload.checksumSha256,
      client_created_at: input.clientCreatedAt ?? new Date().toISOString(),
    })
    .select(VAULT_SELECT)
    .single();

  if (error) throw error;
  return toVaultEntry(data);
}

export async function listEncryptedVaultEntries(
  client: HnkSupabaseClient,
  day?: number | null,
): Promise<EncryptedVaultEntry[]> {
  assertDay(day);
  await requireAuthenticatedUserId(client);

  let query = client
    .from('journal_vault')
    .select(VAULT_SELECT)
    .order('created_at', { ascending: false });

  if (day != null) query = query.eq('day', day);

  const { data, error } = await query;
  if (error) throw error;
  return data.map(toVaultEntry);
}

export async function deleteEncryptedVaultEntry(
  client: HnkSupabaseClient,
  entryId: string,
): Promise<void> {
  if (!entryId.trim()) throw new Error('vault_entry_id_required');
  await requireAuthenticatedUserId(client);

  const { error } = await client.from('journal_vault').delete().eq('id', entryId);
  if (error) throw error;
}
