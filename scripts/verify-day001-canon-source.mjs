import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceFile = process.argv[2];
if (!sourceFile) {
  console.error("usage: node scripts/verify-day001-canon-source.mjs <canonical-markdown-path>");
  process.exit(2);
}

const dayDir = path.join(root, "docs", "experience", "kether", "day-001");
const manifest = JSON.parse(fs.readFileSync(path.join(dayDir, "day-001.canon-blocks.json"), "utf8"));
const sourceBytes = fs.readFileSync(sourceFile);
const markdown = sourceBytes.toString("utf8").replace(/\r\n?/g, "\n");

const fail = (message) => {
  console.error(`DAY001 CANON SOURCE FAIL: ${message}`);
  process.exitCode = 1;
};

const gitBlobSha = (bytes) => {
  const header = Buffer.from(`blob ${bytes.length}\0`, "utf8");
  return crypto.createHash("sha1").update(header).update(bytes).digest("hex");
};

const normalize = (value) => value.replace(/\r\n?/g, "\n").trim();
const sha256 = (value) => crypto.createHash("sha256").update(normalize(value), "utf8").digest("hex");

const actualBlobSha = gitBlobSha(sourceBytes);
if (actualBlobSha !== manifest.source.blob_sha) {
  fail(`Git blob SHA mismatch: expected ${manifest.source.blob_sha}, got ${actualBlobSha}`);
}

const counted = new Map();
const countedRe =
  /<!-- HNK:COUNT START ([\w-]+) target=(\d+) -->\n([\s\S]*?)\n<!-- HNK:COUNT END -->/g;

for (const match of markdown.matchAll(countedRe)) {
  counted.set(match[1], {
    target: Number(match[2]),
    text: normalize(match[3] ?? ""),
  });
}

function sectionAfterHeading(heading) {
  const marker = `### ${heading}`;
  const start = markdown.indexOf(marker);
  if (start < 0) return null;
  const bodyStart = start + marker.length;
  const rest = markdown.slice(bodyStart);
  const next = rest.search(/\n###\s/u);
  return normalize(next >= 0 ? rest.slice(0, next) : rest);
}

const sourceSections = new Map([
  ["qr-code-interativo", sectionAfterHeading("QR CODE INTERATIVO")],
  ["espelho-da-alma", sectionAfterHeading("ESPELHO DA ALMA")],
]);

for (const block of manifest.blocks) {
  let actualText;
  if (block.kind === "COUNTED") {
    const extracted = counted.get(block.id);
    if (!extracted) {
      fail(`missing COUNT marker in source: ${block.id}`);
      continue;
    }
    if (extracted.target !== block.target_words) {
      fail(`target mismatch for ${block.id}: source=${extracted.target}, manifest=${block.target_words}`);
    }
    actualText = extracted.text;
  } else {
    actualText = sourceSections.get(block.id);
    if (actualText == null) {
      fail(`missing source section: ${block.id}`);
      continue;
    }
  }

  if (actualText !== normalize(block.text)) {
    fail(`exact text mismatch for ${block.id}`);
  }
  if (sha256(actualText) !== block.sha256) {
    fail(`source SHA-256 mismatch for ${block.id}`);
  }
}

if (!process.exitCode) {
  console.log(`DAY001 CANON SOURCE PASS (${actualBlobSha})`);
}
