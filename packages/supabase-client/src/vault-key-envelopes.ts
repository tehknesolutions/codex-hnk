import type { HnkSupabaseClient } from './index';

export interface SaveRecoveryEnvelopeInput {
  keyVersion: number;
  wrappedKey: string;
  wrapAlg: 'AES-KW-256';
  kdfAlg: 'HKDF-SHA-256';
  kdfSalt: string;
  kdfInfoVersion: 1;
}

export interface RecoveryEnvelopeRecord {
  id: string;
  userId: string;
  keyVersion: number;
  envelopeKind: 'recovery';
  wrappedKey: string;
  wrapAlg: 'AES-KW-256';
  kdfAlg: 'HKDF-SHA-256';
  kdfSalt: string;
  kdfInfoVersion: 1;
  createdAt: string;
  updatedAt: string;
  rotatedAt: string | null;
  revokedAt: string | null;
}

const ENVELOPE_SELECT =
  'id,user_id,key_version,envelope_kind,wrapped_key,wrap_alg,kdf_alg,kdf_salt,kdf_info_version,created_at,updated_at,rotated_at,revoked_at';

async function requireAuthenticatedUserId(client: HnkSupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error('authentication_required');
  return data.user.id;
}

function assertRecoveryEnvelopeInput(input: SaveRecoveryEnvelopeInput): void {
  if (!Number.isInteger(input.keyVersion) || input.keyVersion < 1) {
    throw new Error('vault_invalid_key_version');
  }
  if (!input.wrappedKey.trim()) throw new Error('vault_wrapped_key_required');
  if (input.wrappedKey.length > 4096) throw new Error('vault_wrapped_key_too_large');
  if (input.wrapAlg !== 'AES-KW-256') throw new Error('vault_wrap_algorithm_unsupported');
  if (input.kdfAlg !== 'HKDF-SHA-256') throw new Error('vault_kdf_algorithm_unsupported');
  if (!input.kdfSalt.trim()) throw new Error('vault_kdf_salt_required');
  if (input.kdfSalt.length > 512) throw new Error('vault_kdf_salt_too_large');
  if (input.kdfInfoVersion !== 1) throw new Error('vault_kdf_info_version_unsupported');
}

function toRecoveryEnvelopeRecord(row: {
  id: string;
  user_id: string;
  key_version: number;
  envelope_kind: string;
  wrapped_key: string;
  wrap_alg: string;
  kdf_alg: string;
  kdf_salt: string;
  kdf_info_version: number;
  created_at: string;
  updated_at: string;
  rotated_at: string | null;
  revoked_at: string | null;
}): RecoveryEnvelopeRecord {
  if (
    row.envelope_kind !== 'recovery' ||
    row.wrap_alg !== 'AES-KW-256' ||
    row.kdf_alg !== 'HKDF-SHA-256' ||
    row.kdf_info_version !== 1
  ) {
    throw new Error('vault_recovery_envelope_contract_mismatch');
  }

  return {
    id: row.id,
    userId: row.user_id,
    keyVersion: row.key_version,
    envelopeKind: 'recovery',
    wrappedKey: row.wrapped_key,
    wrapAlg: 'AES-KW-256',
    kdfAlg: 'HKDF-SHA-256',
    kdfSalt: row.kdf_salt,
    kdfInfoVersion: 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rotatedAt: row.rotated_at,
    revokedAt: row.revoked_at,
  };
}

/**
 * Persists only an already-wrapped recovery envelope. The authenticated user
 * is resolved from the session; ownership is not caller-supplied. RLS remains
 * the server-side ownership boundary.
 */
export async function saveRecoveryEnvelope(
  client: HnkSupabaseClient,
  input: SaveRecoveryEnvelopeInput,
): Promise<RecoveryEnvelopeRecord> {
  assertRecoveryEnvelopeInput(input);
  const userId = await requireAuthenticatedUserId(client);

  const { data, error } = await client
    .from('vault_key_envelopes')
    .insert({
      user_id: userId,
      key_version: input.keyVersion,
      envelope_kind: 'recovery',
      wrapped_key: input.wrappedKey,
      wrap_alg: input.wrapAlg,
      kdf_alg: input.kdfAlg,
      kdf_salt: input.kdfSalt,
      kdf_info_version: input.kdfInfoVersion,
    })
    .select(ENVELOPE_SELECT)
    .single();

  if (error) throw error;
  return toRecoveryEnvelopeRecord(data);
}

export async function listRecoveryEnvelopes(
  client: HnkSupabaseClient,
): Promise<RecoveryEnvelopeRecord[]> {
  await requireAuthenticatedUserId(client);
  const { data, error } = await client
    .from('vault_key_envelopes')
    .select(ENVELOPE_SELECT)
    .eq('envelope_kind', 'recovery')
    .order('key_version', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(toRecoveryEnvelopeRecord);
}

export async function getActiveRecoveryEnvelope(
  client: HnkSupabaseClient,
  keyVersion?: number,
): Promise<RecoveryEnvelopeRecord | null> {
  await requireAuthenticatedUserId(client);
  if (keyVersion !== undefined && (!Number.isInteger(keyVersion) || keyVersion < 1)) {
    throw new Error('vault_invalid_key_version');
  }

  let query = client
    .from('vault_key_envelopes')
    .select(ENVELOPE_SELECT)
    .eq('envelope_kind', 'recovery')
    .is('revoked_at', null)
    .order('key_version', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1);

  if (keyVersion !== undefined) query = query.eq('key_version', keyVersion);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? toRecoveryEnvelopeRecord(data) : null;
}

export async function revokeRecoveryEnvelope(
  client: HnkSupabaseClient,
  envelopeId: string,
): Promise<RecoveryEnvelopeRecord> {
  if (!envelopeId.trim()) throw new Error('vault_envelope_id_required');
  await requireAuthenticatedUserId(client);

  const { data, error } = await client
    .from('vault_key_envelopes')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', envelopeId)
    .eq('envelope_kind', 'recovery')
    .is('revoked_at', null)
    .select(ENVELOPE_SELECT)
    .single();

  if (error) throw error;
  return toRecoveryEnvelopeRecord(data);
}
