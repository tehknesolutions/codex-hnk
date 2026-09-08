import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error('usage: node scripts/verify-day002-canon-source.mjs <dia-002.md>');
  process.exit(2);
}

const raw = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/experience/kether/day-002/day-002.canon-blocks.json'), 'utf8'));
const bytes = Buffer.from(raw, 'utf8');
const gitBlobSha = crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const fail = (message) => { console.error(`DAY002 CANON SOURCE FAIL: ${message}`); process.exitCode = 1; };

if (gitBlobSha !== manifest.source?.blob_sha) fail(`Git blob SHA mismatch: ${gitBlobSha} != ${manifest.source?.blob_sha}`);

const WORD_RE = /[0-9A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-’'][0-9A-Za-zÀ-ÖØ-öø-ÿ]+)*/gu;
const officialCount = (text) => (text
  .replace(/<!--.*?-->/gs, ' ')
  .replace(/\[(?:\d+\s*(?:,\s*\d+\s*)*)\]/g, ' ')
  .replace(/[`*_#>]/g, ' ')
  .match(WORD_RE) ?? []).length;

function extractCountedBlock(id) {
  const startPattern = new RegExp(`<!--\\s*HNK:COUNT START\\s+${id}\\s+target=(\\d+)\\s*-->`, 'i');
  const match = startPattern.exec(raw);
  if (!match) return null;
  const bodyStart = match.index + match[0].length;
  const end = raw.indexOf('<!-- HNK:COUNT END -->', bodyStart);
  if (end < 0) return null;
  return { declaredTarget: Number(match[1]), text: raw.slice(bodyStart, end).trim() };
}

let total = 0;
for (const block of manifest.blocks.filter((entry) => entry.kind === 'COUNTED')) {
  const source = extractCountedBlock(block.id);
  if (!source) { fail(`missing raw block ${block.id}`); continue; }
  if (source.text !== block.text) fail(`text drift: ${block.id}`);
  const count = officialCount(source.text);
  total += count;
  if (source.declaredTarget !== block.target_words) fail(`declared target drift: ${block.id}`);
  if (count !== block.word_count) fail(`word count drift: ${block.id}=${count}`);
  const sha256 = crypto.createHash('sha256').update(Buffer.from(source.text, 'utf8')).digest('hex');
  if (sha256 !== block.sha256) fail(`SHA-256 drift: ${block.id}`);
}

if (total !== 705) fail(`counted core is ${total}, expected 705`);
if (!process.exitCode) console.log(`DAY002 CANON SOURCE PASS (${gitBlobSha}, 705 counted words)`);
