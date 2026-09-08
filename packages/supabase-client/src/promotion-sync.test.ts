// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveKetherPortalPromotion } from './promotion-sync.ts';

const neophyte = { grade: 1, title: 'Neófito' };

test('OFF-006 local offline Portal completion remains PROMOTION_PENDING_SYNC', () => {
  const result = resolveKetherPortalPromotion({
    localPortalCompleted: true,
    transport: 'offline',
    lastConfirmed: neophyte,
  });

  assert.equal(result.phase, 'PROMOTION_PENDING_SYNC');
  assert.equal(result.ceremonyAllowed, false);
  assert.equal(result.officialGrade, 1);
  assert.equal(result.officialTitle, 'Neófito');
});

test('OFF-006 sync in flight cannot finalize Iniciado ceremony', () => {
  const result = resolveKetherPortalPromotion({
    localPortalCompleted: true,
    transport: 'pending',
    lastConfirmed: neophyte,
  });

  assert.equal(result.phase, 'PROMOTION_PENDING_SYNC');
  assert.equal(result.ceremonyAllowed, false);
});

test('OFF-006 transport failure preserves last server-confirmed grade', () => {
  const result = resolveKetherPortalPromotion({
    localPortalCompleted: true,
    transport: 'failed',
    lastConfirmed: neophyte,
  });

  assert.equal(result.phase, 'PROMOTION_SYNC_ERROR');
  assert.equal(result.officialGrade, 1);
  assert.equal(result.officialTitle, 'Neófito');
  assert.equal(result.ceremonyAllowed, false);
});

test('P36-014 malformed or non-promoting backend confirmation cannot finalize promotion', () => {
  const result = resolveKetherPortalPromotion({
    localPortalCompleted: true,
    transport: 'confirmed',
    lastConfirmed: neophyte,
    serverConfirmation: {
      grade: 1,
      title: 'Neófito',
      ketherComplete: true,
    },
  });

  assert.equal(result.phase, 'PROMOTION_REJECTED');
  assert.equal(result.ceremonyAllowed, false);
  assert.equal(result.officialGrade, 1);
});

test('P36-014 only Grade 2 + Iniciado + Kether complete unlocks ceremony', () => {
  const result = resolveKetherPortalPromotion({
    localPortalCompleted: true,
    transport: 'confirmed',
    lastConfirmed: neophyte,
    serverConfirmation: {
      grade: 2,
      title: 'Iniciado',
      ketherComplete: true,
    },
  });

  assert.equal(result.phase, 'PROMOTED');
  assert.equal(result.ceremonyAllowed, true);
  assert.equal(result.officialGrade, 2);
  assert.equal(result.officialTitle, 'Iniciado');
});

test('Portal that is not locally complete remains in progress', () => {
  const result = resolveKetherPortalPromotion({
    localPortalCompleted: false,
    transport: 'offline',
    lastConfirmed: neophyte,
  });

  assert.equal(result.phase, 'PORTAL_IN_PROGRESS');
  assert.equal(result.ceremonyAllowed, false);
});
