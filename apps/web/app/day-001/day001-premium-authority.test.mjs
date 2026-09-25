import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDay001PremiumViewModel } from './day001-premium-authority.mjs';

const canon = { title: 'DIA 001 — KETHER — A COROA', sections: { revelation: 'R', doctrine: 'D', kavanah: 'K' } };

test('canon stays separate from user reflection', () => {
  const vm = buildDay001PremiumViewModel({ canon, authoritativeComplete: false, unlockedThrough: 'mirror', vault: { reflection: 'minha reflexão', status: 'saved' } });
  assert.equal(vm.canon, canon); assert.equal(vm.vault.reflection, 'minha reflexão'); assert.equal('reflection' in vm.canon, false);
});
test('missing required canon is explicit and never synthesized', () => {
  const vm = buildDay001PremiumViewModel({ canon: { title: 'DIA 001', sections: { revelation: 'R' } }, authoritativeComplete: false, unlockedThrough: 'revelation' });
  assert.equal(vm.contentStatus, 'unavailable'); assert.match(vm.contentUnavailableReason, /doctrine|kavanah/i);
});
test('client visual state cannot forge Seal completion', () => {
  const vm = buildDay001PremiumViewModel({ canon, authoritativeComplete: false, clientVisualComplete: true, unlockedThrough: 'seal' });
  assert.equal(vm.seal.status, 'locked');
});
test('authoritative completion seals the Day', () => assert.equal(buildDay001PremiumViewModel({ canon, authoritativeComplete: true, unlockedThrough: 'seal' }).seal.status, 'complete'));
