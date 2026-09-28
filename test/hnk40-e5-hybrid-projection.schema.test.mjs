import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schemaUrl = new URL('../spec/hnk40-e5-hybrid-projection.schema.json', import.meta.url);

test('hybrid projection schema locks the approved contract', async () => {
  const schema = JSON.parse(await readFile(schemaUrl, 'utf8'));
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.$id, 'hnk-kode/hnk40-e5-hybrid-projection.schema.json');
  const record = schema.$defs.hybridProjectionRecord;
  assert.deepEqual(record.required, [
    'legacyIdentity', 'projectionSet', 'resolutionStatus',
    'preferredProjectionId', 'resolutionEvidence', 'acquisitionEligibility'
  ]);
  assert.deepEqual(record.properties.resolutionStatus.enum, [
    'DIRECT', 'DERIVED_UNIQUE', 'DERIVED_AMBIGUOUS', 'NO_E5_PROJECTION', 'PENDING_RULE'
  ]);
  const projection = schema.$defs.e5Projection;
  assert.equal(projection.properties.path.minItems, 12);
  assert.equal(projection.properties.path.maxItems, 12);
  assert.equal(projection.properties.path.uniqueItems, true);
  assert.equal(projection.properties.authority.const, 'DERIVED_STRUCTURAL');
  assert.equal(projection.properties.canonical.const, false);
  assert.ok(record.allOf.some(rule => JSON.stringify(rule).includes('DERIVED_AMBIGUOUS') && JSON.stringify(rule).includes('null')));
});
