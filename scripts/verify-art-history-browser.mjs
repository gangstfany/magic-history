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
  { width: 519, height: 519 },
  { width: 519, height: 520 },
  { width: 519, height: 521 },
  { width: 520, height: 519 },
  { width: 520, height: 520 },
  { width: 520, height: 521 },
  { width: 521, height: 519 },
  { width: 521, height: 520 },
  { width: 521, height: 521 },
  { width: 639, height: 700 },
  { width: 640, height: 700 },
  { width: 641, height: 700 },
  { width: 664, height: 700 },
  { width: 665, height: 700 },
  { width: 639, height: 519 },
  { width: 639, height: 520 },
  { width: 639, height: 521 },
  { width: 640, height: 519 },
  { width: 640, height: 520 },
  { width: 640, height: 521 },
  { width: 641, height: 519 },
  { width: 641, height: 520 },
  { width: 641, height: 521 },
  { width: 663, height: 519 },
  { width: 663, height: 520 },
  { width: 663, height: 521 },
  { width: 664, height: 519 },
  { width: 664, height: 520 },
  { width: 664, height: 521 },
  { width: 665, height: 519 },
  { width: 665, height: 520 },
  { width: 665, height: 521 },
  { width: 667, height: 519 },
  { width: 667, height: 520 },
  { width: 667, height: 521 },
]);

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const U1_WORKS = Object.freeze(JSON.parse(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u1-browser.json'), 'utf8'),
));
const NINE_IMPORTED_WORKS = Object.freeze(JSON.parse(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u2-imported-browser.json'), 'utf8'),
));
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
    if (
      message.type() === 'error'
      || message.type() === 'warning'
    ) {
      errors.push(`${label} console ${message.type()}: ${message.text()}`);
    }
  });
  return errors;
}

async function mockRemoteImages(page, onImageRequest = () => {}) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (route) => {
    if (route.request().resourceType() === 'image') {
      onImageRequest(route.request().url());
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
    const toolbar = document.querySelector('.filter-toolbar').getBoundingClientRect();
    const bodyStyle = getComputedStyle(document.body);
    return {
      innerWidth,
      innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pageScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      bodyOverflowY: bodyStyle.overflowY,
      workspace: { width: workspace.width, height: workspace.height },
      toolbar: { top: toolbar.top, bottom: toolbar.bottom, height: toolbar.height },
      map: { x: map.x, y: map.y, width: map.width, height: map.height },
      detail: { x: detail.x, y: detail.y, width: detail.width, height: detail.height },
      contentBottom: Math.max(toolbar.bottom, map.bottom, detail.bottom),
      scrollHeight: document.documentElement.scrollHeight,
      stacked: detail.y >= map.y + map.height - 1,
      detailScroll: document.querySelector('.detail-panel').scrollHeight
        - document.querySelector('.detail-panel').clientHeight,
    };
  });
}

