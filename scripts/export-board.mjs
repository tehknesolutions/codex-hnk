import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      result[key] = true;
      continue;
    }
    result[key] = value;
    index += 1;
  }
  return result;
}

function required(args, key) {
  const value = args[key];
  if (!value || value === true) {
    throw new Error(`Missing required argument --${key}`);
  }
  return value;
}

async function sha256(path) {
  const buffer = await readFile(path);
  return createHash('sha256').update(buffer).digest('hex');
}

async function prepareBoardPage(browser, targetUrl, boardId, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const board = page.locator(`[data-hnk-board-id="${boardId}"]`);
  await board.waitFor({ state: 'visible' });

  const exportedId = await board.getAttribute('data-hnk-board-id');
  if (exportedId !== boardId) {
    throw new Error(`Board identity mismatch: expected ${boardId}, received ${exportedId}`);
  }

  const box = await board.boundingBox();
  if (!box) throw new Error(`Unable to measure board ${boardId}`);

  return { page, board, box };
}

const args = parseArgs(process.argv.slice(2));
const boardId = required(args, 'id');
const route = required(args, 'route');
const outputDirectory = resolve(required(args, 'out'));
const slug = typeof args.slug === 'string' ? args.slug : boardId.replace(/-v\d+$/, '');
const baseUrl = process.env.HNK_BOARD_BASE_URL ?? 'http://127.0.0.1:3000';
const targetUrl = new URL(route, baseUrl).toString();

await mkdir(outputDirectory, { recursive: true });

const pngPath = resolve(outputDirectory, `${slug}.png`);
const mobilePngPath = resolve(outputDirectory, `${slug}-mobile-390.png`);
const pdfPath = resolve(outputDirectory, `${slug}.pdf`);
const manifestPath = resolve(outputDirectory, 'export-manifest.json');

const browser = await chromium.launch({ headless: true });

try {
  const desktopViewport = { width: 1600, height: 1200 };
  const mobileViewport = { width: 390, height: 844 };

  const desktop = await prepareBoardPage(browser, targetUrl, boardId, desktopViewport);

  await desktop.board.screenshot({
    path: pngPath,
    type: 'png',
    animations: 'disabled',
  });

  const documentSize = await desktop.page.evaluate(() => ({
    width: Math.ceil(document.documentElement.scrollWidth),
    height: Math.ceil(document.documentElement.scrollHeight),
  }));

  await desktop.page.pdf({
    path: pdfPath,
    printBackground: true,
    preferCSSPageSize: false,
    width: `${documentSize.width}px`,
    height: `${documentSize.height}px`,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  const mobile = await prepareBoardPage(browser, targetUrl, boardId, mobileViewport);

  await mobile.board.screenshot({
    path: mobilePngPath,
    type: 'png',
    animations: 'disabled',
  });

  const manifest = {
    schemaVersion: '1.0',
    boardId,
    route,
    sourceUrl: targetUrl,
    exportedAt: new Date().toISOString(),
    renderer: 'playwright/chromium',
    viewport: { ...desktopViewport, deviceScaleFactor: 1 },
    boardBounds: {
      width: Math.ceil(desktop.box.width),
      height: Math.ceil(desktop.box.height),
    },
    mobileViewport: { ...mobileViewport, deviceScaleFactor: 1 },
    mobileBoardBounds: {
      width: Math.ceil(mobile.box.width),
      height: Math.ceil(mobile.box.height),
    },
    outputs: [
      {
        kind: 'board-img',
        format: 'png',
        target: 'desktop',
        path: pngPath,
        sha256: await sha256(pngPath),
      },
      {
        kind: 'board-img-mobile',
        format: 'png',
        target: 'mobile-390',
        path: mobilePngPath,
        sha256: await sha256(mobilePngPath),
      },
      {
        kind: 'board-document-export',
        format: 'pdf',
        target: 'print',
        path: pdfPath,
        sha256: await sha256(pdfPath),
      },
    ],
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Exported ${boardId}`);
  console.log(`PNG: ${pngPath}`);
  console.log(`Mobile PNG: ${mobilePngPath}`);
  console.log(`PDF: ${pdfPath}`);
  console.log(`Manifest: ${manifestPath}`);
} finally {
  await browser.close();
}
