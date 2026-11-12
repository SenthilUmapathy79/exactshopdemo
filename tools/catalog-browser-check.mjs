// Browser checks for responses the public API cannot reliably produce on demand.
// Run with the web preview at 54321, or set CATALOG_URL.
import { chromium } from '../../exact/node_modules/playwright-core/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const held = [];
  await page.route('https://fakestoreapi.com/products**', route => { held.push(route); });
  await page.goto(process.env.CATALOG_URL || 'http://127.0.0.1:54321');
  await page.getByText('Loading categories…', { exact: true }).waitFor();
  await page.getByText('Loading products…', { exact: true }).waitFor();
  await page.waitForFunction(() => document.body.innerText.includes('Loading products'));
  assert.equal(held.length, 2, 'exactly the two initial API reads');
  for (const route of held) await route.fulfill({ status: 200, contentType: 'application/json', body: '[]', headers: { 'access-control-allow-origin': '*' } });
  await page.getByText('No products found', { exact: true }).waitFor();
  assert.equal(await page.getByText('Loading products…', { exact: true }).count(), 0);
  assert.equal(await page.getByText('Loading categories…', { exact: true }).count(), 0);
  console.log('PASS: both loading states, empty API response, and exactly two initial requests');
} finally {
  await browser.close();
}