function assertReachability(metrics, mode, viewport) {
  const fitsFrame = metrics.contentBottom <= metrics.innerHeight + 1;
  const childCanScroll = metrics.pageScroll > 0 && (
    mode === 'standalone'
    || ['auto', 'scroll'].includes(metrics.bodyOverflowY)
  );
  assert.ok(
    fitsFrame || childCanScroll,
    `${mode} ${viewport.width}x${viewport.height} content bottom ${metrics.contentBottom}`
      + ` is clipped by ${metrics.innerHeight}px frame with ${metrics.bodyOverflowY} overflow`,
  );
  if (metrics.bodyOverflowY === 'hidden') {
    assert.ok(
      fitsFrame,
      `${mode} ${viewport.width}x${viewport.height} hidden child clips content`,
    );
  }
  if (
    mode === 'embedded'
    && metrics.bodyOverflowY === 'hidden'
    && metrics.stacked
    && metrics.innerWidth <= 520
  ) {
    assert.ok(
      metrics.detail.height >= 220,
      `${mode} ${viewport.width}x${viewport.height} detail height ${metrics.detail.height}`,
    );
  }
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
  assertReachability(metrics, mode, viewport);
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

  await unitFilter.selectOption('1');
  assert.equal(await unitFilter.inputValue(), '1');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  assert.match(await frame.locator('.result-count').textContent(), /\b11\b/);
  const cultureFilters = frame.locator('#cultureFilters');
  assert.equal(await cultureFilters.isHidden(), true);
  assert.equal(await cultureFilters.locator('[data-culture]').count(), 0);
  const u1RegionLabels = await frame
    .locator('.site-marker[data-group-kind="region"]')
    .evaluateAll((markers) => markers.map((marker) => marker.getAttribute('aria-label')).sort());
  assert.deepEqual(u1RegionLabels, [
    'Africa · 2 pieces',
    'Americas · 2 pieces',
    'East Asia · 1 piece',
    'Europe · 2 pieces',
    'Middle East · 2 pieces',
    'Oceania · 2 pieces',
  ]);

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
    if (culture === 'ancientNearEast') {
      await frame.locator('[data-culture="all"]').focus();
      await page.keyboard.press('Tab');
      assert.equal(
        await frame.evaluate(() => document.activeElement?.dataset?.culture),
        'ancientNearEast',
      );
      const semantics = await button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          tagName: element.tagName,
          tabIndex: element.tabIndex,
          ariaPressed: element.getAttribute('aria-pressed'),
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth),
        };
      });
      assert.equal(semantics.tagName, 'BUTTON');
      assert.equal(semantics.tabIndex, 0);
      assert.equal(semantics.ariaPressed, 'false');
      assert.notEqual(semantics.outlineStyle, 'none');
      assert.ok(semantics.outlineWidth >= 2);
      await page.keyboard.press('Space');
    } else {
      await button.click();
    }
    assert.match(await frame.locator('.result-count').textContent(), new RegExp(`\\b${count}\\b`));
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await frame.evaluate(() => document.activeElement?.dataset?.culture), culture);
  }
  await frame.locator('[data-culture="all"]').click();
  return unitFilter;
}

