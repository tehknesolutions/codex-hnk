import fs from 'node:fs';

const sourceSha = '2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8';
const catalogPath = 'packages/assets/src/kether-references.ts';
const syncDocPath = 'docs/experience/kether/HNK_KETHER_CANONICAL_REFERENCE_SYNC_V1.md';
const registryPath = 'docs/HNK_ASSET_REGISTRY_V1.md';
const seedPath = 'supabase/seeds/kether_canonical_references_v1.sql';

const catalog = fs.readFileSync(catalogPath, 'utf8');
const syncDoc = fs.readFileSync(syncDocPath, 'utf8');
const registry = fs.readFileSync(registryPath, 'utf8');
const seed = fs.readFileSync(seedPath, 'utf8');

const required = [
  ['canon SHA', sourceSha],
  ['Dai Koo Myo id', 'reiki-usui-dai-ko-myo-v1'],
  ['Dai Koo Myo semantic master', '大光明'],
  ['Dai Koo Myo master hash', '25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0'],
  ['Gneo Geo id', 'hnk.gneo_geo.v1'],
  ['Gneo Geo hash', '2547d18241651980ed1668408b189ecfd1eb28acb400cdf6c1d96e7514d90436'],
  ['Kether sigil id', 'hnk.kether.sigil.v1'],
  ['Kether sigil hash', '7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a'],
  ['Sintonizador id', 'hnk.tuner.kether.v1'],
  ['transition id', 'hnk.audio.kether_chokmah.transition.v1'],
  ['transition hash', '5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168'],
];

for (const [label, needle] of required) {
  for (const [path, text] of [[catalogPath, catalog], [syncDocPath, syncDoc]]) {
    if (!text.includes(needle)) throw new Error(`${label} missing from ${path}`);
  }
}

for (const needle of ['hnk.gneo_geo.v1.master','hnk.kether.sigil.v1.master','oracle-dai-ko-myo-usui-hnk-master-v1','hnk.tuner.kether.v1','hnk.audio.kether_chokmah.transition.v1']) {
  if (!seed.includes(needle)) throw new Error(`registry seed missing ${needle}`);
  if (!registry.includes(needle)) throw new Error(`registry doc missing ${needle}`);
}

if (!catalog.includes("transitionAudio") || !catalog.includes("state: 'review'")) {
  throw new Error('transition audio must remain review in product catalog until listening QA/publication');
}
if (!seed.includes("'review', 1, 'project-generated'") || !seed.includes("'listening_qa_pending',true") || !seed.includes("'published',false")) {
  throw new Error('transition audio seed must remain review/listening-QA-pending/not-published');
}
if (seed.includes("'hnk.audio.kether_chokmah.transition.v1', 36, 'day', '036', 'transition-audio', 'audio', null,\n    'hnk-canonical-reference',\n    '5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168',\n    'published'")) {
  throw new Error('transition audio must not be published before listening QA');
}
if (!syncDoc.includes('supersedes older `REFERENCE_PENDING` / `CANONICAL_REFERENCE_PENDING`')) {
  throw new Error('sync document must explicitly supersede historical pending markers');
}
if (!syncDoc.includes('angel/entity detector') || !syncDoc.includes('does not infer objective supernatural frequencies') || !catalog.includes('entityDetector: false')) {
  throw new Error('Sintonizador HNK-EP boundary is required');
}

console.log('Kether canonical reference sync: OK');
