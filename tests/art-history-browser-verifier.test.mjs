import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const VERIFIER_URL = new URL('../scripts/verify-art-history-browser.mjs', import.meta.url);
const RELEASE_VERIFIER_URL = new URL('../scripts/verify-art-history-release.mjs', import.meta.url);

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
      [639, 519],
      [639, 520],
      [639, 521],
      [640, 519],
      [640, 520],
      [640, 521],
      [641, 519],
      [641, 520],
      [641, 521],
      [663, 519],
      [663, 520],
      [663, 521],
      [664, 519],
      [664, 520],
      [664, 521],
      [665, 519],
      [665, 520],
      [665, 521],
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

test('verification lifecycle closes the server when browser launch rejects', async () => {
  const { runManagedVerification } = await import(VERIFIER_URL.href);
  const events = [];
  const launchError = new Error('launcher rejected');

  await assert.rejects(
    runManagedVerification({
      startServer: async () => ({
        close: async () => events.push('server.close'),
      }),
      launchBrowser: async () => {
        events.push('browser.launch');
        throw launchError;
      },
      verify: async () => events.push('verify'),
    }),
    launchError,
  );
  assert.deepEqual(events, ['browser.launch', 'server.close']);
});

test('verification lifecycle still closes the server when browser close rejects', async () => {
  const { runManagedVerification } = await import(VERIFIER_URL.href);
  const events = [];
  const closeError = new Error('browser close rejected');

  await assert.rejects(
    runManagedVerification({
      startServer: async () => ({
        close: async () => events.push('server.close'),
      }),
      launchBrowser: async () => ({
        close: async () => {
          events.push('browser.close');
          throw closeError;
        },
      }),
      verify: async () => {
        events.push('verify');
        return ['report'];
      },
    }),
    closeError,
  );
  assert.deepEqual(events, ['verify', 'browser.close', 'server.close']);
});

test('release verifier explicitly runs tests, strict data validation, and browser verification', async () => {
  const source = await readFile(RELEASE_VERIFIER_URL, 'utf8');

  assert.match(source, /--test/);
  assert.match(source, /validate-art-history-data\.mjs/);
  assert.match(source, /verify-art-history-browser\.mjs/);
  assert.match(source, /Release verification failed/);
});
