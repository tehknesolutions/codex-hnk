import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { generateHybridProjection } from './lib/hnk40-e5-hybrid-projection.mjs';

const sourceUrl=new URL('../docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json',import.meta.url);
const outputUrl=new URL('../docs/research/mandala/final/hnk40-e5-hybrid-projection.v1.json',import.meta.url);

export async function materializeHybridProjection(){
  const source=JSON.parse(await readFile(sourceUrl,'utf8'));
  const artifact=generateHybridProjection(source);
  const bytes=JSON.stringify(artifact,null,2)+'\n';
  await writeFile(outputUrl,bytes,'utf8');
  return { output:fileURLToPath(outputUrl), bytes:Buffer.byteLength(bytes), summary:artifact.summary };
}

if (process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]) {
  const result=await materializeHybridProjection();
  console.log(JSON.stringify(result));
}