async function assertInitialHierarchy(frame) {
  const initial = await frame
    .locator('.site-marker[data-group-kind="unit"]')
    .allTextContents();
  assert.equal(initial.length, 2);
  assert.ok(initial.some((text) => /U1Global Prehistory · 11 pieces/.test(text)));
  assert.ok(initial.some((text) => /U2Ancient Mediterranean · 36 pieces/.test(text)));
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

async function selectBoundaryFilters(frame) {
  await frame.locator('#unitFilter').selectOption('2');
  const culture = frame.locator('[data-culture="ancientNearEast"]');
  await culture.click();
  assert.equal(await culture.getAttribute('aria-pressed'), 'true');
  assert.match(await frame.locator('.result-count').textContent(), /\b6\b/);
}

async function verifyStandalone(
  browser,
  baseUrl,
  viewport,
  full,
  { injectConsoleWarning = false } = {},
) {
  return withBrowserContext(browser, {
    viewport,
    reducedMotion: 'reduce',
  }, async (context) => {
    const page = await context.newPage();
    const errors = installErrorCollection(page, `standalone ${viewport.width}x${viewport.height}`);
    await mockRemoteImages(page);
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    assert.equal(
      (await page.locator('.page-header h1').textContent()).trim(),
      'AP 艺术史互动地图',
    );
    await assertInitialHierarchy(page);
    let metrics = await assertCommonLayout(page, 'standalone', viewport);
    if (full) {
      await assertKeyboardAndFilters(page, page);
      await assertHierarchyAndDialog(page, page);
      assert.match(
        await page.evaluate(() => getComputedStyle(document.querySelector('.marker-visual')).transitionDuration),
        /^(?:0\.01ms|1e-05s)$/,
      );
    } else {
      await selectBoundaryFilters(page);
      metrics = await assertCommonLayout(page, 'standalone', viewport);
    }
    if (injectConsoleWarning) {
      await page.evaluate(() => console.warn('responsive warning regression'));
    }
    assert.deepEqual(errors, []);
    return metrics;
  });
}

async function selectArtAndFrame(page, useKeyboard = false) {
  const artPill = page.locator('.subj-pill[data-subj="art"]');
  if (useKeyboard) {
    await artPill.focus();
    const semantics = await artPill.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        role: element.getAttribute('role'),
        tabIndex: element.tabIndex,
        ariaPressed: element.getAttribute('aria-pressed'),
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
      };
    });
    assert.equal(semantics.role, 'button');
    assert.equal(semantics.tabIndex, 0);
    assert.equal(semantics.ariaPressed, 'false');
    assert.notEqual(semantics.outlineStyle, 'none');
    assert.ok(semantics.outlineWidth >= 2);
    await page.keyboard.press('Enter');
    assert.equal(await artPill.getAttribute('aria-pressed'), 'true');
    assert.equal(
      await page.evaluate(() => document.activeElement?.dataset?.subj),
      'art',
    );
  } else {
    await artPill.click();
  }
  const caption = page.locator('#homeMapCaption');
  await caption.waitFor({ state: 'visible' });
  assert.equal(
    (await caption.textContent()).trim(),
    '47 AP works · Units 1-2 · filter, compare and study',
  );
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
  return withBrowserContext(browser, {
    viewport,
    reducedMotion: 'reduce',
  }, async (context) => {
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
    const { frame, iframe } = await selectArtAndFrame(page, full);
    await assertInitialHierarchy(frame);
    let metrics = await assertCommonLayout(frame, 'embedded', viewport);
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
    const shortStacked = viewport.width <= 666 && viewport.height <= 520;
    const shortTwoColumn = viewport.width >= 667
      && viewport.width <= 900
      && viewport.height <= 520;
    if (shortStacked) {
      assert.ok(Math.abs(host.wrapHeight - 960) <= 1, `stacked short host height ${host.wrapHeight}`);
      assert.ok(host.pageScroll > 0, 'homepage should own stacked short scrolling');
      assert.ok(metrics.pageScroll <= 1, 'stacked short child should not page-scroll');
      assert.equal(metrics.bodyOverflowY, 'hidden');
    } else if (shortTwoColumn) {
      assert.ok(Math.abs(host.wrapHeight - 520) <= 1, `two-column short host height ${host.wrapHeight}`);
      assert.ok(host.pageScroll > 0, 'homepage should own two-column short scrolling');
      assert.ok(metrics.pageScroll <= 1, 'two-column short child should not page-scroll');
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
      await selectBoundaryFilters(frame);
      metrics = await assertCommonLayout(frame, 'embedded', viewport);
    }
    assert.deepEqual(errors, []);
    return { ...metrics, host };
  });
}

async function fillSearchThroughUi(searchInput, value, label) {
  let actualValue = await searchInput.inputValue();
  for (let attempt = 0; actualValue !== value && attempt < 5; attempt += 1) {
    await searchInput.fill(value);
    actualValue = await searchInput.inputValue();
  }
  assert.equal(actualValue, value, label);
}

