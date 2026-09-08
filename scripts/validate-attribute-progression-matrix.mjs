import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const matrix = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'progression', 'attribute-progression-matrix.v1.json'), 'utf8'));
const day2 = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'experience', 'kether', 'day-002', 'day-002.quest.json'), 'utf8'));
const evidence2 = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'experience', 'kether', 'day-002', 'day-002.evidence.schema.json'), 'utf8'));
const fail = (message) => { console.error(`ATTRIBUTE MATRIX FAIL: ${message}`); process.exitCode = 1; };

const codes = new Set(['HIP','VNT','PER','SIN','BIO','INT','DIS']);
if (matrix.id !== 'HNK-ATTRIBUTE-PROGRESSION-MATRIX-V1' || matrix.version !== '1.0.0' || matrix.status !== 'FROZEN_V1') fail('matrix identity/version drift');
if (matrix.attribute_scale?.min !== 1 || matrix.attribute_scale?.max !== 20 || matrix.attribute_scale?.onboarding_base !== 5 || matrix.attribute_scale?.onboarding_extra_pool !== 15) fail('attribute scale/onboarding baseline drift');
if (matrix.rules?.first_completion_only !== true || matrix.rules?.revisit_gain !== 0) fail('first-completion/revisit rule drift');
if (matrix.rules?.max_attribute_gain_per_day !== 1 || matrix.rules?.secondary_attribute_gain !== 0) fail('gain cadence drift');
if (matrix.rules?.subjective_phenomenon_may_trigger_gain !== false || matrix.rules?.paranormal_claim_may_trigger_gain !== false) fail('subjective/paranormal reward forbidden');
if (matrix.rules?.xp_affects_attribute_gain !== false || matrix.rules?.grade_affects_attribute_gain !== false) fail('XP/Grade must remain separate from attributes');
if (matrix.rows?.length !== 36) fail(`expected 36 Kether rows, got ${matrix.rows?.length}`);

const days = new Set();
let gains = 0;
for (const row of matrix.rows ?? []) {
  if (days.has(row.day)) fail(`duplicate day ${row.day}`);
  days.add(row.day);
  if (!codes.has(row.primary_attribute) || !codes.has(row.secondary_attribute)) fail(`invalid attribute code at day ${row.day}`);
  if (row.primary_attribute === row.secondary_attribute) fail(`primary/secondary collision at day ${row.day}`);
  if (![0,1].includes(row.attribute_gain)) fail(`invalid gain at day ${row.day}`);
  if (!String(row.status).startsWith('FROZEN')) fail(`row not frozen at day ${row.day}`);
  gains += row.attribute_gain;
}
for (let day=1; day<=36; day++) if (!days.has(day)) fail(`missing day ${day}`);
if (gains !== 14 || matrix.totals?.kether_gain_events !== 14) fail(`Kether gain cadence must remain 14, got ${gains}`);

const d1 = matrix.rows.find((r) => r.day === 1);
if (d1?.attribute_gain !== 0) fail('Day 001 must reveal ficha without auto-gain');
const d2 = matrix.rows.find((r) => r.day === 2);
if (d2?.primary_attribute !== 'DIS' || d2?.secondary_attribute !== 'PER' || d2?.attribute_gain !== 1 || d2?.source_basis?.type !== 'CANON_EXPLICIT') fail('Day 002 DIS mapping drift');
if (day2.phases.find((p) => p.id === 'attribute_notice')?.attribute_effect?.attribute !== 'DIS') fail('Day 002 quest no longer points to DIS');
if (evidence2.properties?.attribute_progression?.properties?.dis_gain_applied?.const !== false) fail('Day 002 reviewed contract must still forbid client-applied DIS');
const portal = matrix.rows.find((r) => r.day === 36);
if (portal?.attribute_gain !== 0 || portal?.source_basis?.type !== 'PORTAL_GRADE_ONLY') fail('Portal 036 must not grant attribute point');

if (!process.exitCode) console.log('ATTRIBUTE MATRIX PASS: Kether 36 rows; 14 slow-growth events; Day 002 = +1 DIS server-side only');
