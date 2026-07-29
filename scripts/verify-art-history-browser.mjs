#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, extname, join, normalize, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const REQUIRED_VIEWPORTS = Object.freeze([
  { width: 1365, height: 768 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 667, height: 375 },
  { width: 665, height: 700 },
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
const U3_WORK_KEYS = Object.freeze([
  'id',
  'apNumber',
  'titleEn',
  'titleZh',
  'unit',
  'region',
  'siteName',
  'images',
]);
const U3_IMAGE_KEYS = Object.freeze([
  'id',
  'label',
  'imageUrl',
  'imageAlt',
  'imageSourceUrl',
]);

function assertExactKeys(value, expected, label) {
  assert.deepEqual(Object.keys(value), expected, `${label} exact keyset`);
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `duplicate ${label}`);
}

export function validateAndFreezeU3Works(works) {
  assert.ok(Array.isArray(works), 'U3 browser fixture must be an array');
  assert.equal(works.length, 51, 'U3 browser fixture must contain exactly 51 U3 works');
  const workIds = [];
  const viewIds = [];
  const imageUrls = [];
  const imageAlts = [];
  const sourceUrls = [];
  let viewCount = 0;

  works.forEach((work, workIndex) => {
    const expectedApNumber = 48 + workIndex;
    assertExactKeys(work, U3_WORK_KEYS, `AP ${expectedApNumber}`);
    assert.equal(work.apNumber, expectedApNumber, `AP ${expectedApNumber} sequence`);
    assert.equal(work.unit, 3, `AP ${expectedApNumber} Unit`);
    for (const key of ['id', 'titleEn', 'titleZh', 'region', 'siteName']) {
      assert.equal(typeof work[key], 'string', `AP ${expectedApNumber} ${key} type`);
      assert.ok(work[key].trim(), `AP ${expectedApNumber} ${key} value`);
    }
    assert.ok(Array.isArray(work.images), `AP ${expectedApNumber} images`);
    assert.ok(work.images.length > 0, `AP ${expectedApNumber} must retain required views`);
    workIds.push(work.id);
    work.images.forEach((image, imageIndex) => {
      assertExactKeys(
        image,
        U3_IMAGE_KEYS,
        `AP ${expectedApNumber} view ${imageIndex + 1}`,
      );
      for (const key of U3_IMAGE_KEYS) {
        assert.equal(
          typeof image[key],
          'string',
          `AP ${expectedApNumber} view ${imageIndex + 1} ${key} type`,
        );
        assert.ok(
          image[key].trim(),
          `AP ${expectedApNumber} view ${imageIndex + 1} ${key} value`,
        );
      }
      assert.match(image.imageUrl, /^https:\/\//, `AP ${expectedApNumber} image URL`);
      assert.match(
        image.imageSourceUrl,
        /^https:\/\//,
        `AP ${expectedApNumber} image source URL`,
      );
      viewIds.push(`${work.id}/${image.id}`);
      imageUrls.push(image.imageUrl);
      imageAlts.push(image.imageAlt);
      sourceUrls.push(image.imageSourceUrl);
      viewCount += 1;
      Object.freeze(image);
    });
    Object.freeze(work.images);
    Object.freeze(work);
  });
  assert.equal(viewCount, 103, 'U3 browser fixture must contain exactly 103 U3 views');
  assertUnique(workIds, 'U3 work id');
  assertUnique(viewIds, 'U3 view id');
  assertUnique(imageUrls, 'U3 image URL');
  assertUnique(imageAlts, 'U3 image alt');
  assertUnique(sourceUrls, 'U3 image source URL');
  return Object.freeze(works);
}

const U3_WORKS = validateAndFreezeU3Works(JSON.parse(
  await readFile(join(PROJECT_ROOT, 'tests', 'fixtures', 'u3-browser.json'), 'utf8'),
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

export function assertNoCollectedIssues(issues, label) {
  assert.deepEqual(issues, [], `${label}: ${issues.join('\n')}`);
}

export function assertDialogFocusRestored(restored, label) {
  assert.equal(restored, true, `${label} dialog focus restoration`);
}

export function assertU3ViewMatches(actual, expected, label) {
  assert.equal(actual.id, expected.id, `${label} view id`);
  assert.equal(actual.label, expected.label, `${label} view label`);
  assert.equal(actual.imageUrl, expected.imageUrl, `${label} image URL`);
  assert.equal(actual.imageAlt, expected.imageAlt, `${label} image alt`);
  assert.equal(actual.imageSourceUrl, expected.imageSourceUrl, `${label} image source URL`);
}

export function assertExactImageRequests(imageRequests, work, checkpoint) {
  assert.equal(
    imageRequests.size,
    work.images.length,
    `${checkpoint} AP ${work.apNumber} expected image URL count`,
  );
  for (const image of work.images) {
    assert.equal(
      imageRequests.get(image.imageUrl),
      1,
      `${checkpoint} AP ${work.apNumber} ${image.id} request count`,
    );
  }
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

async function waitForPostTransformRender(frame) {
  await frame.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
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
      horizontalOverflowElements: [...document.querySelectorAll('body *')]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`
              + `${[...element.classList].map((name) => `.${name}`).join('')}`,
            left: rect.left,
            right: rect.right,
            width: rect.width,
          };
        })
        .filter(({ left, right }) => left < -1 || right > innerWidth + 1)
        .slice(0, 12),
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
  assert.ok(
    metrics.horizontalOverflow <= 1,
    `${mode} ${viewport.width} has ${metrics.horizontalOverflow}px horizontal overflow: `
      + JSON.stringify(metrics.horizontalOverflowElements),
  );
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
  await waitForPostTransformRender(frame);
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
  await waitForPostTransformRender(frame);
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

  await unitFilter.focus();
  await unitFilter.selectOption('3');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), '3');
  assert.equal(await frame.evaluate(() => document.activeElement?.id), 'unitFilter');
  assert.match(await frame.locator('.result-count').textContent(), /\b51\b/);
  const traditions = frame.locator('#cultureFilters [data-culture]');
  assert.equal(await traditions.count(), 5);
  const expectedTraditions = new Map([
    ['all', 51],
    ['lateAntiqueByzantine', 5],
    ['medievalIslamic', 14],
    ['renaissanceMannerism', 16],
    ['baroqueColonial', 16],
  ]);
  for (const [tradition, count] of expectedTraditions) {
    const button = frame.locator(`[data-culture="${tradition}"]`);
    await button.click();
    assert.match(await frame.locator('.result-count').textContent(), new RegExp(`\\b${count}\\b`));
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
  }
  await frame.locator('[data-culture="all"]').click();
  const u3RegionLabels = await frame
    .locator('.site-marker[data-group-kind="region"]')
    .evaluateAll((markers) => markers.map((marker) => marker.getAttribute('aria-label')).sort());
  assert.deepEqual(u3RegionLabels, [
    'British Isles · 3 pieces',
    'Central Europe · 4 pieces',
    'Colonial Americas · 5 pieces',
    'Eastern Mediterranean · 4 pieces',
    'France · 5 pieces',
    'Iberian Peninsula · 5 pieces',
    'Italy & Vatican · 18 pieces',
    'Low Countries · 7 pieces',
  ]);
  return unitFilter;
}

async function assertInitialHierarchy(frame) {
  const initial = await frame
    .locator('.site-marker[data-group-kind="unit"]')
    .allTextContents();
  assert.equal(initial.length, 3);
  assert.ok(initial.some((text) => /U1Global Prehistory · 11 pieces/.test(text)));
  assert.ok(initial.some((text) => /U2Ancient Mediterranean · 36 pieces/.test(text)));
  assert.ok(initial.some((text) => /U3Early Europe and Colonial Americas · 51 pieces/.test(text)));
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

async function assertU3ResponsiveLayout(page, frame, mode, viewport) {
  const unitFilter = frame.locator('#unitFilter');
  await unitFilter.selectOption('3');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), '3');
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 51 件作品');

  const culturePills = frame.locator('#cultureFilters [data-culture]');
  assert.equal(await culturePills.count(), 5, `${mode} ${viewport.width} U3 culture pill count`);
  const frameWidth = await frame.evaluate(() => innerWidth);
  const minimumPillHeight = frameWidth <= 520 ? 44 : 34;
  const pillRects = await culturePills.evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  }));
  assert.ok(
    pillRects.every(({ left, right, width, height }) => (
      left >= -1
      && right <= frameWidth + 1
      && width >= minimumPillHeight
      && height >= minimumPillHeight
    )),
    `${mode} ${viewport.width} U3 culture pills must be visible ${minimumPillHeight}px targets: `
      + JSON.stringify(pillRects),
  );

  await frame.locator('.map-controls').scrollIntoViewIfNeeded();
  const mapControls = await frame.locator('.map-controls button').evaluateAll((buttons) => (
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      return {
        id: button.id,
        label: button.textContent.trim(),
        centerHitsControl: hit === button || button.contains(hit),
        centerHit: hit
          ? `${hit.tagName.toLowerCase()}${hit.id ? `#${hit.id}` : ''}`
            + `${[...hit.classList].map((name) => `.${name}`).join('')}`
          : null,
      };
    })
  ));
  assert.ok(
    mapControls.every(({ centerHitsControl }) => centerHitsControl),
    `${mode} ${viewport.width} map control pointer centers ${JSON.stringify(mapControls)}`,
  );

  const markerGeometry = await frame
    .locator('.site-marker[data-group-kind="region"]')
    .evaluateAll((markers) => {
      const map = document.querySelector('.map-panel').getBoundingClientRect();
      const transform = { ...window.ArtHistoryMap.state.transform };
      return {
        map: { left: map.left, right: map.right, top: map.top, bottom: map.bottom },
        stateTransform: transform,
        mapViewportTransform: document.querySelector('#mapViewport').getAttribute('transform'),
        visibleWorldBounds: {
          left: Math.max(0, -transform.x / transform.scale),
          right: Math.min(1600, (1600 - transform.x) / transform.scale),
          top: Math.max(0, -transform.y / transform.scale),
          bottom: Math.min(800, (800 - transform.y) / transform.scale),
        },
        markers: markers.map((marker) => {
          const rect = marker.querySelector('.marker-label-bg').getBoundingClientRect();
          const textRects = [
            marker.querySelector('.marker-title-label').getBoundingClientRect(),
            marker.querySelector('.marker-subtitle-label').getBoundingClientRect(),
          ];
          return {
            label: marker.getAttribute('aria-label'),
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            textLeft: Math.min(...textRects.map((textRect) => textRect.left)),
            textRight: Math.max(...textRects.map((textRect) => textRect.right)),
            textTop: Math.min(...textRects.map((textRect) => textRect.top)),
            textBottom: Math.max(...textRects.map((textRect) => textRect.bottom)),
          };
        }),
      };
    });
  assert.equal(
    markerGeometry.mapViewportTransform,
    `translate(${markerGeometry.stateTransform.x} ${markerGeometry.stateTransform.y}) `
      + `scale(${markerGeometry.stateTransform.scale})`,
    `${mode} ${viewport.width} applied map transform`,
  );
  assert.equal(markerGeometry.markers.length, 8, `${mode} ${viewport.width} U3 region count`);
  for (const marker of markerGeometry.markers) {
    assert.ok(
      marker.textLeft >= markerGeometry.map.left - 1
        && marker.textRight <= markerGeometry.map.right + 1
        && marker.textTop >= markerGeometry.map.top - 1
        && marker.textBottom <= markerGeometry.map.bottom + 1,
      `${mode} ${viewport.width} clipped U3 region ${marker.label}: `
        + JSON.stringify({ marker, map: markerGeometry.map }),
    );
  }
  for (let first = 0; first < markerGeometry.markers.length; first += 1) {
    for (let second = first + 1; second < markerGeometry.markers.length; second += 1) {
      const a = markerGeometry.markers[first];
      const b = markerGeometry.markers[second];
      const overlaps = (
        a.left < b.right - 1
        && a.right > b.left + 1
        && a.top < b.bottom - 1
        && a.bottom > b.top + 1
      );
      assert.equal(
        overlaps,
        false,
        `${mode} ${viewport.width} marker overlap: ${a.label} / ${b.label}`,
      );
    }
  }

  const responsiveWork = U3_WORKS.find(({ id }) => id === 'ap60-chartres-cathedral');
  await resetAndActivateWork(page, frame, responsiveWork);
  const importantDetails = frame.locator(
    '[data-selected-artwork-title], .image-view-switcher button',
  );
  for (let index = 0; index < await importantDetails.count(); index += 1) {
    const detail = importantDetails.nth(index);
    await detail.scrollIntoViewIfNeeded();
    const visible = await detail.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const panel = document.querySelector('.detail-panel').getBoundingClientRect();
      return (
        rect.width > 0
        && rect.height > 0
        && rect.left >= panel.left - 1
        && rect.right <= panel.right + 1
        && rect.top >= -1
        && rect.bottom <= innerHeight + 1
      );
    });
    assert.equal(visible, true, `${mode} ${viewport.width} clipped U3 detail control ${index}`);
  }
}

async function selectBoundaryFilters(frame) {
  await frame.locator('#unitFilter').selectOption('2');
  await waitForPostTransformRender(frame);
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
  { injectConsoleIssue = null } = {},
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
      'AP 艺术史互动地图 · Units 1-3',
    );
    await assertInitialHierarchy(page);
    let metrics = await assertCommonLayout(page, 'standalone', viewport);
    if (full) {
      await assertKeyboardAndFilters(page, page);
      await assertHierarchyAndDialog(page, page);
      await assertU3ResponsiveLayout(page, page, 'standalone', viewport);
      assert.match(
        await page.evaluate(() => getComputedStyle(document.querySelector('.marker-visual')).transitionDuration),
        /^(?:0\.01ms|1e-05s)$/,
      );
    } else {
      await selectBoundaryFilters(page);
      metrics = await assertCommonLayout(page, 'standalone', viewport);
    }
    if (injectConsoleIssue === 'warning') {
      await page.evaluate(() => console.warn('responsive warning regression'));
    } else if (injectConsoleIssue === 'error') {
      await page.evaluate(() => console.error('responsive error regression'));
    }
    assertNoCollectedIssues(errors, `standalone ${viewport.width}x${viewport.height}`);
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
    '98 AP works · Units 1-3 · filter, compare and study',
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
      await assertU3ResponsiveLayout(page, frame, 'embedded', viewport);
    } else {
      await selectBoundaryFilters(frame);
      metrics = await assertCommonLayout(frame, 'embedded', viewport);
    }
    assertNoCollectedIssues(errors, `embedded ${viewport.width}x${viewport.height}`);
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

async function resetAndActivateWork(page, frame, work, beforeActivate = () => {}) {
  const unitFilter = frame.locator('#unitFilter');
  const searchInput = frame.locator('#searchInput');
  const resultCount = frame.locator('.result-count');
  const unit = work.unit || (work.apNumber <= 11 ? 1 : work.apNumber <= 47 ? 2 : 3);
  const unitCount = new Map([[1, 11], [2, 36], [3, 51]]).get(unit);
  await fillSearchThroughUi(searchInput, '', `AP ${work.apNumber} reset search`);
  await unitFilter.selectOption('all');
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), 'all', `AP ${work.apNumber} reset Unit`);
  assert.equal(await searchInput.inputValue(), '', `AP ${work.apNumber} Unit reset retains search`);
  assert.equal(
    (await resultCount.textContent()).trim(),
    '当前显示 98 件作品',
    `AP ${work.apNumber} search reset result`,
  );
  await frame.locator('#resetView').click();
  assert.equal(
    (await resultCount.textContent()).trim(),
    '当前显示 98 件作品',
    `AP ${work.apNumber} hierarchy reset result`,
  );

  await unitFilter.selectOption(String(unit));
  await waitForPostTransformRender(frame);
  assert.equal(await unitFilter.inputValue(), String(unit), `AP ${work.apNumber} Unit selection`);
  assert.equal(
    (await resultCount.textContent()).trim(),
    `当前显示 ${unitCount} 件作品`,
    `AP ${work.apNumber} Unit result`,
  );
  await fillSearchThroughUi(searchInput, work.titleEn, `AP ${work.apNumber} exact search`);
  assert.equal((await resultCount.textContent()).trim(), '当前显示 1 件作品');

  const region = frame.locator('.site-marker[data-group-kind="region"]');
  await region.waitFor();
  assert.equal(await region.count(), 1, `AP ${work.apNumber} should expose one region`);
  await region.focus();
  await page.keyboard.press('Enter');

  const site = frame.locator('.site-marker[data-group-kind="site"]');
  await site.waitFor();
  assert.equal(await site.count(), 1, `AP ${work.apNumber} should expose one site`);
  await beforeActivate();
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
    const meta = (await summary.locator('.work-meta').textContent()).trim();
    assert.equal(meta.split(' · ')[0], `AP #${work.apNumber}`);
    const viewButtons = summary.locator('.image-view-switcher button');
    assert.equal(
      await viewButtons.count(),
      work.images.length === 2 ? 2 : 0,
      `${mode} AP ${work.apNumber} view button count`,
    );
    if (work.images.length === 2) {
      assert.deepEqual(
        await viewButtons.allTextContents(),
        work.images.map(({ label }) => label),
        `${mode} AP ${work.apNumber} view button labels`,
      );
    }

    for (let imageIndex = 0; imageIndex < work.images.length; imageIndex += 1) {
      if (work.images.length === 2) {
        await viewButtons.nth(imageIndex).click();
        assert.deepEqual(
          await viewButtons.evaluateAll((buttons) => (
            buttons.map((button) => button.getAttribute('aria-pressed'))
          )),
          work.images.map((image, index) => String(index === imageIndex)),
          `${mode} AP ${work.apNumber} view ${imageIndex + 1} pressed state`,
        );
      }
      const expected = work.images[imageIndex];
      const imageButton = summary.locator('.artwork-image-button');
      const image = imageButton.locator('img');
      await waitForLoadedImage(image);
      assert.equal(await image.getAttribute('src'), expected.imageUrl);
      assert.equal(await image.getAttribute('alt'), expected.imageAlt);

      const creditHost = summary.locator('.image-credit-host');
      const imageCredit = creditHost.locator('.image-credit');
      assert.equal(
        (await imageCredit.textContent()).trim(),
        `图片：${expected.creatorOrInstitution} · ${expected.licenseName} · ${expected.imageSourceName}`,
      );
      const inlineLinks = imageCredit.locator('a');
      assert.equal(await inlineLinks.count(), 2);
      assert.equal(
        await inlineLinks.nth(0).getAttribute('href'),
        expected.licenseUrl,
      );
      assert.equal((await inlineLinks.nth(0).textContent()).trim(), expected.licenseName);
      assert.equal(
        await inlineLinks.nth(1).getAttribute('href'),
        expected.imageSourceUrl,
      );
      assert.equal((await inlineLinks.nth(1).textContent()).trim(), expected.imageSourceName);

      await imageButton.click();
      const dialog = frame.locator('#imageDialog');
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
      const dialogImage = frame.locator('#dialogImage');
      await waitForLoadedImage(dialogImage);
      assert.equal(await dialogImage.getAttribute('src'), expected.imageUrl);
      assert.equal(await dialogImage.getAttribute('alt'), expected.imageAlt);
      assert.equal(
        (await frame.locator('#dialogTitle').textContent()).trim(),
        `${work.titleEn} · ${work.titleZh}`,
      );
      assert.equal((await frame.locator('#dialogCaption').textContent()).trim(), expected.imageAlt);
      assert.equal(
        (await frame.locator('#dialogCredit').textContent()).trim(),
        `图片：${expected.creatorOrInstitution}`,
      );
      const dialogLicense = frame.locator('#dialogLicense');
      assert.equal(await dialogLicense.getAttribute('href'), expected.licenseUrl);
      assert.equal((await dialogLicense.textContent()).trim(), expected.licenseName);
      const dialogSource = frame.locator('#dialogSource');
      assert.equal(await dialogSource.getAttribute('href'), expected.imageSourceUrl);
      assert.equal((await dialogSource.textContent()).trim(), expected.imageSourceName);

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

async function verifyU1StudyTabsAndComparison(page, frame, mode) {
  const sourceWork = U1_WORKS.find(({ id }) => id === 'ap2-great-hall-bulls');
  assert.ok(sourceWork, `${mode} AP 2 study-tab source fixture`);
  await resetAndActivateWork(page, frame, sourceWork);

  const expectedTabs = [
    { id: 'quick', label: '速览', headings: ['核心功能', '识别锚点'] },
    { id: 'form', label: '形式', headings: ['形式', '内容'] },
    { id: 'context', label: '语境', headings: ['历史语境', '图像内容'] },
    { id: 'compare', label: '比较', headings: [] },
  ];
  const tabs = frame.locator('.detail-tab');
  assert.equal(await tabs.count(), expectedTabs.length, `${mode} AP 2 study tab count`);
  assert.deepEqual(
    await tabs.allTextContents(),
    expectedTabs.map(({ label }) => label),
    `${mode} AP 2 study tab labels`,
  );

  let comparisonIds = [];
  for (let tabIndex = 0; tabIndex < expectedTabs.length; tabIndex += 1) {
    const expected = expectedTabs[tabIndex];
    await tabs.nth(tabIndex).click();
    assert.deepEqual(
      await tabs.evaluateAll((buttons) => buttons.map((button) => ({
        selected: button.getAttribute('aria-selected'),
        tabIndex: button.getAttribute('tabindex'),
      }))),
      expectedTabs.map((tab, index) => ({
        selected: String(index === tabIndex),
        tabIndex: index === tabIndex ? '0' : '-1',
      })),
      `${mode} AP 2 ${expected.label} tab state`,
    );

    const panel = frame.locator('#detail-tabpanel');
    assert.equal(await panel.getAttribute('aria-labelledby'), `detail-tab-${expected.id}`);
    const panelText = (await panel.textContent()).trim();
    assert.ok(panelText.length > 8, `${mode} AP 2 ${expected.label} panel content`);
    assert.deepEqual(
      await panel.locator('h3').allTextContents(),
      expected.headings,
      `${mode} AP 2 ${expected.label} panel headings`,
    );

    if (expected.id === 'compare') {
      const cards = panel.locator('.comparison-card');
      comparisonIds = await cards.evaluateAll((elements) => (
        elements.map((element) => element.dataset.comparisonId)
      ));
      assert.deepEqual(comparisonIds, [
        'ap1-apollo-11-stones',
        'ap4-running-horned-woman',
        'ap24-last-judgment-of-hunefer',
      ]);
      assert.ok(
        (await cards.allTextContents()).every((text) => text.trim().length > 20),
        `${mode} AP 2 comparison card content`,
      );
    }
  }

  const crossUnitCard = frame.locator(
    '.comparison-card[data-comparison-id="ap24-last-judgment-of-hunefer"]',
  );
  assert.equal(await crossUnitCard.count(), 1, `${mode} AP 2 cross-Unit comparison card`);
  await crossUnitCard.click();
  const targetHeading = frame.locator('[data-selected-artwork-title]');
  await targetHeading.waitFor();
  assert.equal(
    (await targetHeading.textContent()).trim(),
    'Last judgment of Hunefer, from his tomb (page from the Book of the Dead)',
  );
  assert.equal((await frame.locator('.work-title-zh').textContent()).trim(), '胡内弗《末日审判》');
  assert.equal(
    (await frame.locator('.work-meta').textContent()).trim().split(' · ')[0],
    'AP #24',
  );
  assert.equal(await frame.locator('#unitFilter').inputValue(), '2');
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 36 件作品');
  assert.equal(await frame.locator('#searchInput').inputValue(), '');
  await frame.waitForFunction(() => (
    document.activeElement === document.querySelector('[data-selected-artwork-title]')
  ));
  assert.equal(
    await frame.evaluate(() => (
      document.activeElement === document.querySelector('[data-selected-artwork-title]')
    )),
    true,
    `${mode} AP 24 comparison target focus`,
  );

  await resetAndActivateWork(page, frame, sourceWork);
  assert.equal(await frame.locator('#unitFilter').inputValue(), '1');
  assert.equal(
    (await frame.locator('[data-selected-artwork-title]').textContent()).trim(),
    sourceWork.titleEn,
  );
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 1 件作品');
  await frame.locator('#detail-tab-form').click();
  assert.equal(await frame.locator('#detail-tab-form').getAttribute('aria-selected'), 'true');
  assert.deepEqual(
    await frame.locator('#detail-tabpanel h3').allTextContents(),
    ['形式', '内容'],
  );

  return {
    sourceApNumber: sourceWork.apNumber,
    tabs: expectedTabs.map(({ id, label }) => ({ id, label })),
    comparisonIds,
    crossUnitTarget: 24,
    resetToSource: true,
  };
}

async function verifyU3Works(page, frame, imageRequests, mode) {
  const results = [];
  for (const work of U3_WORKS) {
    await resetAndActivateWork(page, frame, work, () => imageRequests.clear());

    const summary = frame.locator('.selected-summary');
    assert.equal(
      (await summary.locator('[data-selected-artwork-title]').textContent()).trim(),
      work.titleEn,
      `${mode} AP ${work.apNumber} English title`,
    );
    assert.equal(
      (await summary.locator('.work-title-zh').textContent()).trim(),
      work.titleZh,
      `${mode} AP ${work.apNumber} Chinese subtitle`,
    );
    const meta = (await summary.locator('.work-meta').textContent()).trim();
    assert.equal(meta.split(' · ')[0], `AP #${work.apNumber}`);
    assert.ok(meta.split(' · ').length >= 4, `${mode} AP ${work.apNumber} precise metadata`);
    const identity = await summary.locator('.identity-row').evaluateAll((rows) => (
      Object.fromEntries(rows.map((row) => [
        row.querySelector('dt')?.textContent?.trim(),
        row.querySelector('dd')?.textContent?.trim(),
      ]))
    ));
    assert.equal(identity['地点'], work.siteName, `${mode} AP ${work.apNumber} site metadata`);
    assert.equal(
      await frame.locator('.site-marker[data-group-kind="site"][aria-pressed="true"]').count(),
      1,
      `${mode} AP ${work.apNumber} selected site marker`,
    );

    const viewButtons = summary.locator('.image-view-switcher button');
    const expectedViewButtonCount = work.images.length > 1 ? work.images.length : 0;
    assert.equal(
      await viewButtons.count(),
      expectedViewButtonCount,
      `${mode} AP ${work.apNumber} view button count`,
    );
    if (expectedViewButtonCount) {
      assert.deepEqual(
        await viewButtons.allTextContents(),
        work.images.map(({ label }) => label),
        `${mode} AP ${work.apNumber} view button labels`,
      );
    }

    for (let imageIndex = 0; imageIndex < work.images.length; imageIndex += 1) {
      const expected = work.images[imageIndex];
      if (expectedViewButtonCount) {
        await viewButtons.nth(imageIndex).click();
        assert.deepEqual(
          await viewButtons.evaluateAll((buttons) => (
            buttons.map((button) => button.getAttribute('aria-pressed'))
          )),
          work.images.map((image, index) => String(index === imageIndex)),
          `${mode} AP ${work.apNumber} ${expected.id} pressed state`,
        );
      }

      const imageButton = summary.locator('.artwork-image-button');
      const image = imageButton.locator('img');
      await waitForLoadedImage(image);
      const sourceLink = summary.locator('.image-credit a').nth(1);
      const actual = {
        id: expected.id,
        label: expectedViewButtonCount
          ? (await viewButtons.nth(imageIndex).textContent()).trim()
          : expected.label,
        imageUrl: await image.getAttribute('src'),
        imageAlt: await image.getAttribute('alt'),
        imageSourceUrl: await sourceLink.getAttribute('href'),
      };
      assertU3ViewMatches(
        actual,
        expected,
        `${mode} AP ${work.apNumber} ${expected.id}`,
      );
      assert.equal(
        await summary.locator('.image-credit a').count(),
        2,
        `${mode} AP ${work.apNumber} ${expected.id} inline credit links`,
      );

      await imageButton.click();
      const dialog = frame.locator('#imageDialog');
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await frame.evaluate(() => document.activeElement?.id), 'dialogClose');
      const dialogImage = frame.locator('#dialogImage');
      await waitForLoadedImage(dialogImage);
      assert.equal(await dialogImage.getAttribute('src'), expected.imageUrl);
      assert.equal(await dialogImage.getAttribute('alt'), expected.imageAlt);
      assert.equal(
        (await frame.locator('#dialogTitle').textContent()).trim(),
        `${work.titleEn} · ${work.titleZh}`,
      );
      assert.equal((await frame.locator('#dialogCaption').textContent()).trim(), expected.imageAlt);
      assert.match((await frame.locator('#dialogCredit').textContent()).trim(), /^图片：\S/);
      const dialogLicense = frame.locator('#dialogLicense');
      assert.match(await dialogLicense.getAttribute('href'), /^https:\/\//);
      assert.ok((await dialogLicense.textContent()).trim().length > 0);
      const dialogSource = frame.locator('#dialogSource');
      assert.equal(await dialogSource.getAttribute('href'), expected.imageSourceUrl);
      assert.ok((await dialogSource.textContent()).trim().length > 0);

      await frame.locator('#dialogClose').click();
      await dialog.waitFor({ state: 'hidden' });
      assertDialogFocusRestored(
        await frame.evaluate(() => (
          document.activeElement?.classList.contains('artwork-image-button')
        )),
        `${mode} AP ${work.apNumber} ${expected.id}`,
      );
    }
    assertExactImageRequests(imageRequests, work, mode);
    results.push({
      apNumber: work.apNumber,
      mode,
      views: work.images.map(({ id, imageUrl }) => ({
        id,
        imageUrl,
        requestCount: imageRequests.get(imageUrl),
      })),
    });
  }
  return results;
}

async function verifyU3StudyTabsAndComparison(page, frame, mode) {
  const studyWork = U3_WORKS.find(({ id }) => id === 'ap52-hagia-sophia');
  const comparisonWork = U3_WORKS.find(({ id }) => id === 'ap89-ecstasy-saint-teresa');
  assert.ok(studyWork, `${mode} AP 52 study fixture`);
  assert.ok(comparisonWork, `${mode} AP 89 comparison fixture`);
  await resetAndActivateWork(page, frame, studyWork);

  const expectedTabs = [
    { id: 'quick', label: '速览', headings: ['核心功能', '识别锚点'] },
    { id: 'form', label: '形式', headings: ['形式', '内容'] },
    { id: 'context', label: '语境', headings: ['历史语境', '图像内容'] },
    { id: 'compare', label: '比较', headings: [] },
  ];
  const tabs = frame.locator('.detail-tab');
  assert.equal(await tabs.count(), expectedTabs.length, `${mode} AP 52 study tab count`);
  for (let tabIndex = 0; tabIndex < expectedTabs.length; tabIndex += 1) {
    const expected = expectedTabs[tabIndex];
    await tabs.nth(tabIndex).click();
    assert.deepEqual(
      await tabs.evaluateAll((buttons) => buttons.map((button) => ({
        selected: button.getAttribute('aria-selected'),
        tabIndex: button.getAttribute('tabindex'),
      }))),
      expectedTabs.map((tab, index) => ({
        selected: String(index === tabIndex),
        tabIndex: index === tabIndex ? '0' : '-1',
      })),
      `${mode} AP 52 ${expected.label} tab state`,
    );
    const panel = frame.locator('#detail-tabpanel');
    assert.equal(await panel.getAttribute('aria-labelledby'), `detail-tab-${expected.id}`);
    assert.ok((await panel.textContent()).trim().length > 8);
    assert.deepEqual(await panel.locator('h3').allTextContents(), expected.headings);
  }

  await resetAndActivateWork(page, frame, comparisonWork);
  await frame.locator('#detail-tab-compare').click();
  const targetCard = frame.locator('.comparison-card[data-comparison-id="ap46-pantheon"]');
  assert.equal(await targetCard.count(), 1, `${mode} AP 89 to AP 46 comparison card`);
  await targetCard.click();
  const targetHeading = frame.locator('[data-selected-artwork-title]');
  await targetHeading.waitFor();
  assert.equal((await targetHeading.textContent()).trim(), 'Pantheon');
  assert.equal((await frame.locator('.work-meta').textContent()).trim().split(' · ')[0], 'AP #46');
  assert.equal(await frame.locator('#unitFilter').inputValue(), '2');
  assert.equal((await frame.locator('.result-count').textContent()).trim(), '当前显示 36 件作品');
  assert.equal(await frame.locator('#searchInput').inputValue(), '');
  await frame.waitForFunction(() => (
    document.activeElement === document.querySelector('[data-selected-artwork-title]')
  ));
  assert.equal(
    await frame.evaluate(() => (
      document.activeElement === document.querySelector('[data-selected-artwork-title]')
    )),
    true,
    `${mode} AP 46 comparison target focus`,
  );

  return {
    sourceApNumber: studyWork.apNumber,
    tabs: expectedTabs.map(({ id, label }) => ({ id, label })),
    comparisonSource: comparisonWork.apNumber,
    crossUnitTarget: 46,
  };
}

async function verifyU3Standalone(browser, baseUrl) {
  const viewport = { width: 1365, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U3 fifty-one works standalone');
    const imageRequests = new Map();
    await mockRemoteImages(page, (url) => {
      imageRequests.set(url, (imageRequests.get(url) || 0) + 1);
    });
    await page.goto(`${baseUrl}/art-history-map.html`, { waitUntil: 'load' });
    await waitForArt(page);
    const works = await verifyU3Works(page, page, imageRequests, 'standalone');
    const study = await verifyU3StudyTabsAndComparison(page, page, 'standalone');
    assertNoCollectedIssues(issues, 'U3 standalone');
    return { viewport, works, study };
  });
}

async function verifyU3Embedded(browser, baseUrl) {
  const viewport = { width: 1365, height: 768 };
  return withBrowserContext(browser, { viewport, reducedMotion: 'reduce' }, async (context) => {
    const page = await context.newPage();
    const issues = installErrorCollection(page, 'U3 fifty-one works embedded');
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
    const works = await verifyU3Works(page, frame, imageRequests, 'embedded');
    const study = await verifyU3StudyTabsAndComparison(page, frame, 'embedded');
    assertNoCollectedIssues(issues, 'U3 embedded');
    return { viewport, works, study };
  });
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
    const study = await verifyU1StudyTabsAndComparison(page, page, 'standalone');
    assert.deepEqual(issues, []);
    return { viewport, works, study };
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
    const study = await verifyU1StudyTabsAndComparison(page, frame, 'embedded');
    assert.deepEqual(issues, []);
    return { viewport, works, study };
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
      'AP 艺术史互动地图 · Units 1-3',
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
      { injectConsoleIssue: 'warning' },
    ),
    /responsive warning regression/,
  );
  await assert.rejects(
    verifyStandalone(
      browser,
      baseUrl,
      viewport,
      false,
      { injectConsoleIssue: 'error' },
    ),
    /responsive error regression/,
  );
  return { viewport, warningRejected: true, errorRejected: true };
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
      const u3Standalone = await verifyU3Standalone(browser, server.baseUrl);
      const u3Embedded = await verifyU3Embedded(browser, server.baseUrl);
      report.push({
        kind: 'u3-fifty-one-works',
        standalone: u3Standalone,
        embedded: u3Embedded,
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