async function resetAndActivateWork(page, frame, work) {
  const unitFilter = frame.locator('#unitFilter');
  const searchInput = frame.locator('#searchInput');
  const resultCount = frame.locator('.result-count');
  await fillSearchThroughUi(searchInput, '', `AP ${work.apNumber} reset search`);
  await unitFilter.selectOption('all');
  assert.equal(await unitFilter.inputValue(), 'all', `AP ${work.apNumber} reset Unit`);
  assert.equal(await searchInput.inputValue(), '', `AP ${work.apNumber} Unit reset retains search`);
  assert.equal(
    (await resultCount.textContent()).trim(),
    '当前显示 47 件作品',
    `AP ${work.apNumber} search reset result`,
  );
  await frame.locator('#resetView').click();
  assert.equal(
    (await resultCount.textContent()).trim(),
    '当前显示 47 件作品',
    `AP ${work.apNumber} hierarchy reset result`,
  );

  await fillSearchThroughUi(searchInput, work.titleEn, `AP ${work.apNumber} exact search`);
  assert.equal((await resultCount.textContent()).trim(), '当前显示 1 件作品');

  const unit = frame.locator('.site-marker[data-group-kind="unit"]');
  assert.equal(await unit.count(), 1, `AP ${work.apNumber} exact search should expose one Unit`);
  await unit.focus();
  await page.keyboard.press('Enter');

  const region = frame.locator('.site-marker[data-group-kind="region"]');
  await region.waitFor();
  assert.equal(await region.count(), 1, `AP ${work.apNumber} should expose one region`);
  await region.focus();
  await page.keyboard.press('Enter');

  const site = frame.locator('.site-marker[data-group-kind="site"]');
  await site.waitFor();
  assert.equal(await site.count(), 1, `AP ${work.apNumber} should expose one site`);
  await site.focus();
  await page.keyboard.press('Space');

  const heading = frame.locator('[data-selected-artwork-title]');
  await heading.waitFor();
  assert.equal((await heading.textContent()).trim(), work.titleEn);
}

async function waitForLoadedImage(image) {
  await image.waitFor();
  await image.evaluate((element) => (
    element.complete && element.naturalWidth > 0
      ? undefined
      : new Promise((resolve, reject) => {
        element.addEventListener('load', resolve, { once: true });
        element.addEventListener('error', reject, { once: true });
      })
  ));
  assert.ok(await image.evaluate((element) => element.complete && element.naturalWidth > 0));
}

function assertSingleImageRequest(imageRequests, work, checkpoint) {
  assert.equal(imageRequests.length, 1,
    `${checkpoint} AP ${work.apNumber} should issue exactly one image request`,
  );
  assert.equal(imageRequests[0], work.imageUrl,
    `${checkpoint} AP ${work.apNumber} requested image URL`,
  );
}

