import { readFile,writeFile } from 'node:fs/promises';
import { exportAcquisitionDataset } from './lib/hnk40-e5-acquisition-export.mjs';

const inputUrl=new URL('../docs/research/mandala/final/hnk40-e5-hybrid-projection.v1.json',import.meta.url);
const outputUrl=new URL('../docs/research/mandala/final/hnk40-e5-acquisition.v1.json',import.meta.url);

const hybrid=JSON.parse(await readFile(inputUrl,'utf8'));
const acquisition=exportAcquisitionDataset(hybrid);
await writeFile(outputUrl,JSON.stringify(acquisition,null,2)+'\n','utf8');
console.log(JSON.stringify({records:acquisition.records.length,ambiguous:acquisition.records.filter(r=>r.acquisitionMode==='CANDIDATE_SET').map(r=>r.glyphId)}));
