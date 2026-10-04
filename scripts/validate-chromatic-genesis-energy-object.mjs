import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const schemaPath = path.join(root, 'docs/research/chromatic-genesis/schema/hnk-energy-object.v0.1.schema.json');
const fixtureDir = path.join(root, 'docs/research/chromatic-genesis/fixtures/energy-object');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const load = (name) => JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8'));
const fail = (message) => { throw new Error(`[CG Energy Object validation] ${message}`); };

// This validator intentionally implements the governance-critical subset of the JSON Schema
// without adding a new package dependency. The JSON Schema remains the declarative contract.
function validateGovernanceCritical(object) {
  const errors = [];
  const required = schema.required ?? [];
  for (const key of required) if (!(key in object)) errors.push(`missing required property: ${key}`);
  if (!/^CG-(ENERGY|META)-[0-9]{3}$/.test(object.semanticId ?? '')) errors.push('invalid semanticId');
  if (object.chromaticField?.identitySufficient !== false) errors.push('chromatic identitySufficient must be false');
  if (!Array.isArray(object.provenance) || object.provenance.length < 1) errors.push('provenance required');
  if (!Array.isArray(object.manifestationRules) || object.manifestationRules.length < 1) errors.push('manifestationRules required');

  if (object.semanticId === 'CG-ENERGY-006') {
    if (object.authorityState !== 'UNRESOLVED') errors.push('E6 authorityState must be UNRESOLVED');
    if (object.resolutionState !== 'UNRESOLVED') errors.push('E6 resolutionState must be UNRESOLVED');
    if (object.lexicalBinding?.state !== 'HOLD_UNRESOLVED') errors.push('E6 lexical state must be HOLD_UNRESOLVED');
    if (object.lexicalBinding?.lexeme !== null) errors.push('E6 lexeme must be null');
    if (object.lexicalBinding?.authorityState !== 'UNRESOLVED') errors.push('E6 lexical authority must be UNRESOLVED');
    if ((object.mandalaBindings?.length ?? 0) !== 0) errors.push('E6 mandala bindings forbidden');
    if ((object.operatorBindings?.length ?? 0) !== 0) errors.push('E6 operator bindings forbidden');
  }
  return errors;
}

const positive = load('ZARENU.valid.v0.1.json');
const negative = load('E6.invalid-resolved.v0.1.json');
const positiveErrors = validateGovernanceCritical(positive);
const negativeErrors = validateGovernanceCritical(negative);

if (positiveErrors.length) fail(`positive fixture failed: ${positiveErrors.join('; ')}`);
if (!negativeErrors.length) fail('negative E6 fixture unexpectedly passed');

const expectedE6Failures = [
  'E6 authorityState must be UNRESOLVED',
  'E6 resolutionState must be UNRESOLVED',
  'E6 lexical state must be HOLD_UNRESOLVED',
  'E6 lexeme must be null',
  'E6 lexical authority must be UNRESOLVED',
  'E6 mandala bindings forbidden',
  'E6 operator bindings forbidden'
];
for (const expected of expectedE6Failures) if (!negativeErrors.includes(expected)) fail(`negative fixture did not prove rule: ${expected}`);

console.log(JSON.stringify({
  status: 'PASS',
  positiveFixture: 'ZARENU.valid.v0.1.json',
  negativeFixture: 'E6.invalid-resolved.v0.1.json',
  negativeFailureCount: negativeErrors.length,
  provenRules: expectedE6Failures,
  chromaticIdentityGuard: true
}, null, 2));
