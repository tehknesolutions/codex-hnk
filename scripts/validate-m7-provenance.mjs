import fs from 'node:fs';
const must=[
'packages/provenance-contract/src/types.ts','packages/provenance-contract/src/provenance.ts',
'packages/provenance-registry/src/datasets.ts','apps/web/app/_components/ProvenanceLens.tsx','apps/web/app/provenance/page.tsx'
];
for(const p of must){if(!fs.existsSync(p)) throw new Error(`M7 missing ${p}`);}
const types=fs.readFileSync(must[0],'utf8');
for(const token of ['CANON','HISTORICAL_REFERENCE','SOURCE_DERIVED','HNK_AUTHORED','RESEARCH_ONLY']) if(!types.includes(token)) throw new Error(`M7 authority missing ${token}`);
const dataset=fs.readFileSync(must[2],'utf8');
for(const token of ['SRC-SY-REFERENCE-A','SRC-GD-STANDARD','SRC-024','SRC-026','CANON_APPROVED']) if(!dataset.includes(token)) throw new Error(`M7 dataset missing ${token}`);
const ui=fs.readFileSync(must[3],'utf8');
for(const token of ['Origem, autoridade e evidência','Conflito preservado','Filtrar autoridade']) if(!ui.includes(token)) throw new Error(`M7 UI missing ${token}`);
console.log('M7_PROVENANCE_GATE_OK');
