import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const REQUIRED_VIEWPORTS = Object.freeze([
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 375, height: 812 },
  { width: 667, height: 375 },
]);
export const LAYOUTS = Object.freeze(['a', 'c']);

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE_FILE = join(PROJECT_ROOT, 'apush-map.html');
const DATA_PATH = '/data/apush-period-1.json';
const MIME_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
});

const pageUrl = (port, layout) => `http://127.0.0.1:${port}/apush-map.html?layout=${layout}`;
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const stateOf = (page) => page.evaluate(() => window.__apushMap?.getState());

function required(condition, message) {
  assert.ok(condition, message);
}

async function importFirst(candidates) {
  const require = createRequire(import.meta.url);
  const failures = [];
  for (const candidate of candidates.filter(Boolean)) {
    try {
      const entry = candidate.startsWith('.') || candidate.startsWith('/')
        ? require.resolve(candidate)
        : candidate;
      return await import(entry.startsWith('/') ? pathToFileURL(entry).href : entry);
    } catch (error) {
      failures.push(`${candidate}: ${error.code || error.message}`);
    }
  }
  throw new Error(`Playwright could not be discovered. Tried: ${failures.join('; ')}`);
}

async function discoverPlaywright() {
  const require = createRequire(import.meta.url);
  const codexRuntime = process.env.CODEX_PRIMARY_RUNTIME
    || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime');
  const cachedCandidates = [
    process.env.HOME && join(process.env.HOME, '.cache/ms-playwright/node_modules/playwright'),
    process.env.HOME && join(process.env.HOME, 'Library/Caches/ms-playwright/node_modules/playwright'),
    process.env.HOME && join(process.env.HOME, '.npm/_npx/node_modules/playwright'),
  ];
  const candidates = [process.env.APUSH_PLAYWRIGHT_PATH];
  try { candidates.push(require.resolve('playwright')); } catch {}
  candidates.push(
    join(codexRuntime, 'dependencies/node/node_modules/playwright/index.mjs'),
    join(homedir(), '.codex/plugins/cache/openai-primary-runtime/node_modules/playwright'),
    '/opt/codex/primary-runtime/node_modules/playwright',
  );
  candidates.push(...cachedCandidates);
  const module = await importFirst(candidates);
  if (!module.chromium) throw new Error('Discovered Playwright does not export chromium');
  return module;
}

async function discoverChromium(chromium) {
  const candidates = [
    process.env.APUSH_BROWSER_PATH,
    chromium.executablePath(),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error(`Chromium could not be discovered. Tried: ${candidates.join(', ')}`);
}

export function startServer() {
  let invalidDatasetRequests = 0;
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, 'http://127.0.0.1');
      if (requestUrl.pathname === DATA_PATH && invalidDatasetRequests > 0) {
        invalidDatasetRequests -= 1;
        response.writeHead(200, { 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8' });
        response.end('{"schemaVersion":0}');
        return;
      }
      const relativePath = normalize(decodeURIComponent(requestUrl.pathname)).replace(/^[/\\]+/, '');
      const filePath = resolve(PROJECT_ROOT, relativePath || 'index.html');
      if (filePath !== PROJECT_ROOT && !filePath.startsWith(`${PROJECT_ROOT}/`)) {
        response.writeHead(403, { 'cache-control': 'no-store' });
        response.end('Forbidden');
        return;
      }
      const file = await readFile(filePath);
      response.writeHead(200, {
        'cache-control': 'no-store, max-age=0',
        'content-type': MIME_TYPES[extname(filePath)] || 'application/octet-stream',
      });
      response.end(file);
    } catch (error) {
      response.writeHead(error?.code === 'ENOENT' ? 404 : 500, { 'cache-control': 'no-store' });
      response.end(error?.code === 'ENOENT' ? 'Not found' : String(error));
    }
  });
  return {
    setInvalidDatasetRequests(value) { invalidDatasetRequests = value; },
    async listen() {
      await new Promise((resolveListen, rejectListen) => {
        server.once('error', rejectListen);
        server.listen(0, '127.0.0.1', resolveListen);
      });
      return server.address().port;
    },
    async close() {
      if (!server.listening) return;
      await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
    },
  };
}