async function verifyNineImportedWorks(page, frame, imageRequests, mode) {
  const verified = [];
  for (const work of NINE_IMPORTED_WORKS) {
    imageRequests.length = 0;
    await resetAndActivateWork(page, frame, work);

    const summary = frame.locator('.selected-summary');
    assert.equal((await summary.locator('.work-title-en').textContent()).trim(), work.titleEn);
    assert.equal((await summary.locator('.work-title-zh').textContent()).trim(), work.titleZh);
    const meta = (await summary.locator('.work-meta').textContent()).trim();
    assert.equal(meta.split(' · ')[0], `AP #${work.apNumber}`);

    const imageButtons = summary.locator('.artwork-image-button');
    assert.equal(await imageButtons.count(), 1, `${mode} AP ${work.apNumber} detail image button`);
    assert.equal(await summary.locator('img').count(), 1, `${mode} AP ${work.apNumber} detail image`);
    assert.equal(await summary.locator('[class*="gallery"]').count(), 0);
    const imageButton = imageButtons.first();
    const image = imageButton.locator('img');
    await waitForLoadedImage(image);
    assert.equal(await image.getAttribute('alt'), work.imageAlt);

    const imageCredit = summary.locator('.image-credit');
    assert.equal(await imageCredit.isVisible(), true);
    assert.equal(
      (await imageCredit.textContent()).trim(),
      `图片：${work.credit.creatorOrInstitution} · ${work.credit.licenseName} · ${work.imageSourceName}`,
    );
    const inlineLicense = imageCredit.locator('a').nth(0);
    assert.equal(await inlineLicense.getAttribute('href'), work.credit.licenseUrl);
    assert.equal((await inlineLicense.textContent()).trim(), work.credit.licenseName);
    const inlineSource = imageCredit.locator('a').nth(1);
    assert.equal(await inlineSource.getAttribute('href'), work.imageSourceUrl);
    assert.equal((await inlineSource.textContent()).trim(), work.imageSourceName);

    assertSingleImageRequest(imageRequests, work, `${mode} detail`);

    const originalImageButton = await imageButton.elementHandle();
    assert.ok(originalImageButton, `${mode} AP ${work.apNumber} original image button handle`);
    await imageButton.focus();
    await page.keyboard.press('Enter');
    const dialog = frame.locator('#imageDialog');
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
    assert.equal((await frame.locator('#dialogTitle').textContent()).trim(), `${work.titleEn} · ${work.titleZh}`);
    assert.equal(await dialog.locator('img').count(), 1);
    const dialogImage = frame.locator('#dialogImage');
    await waitForLoadedImage(dialogImage);
    assert.equal(await dialogImage.getAttribute('alt'), work.imageAlt);
    assert.equal((await frame.locator('#dialogCredit').textContent()).trim(), `图片：${work.credit.creatorOrInstitution}`);

    const dialogLicense = frame.locator('#dialogLicense');
    assert.equal(await dialogLicense.isVisible(), true);
    assert.equal(await dialogLicense.getAttribute('href'), work.credit.licenseUrl);
    assert.equal((await dialogLicense.textContent()).trim(), work.credit.licenseName);
    const dialogSource = frame.locator('#dialogSource');
    assert.equal(await dialogSource.isVisible(), true);
    assert.equal(await dialogSource.getAttribute('href'), work.imageSourceUrl);
    assert.equal((await dialogSource.textContent()).trim(), work.imageSourceName);

    assertSingleImageRequest(imageRequests, work, `${mode} open dialog`);

    const originalViewport = page.viewportSize();
    assert.ok(originalViewport, `${mode} AP ${work.apNumber} viewport`);
    await page.setViewportSize({
      width: originalViewport.width - 1,
      height: originalViewport.height,
    });
    await frame.waitForFunction(
      (element) => !element.isConnected,
      originalImageButton,
    );
    assert.equal(await originalImageButton.evaluate((element) => element.isConnected), false);
    await frame.waitForFunction(
      (element) => (
        document.querySelector('.artwork-image-button')?.isConnected
        && document.querySelector('.artwork-image-button') !== element
      ),
      originalImageButton,
    );

    await page.keyboard.press('Enter');
    await dialog.waitFor({ state: 'hidden' });
    await frame.waitForFunction(() => (
      document.activeElement === document.querySelector('.artwork-image-button')
    ));
    assert.equal(
      await frame.evaluate(() => (
        document.activeElement === document.querySelector('.artwork-image-button')
      )),
      true,
      `${mode} AP ${work.apNumber} should restore focus to the current detail image button`,
    );
    await page.setViewportSize(originalViewport);
    await frame.waitForFunction(() => (
      document.activeElement === document.querySelector('.artwork-image-button')
    ));
    assertSingleImageRequest(imageRequests, work, `${mode} closed dialog`);
    verified.push({
      apNumber: work.apNumber,
      imageUrl: work.imageUrl,
      imageRequestCount: imageRequests.length,
    });
  }
  return verified;
}

