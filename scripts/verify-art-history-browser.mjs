#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, extname, join, normalize, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const REQUIRED_VIEWPORTS = Object.freeze([
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 375, height: 812 },
  { width: 667, height: 375 },
]);

export const BOUNDARY_VIEWPORTS = Object.freeze([
  { width: 519, height: 700 },
  { width: 520, height: 700 },
  { width: 521, height: 700 },
  { width: 639, height: 700 },
  { width: 640, height: 700 },
  { width: 641, height: 700 },
  { width: 664, height: 700 },
  { width: 665, height: 700 },
  { width: 667, height: 519 },
  { width: 667, height: 520 },
  { width: 667, height: 521 },
]);

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const IMAGE_FIXTURE = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#d8c5a7"/><circle cx="320" cy="240" r="120" fill="#8f553f"/></svg>',
);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

async function isReadable(path) {
  if (!path) return false;
  try {
    await access(path, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function newestDirectory(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
  } catch {
    return null;
  }
}

export async function discoverPlaywright() {
  const configured = process.env.ART_HISTORY_PLAYWRIGHT_PATH;
  const cacheRoot = join(homedir(), 'Library', 'Caches', 'ms-playwright-go');
  const cacheVersion = await newestDirectory(cacheRoot);
  const candidates = [
    configured,
    join(PROJECT_ROOT, 'node_modules', 'playwright', 'index.mjs'),
    join(PROJECT_ROOT, 'node_modules', 'playwright', 'index.js'),
    join(PROJECT_ROOT, 'node_modules', 'playwright-core', 'index.mjs'),
    join(PROJECT_ROOT, 'node_modules', 'playwright-core', 'index.js'),
    cacheVersion && join(cacheRoot, cacheVersion, 'package', 'index.mjs'),
    cacheVersion && join(cacheRoot, cacheVersion, 'package', 'index.js'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!await isReadable(candidate)) continue;
    try {
      return await import(pathToFileURL(candidate).href);
    } catch {
      // Try the next discovered installation and report one actionable error below.
    }
  }
  throw new Error(
    'No supported Playwright runtime found. Install playwright locally or set ART_HISTORY_PLAYWRIGHT_PATH.',
  );
}

export async function discoverBrowser(chromium) {
  const configured = process.env.ART_HISTORY_BROWSER_PATH;
  const candidates = [
    configured,
    chromium?.executablePath?.(),
    process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : null,
    process.platform === 'darwin'
      ? '/Applications/Chromium.app/Contents/MacOS/Chromium'
      : null,
    process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
    process.platform === 'linux' ? '/usr/bin/chromium' : null,
    process.platform === 'win32'
      ? join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe')
      : null,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (await isReadable(candidate)) return candidate;
  }
  throw new Error(
    'No supported Chromium or Chrome executable found. Install Chrome/Chromium or set ART_HISTORY_BROWSER_PATH.',
  );
}

export async function startStaticServer(root = PROJECT_ROOT) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
      if (requestUrl.pathname === '/favicon.ico') {
        response.writeHead(204);
        response.end();
        return;
      }
      const decoded = decodeURIComponent(requestUrl.pathname);
      const requested = decoded === '/' ? '/index.html' : decoded;
      const path = normalize(join(root, requested));
      if (relative(root, path).startsWith('..')) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      const info = await stat(path);
      const file = info.isDirectory() ? join(path, 'index.html') : path;
      const body = await readFile(file);
      response.writeHead(200, {
        'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (
      error ? reject(error) : resolve()
    ))),
  };
}

function installErrorCollection(page, label) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`${label} pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${label} console: ${message.text()}`);
  });
  return errors;
}

async function mockRemoteImages(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (route) => {
    if (route.request().resourceType() === 'image') {
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: IMAGE_FIXTURE,
      });
      return;
    }
    await route.fulfill({ status: 204, body: '' });
  });
}

async function waitForArt(frame) {
  await frame.locator('#markerLayer .site-marker').first().waitFor();
  await frame.locator('#unitFilter').waitFor();
}

async function geometry(frame) {
  return frame.evaluate(() => {
    const workspace = document.querySelector('.art-workspace').getBoundingClientRect();
    const map = document.querySelector('.map-panel').getBoundingClientRect();
    const detail = document.querySelector('.detail-panel').getBoundingClientRect();
    const bodyStyle = getComputedStyle(document.body);
    return {
      innerWidth,
      innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pageScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      bodyOverflowY: bodyStyle.overflowY,
      workspace: { width: workspace.width, height: workspace.height },
      map: { x: map.x, y: map.y, width: map.width, height: map.height },
      detail: { x: detail.x, y: detail.y, width: detail.width, height: detail.height },
      stacked: detail.y >= map.y + map.height - 1,
      detailScroll: document.querySelector('.detail-panel').scrollHeight
        - document.querySelector('.detail-panel').clientHeight,
    };
  });
}

