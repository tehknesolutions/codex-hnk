import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.HNK_VAULT_LAB_BASE_URL ?? 'http://127.0.0.1:3000';
const outDir = process.env.HNK_VAULT_LAB_OUT ?? 'artifacts/vault-web-crypto-lab';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${baseUrl}/labs/vault-crypto`, { waitUntil: 'networkidle' });
  const status = page.locator('[data-lab-status]');
  await status.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[data-lab-status]')?.getAttribute('data-lab-status') !== 'RUNNING');
  const finalStatus = await status.getAttribute('data-lab-status');
  const error = await page.locator('[data-lab-error]').textContent().catch(() => null);
  const checks = await page.locator('[data-check]').evaluateAll((nodes) => nodes.map((node) => ({
    name: node.getAttribute('data-check'),
    ok: node.getAttribute('data-check-ok') === 'true',
    text: node.textContent?.trim() ?? '',
  })));

  if (finalStatus !== 'PASS' || checks.length < 7 || checks.some((check) => !check.ok)) {
    throw new Error(`vault_web_crypto_lab_failed:${finalStatus}:${error ?? 'no-error'}`);
  }

  await mkdir(outDir, { recursive: true });
  const result = {
    schemaVersion: '1.0',
    lab: 'hnk-web-vault-crypto-v1',
    status: finalStatus,
    route: '/labs/vault-crypto',
    secureContext: await page.evaluate(() => window.isSecureContext),
    chromiumVersion: browser.version(),
    headSha: process.env.GITHUB_SHA ?? null,
    checks,
    verifiedAt: new Date().toISOString(),
  };
  await writeFile(path.join(outDir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
