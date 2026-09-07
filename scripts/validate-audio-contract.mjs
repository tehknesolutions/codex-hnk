import { existsSync, readFileSync } from 'node:fs';

const paths = {
  contract: 'packages/audio-contract/src/index.ts',
  packageJson: 'packages/audio-contract/package.json',
  doc: 'docs/audio/HNK_AUDIO_PRESET_CONTRACT_V1.md',
};

const missing = Object.values(paths).filter((path) => !existsSync(path));
if (missing.length) {
  console.error('HNK Audio Contract V1: required files missing');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

const contract = readFileSync(paths.contract, 'utf8');
const packageJson = readFileSync(paths.packageJson, 'utf8');
const doc = readFileSync(paths.doc, 'utf8');

const checks = [
  ['package is shared audio contract', packageJson.includes('"name": "@hnk/audio-contract"')],
  ['layer vocabulary separates carrier', contract.includes("kind: 'carrier'")],
  ['layer vocabulary separates binaural', contract.includes("kind: 'binaural'")],
  ['layer vocabulary separates ritual tone', contract.includes("kind: 'ritual-tone'")],
  ['layer vocabulary separates ambient', contract.includes("kind: 'ambient'")],
  ['source taxonomy preserves target-state labels', contract.includes("'target-state-label'")],
  ['source taxonomy preserves unresolved references', contract.includes("'unresolved'") && contract.includes('unresolvedReferences')],
  ['publication requires approval reference', contract.includes('requires approvalRef')],
  ['publication requires provenance reference', contract.includes('requires provenanceRef')],
  ['published preset requires SHA-256', contract.includes('published preset requires renderChecksumSha256')],
  ['ritual autoplay is forbidden', contract.includes('autoplay: false') && contract.includes('ritual audio autoplay is forbidden')],
  ['user volume control is required', contract.includes('userVolumeControl: true')],
  ['immediate stop is required', contract.includes('immediateStop: true')],
  ['binaural difference is validated', contract.includes('Math.abs(layer.rightHz - layer.leftHz)')],
  ['doc keeps ritual presets unapproved', doc.includes('RITUAL PRESETS NOT APPROVED')],
  ['doc records Day 006 52 Hz removal', doc.includes('Day 006 `52 Hz` was removed')],
  ['doc forbids inference from Theta alone', doc.includes('never inferred from the word `Theta` alone')],
  ['doc distinguishes claims from playback', doc.includes('must not describe that reproduction as proof')],
  ['doc does not seed Day 001 or Portal 036', doc.includes('No Day 001 or Portal 036 preset is seeded')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('HNK Audio Contract V1 failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`HNK Audio Contract V1: valid (${checks.length} checks)`);
