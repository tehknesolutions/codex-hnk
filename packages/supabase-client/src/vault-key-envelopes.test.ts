// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getActiveRecoveryEnvelope,
  listRecoveryEnvelopes,
  revokeRecoveryEnvelope,
  saveRecoveryEnvelope,
} from './vault-key-envelopes.ts';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function fixture(overrides = {}) {
  return {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    user_id: USER_ID,
    key_version: 2,
    envelope_kind: 'recovery',
    wrapped_key: 'd3JhcHBlZC12ZGsta2V5LWZpeHR1cmU=',
    wrap_alg: 'AES-KW-256',
    kdf_alg: 'HKDF-SHA-256',
    kdf_salt: 'c2FsdC1maXh0dXJlLTE2Ynl0ZXM=',
    kdf_info_version: 1,
    created_at: '2026-09-03T16:00:00.000Z',
    updated_at: '2026-09-03T16:00:00.000Z',
    rotated_at: null,
    revoked_at: null,
    ...overrides,
  };
}

function makeClient({
  userId = USER_ID,
  authError = null,
  awaitData = [],
  singleData = fixture(),
  maybeSingleData = fixture(),
  queryError = null,
} = {}) {
  const calls = [];
  let authCalls = 0;

  const query = {
    insert(value) {
      calls.push(['insert', value]);
      return query;
    },
    update(value) {
      calls.push(['update', value]);
      return query;
    },
    select(value) {
      calls.push(['select', value]);
      return query;
    },
    eq(column, value) {
      calls.push(['eq', column, value]);
      return query;
    },
    is(column, value) {
      calls.push(['is', column, value]);
      return query;
    },
    order(column, options) {
      calls.push(['order', column, options]);
      return query;
    },
    limit(value) {
      calls.push(['limit', value]);
      return query;
    },
    async single() {
      calls.push(['single']);
      return { data: singleData, error: queryError };
    },
    async maybeSingle() {
      calls.push(['maybeSingle']);
      return { data: maybeSingleData, error: queryError };
    },
    then(resolve, reject) {
      return Promise.resolve({ data: awaitData, error: queryError }).then(resolve, reject);
    },
  };

  const client = {
    auth: {
      async getUser() {
        authCalls += 1;
        return {
          data: { user: userId ? { id: userId } : null },
          error: authError,
        };
      },
    },
    from(table) {
      calls.push(['from', table]);
      return query;
    },
  };

  return { client, calls, getAuthCalls: () => authCalls };
}

const VALID_INPUT = {
  keyVersion: 2,
  wrappedKey: 'd3JhcHBlZC12ZGsta2V5LWZpeHR1cmU=',
  wrapAlg: 'AES-KW-256',
  kdfAlg: 'HKDF-SHA-256',
  kdfSalt: 'c2FsdC1maXh0dXJlLTE2Ynl0ZXM=',
  kdfInfoVersion: 1,
};

test('saveRecoveryEnvelope derives ownership from authenticated session', async () => {
  const { client, calls } = makeClient();
  const result = await saveRecoveryEnvelope(client, VALID_INPUT);

  assert.equal(result.userId, USER_ID);
  assert.equal(result.envelopeKind, 'recovery');
  assert.equal(result.wrapAlg, 'AES-KW-256');
  assert.equal(result.kdfAlg, 'HKDF-SHA-256');

  assert.deepEqual(calls[0], ['from', 'vault_key_envelopes']);
  const insertCall = calls.find(([name]) => name === 'insert');
  assert.deepEqual(insertCall[1], {
    user_id: USER_ID,
    key_version: 2,
    envelope_kind: 'recovery',
    wrapped_key: VALID_INPUT.wrappedKey,
    wrap_alg: 'AES-KW-256',
    kdf_alg: 'HKDF-SHA-256',
    kdf_salt: VALID_INPUT.kdfSalt,
    kdf_info_version: 1,
  });
  assert.equal('plaintext' in insertCall[1], false);
  assert.equal('rrs' in insertCall[1], false);
  assert.equal('vdk' in insertCall[1], false);
});

test('saveRecoveryEnvelope rejects malformed input before auth or persistence', async () => {
  const { client, calls, getAuthCalls } = makeClient();

  await assert.rejects(
    () => saveRecoveryEnvelope(client, { ...VALID_INPUT, keyVersion: 0 }),
    /vault_invalid_key_version/,
  );
  assert.equal(getAuthCalls(), 0);
  assert.equal(calls.length, 0);
});

test('listRecoveryEnvelopes maps rows and applies recovery-only ordering', async () => {
  const first = fixture();
  const second = fixture({
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    key_version: 1,
    created_at: '2026-09-02T16:00:00.000Z',
  });
  const { client, calls } = makeClient({ awaitData: [first, second] });

  const result = await listRecoveryEnvelopes(client);
  assert.deepEqual(result.map((entry) => entry.keyVersion), [2, 1]);
  assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'envelope_kind' && call[2] === 'recovery'));
  assert.ok(calls.some((call) => call[0] === 'order' && call[1] === 'key_version' && call[2]?.ascending === false));
  assert.ok(calls.some((call) => call[0] === 'order' && call[1] === 'created_at' && call[2]?.ascending === false));
});

test('getActiveRecoveryEnvelope filters revoked rows and optional key version', async () => {
  const { client, calls } = makeClient({ maybeSingleData: fixture({ key_version: 3 }) });
  const result = await getActiveRecoveryEnvelope(client, 3);

  assert.equal(result?.keyVersion, 3);
  assert.ok(calls.some((call) => call[0] === 'is' && call[1] === 'revoked_at' && call[2] === null));
  assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'key_version' && call[2] === 3));
  assert.ok(calls.some((call) => call[0] === 'limit' && call[1] === 1));
});

test('getActiveRecoveryEnvelope returns null when no active envelope exists', async () => {
  const { client } = makeClient({ maybeSingleData: null });
  assert.equal(await getActiveRecoveryEnvelope(client), null);
});

test('revokeRecoveryEnvelope updates only the authenticated visible active envelope', async () => {
  const revokedAt = '2026-09-03T16:10:00.000Z';
  const row = fixture({ revoked_at: revokedAt, updated_at: revokedAt });
  const { client, calls } = makeClient({ singleData: row });

  const result = await revokeRecoveryEnvelope(client, row.id);
  assert.equal(result.revokedAt, revokedAt);

  const updateCall = calls.find(([name]) => name === 'update');
  assert.deepEqual(Object.keys(updateCall[1]), ['revoked_at']);
  assert.ok(Number.isFinite(Date.parse(updateCall[1].revoked_at)));
  assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'id' && call[2] === row.id));
  assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'envelope_kind' && call[2] === 'recovery'));
  assert.ok(calls.some((call) => call[0] === 'is' && call[1] === 'revoked_at' && call[2] === null));
});

test('all adapter operations require an authenticated user before table access', async () => {
  const { client, calls } = makeClient({ userId: null });

  await assert.rejects(() => listRecoveryEnvelopes(client), /authentication_required/);
  assert.equal(calls.length, 0);
});

test('adapter rejects rows that violate the frozen crypto contract', async () => {
  const { client } = makeClient({
    maybeSingleData: fixture({ wrap_alg: 'AES-GCM' }),
  });

  await assert.rejects(
    () => getActiveRecoveryEnvelope(client),
    /vault_recovery_envelope_contract_mismatch/,
  );
});