async function controlLocator(page, matcher) {
  const controls = page.locator('#mapPanel button, #mapPanel [role="button"]');
  const count = await controls.count();
  for (let index = 0; index < count; index += 1) {
    const control = controls.nth(index);
    const label = `${await control.getAttribute('aria-label') || ''} ${await control.textContent() || ''}`;
    if (matcher.test(label)) return control;
  }
  throw new Error(`Missing map control matching ${matcher}`);
}

async function assertNoConsoleOrPageErrors(errors) {
  assert.deepEqual(errors, [], `page emitted errors:\n${errors.join('\n')}`);
}

function contrastRatio(foreground, background) {
  const channels = (color) => {
    const values = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    required(values?.length === 3, `could not parse computed color: ${color}`);
    return values.map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
  };
  const luminance = (color) => {
    const [red, green, blue] = channels(color);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

async function assertStateCopies(page) {
  const first = await stateOf(page);
  first.activeThemes.push('mutated');
  first.visibleEventIds.push('mutated');
  first.mapTransform.scale = 999;
  const second = await stateOf(page);
  assert.equal(second.activeThemes.includes('mutated'), false, 'getState must copy activeThemes');
  assert.equal(second.visibleEventIds.includes('mutated'), false, 'getState must copy visibleEventIds');
  assert.notEqual(second.mapTransform.scale, 999, 'getState must copy mapTransform');
}

async function assertPublicApi(page, manifestIds, events) {
  const methods = await page.evaluate(() => Object.fromEntries([
    'getState', 'selectEvent', 'setQuery', 'toggleTheme', 'clearFilters', 'resetMap',
  ].map((name) => [name, typeof window.__apushMap?.[name]])));
  assert.deepEqual(methods, {
    getState: 'function',
    selectEvent: 'function',
    setQuery: 'function',
    toggleTheme: 'function',
    clearFilters: 'function',
    resetMap: 'function',
  }, 'window.__apushMap must expose the complete callable state API');

  await page.evaluate(() => window.__apushMap.setQuery('Columbian Exchange'));
  let state = await stateOf(page);
  assert.equal(state.query, 'Columbian Exchange', 'setQuery must update query state');
  required(state.visibleEventIds.includes('columbian-exchange'), 'setQuery must filter to Columbian Exchange');

  await page.evaluate(() => window.__apushMap.setQuery(''));
  const themeId = events.find((event) => event.themeIds?.length)?.themeIds[0];
  required(themeId, 'dataset must provide a theme for API verification');
  await page.evaluate((id) => window.__apushMap.toggleTheme(id), themeId);
  state = await stateOf(page);
  assert.equal(state.activeThemes.includes(themeId), true, 'toggleTheme must activate the supplied theme');

  await page.evaluate(() => window.__apushMap.clearFilters());
  state = await stateOf(page);
  assert.equal(state.query, '', 'clearFilters must clear the query');
  assert.deepEqual(state.activeThemes, [], 'clearFilters must clear active themes');
  assert.deepEqual(state.visibleEventIds, manifestIds, 'clearFilters must restore all manifest events');
}

async function assertHitTargets(page) {
  const hitTargets = page.locator([
    '#mapPanel button',
    '#mapPanel [data-event-id]',
    '#timelineMount [data-event-id]',
    '[data-hit-target]',
    '[data-map-control]',
  ].join(', '));
  const count = await hitTargets.count();
  for (let index = 0; index < count; index += 1) {
    const target = hitTargets.nth(index);
    if (!(await target.isVisible())) continue;
    const box = await target.boundingBox();
    required(box && box.width >= 44 && box.height >= 44,
      `interactive hit target ${index} is below 44px (${box?.width}x${box?.height})`);
  }
}

async function assertTimeline(page, layout) {
  const timeline = page.locator('#timelineMount');
  if (layout === 'a') {
    assert.equal(await timeline.count(), 0, 'layout A must not retain a hidden interactive timeline');
    return;
  }
  assert.equal(await timeline.count(), 1, 'layout C must include a timeline mount');
  required(await timeline.evaluate((node) => node.isConnected), 'layout C timeline must be connected');
  required(await timeline.isVisible(), 'layout C timeline must be visible');
  required(await timeline.locator('[data-event-id]').count() > 0, 'layout C timeline must contain interactive stops');
}

async function loadPrototype(page, port, layout) {
  const response = await page.goto(pageUrl(port, layout), { waitUntil: 'networkidle' });
  required(response?.ok(), `apush-map.html is unavailable for layout ${layout} (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__apushMap), undefined, { timeout: 8_000 });
}

async function firstRenderedMarker(page, eventId) {
  const markers = page.locator(`#mapPanel [data-event-id="${eventId}"]`);
  const count = await markers.count();
  required(count > 0, `rendered map must expose a marker for ${eventId}`);
  return markers.first();
}

async function verifyFilterSelectionFlow(page, port, layout) {
  await loadPrototype(page, port, layout);
  await (await firstRenderedMarker(page, 'columbian-exchange')).click();
  assert.equal((await stateOf(page)).selectedEventId, 'columbian-exchange',
    `${layout}: fixture selection must start on Columbian Exchange`);
  await page.locator('#searchInput').fill('Columbian Exchange');
  assert.equal((await stateOf(page)).selectedEventId, 'columbian-exchange',
    `${layout}: filtering must retain a selected event while it remains visible`);
  await page.locator('#searchInput').fill('Spanish Labor and Caste Systems');
  const filtered = await stateOf(page);
  assert.deepEqual(filtered.visibleEventIds, ['spanish-labor-caste'], `${layout}: fixture filter must leave one visible event`);
  assert.equal(filtered.selectedEventId, null, `${layout}: filtering must clear a selection that is no longer visible`);
  assert.match(await page.locator('#detailPanel').innerText(), /选择地图上的编号地点/,
    `${layout}: cleared selection must restore the instructional detail state`);
}

async function verifyNoResultsUi(page, port, layout, manifestIds) {
  await loadPrototype(page, port, layout);
  const query = 'no-such-period-1-event';
  await page.locator('#searchInput').fill(query);
  assert.deepEqual((await stateOf(page)).visibleEventIds, [], `${layout}: no-match query must produce zero results`);
  const noResults = page.locator('#noResults:not([hidden])');
  assert.equal(await noResults.count(), 1, `${layout}: zero results must show one in-context empty state`);
  assert.match(await noResults.innerText(), new RegExp(query), `${layout}: no-results state must display the current query`);
  const clear = noResults.locator('button');
  assert.equal(await clear.count(), 1, `${layout}: no-results state must expose one clear-filters button`);
  await clear.click();
  const restored = await stateOf(page);
  assert.equal(restored.query, '', `${layout}: in-context clear must clear the query`);
  assert.deepEqual(restored.visibleEventIds, manifestIds, `${layout}: in-context clear must restore all events`);
  assert.equal(await page.locator('#noResults:not([hidden])').count(), 0, `${layout}: restored results must hide the empty state`);
}

async function verifyClearRestoresOverview(page, port, layout, manifestIds) {
  await loadPrototype(page, port, layout);
  const initial = await stateOf(page);
  await (await firstRenderedMarker(page, 'columbian-exchange')).click();
  assert.notDeepEqual((await stateOf(page)).mapTransform, initial.mapTransform,
    `${layout}: selecting the fixture must move the map from its overview`);
  await page.locator('#clearFilters').click();
  const cleared = await stateOf(page);
  assert.deepEqual(cleared.visibleEventIds, manifestIds, `${layout}: clearFilters must restore all events`);
  assert.deepEqual(cleared.mapTransform, initial.mapTransform, `${layout}: clearFilters must restore the map overview`);
}

async function verifyRenderedManifestControls(page, port, layout, events) {
  await loadPrototype(page, port, layout);
  for (const event of events) {
    await (await firstRenderedMarker(page, event.id)).press('Enter');
    assert.equal((await stateOf(page)).selectedEventId, event.id, `${layout}: rendered marker must select ${event.id}`);
    const detail = await page.locator('#detailPanel').innerText();
    required(detail.includes(event.titleEn) && detail.includes(event.titleZh),
      `${layout}: rendered marker must show bilingual detail for ${event.id}`);
    if (layout === 'c') {
      const stop = page.locator(`#timelineMount [data-event-id="${event.id}"]`);
      assert.equal(await stop.count(), 1, `layout c: timeline must expose exactly one stop for ${event.id}`);
      await stop.click();
      assert.equal((await stateOf(page)).selectedEventId, event.id, `layout c: timeline click must select ${event.id}`);
    }
  }
}

async function verifyKeyboardAndDragControls(page, port) {
  await loadPrototype(page, port, 'a');
  const enterMarker = await firstRenderedMarker(page, 'columbus-caribbean-1492');
  await enterMarker.press('Enter');
  assert.equal((await stateOf(page)).selectedEventId, 'columbus-caribbean-1492', 'marker Enter must select its event');
  await page.locator('[data-map-control="reset"]').click();
  const spaceMarker = await firstRenderedMarker(page, 'columbian-exchange');
  await spaceMarker.press('Space');
  assert.equal((await stateOf(page)).selectedEventId, 'columbian-exchange', 'marker Space must select its event');
  await page.locator('[data-map-control="reset"]').click();

  const beforeDrag = await stateOf(page);
  const mapBox = await page.locator('#historyMap').boundingBox();
  required(mapBox, 'map must expose a pointer target for drag verification');
  const startX = mapBox.x + mapBox.width * 0.65;
  const startY = mapBox.y + mapBox.height * 0.7;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 70, startY + 35, { steps: 4 });
  await page.mouse.up();
  assert.notDeepEqual((await stateOf(page)).mapTransform, beforeDrag.mapTransform, 'pointer drag must change mapTransform');
  await page.locator('[data-map-control="reset"]').click();
  assert.deepEqual((await stateOf(page)).mapTransform, beforeDrag.mapTransform, 'rendered reset control must restore overview after drag');

  await loadPrototype(page, port, 'c');
  const enterStop = page.locator('#timelineMount [data-event-id="conquest-mexica"]');
  assert.equal(await enterStop.count(), 1, 'timeline must expose the Enter fixture');
  await enterStop.press('Enter');
  assert.equal((await stateOf(page)).selectedEventId, 'conquest-mexica', 'timeline Enter must select its event');
  const spaceStop = page.locator('#timelineMount [data-event-id="conquest-inca"]');
  assert.equal(await spaceStop.count(), 1, 'timeline must expose the Space fixture');
  await spaceStop.press('Space');
  assert.equal((await stateOf(page)).selectedEventId, 'conquest-inca', 'timeline Space must select its event');
  const clickStop = page.locator('#timelineMount [data-event-id="st-augustine-borderlands"]');
  assert.equal(await clickStop.count(), 1, 'timeline must expose the click fixture');
  await clickStop.click();
  assert.equal((await stateOf(page)).selectedEventId, 'st-augustine-borderlands', 'timeline click must select its event');
}

async function verifyReducedMotion(page, port) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loadPrototype(page, port, 'a');
  const transition = await page.locator('.map-geography path').first().evaluate((path) => ({
    duration: getComputedStyle(path).transitionDuration,
    property: getComputedStyle(path).transitionProperty,
  }));
  assert.equal(transition.duration, '0s', `reduced motion must disable geography transitions: ${JSON.stringify(transition)}`);
}

async function verifyMultiAnchorLabel(page, port, data) {
  await loadPrototype(page, port, 'a');
  const event = data.events.find((candidate) => candidate.siteIds.length > 1);
  const site = event?.siteIds.map((id) => data.sites.find((candidate) => candidate.id === id)).find((candidate) => candidate?.qualifier);
  required(event && site, 'dataset must provide a qualified multi-anchor fixture');
  const marker = page.locator(`#mapPanel [data-event-id="${event.id}"][data-site-x="${site.x}"][data-site-y="${site.y}"]`);
  assert.equal(await marker.count(), 1, 'qualified multi-anchor fixture must render exactly one marker');
  const label = await marker.getAttribute('aria-label');
  required(label?.includes(site.qualifier), `multi-anchor label must include the site qualifier: ${label}`);
  assert.match(label, /same transregional learning record|同一跨区域学习记录/i,
    `multi-anchor label must explain that anchors open one shared record: ${label}`);
}

async function verifyViewport(page, port, layout, viewport, manifestIds, events) {
  const errors = [];
  const onPageError = (error) => errors.push(`pageerror: ${error.message}`);
  const onConsole = (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  await page.setViewportSize(viewport);
  const response = await page.goto(pageUrl(port, layout), { waitUntil: 'networkidle' });
  required(response?.ok(), `apush-map.html is unavailable (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__apushMap), undefined, { timeout: 8_000 });
  const initial = await stateOf(page);
  const initialDetail = await page.locator('#detailPanel').innerText();
  assert.equal(initial.layout, layout, 'getState must report the requested layout');
  assert.deepEqual(initial.visibleEventIds, manifestIds, 'initial visible events must exactly match manifest order');
  assert.match(await page.locator('#prototypeLabel').innerText(), new RegExp(`\\b${layout.toUpperCase()}\\b`), 'prototype label must identify the current layout');
  await assertStateCopies(page);
  await assertPublicApi(page, manifestIds, events);
  await assertTimeline(page, layout);

  await page.locator('[data-event-id="columbus-caribbean-1492"]').first().click();
  assert.equal((await stateOf(page)).selectedEventId, 'columbus-caribbean-1492', 'event click must select Columbus');

  const themeButtons = page.locator('#themeFilters button');
  let changedResultSet = false;
  for (let index = 0; index < await themeButtons.count(); index += 1) {
    await themeButtons.nth(index).click();
    const afterTheme = await stateOf(page);
    if (afterTheme.visibleEventIds.length !== manifestIds.length) {
      changedResultSet = true;
      break;
    }
    await page.locator('#clearFilters').click();
  }
  required(changedResultSet, 'clicking a theme must change the result set');
  await page.locator('#clearFilters').click();
  assert.deepEqual((await stateOf(page)).visibleEventIds, manifestIds, 'clearing filters must restore all nine events');

  await page.locator('#searchInput').fill('Columbian Exchange');
  const afterSearch = await stateOf(page);
  required(afterSearch.visibleEventIds.includes('columbian-exchange'), 'search must return Columbian Exchange');
  await page.locator('[data-event-id="columbian-exchange"]').first().click();
  assert.equal((await stateOf(page)).selectedEventId, 'columbian-exchange', 'search result must be selectable');
  await page.locator('#clearFilters').click();

  const beforeZoom = await stateOf(page);
  await (await controlLocator(page, /zoom in|放大/i)).click();
  const afterZoom = await stateOf(page);
  assert.notDeepEqual(afterZoom.mapTransform, beforeZoom.mapTransform, 'zoom control must change mapTransform');
  await (await controlLocator(page, /reset|重置/i)).click();
  assert.deepEqual((await stateOf(page)).mapTransform, initial.mapTransform, 'reset must restore the overview transform');
  await (await controlLocator(page, /zoom in|放大/i)).click();
  await page.evaluate(() => window.__apushMap.resetMap());
  assert.deepEqual((await stateOf(page)).mapTransform, initial.mapTransform, 'resetMap must restore the overview transform');

  for (const event of events) {
    await page.evaluate((eventId) => window.__apushMap.selectEvent(eventId), event.id);
    assert.equal((await stateOf(page)).selectedEventId, event.id, `selectEvent must select ${event.id}`);
    const detail = await page.locator('#detailPanel').innerText();
    required(detail.includes(event.titleEn) && detail.includes(event.titleZh), `detail panel must show bilingual content for ${event.id}`);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  assert.equal(overflow, true, `page must not overflow horizontally at ${viewport.width}x${viewport.height}`);
  await assertHitTargets(page);
  await assertNoConsoleOrPageErrors(errors);
  page.off('pageerror', onPageError);
  page.off('console', onConsole);
  return {
    initialDetail,
    initialVisibleEventIds: initial.visibleEventIds,
    mapHeight: await page.locator('#mapPanel').evaluate((node) => node.getBoundingClientRect().height),
  };
}

async function verifyRetry(page, port) {
  const errors = [];
  const onPageError = (error) => errors.push(`pageerror: ${error.message}`);
  const onConsole = (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  try {
    const response = await page.goto(pageUrl(port, 'a'), { waitUntil: 'networkidle' });
    required(response?.ok(), `apush-map.html is unavailable during retry test (HTTP ${response?.status() || 'no response'})`);
    await page.waitForSelector('#loadError:not([hidden])', { state: 'visible', timeout: 8_000 });
    await page.locator('#searchInput').fill('Columbian Exchange');
    await page.locator('#clearFilters').click();
    await page.evaluate(() => new Promise((resolveFrame) => requestAnimationFrame(resolveFrame)));
    const retry = page.locator('#retryLoad');
    required(await retry.isVisible(), 'invalid data must expose a visible retry action');
    await retry.click();
    await page.waitForFunction(() => Boolean(window.__apushMap), undefined, { timeout: 8_000 });
    assert.equal((await stateOf(page)).visibleEventIds.length, 9, 'retry must initialize all nine events');
    await assertNoConsoleOrPageErrors(errors);
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
  }
}

async function verifyMobilePrimaryMarker(page, port, data) {
  const eventId = 'spanish-labor-caste';
  const event = data.events.find((candidate) => candidate.id === eventId);
  const primarySite = data.sites.find((site) => site.id === event?.primarySiteId);
  required(event && primarySite, `missing mobile marker fixture for ${eventId}`);
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto(pageUrl(port, 'a'), { waitUntil: 'networkidle' });
  required(response?.ok(), `apush-map.html is unavailable during mobile marker test (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__apushMap), undefined, { timeout: 8_000 });
  await page.evaluate((id) => window.__apushMap.selectEvent(id), eventId);
  assert.equal((await stateOf(page)).selectedEventId, eventId, `mobile marker fixture must select ${eventId}`);

  const geometry = await page.locator(`#mapPanel [data-event-id="${eventId}"]`).evaluateAll((markers, site) => {
    const marker = markers.find((candidate) =>
      Number(candidate.dataset.siteX) === site.x && Number(candidate.dataset.siteY) === site.y);
    if (!marker) return null;
    const markerRect = marker.getBoundingClientRect();
    const panelRect = document.querySelector('#mapPanel').getBoundingClientRect();
    return {
      moved: Number(marker.dataset.mapX) !== site.x || Number(marker.dataset.mapY) !== site.y,
      marker: {
        left: markerRect.left, top: markerRect.top, right: markerRect.right, bottom: markerRect.bottom,
        width: markerRect.width, height: markerRect.height,
      },
      panel: { left: panelRect.left, top: panelRect.top, right: panelRect.right, bottom: panelRect.bottom },
    };
  }, primarySite);
  required(geometry, `primary marker for ${eventId} must be rendered`);
  required(geometry.moved, `primary marker for ${eventId} must exercise collision-offset placement`);
  required(Math.abs(geometry.marker.width - 48) <= 1 && Math.abs(geometry.marker.height - 48) <= 1,
    `primary marker for ${eventId} must expose a 48px hit target`);
  required(
    geometry.marker.left >= geometry.panel.left - 1
      && geometry.marker.top >= geometry.panel.top - 1
      && geometry.marker.right <= geometry.panel.right + 1
      && geometry.marker.bottom <= geometry.panel.bottom + 1,
    `collision-shifted primary marker for ${eventId} must remain inside #mapPanel: ${JSON.stringify(geometry)}`,
  );
}

async function prepareRelationshipNavigation(page, port) {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto(pageUrl(port, 'c'), { waitUntil: 'networkidle' });
  required(response?.ok(), `apush-map.html is unavailable during relationship checks (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__apushMap), undefined, { timeout: 8_000 });
  await page.locator('#searchInput').fill('Columbian Exchange');
  await page.evaluate(() => window.__apushMap.selectEvent('columbian-exchange'));
  const relationship = page.locator('.relationship-button', { hasText: 'European Exploration of the Americas' });
  assert.equal(await relationship.count(), 1, 'Columbian Exchange must expose one European Exploration relationship');
  await relationship.click();
  assert.equal((await stateOf(page)).selectedEventId, 'european-exploration', 'relationship click must select European Exploration');
}

async function verifyRelationshipFocus(page, port) {
  await prepareRelationshipNavigation(page, port);
  required(
    await page.locator('#detailPanel .detail-title').evaluate((heading) => document.activeElement === heading),
    'relationship navigation must move keyboard focus to the rerendered detail heading',
  );
}

async function verifyRelationStatusRefresh(page, port) {
  await prepareRelationshipNavigation(page, port);
  const status = page.locator('#detailPanel .detail-status');
  assert.equal(await status.count(), 1,
    'out-of-filter relationship navigation must render exactly one status notice');
  assert.match(await status.innerText(), /不在当前筛选结果中/,
    'relationship status must explain that the linked event is outside the current filters');
  await page.locator('#clearFilters').click();
  assert.equal(await page.locator('#detailPanel .detail-status').count(), 0,
    'clearing filters must remove the stale out-of-filter relationship notice');
}

async function verifyWxtContrast(page, port) {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto(pageUrl(port, 'c'), { waitUntil: 'networkidle' });
  required(response?.ok(), `apush-map.html is unavailable during WXT contrast checks (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__apushMap), undefined, { timeout: 8_000 });
  const wxtButton = page.locator('[data-theme-id="WXT"]');
  await wxtButton.click();
  const colors = await page.evaluate(() => {
    const button = document.querySelector('[data-theme-id="WXT"]');
    const marker = document.querySelector('[data-event-id="columbian-exchange"]');
    const number = marker?.querySelector('.marker-number');
    const dot = marker?.querySelector('.marker-dot');
    return {
      buttonBackground: getComputedStyle(button).backgroundColor,
      buttonForeground: getComputedStyle(button).color,
      markerBackground: getComputedStyle(dot).fill,
      markerForeground: getComputedStyle(number).fill,
    };
  });
  required(contrastRatio(colors.buttonForeground, colors.buttonBackground) >= 4.5,
    `active WXT filter contrast must be at least 4.5:1: ${JSON.stringify(colors)}`);
  required(contrastRatio(colors.markerForeground, colors.markerBackground) >= 4.5,
    `WXT marker contrast must be at least 4.5:1: ${JSON.stringify(colors)}`);
}

export async function verifyBrowser() {
  try {
    await stat(PAGE_FILE);
  } catch {
    throw new Error('missing required page: apush-map.html');
  }
  const [manifest, data, playwright] = await Promise.all([
    readJson(join(PROJECT_ROOT, 'data/apush-period-1-manifest.json')),
    readJson(join(PROJECT_ROOT, 'data/apush-period-1.json')),
    discoverPlaywright(),
  ]);
  const browserPath = await discoverChromium(playwright.chromium);
  const server = startServer();
  let browser;
  let port;
  try {
    port = await server.listen();
    browser = await playwright.chromium.launch({ executablePath: browserPath, headless: true });
    const initialByLayout = new Map();
    for (const layout of LAYOUTS) {
      for (const viewport of REQUIRED_VIEWPORTS) {
        const page = await browser.newPage({ viewport });
        const result = await verifyViewport(page, port, layout, viewport, manifest.eventIds, data.events);
        if (viewport.width === 1440) initialByLayout.set(layout, result);
        await page.close();
      }
    }
    const a = initialByLayout.get('a');
    const c = initialByLayout.get('c');
    assert.deepEqual(a.initialVisibleEventIds, c.initialVisibleEventIds, 'layouts A and C must start with matching visible events');
    assert.equal(a.initialDetail, c.initialDetail, 'layouts A and C must start with matching detail content');
    required(a.mapHeight - c.mapHeight >= 80, 'layout C map panel must be at least 80px shorter than layout A at desktop size');

    const regressionErrors = [];

    for (const layout of LAYOUTS) {
      for (const [label, verify] of [
        ['filter selection flow', (page) => verifyFilterSelectionFlow(page, port, layout)],
        ['no-results UI', (page) => verifyNoResultsUi(page, port, layout, manifest.eventIds)],
        ['clear restores overview', (page) => verifyClearRestoresOverview(page, port, layout, manifest.eventIds)],
        ['rendered manifest controls', (page) => verifyRenderedManifestControls(page, port, layout, data.events)],
      ]) {
        const acceptancePage = await browser.newPage({ viewport: REQUIRED_VIEWPORTS[0] });
        try {
          await verify(acceptancePage);
        } catch (error) {
          regressionErrors.push(`${layout} ${label}: ${error.message}`);
        } finally {
          await acceptancePage.close();
        }
      }
    }

    for (const [label, verify] of [
      ['keyboard and drag controls', (page) => verifyKeyboardAndDragControls(page, port)],
      ['reduced motion', (page) => verifyReducedMotion(page, port)],
      ['multi-anchor label', (page) => verifyMultiAnchorLabel(page, port, data)],
    ]) {
      const interactionPage = await browser.newPage({ viewport: REQUIRED_VIEWPORTS[0] });
      try {
        await verify(interactionPage);
      } catch (error) {
        regressionErrors.push(`${label}: ${error.message}`);
      } finally {
        await interactionPage.close();
      }
    }

    const markerPage = await browser.newPage({ viewport: { width: 375, height: 812 } });
    try {
      await verifyMobilePrimaryMarker(markerPage, port, data);
    } catch (error) {
      regressionErrors.push(`mobile primary marker: ${error.message}`);
    } finally {
      await markerPage.close();
    }

    for (const [label, verify] of [
      ['relationship focus', verifyRelationshipFocus],
      ['relationship status refresh', verifyRelationStatusRefresh],
      ['WXT contrast', verifyWxtContrast],
    ]) {
      const deferredUxPage = await browser.newPage({ viewport: { width: 375, height: 812 } });
      try {
        await verify(deferredUxPage, port);
      } catch (error) {
        regressionErrors.push(`${label}: ${error.message}`);
      } finally {
        await deferredUxPage.close();
      }
    }

    server.setInvalidDatasetRequests(1);
    const retryPage = await browser.newPage({ viewport: REQUIRED_VIEWPORTS[0] });
    try {
      await verifyRetry(retryPage, port);
    } catch (error) {
      regressionErrors.push(`malformed-data interactions: ${error.message}`);
    } finally {
      await retryPage.close();
    }
    assert.deepEqual(regressionErrors, [], `browser regression failures:\n${regressionErrors.join('\n')}`);
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  verifyBrowser().then(() => {
    console.log('APUSH browser verification passed');
  }).catch((error) => {
    console.error(`APUSH browser verification failed: ${error.message}`);
    process.exitCode = 1;
  });
}