async function assertCommonLayout(frame, mode, viewport) {
  const metrics = await geometry(frame);
  assert.ok(metrics.horizontalOverflow <= 1, `${mode} ${viewport.width} has horizontal overflow`);
  assert.equal(
    await frame.locator('.page-header').isVisible(),
    mode === 'standalone',
    `${mode} header visibility`,
  );
  const expectedStack = metrics.innerWidth <= 664;
  assert.equal(metrics.stacked, expectedStack, `${mode} ${viewport.width} stack mode`);
  if (!expectedStack) {
    assert.ok(metrics.map.width >= 348, `${mode} ${viewport.width} map width ${metrics.map.width}`);
    assert.ok(metrics.detail.width >= 273, `${mode} ${viewport.width} detail width ${metrics.detail.width}`);
  }
  const controls = await frame.locator('.map-controls button').evaluateAll((buttons) => (
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    })
  ));
  assert.ok(
    controls.every(({ width, height }) => width >= 30 && height >= 30),
    `${mode} ${viewport.width} control sizes ${JSON.stringify(controls)}`,
  );
  return metrics;
}

async function assertKeyboardAndFilters(page, frame) {
  const unitFilter = frame.locator('#unitFilter');
  await frame.locator('body').click({ position: { x: 2, y: 2 } });
  await frame.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Tab');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  const focusStyle = await unitFilter.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth) };
  });
  assert.notEqual(focusStyle.outlineStyle, 'none');
  assert.ok(focusStyle.outlineWidth >= 2);

  await unitFilter.selectOption('2');
  assert.equal(await unitFilter.inputValue(), '2');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  assert.match(await frame.locator('.result-count').textContent(), /36/);
  const cultures = frame.locator('#cultureFilters [data-culture]');
  assert.equal(await cultures.count(), 6);
  const expected = new Map([
    ['all', 36],
    ['ancientNearEast', 6],
    ['egypt', 9],
    ['greece', 10],
    ['etruscan', 3],
    ['rome', 8],
  ]);
  for (const [culture, count] of expected) {
    const button = frame.locator(`[data-culture="${culture}"]`);
    await button.click();
    assert.match(await frame.locator('.result-count').textContent(), new RegExp(`\\b${count}\\b`));
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await frame.evaluate(() => document.activeElement?.dataset?.culture), culture);
  }
  await frame.locator('[data-culture="all"]').click();
  return unitFilter;
}

async function assertHierarchyAndDialog(page, frame) {
  const region = frame.locator('.site-marker[data-group-kind="region"]').first();
  await region.focus();
  await page.keyboard.press('Enter');
  await frame.locator('.site-marker[data-group-kind="site"]').first().waitFor();
  const site = frame.locator('.site-marker[data-group-kind="site"]').first();
  await site.focus();
  await page.keyboard.press('Space');

  const workPin = frame.locator('.expanded-work-pin, .expanded-pin-list-button').first();
  if (await workPin.count()) {
    await workPin.focus();
    await page.keyboard.press('Space');
  }
  const heading = frame.locator('[data-selected-artwork-title]');
  await heading.waitFor();
  assert.ok((await heading.textContent()).trim().length > 3);

  const imageButton = frame.locator('.artwork-image-button');
  const image = imageButton.locator('img');
  await image.waitFor();
  await image.evaluate((element) => (
    element.complete && element.naturalWidth > 0
      ? undefined
      : new Promise((resolve, reject) => {
        element.addEventListener('load', resolve, { once: true });
        element.addEventListener('error', reject, { once: true });
      })
  ));
  const imageFacts = await image.evaluate((element) => ({
    alt: element.alt,
    complete: element.complete,
    naturalWidth: element.naturalWidth,
    objectFit: getComputedStyle(element).objectFit,
    height: element.getBoundingClientRect().height,
  }));
  assert.ok(imageFacts.alt.length > 5);
  assert.equal(imageFacts.complete, true);
  assert.ok(imageFacts.naturalWidth > 0);
  assert.equal(imageFacts.objectFit, 'contain');
  assert.ok(imageFacts.height > 40);

  await imageButton.focus();
  await page.keyboard.press('Enter');
  const dialog = frame.locator('#imageDialog');
  await dialog.waitFor({ state: 'visible' });
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
  await page.keyboard.press('Enter');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await frame.evaluate(() => document.activeElement?.className), 'artwork-image-button');
}

