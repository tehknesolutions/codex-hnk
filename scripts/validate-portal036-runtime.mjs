import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const definition = read('apps/mobile/src/features/kether/runtime-definitions/portal036.ts');
const portal = read('apps/mobile/src/features/kether/KetherPortal036Experience.tsx');
const journey = read('apps/mobile/src/features/kether/KetherJourney.tsx');
const evidenceSql = read('supabase/migrations/20260902231052_enforce_kether_portal_evidence.sql');
const completionSql = read('supabase/migrations/20260902175751_harden_day_completion_atomicity.sql');

const requiredEvidence = [
  'portal_condition_completed',
  'base_condition_completed',
  'portal_base_comparison_completed',
  'return_confirmed',
  'review_001_035_completed',
  'consolidated_competencies_count',
  'fragile_competencies_count',
  'attribute_evidence_count',
  'premature_promotion_criterion_declared',
  'kether_synthesis_completed',
  'journal_update_confirmed',
  'safety_blocking_state',
];

const checks = [
  ['Day 036 uses all-35 gate', definition.includes('gate: ketherGateForDay(36)')],
  ['production operators remain explicitly blocked', definition.includes('PORTAL_036_OPERATORS_APPROVED = false') && definition.includes('PORTAL_036_CANONICAL_BLOCKER_ISSUE = 7')],
  ['runtime contract includes structural evidence', requiredEvidence.every((field) => definition.includes(field))],
  ['Portal UI exposes canonical-reference gate', portal.includes('CANONICAL_REFERENCE_PENDING') && portal.includes('PORTAL_036_OPERATORS_APPROVED')],
  ['blocked Portal cannot call begin through primary branch', portal.includes('!PORTAL_036_OPERATORS_APPROVED') && portal.includes('boss estrutural está implementado')],
  ['Condition A includes 5m gnosis', portal.includes("label=\"CONDITION A · PORTAL\"") && portal.includes('target={300}')],
  ['Condition B excludes operators explicitly', portal.includes('Sem Sintonizador, sem Solfeggio de transição e sem sigilo de Kether')],
  ['both Return Gates exist', portal.includes('RETURN GATE A') && portal.includes('RETURN GATE B')],
  ['safety stop persists blocking evidence', portal.includes('safety_blocking_state: true') && portal.includes('controller.interrupt(')],
  ['review requires 3 consolidated + 3 fragile', portal.includes('consolidated.length !== 3') && portal.includes('fragile.length !== 3')],
  ['seven attribute evidence cards exist', portal.includes("['HIP', 'VNT', 'PER', 'SIN', 'BIO', 'INT', 'DIS']") && portal.includes('attributeEvidence.length === 7')],
  ['synthesis is encrypted into Day 036 Vault', portal.includes('encryptVaultText') && portal.includes('saveEncryptedVaultEntry') && portal.includes("day: 36") && portal.includes('hnk-portal036-synthesis-v1')],
  ['final seal carries backend evidence names', requiredEvidence.every((field) => portal.includes(field))],
  ['promotion ceremony shows all three transitions', portal.includes('FEHU → URUZ') && portal.includes('O LOUCO → O MAGO') && portal.includes('HEXAGRAMA 1 → HEXAGRAMA 2')],
  ['backend trigger enforces evidence and encrypted journal', evidenceSql.includes('kether_portal_evidence_is_complete') && evidenceSql.includes('kether_portal_journal_required') && evidenceSql.includes('journal_vault')],
  ['backend promotion targets Chokmah Day 37', completionSql.includes("initiatory_title = 'Iniciado'") && completionSql.includes('current_day = 37') && completionSql.includes("current_sephira = 'Chokmah'")],
  ['journey mounts Portal only at Day 36', journey.includes('currentDay === 36') && journey.includes('KetherPortal036Experience')],
  ['post-promotion path does not auto-start Day 037', journey.includes('não cria nem inicia o Dia 037 automaticamente')],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} PORTAL036 · ${label}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log(`PASS PORTAL036 · ${checks.length}/${checks.length} invariants`);
