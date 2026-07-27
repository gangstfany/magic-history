import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const VERIFIER_URL = new URL('../scripts/verify-art-history-browser.mjs', import.meta.url);

test('browser verifier exposes required and responsive-boundary viewport matrices', async () => {
  const verifier = await import(VERIFIER_URL.href);

  assert.deepEqual(
    verifier.REQUIRED_VIEWPORTS.map(({ width, height }) => [width, height]),
    [
      [1440, 900],
      [1024, 768],
      [768, 900],
      [375, 812],
      [667, 375],
    ],
  );
  assert.deepEqual(
    verifier.BOUNDARY_VIEWPORTS.map(({ width, height }) => [width, height]),
    [
      [519, 700],
      [520, 700],
      [521, 700],
      [639, 700],
      [640, 700],
      [641, 700],
      [664, 700],
      [665, 700],
      [667, 519],
      [667, 520],
      [667, 521],
    ],
  );
});

test('browser verifier discovers its runtime and browser without machine-specific paths', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /ART_HISTORY_PLAYWRIGHT_PATH/);
  assert.match(source, /ART_HISTORY_BROWSER_PATH/);
  assert.match(source, /Library', 'Caches', 'ms-playwright-go'/);
  assert.match(source, /node_modules', 'playwright'/);
  assert.match(source, /createServer/);
  assert.match(source, /listen\(0,\s*'127\.0\.0\.1'/);
  assert.match(source, /No supported Playwright runtime found/);
  assert.match(source, /No supported Chromium or Chrome executable found/);
  assert.doesNotMatch(source, /\/Users\/|tiffanyxu/);
});
