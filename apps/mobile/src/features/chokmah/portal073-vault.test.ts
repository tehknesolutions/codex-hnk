import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PORTAL073_VAULT_SCHEMA } from './portal073-vault';

describe('Portal073 Vault contract', () => {
  it('keeps the Portal-specific encrypted payload schema frozen', () => {
    assert.equal(PORTAL073_VAULT_SCHEMA, 'hnk-portal073-vault-v1');
  });
});