async function verifyU1Works(page, frame, imageRequests, mode) {
  const results = [];
  for (const work of U1_WORKS) {
    imageRequests.clear();
    await resetAndActivateWork(page, frame, work);

    const summary = frame.locator('.selected-summary');
    assert.equal(
      (await summary.locator('[data-selected-artwork-title]').textContent()).trim(),
      work.titleEn,
    );
    assert.equal((await summary.locator('.work-title-zh').textContent()).trim(), work.titleZh);
    const viewButtons = summary.locator('.image-view-switcher button');
    assert.equal(
      await viewButtons.count(),
      work.images.length === 2 ? 2 : 0,
      `${mode} AP ${work.apNumber} view button count`,
    );

    for (let imageIndex = 0; imageIndex < work.images.length; imageIndex += 1) {
      if (work.images.length === 2) await viewButtons.nth(imageIndex).click();
      const expected = work.images[imageIndex];
      const imageButton = summary.locator('.artwork-image-button');
      const image = imageButton.locator('img');
      await waitForLoadedImage(image);
      assert.equal(await image.getAttribute('src'), expected.imageUrl);
      assert.equal(await image.getAttribute('alt'), expected.imageAlt);

      const creditHost = summary.locator('.image-credit-host');
      assert.match(
        (await creditHost.textContent()).trim(),
        new RegExp(expected.licenseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
      assert.equal(
        await creditHost.locator(`a[href="${expected.licenseUrl}"]`).count(),
        1,
      );
      assert.equal(
        await creditHost.locator(`a[href="${expected.imageSourceUrl}"]`).count(),
        1,
      );

      await imageButton.click();
      const dialog = frame.locator('#imageDialog');
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
      const dialogImage = frame.locator('#dialogImage');
      await waitForLoadedImage(dialogImage);
      assert.equal(await dialogImage.getAttribute('src'), expected.imageUrl);
      assert.equal(await dialogImage.getAttribute('alt'), expected.imageAlt);
      assert.equal(await frame.locator('#dialogSource').getAttribute('href'), expected.imageSourceUrl);
      assert.equal(await frame.locator('#dialogLicense').getAttribute('href'), expected.licenseUrl);

      await frame.locator('#dialogClose').click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(
        await frame.evaluate(() => (
          document.activeElement?.classList.contains('artwork-image-button')
        )),
        true,
        `${mode} AP ${work.apNumber} view ${imageIndex + 1} focus restoration`,
      );
      assert.equal(
        imageRequests.get(expected.imageUrl),
        1,
        `${mode} AP ${work.apNumber} view ${imageIndex + 1} image request count`,
      );
    }

    assert.equal(
      imageRequests.size,
      work.images.length,
      `${mode} AP ${work.apNumber} should request only its expected image URLs`,
    );
    results.push({
      apNumber: work.apNumber,
      mode,
      images: work.images.map(({ imageUrl }) => ({
        imageUrl,
        imageRequestCount: imageRequests.get(imageUrl),
      })),
    });
  }
  return results;
}

async function verifyU1Standalone(browser, baseUrl) {
  const viewport = { width: 1440, height: 900 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U1 eleven works standalone');
    const imageRequests = new Map();
    await mockRemoteImages(page, (url) => {
      imageRequests.set(url, (imageRequests.get(url) || 0) + 1);
    });
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    const works = await verifyU1Works(page, page, imageRequests, 'standalone');
    assert.deepEqual(issues, []);
    return { viewport, works };
  });
}

async function verifyU1Embedded(browser, baseUrl) {
  const viewport = { width: 1024, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U1 eleven works embedded');
    const imageRequests = new Map();
    await mockRemoteImages(page, (url) => {
      imageRequests.set(url, (imageRequests.get(url) || 0) + 1);
    });
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => (
      document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('.map-zone')
    ));
    const { frame } = await selectArtAndFrame(page, true);
    const works = await verifyU1Works(page, frame, imageRequests, 'embedded');
    assert.deepEqual(issues, []);
    return { viewport, works };
  });
}

async function verifyImportedWorksStandalone(browser, baseUrl) {
  const viewport = { width: 1440, height: 900 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'nine works standalone');
    const imageRequests = [];
    await mockRemoteImages(page, (url) => imageRequests.push(url));
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    assert.equal(
      (await page.locator('.page-header h1').textContent()).trim(),
      'AP 艺术史互动地图',
    );
    const works = await verifyNineImportedWorks(page, page, imageRequests, 'standalone');
    assert.deepEqual(issues, []);
    return { viewport, works };
  });
}

async function verifyImportedWorksEmbedded(browser, baseUrl) {
  const viewport = { width: 1024, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'nine works embedded');
    const imageRequests = [];
    await mockRemoteImages(page, (url) => imageRequests.push(url));
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => (
      document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('.map-zone')
    ));
    const { frame } = await selectArtAndFrame(page, true);
    const works = await verifyNineImportedWorks(page, frame, imageRequests, 'embedded');
    assert.deepEqual(issues, []);
    return { viewport, works };
  });
}