async function verifyStandalone(browser, baseUrl, viewport, full) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = installErrorCollection(page, `standalone ${viewport.width}x${viewport.height}`);
  await mockRemoteImages(page);
  await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
  await waitForArt(page);
  const initial = await page.locator('.site-marker').allTextContents();
  assert.equal(initial.length, 1);
  assert.match(initial[0], /U2Ancient Mediterranean · 36 pieces/);
  const metrics = await assertCommonLayout(page, 'standalone', viewport);
  if (full) {
    await assertKeyboardAndFilters(page, page);
    await assertHierarchyAndDialog(page, page);
    assert.match(
      await page.evaluate(() => getComputedStyle(document.querySelector('.marker-visual')).transitionDuration),
      /^(?:0\.01ms|1e-05s)$/,
    );
  } else {
    await page.locator('#unitFilter').selectOption('2');
  }
  assert.deepEqual(errors, []);
  await context.close();
  return metrics;
}

async function selectArtAndFrame(page) {
  const artPill = page.locator('.subj-pill[data-subj="art"]');
  await artPill.click();
  const iframe = page.locator('#artMapFrame');
  await iframe.waitFor({ state: 'visible' });
  await page.waitForFunction(() => (
    document.querySelector('#artMapFrame')?.contentDocument?.querySelector('#markerLayer .site-marker')
  ));
  const frame = page.frames().find((candidate) => candidate.url().includes('art-history-map.html'));
  assert.ok(frame, 'Art iframe was not attached');
  await waitForArt(frame);
  return { frame, iframe };
}

async function verifyEmbedded(browser, baseUrl, viewport, full) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = installErrorCollection(page, `embedded ${viewport.width}x${viewport.height}`);
  await mockRemoteImages(page);
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
  await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => (
    document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('.map-zone')
  ));
  const worldFrame = page.frames().find((candidate) => candidate.url().includes('world-map.html'));
  assert.ok(worldFrame, 'World iframe was not attached');
  await worldFrame.locator('.map-zone').waitFor();
  assert.ok(await worldFrame.locator('.pin-group').count() > 0);
  const { frame, iframe } = await selectArtAndFrame(page);
  const metrics = await assertCommonLayout(frame, 'embedded', viewport);
  const host = await page.evaluate(() => {
    const wrap = document.querySelector('.map-card[data-subject="art"] .home-map-wrap');
    const rect = wrap.getBoundingClientRect();
    return {
      wrapHeight: rect.height,
      pageScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  assert.ok(host.horizontalOverflow <= 1);
  const shortLandscape = viewport.width <= 900 && viewport.height <= 520;
  if (shortLandscape) {
    assert.ok(Math.abs(host.wrapHeight - 520) <= 1, `short host height ${host.wrapHeight}`);
    assert.ok(host.pageScroll > 0, 'homepage should own short-landscape scrolling');
    assert.ok(metrics.pageScroll <= 1, 'embedded child should not page-scroll in short landscape');
    assert.equal(metrics.bodyOverflowY, 'hidden');
  } else if (viewport.width <= 900) {
    const approved = Math.min(720, viewport.height * 0.78);
    assert.ok(Math.abs(host.wrapHeight - approved) <= 1, `approved host height ${host.wrapHeight}`);
    if (metrics.stacked) {
      assert.ok(metrics.pageScroll > 0, 'stacked portrait content should remain reachable by child scroll');
      assert.equal(metrics.bodyOverflowY, 'auto');
    }
  }
  assert.equal(await iframe.getAttribute('aria-hidden'), 'false');
  if (full) {
    await assertKeyboardAndFilters(page, frame);
    await assertHierarchyAndDialog(page, frame);
  } else {
    await frame.locator('#unitFilter').selectOption('2');
  }
  assert.deepEqual(errors, []);
  await context.close();
  return { ...metrics, host };
}

export async function runVerification() {
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  const server = await startStaticServer();
  const browser = await playwright.chromium.launch({
    executablePath,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });
  const report = [];
  try {
    for (const viewport of REQUIRED_VIEWPORTS) {
      const standalone = await verifyStandalone(browser, server.baseUrl, viewport, true);
      const embedded = await verifyEmbedded(browser, server.baseUrl, viewport, true);
      report.push({ viewport, kind: 'required', standalone, embedded });
    }
    for (const viewport of BOUNDARY_VIEWPORTS) {
      const standalone = await verifyStandalone(browser, server.baseUrl, viewport, false);
      const embedded = await verifyEmbedded(browser, server.baseUrl, viewport, false);
      report.push({ viewport, kind: 'boundary', standalone, embedded });
    }
  } finally {
    await browser.close();
    await server.close();
  }
  return report;
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url) === normalize(process.argv[1]);

if (isMain) {
  runVerification()
    .then((report) => {
      process.stdout.write(`${JSON.stringify({ ok: true, cases: report }, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`Art History browser verification failed: ${error.stack || error}\n`);
      process.exitCode = 1;
    });
}
