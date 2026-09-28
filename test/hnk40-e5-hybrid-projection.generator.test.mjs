import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateHybridProjection } from '../scripts/lib/hnk40-e5-hybrid-projection.mjs';

const source = JSON.parse(await readFile(new URL('../docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json', import.meta.url), 'utf8'));

test('generator reproduces approved 4/34/2 state', () => {
  const out = generateHybridProjection(source);
  assert.equal(out.records.length, 40);
  assert.deepEqual(out.summary, { DIRECT: 4, DERIVED_UNIQUE: 34, DERIVED_AMBIGUOUS: 2, NO_E5_PROJECTION: 0, PENDING_RULE: 0 });
  const direct = out.records.filter(r => r.resolutionStatus === 'DIRECT').map(r => r.legacyIdentity.glyphId);
  assert.deepEqual(direct, ['G01', 'G11', 'G21', 'G31']);
  const ambiguous = out.records.filter(r => r.resolutionStatus === 'DERIVED_AMBIGUOUS');
  assert.deepEqual(ambiguous.map(r => r.legacyIdentity.glyphId), ['G17', 'G20']);
  assert.ok(ambiguous.every(r => r.projectionSet.length === 2 && r.preferredProjectionId === null));
  for (const record of out.records) for (const projection of record.projectionSet) {
    assert.equal(projection.path.length, 12);
    assert.equal(new Set(projection.path).size, 12);
  }
});

test('generator rejects non-40 corpus and preserves unexpected ties', () => {
  assert.throws(() => generateHybridProjection({ ...source, records: source.records.slice(0, 39) }), /40/);
  const out = generateHybridProjection(source);
  assert.ok(out.records.find(r => r.legacyIdentity.glyphId === 'G17').projectionSet.length > 1);
});

test('projection IDs and ordering are deterministic', () => {
  const a = generateHybridProjection(source);
  const b = generateHybridProjection(source);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.deepEqual(a.records.map(r => r.legacyIdentity.glyphId), Array.from({ length: 40 }, (_, i) => `G${String(i + 1).padStart(2, '0')}`));
  for (const record of a.records) {
    const ids = record.projectionSet.map(p => p.projectionId);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.every(id => id.startsWith(`${record.legacyIdentity.glyphId}-E5-`)));
  }
});