async function verifyResponsiveWarningRegression(browser, baseUrl) {
  const viewport = { width: 519, height: 700 };
  await assert.rejects(
    verifyStandalone(
      browser,
      baseUrl,
      viewport,
      false,
      { injectConsoleWarning: true },
    ),
    /responsive warning regression/,
  );
  return { viewport, warningRejected: true };
}

export async function runFocusedImportedVerification() {
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  return runManagedVerification({
    startServer: () => startStaticServer(),
    launchBrowser: () => playwright.chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    }),
    verify: async ({ server, browser }) => ({
      standalone: await verifyImportedWorksStandalone(browser, server.baseUrl),
      embedded: await verifyImportedWorksEmbedded(browser, server.baseUrl),
    }),
  });
}

export async function runFocusedWarningVerification() {
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  return runManagedVerification({
    startServer: () => startStaticServer(),
    launchBrowser: () => playwright.chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    }),
    verify: async ({ server, browser }) => (
      verifyResponsiveWarningRegression(browser, server.baseUrl)
    ),
  });
}

export async function withBrowserContext(browser, options, verify) {
  const context = await browser.newContext(options);
  let result;
  let operationError;
  try {
    result = await verify(context);
  } catch (error) {
    operationError = error;
  }
  const [cleanup] = await Promise.allSettled([context.close()]);
  if (operationError) throw operationError;
  if (cleanup.status === 'rejected') throw cleanup.reason;
  return result;
}

export async function runManagedVerification({ startServer, launchBrowser, verify }) {
  let server;
  let browser;
  let result;
  let operationError;
  try {
    server = await startServer();
    browser = await launchBrowser(server);
    result = await verify({ server, browser });
  } catch (error) {
    operationError = error;
  }
  const cleanupResults = await Promise.allSettled([
    browser?.close?.(),
    server?.close?.(),
  ]);
  if (operationError) throw operationError;
  const cleanupErrors = cleanupResults
    .filter(({ status }) => status === 'rejected')
    .map(({ reason }) => reason);
  if (cleanupErrors.length === 1) throw cleanupErrors[0];
  if (cleanupErrors.length > 1) {
    throw new AggregateError(cleanupErrors, 'Browser verification cleanup failed');
  }
  return result;
}

export async function runVerification() {
  const playwright = await discoverPlaywright();
  const executablePath = await discoverBrowser(playwright.chromium);
  return runManagedVerification({
    startServer: () => startStaticServer(),
    launchBrowser: () => playwright.chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    }),
    verify: async ({ server, browser }) => {
      const report = [];
      const warningRegression = await verifyResponsiveWarningRegression(browser, server.baseUrl);
      report.push({ kind: 'warning-regression', ...warningRegression });
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
      const u1Standalone = await verifyU1Standalone(browser, server.baseUrl);
      const u1Embedded = await verifyU1Embedded(browser, server.baseUrl);
      report.push({
        kind: 'u1-eleven-works',
        standalone: u1Standalone,
        embedded: u1Embedded,
      });
      const standaloneImported = await verifyImportedWorksStandalone(browser, server.baseUrl);
      const embeddedImported = await verifyImportedWorksEmbedded(browser, server.baseUrl);
      report.push({
        kind: 'nine-imported-works',
        standalone: standaloneImported,
        embedded: embeddedImported,
      });
      return report;
    },
  });
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url) === normalize(process.argv[1]);

if (isMain) {
  let verification;
  if (process.argv.includes('--imported-only')) {
    verification = runFocusedImportedVerification();
  } else if (process.argv.includes('--warning-regression-only')) {
    verification = runFocusedWarningVerification();
  } else {
    verification = runVerification();
  }
  verification
    .then((report) => {
      process.stdout.write(`${JSON.stringify({ ok: true, cases: report }, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`Art History browser verification failed: ${error.stack || error}\n`);
      process.exitCode = 1;
    });
}
