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
const REGISTRY_FILE = join(PROJECT_ROOT, 'data/apush-period-registry.json');
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

async function assertCompactCard(page, event, { scopeCue = false } = {}) {
  const panel = page.locator('#detailPanel');
  assert.equal(await panel.locator('h2.detail-title').count(), 1, 'the compact card must expose one accessible h2');
  const copy = await panel.innerText();
  required(copy.includes(event.dateLabel), `compact card must include the date for ${event.id}`);
  required(copy.includes(event.titleZh), `compact card must include the Chinese title for ${event.id}`);
  required(copy.includes(event.summary), `compact card must include the one-sentence summary for ${event.id}`);
  assert.equal(await panel.locator('.detail-section, .relationship-button, textarea').count(), 0,
    'compact card must not expose long-form sections, relationship navigation, or learning inputs');
  assert.doesNotMatch(copy, /Significance|Exam Connection|Sources|Causes|Effects|Related Events|历史意义|考试连接|来源|原因|结果|相关事件|学习进度|掌握度/,
    'compact card must not expose long-form or learning-module copy');
  if (scopeCue) {
    assert.match(copy, /全国性|制度性/, `Dock-only event ${event.id} must explain its nongeographic scope in Chinese`);
    assert.match(copy, /National|Institutional/, `Dock-only event ${event.id} must expose an English scope cue`);
  }
}

function required(condition, message) {
  assert.ok(condition, message);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  let invalidDatasetPath = null;
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, 'http://127.0.0.1');
      if (requestUrl.pathname === invalidDatasetPath && invalidDatasetRequests > 0) {
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
    setInvalidDatasetRequests(value, dataPath) {
      invalidDatasetRequests = value;
      invalidDatasetPath = `/${String(dataPath).replace(/^\//, '')}`;
    },
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

async function visibleEvents(page, events) {
  const visibleIds = (await stateOf(page)).visibleEventIds;
  return visibleIds.map((id) => events.find((event) => event.id === id)).filter(Boolean);
}

async function assertTimelineDock(page, events, periodLabel = 'Period 1') {
  const dock = page.locator('#timelineMount');
  assert.equal(await dock.count(), 1, 'the embedded timeline Dock must expose exactly one #timelineMount');
  required(await dock.isVisible(), 'the embedded timeline Dock must be visible');
  assert.equal(await dock.getAttribute('aria-label'), `${periodLabel} timeline`,
    `the embedded timeline Dock must have the accessible label "${periodLabel} timeline"`);

  const list = dock.locator('ol');
  assert.equal(await list.count(), 1, 'the embedded timeline Dock must contain one ordered list');
  const items = list.locator(':scope > li');
  const nodes = dock.locator('[data-event-id]');
  assert.equal(await nodes.count(), events.length,
    'the embedded timeline Dock must render one event node per visible event');
  const emptyItems = list.locator(':scope > li.timeline-empty');
  if (events.length === 0) {
    assert.equal(await items.count(), 1, 'an empty Dock must render exactly one ordered-list item');
    assert.equal(await emptyItems.count(), 1, 'an empty Dock must render exactly one li.timeline-empty');
    assert.equal(await emptyItems.locator('button, a, input, select, textarea, [tabindex]').count(), 0,
      'the empty Dock message must be noninteractive');
    return;
  }

  assert.equal(await items.count(), events.length,
    'the embedded timeline Dock must render one ordered-list item per visible event');
  assert.equal(await emptyItems.count(), 0, 'a nonempty Dock must not render li.timeline-empty');
  assert.deepEqual(await nodes.evaluateAll((elements) => elements.map((element) => element.dataset.eventId)), events.map((event) => event.id),
    'the embedded timeline Dock must preserve visible event order');
  const itemStops = await items.evaluateAll((listItems) => listItems.map((item) => [...item.children]
    .filter((child) => child.matches('button.timeline-stop[data-event-id]'))
    .map((button) => button.dataset.eventId)));
  assert.deepEqual(itemStops, events.map((event) => [event.id]),
    'each ordered-list item must contain exactly one direct button.timeline-stop[data-event-id] for its event');
  for (const event of events) {
    const accessibleName = new RegExp(`${escapeRegex(event.dateLabel)}.*${escapeRegex(event.titleZh)}`);
    assert.equal(await dock.getByRole('button', { name: accessibleName }).count(), 1,
      `Dock button accessible name must include its date and full event title for ${event.id}`);
  }
}

async function assertTimelineDockGeometry(page, viewport) {
  const geometry = await page.evaluate(() => {
    const map = document.querySelector('#mapPanel');
    const dock = document.querySelector('#timelineMount');
    const track = dock?.querySelector('.timeline-track');
    if (!map || !dock || !track) return null;
    const mapRect = map.getBoundingClientRect();
    const dockRect = dock.getBoundingClientRect();
    return {
      mapBottom: mapRect.bottom,
      dockTop: dockRect.top,
      pageScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      dockOverflowX: getComputedStyle(dock).overflowX,
      dockScrollWidth: dock.scrollWidth,
      dockClientWidth: dock.clientWidth,
      trackOverflowX: getComputedStyle(track).overflowX,
      trackScrollWidth: track.scrollWidth,
      trackClientWidth: track.clientWidth,
      trackScrollLeftBefore: 0,
      focusedOutlineFits: (() => {
        const stops = [...track.querySelectorAll('.timeline-stop')];
        if (!stops.length) return { first: true, last: true };
        const fits = (stop) => {
          stop.focus();
          const stopRect = stop.getBoundingClientRect();
          const trackRect = track.getBoundingClientRect();
          const style = getComputedStyle(stop);
          const extent = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
          return {
            fits: stopRect.top - extent >= trackRect.top
            && stopRect.right + extent <= trackRect.right
            && stopRect.bottom + extent <= trackRect.bottom
            && stopRect.left - extent >= trackRect.left,
            extent,
            stop: { top: stopRect.top, right: stopRect.right, bottom: stopRect.bottom, left: stopRect.left },
            track: { top: trackRect.top, right: trackRect.right, bottom: trackRect.bottom, left: trackRect.left },
          };
        };
        track.scrollLeft = 0;
        const firstFits = fits(stops[0]);
        track.scrollLeft = track.scrollWidth - track.clientWidth;
        const lastFits = fits(stops.at(-1));
        track.scrollLeft = 0;
        return { first: firstFits, last: lastFits };
      })(),
      trackScrollLeftAfter: (() => {
        track.scrollLeft = 0;
        const maximum = track.scrollWidth - track.clientWidth;
        if (maximum <= 0) return track.scrollLeft;
        track.scrollLeft = Math.min(64, maximum);
        const after = track.scrollLeft;
        track.scrollLeft = 0;
        return after;
      })(),
    };
  });
  required(geometry, 'the embedded timeline Dock must expose a timeline track');
  required(geometry.dockTop >= geometry.mapBottom,
    `the embedded timeline Dock must occupy a separate row below the map at ${viewport.width}x${viewport.height}: ${JSON.stringify(geometry)}`);
  required(geometry.pageScrollWidth <= geometry.viewportWidth,
    `page must not overflow horizontally at ${viewport.width}x${viewport.height}: ${JSON.stringify(geometry)}`);
  required(['auto', 'scroll'].includes(geometry.trackOverflowX),
    `the timeline track must own horizontal scrolling at ${viewport.width}x${viewport.height}: ${JSON.stringify(geometry)}`);
  required(!['auto', 'scroll'].includes(geometry.dockOverflowX),
    `the Dock itself must not horizontally scroll at ${viewport.width}x${viewport.height}: ${JSON.stringify(geometry)}`);
  required(geometry.dockScrollWidth <= geometry.dockClientWidth,
    `Dock content must not create its own horizontal scroll range at ${viewport.width}x${viewport.height}: ${JSON.stringify(geometry)}`);
  required(geometry.focusedOutlineFits.first.fits && geometry.focusedOutlineFits.last.fits,
    `Dock track padding must keep focused-node outlines inside its scrollport at ${viewport.width}x${viewport.height}: ${JSON.stringify(geometry)}`);
  if (geometry.trackScrollWidth > geometry.trackClientWidth) {
    required(geometry.trackScrollLeftAfter > geometry.trackScrollLeftBefore,
      `the overflowing timeline track must be horizontally scrollable at ${viewport.width}x${viewport.height}: ${JSON.stringify(geometry)}`);
  }
}

async function loadPrototype(page, port, layout) {
  const response = await page.goto(pageUrl(port, layout), { waitUntil: 'networkidle' });
  required(response?.ok(), `apush-map.html is unavailable for layout ${layout} (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__apushMap), undefined, { timeout: 8_000 });
}

const dockIds = (page) => page.locator('#timelineMount [data-event-id]')
  .evaluateAll((nodes) => nodes.map((node) => node.dataset.eventId));

async function selectPeriod(page, periodId) {
  await page.locator('#periodFilter').selectOption(periodId);
  await page.waitForFunction((id) => window.__apushMap?.getState().periodId === id, periodId, { timeout: 8_000 });
}

async function verifyAllPeriodSwitching(page, port, registry, datasets, manifests) {
  const errors = [];
  const onPageError = (error) => errors.push(`pageerror: ${error.stack || error.message}`);
  const onConsole = (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  try {
    await loadPrototype(page, port, 'a');
    const options = page.locator('#periodFilter option');
    assert.equal(await options.count(), 9, 'the Period selector must expose exactly P1–P9');
    assert.deepEqual(await options.evaluateAll((nodes) => nodes.map((node) => ({ value: node.value, copy: node.textContent.trim() }))),
      registry.periods.map((period) => ({ value: period.id, copy: `${period.labelEn} · ${period.dates}` })),
      'the Period selector must use registry IDs, labels, and date ranges');

    for (const period of registry.periods) {
      if (period.id !== 'p1') {
        const currentState = await stateOf(page);
        const transientEventId = currentState.visibleEventIds[0];
        await page.evaluate((eventId) => window.__apushMap.selectEvent(eventId), transientEventId);
        await page.locator('#searchInput').fill('temporary query');
        await page.evaluate((eventId) => window.__apushMap.selectEvent(eventId, true), transientEventId);
        const transientState = await stateOf(page);
        assert.equal(transientState.selectedEventId, transientEventId, 'fixture must establish selection before switching periods');
        required(transientState.relationStatus.length > 0, 'fixture must establish transient relationship status before switching periods');
        const theme = (await stateOf(page)).activeThemes[0]
          || await page.locator('[data-theme-id]').first().getAttribute('data-theme-id');
        if (theme && !(await stateOf(page)).activeThemes.includes(theme)) {
          await page.evaluate((id) => window.__apushMap.toggleTheme(id), theme);
        }
        await page.evaluate(() => {
          window.__apushMap.resetMap();
          document.querySelector('[data-map-control="zoom-in"]')?.click();
        });
      }
      await selectPeriod(page, period.id);
      const expectedIds = manifests[period.id].eventIds;
      const state = await stateOf(page);
      assert.equal(state.periodId, period.id, `${period.id}: public state must expose the active period`);
      assert.equal(state.query, '', `${period.id}: switching must clear the query`);
      assert.deepEqual(state.activeThemes, [], `${period.id}: switching must clear active themes`);
      assert.deepEqual(state.visibleEventIds, expectedIds, `${period.id}: switching must restore manifest order`);
      assert.equal(state.selectedEventId, null, `${period.id}: switching must clear selection`);
      assert.equal(state.relationStatus, '', `${period.id}: switching must clear relationship status`);
      assert.deepEqual(state.mapTransform, { scale: 1.35, x: 120, y: -70 }, `${period.id}: switching must reset the map`);
      assert.equal(await page.locator('#periodFilter').inputValue(), period.id);
      assert.equal(await page.title(), `APUSH ${period.labelEn} · American History Map`);
      assert.match(await page.locator('.eyebrow').innerText(), new RegExp(`${escapeRegex(period.labelEn)}$`, 'i'));
      assert.match(await page.locator('h1').innerText(), /American History Map/);
      assert.equal(await page.locator('#mapPanel').getAttribute('aria-label'), `${period.labelEn} 互动地图`);
      assert.equal(await page.locator('#timelineMount').getAttribute('aria-label'), `${period.labelEn} timeline`);
      assert.equal((await page.locator('.timeline-dock-head strong').textContent()).trim(), `${period.labelEn} Timeline`);
      assert.equal(await page.locator('#resultCount').innerText(), `${datasets[period.id].events.length} / ${datasets[period.id].events.length} 事件`);
      assert.deepEqual(await dockIds(page), expectedIds, `${period.id}: Dock must preserve its manifest order`);
      await assertTimelineDock(page, datasets[period.id].events, period.labelEn);
      for (const prior of registry.periods.filter((candidate) => candidate.id !== period.id)) {
        const leaked = manifests[prior.id].eventIds.filter((id) => !expectedIds.includes(id));
        assert.equal((await dockIds(page)).some((id) => leaked.includes(id)), false, `${period.id}: Dock must not leak ${prior.id} events`);
      }
    }

    await page.goto(pageUrl(port, 'c'), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__apushMap?.getState().periodId === 'p1');
    await selectPeriod(page, 'p9');
    assert.deepEqual(await dockIds(page), manifests.p9.eventIds, 'legacy layout=c must use the same canonical Dock loader');
    await assertNoConsoleOrPageErrors(errors);
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
  }
}

async function verifyStalePeriodRequests(page, port, manifests) {
  let releaseP2;
  const p2Released = new Promise((resolve) => { releaseP2 = resolve; });
  let resolveP2Handled;
  const p2Handled = new Promise((resolve) => { resolveP2Handled = resolve; });
  await page.route('**/data/apush-period-2.json', async (route) => {
    await p2Released;
    const response = await route.fetch();
    await route.fulfill({ response });
    resolveP2Handled();
  });
  await loadPrototype(page, port, 'a');
  await page.locator('#periodFilter').selectOption('p2');
  await page.locator('#periodFilter').selectOption('p3');
  await page.waitForFunction(() => window.__apushMap?.getState().periodId === 'p3');
  releaseP2();
  await p2Handled;
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal((await stateOf(page)).periodId, 'p3', 'a stale P2 success must not replace P3');
  assert.equal(await page.locator('#periodFilter').inputValue(), 'p3', 'a stale P2 success must not rewind the selector');
  assert.match(await page.locator('.eyebrow').innerText(), /Period 3$/i);
  assert.deepEqual(await dockIds(page), manifests.p3.eventIds, 'a stale P2 success must not replace the P3 Dock');
}

async function verifyPeriodFailureRecovery(page, port, manifests) {
  let p2Attempts = 0;
  await page.route('**/data/apush-period-2.json', async (route) => {
    p2Attempts += 1;
    if (p2Attempts === 1) await route.abort('failed');
    else await route.continue();
  });
  await loadPrototype(page, port, 'a');
  await page.locator('#periodFilter').selectOption('p2');
  const error = page.locator('#loadError:not([hidden])');
  await error.waitFor();
  assert.equal(await page.locator('#loadError').getAttribute('role'), 'alert', 'load errors must expose an alert role');
  assert.equal(await page.locator('#loadError').getAttribute('aria-live'), 'assertive', 'load errors must be announced when revealed');
  assert.match(await error.innerText(), /Period 2/, 'load failure must identify the requested period');
  assert.equal(await page.locator('#periodFilter').isEnabled(), true, 'period selector must remain enabled after a load failure');
  assert.notEqual((await stateOf(page))?.periodId, 'p2', 'failed P2 must not falsely publish P2 state');
  await page.locator('#retryLoad').click();
  await page.waitForFunction(() => window.__apushMap?.getState().periodId === 'p2');
  assert.equal(p2Attempts, 2, 'retry must target the failed selected period');
  assert.deepEqual(await dockIds(page), manifests.p2.eventIds);

  await page.route('**/data/apush-period-4.json', (route) => route.abort('failed'));
  await page.locator('#periodFilter').selectOption('p4');
  await error.waitFor();
  await page.locator('#periodFilter').selectOption('p3');
  await page.waitForFunction(() => window.__apushMap?.getState().periodId === 'p3');
  assert.equal(await error.isHidden(), true, 'a newer successful selection must dismiss an older failure');
  assert.deepEqual(await dockIds(page), manifests.p3.eventIds);

  let releaseP5Failure;
  const p5FailureReleased = new Promise((resolve) => { releaseP5Failure = resolve; });
  let resolveP5Handled;
  const p5Handled = new Promise((resolve) => { resolveP5Handled = resolve; });
  await page.route('**/data/apush-period-5.json', async (route) => {
    await p5FailureReleased;
    await route.abort('failed');
    resolveP5Handled();
  });
  await page.locator('#periodFilter').selectOption('p5');
  await page.locator('#periodFilter').selectOption('p6');
  await page.waitForFunction(() => window.__apushMap?.getState().periodId === 'p6');
  releaseP5Failure();
  await p5Handled;
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal((await stateOf(page)).periodId, 'p6', 'a stale P5 failure must not replace newer P6 success');
  assert.equal(await error.isHidden(), true, 'a stale failure must not reveal the load error over newer success');
  assert.deepEqual(await dockIds(page), manifests.p6.eventIds);
}

async function verifyRegistryFailureRecovery(page, port, manifests) {
  let registryAttempts = 0;
  await page.route('**/data/apush-period-registry.json', async (route) => {
    registryAttempts += 1;
    if (registryAttempts === 1) await route.abort('failed');
    else await route.continue();
  });
  const response = await page.goto(pageUrl(port, 'a'), { waitUntil: 'networkidle' });
  required(response?.ok(), 'page must remain available when the registry request fails');
  const error = page.locator('#loadError:not([hidden])');
  await error.waitFor();
  assert.equal(await page.locator('#periodFilter option').count(), 0, 'failed registry load must not invent period options');
  assert.equal(await page.locator('#periodFilter').isDisabled(), true, 'selector with no registry options must be disabled');
  await page.locator('#retryLoad').click();
  await page.waitForFunction(() => window.__apushMap?.getState().periodId === 'p1');
  assert.equal(registryAttempts, 2, 'Retry must fetch the failed registry again');
  assert.equal(await page.locator('#periodFilter option').count(), 9, 'registry retry must populate all Period options');
  assert.equal(await page.locator('#periodFilter').isEnabled(), true, 'successful registry retry must re-enable the Period selector');
  await selectPeriod(page, 'p2');
  assert.deepEqual(await dockIds(page), manifests.p2.eventIds, 'selector must be switchable after registry recovery');
}

async function firstRenderedMarker(page, eventId) {
  const markers = page.locator(`#mapPanel [data-event-id="${eventId}"]`);
  const count = await markers.count();
  required(count > 0, `rendered map must expose a marker for ${eventId}`);
  return markers.first();
}

async function verifyFilterSelectionFlow(page, port, layout, events) {
  await loadPrototype(page, port, layout);
  await (await firstRenderedMarker(page, 'columbian-exchange')).click();
  assert.equal((await stateOf(page)).selectedEventId, 'columbian-exchange',
    `${layout}: fixture selection must start on Columbian Exchange`);
  await page.locator('#searchInput').fill('Columbian Exchange');
  await assertTimelineDock(page, await visibleEvents(page, events));
  assert.equal((await stateOf(page)).selectedEventId, 'columbian-exchange',
    `${layout}: filtering must retain a selected event while it remains visible`);
  assert.equal(await page.locator('#timelineMount [data-event-id="columbian-exchange"]').getAttribute('aria-current'), 'step',
    `${layout}: a selected event retained by filtering must remain the current Dock node`);
  await page.locator('#searchInput').fill('Spanish Labor and Caste Systems');
  const filtered = await stateOf(page);
  assert.deepEqual(filtered.visibleEventIds, ['spanish-labor-caste'], `${layout}: fixture filter must leave one visible event`);
  await assertTimelineDock(page, await visibleEvents(page, events));
  assert.equal(filtered.selectedEventId, null, `${layout}: filtering must clear a selection that is no longer visible`);
  assert.equal(await page.locator('#timelineMount [aria-current="step"]').count(), 0,
    `${layout}: filtering out the selected event must leave no current Dock node`);
  const emptyCopy = await page.locator('#detailPanel').innerText();
  assert.match(emptyCopy, /Period 1/,
    `${layout}: cleared selection must identify the active period`);
  assert.match(emptyCopy, /地图上的编号|底部时间线/,
    `${layout}: cleared selection must invite selection from either the map or Dock`);
  assert.doesNotMatch(emptyCopy, /所有事件.*地图|每个事件.*地图/,
    `${layout}: empty copy must not claim that all events have markers`);
}

async function verifyNoResultsUi(page, port, layout, manifestIds, events) {
  await loadPrototype(page, port, layout);
  const query = 'no-such-period-1-event';
  await page.locator('#searchInput').fill(query);
  assert.deepEqual((await stateOf(page)).visibleEventIds, [], `${layout}: no-match query must produce zero results`);
  await assertTimelineDock(page, []);
  const noResults = page.locator('#noResults:not([hidden])');
  assert.equal(await noResults.count(), 1, `${layout}: zero results must show one in-context empty state`);
  assert.match(await noResults.innerText(), new RegExp(query), `${layout}: no-results state must display the current query`);
  const clear = noResults.locator('button');
  assert.equal(await clear.count(), 1, `${layout}: no-results state must expose one clear-filters button`);
  await clear.click();
  const restored = await stateOf(page);
  assert.equal(restored.query, '', `${layout}: in-context clear must clear the query`);
  assert.deepEqual(restored.visibleEventIds, manifestIds, `${layout}: in-context clear must restore all events`);
  await assertTimelineDock(page, events);
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
  await assertTimelineDock(page, events);
  for (const event of events) {
    await (await firstRenderedMarker(page, event.id)).press('Enter');
    assert.equal((await stateOf(page)).selectedEventId, event.id, `${layout}: rendered marker must select ${event.id}`);
    const detail = await page.locator('#detailPanel').innerText();
    required(detail.includes(event.titleZh) && detail.includes(event.summary),
      `${layout}: rendered marker must show compact Chinese detail for ${event.id}`);
    const stop = page.locator(`#timelineMount [data-event-id="${event.id}"]`);
    assert.equal(await stop.count(), 1, `${layout}: Dock must expose exactly one stop for ${event.id}`);
    await stop.click();
    assert.equal((await stateOf(page)).selectedEventId, event.id, `${layout}: Dock click must select ${event.id}`);
  }
}

async function verifyTimelineDockSync(page, port, layout, events) {
  await loadPrototype(page, port, layout);
  await assertTimelineDock(page, events);
  await (await firstRenderedMarker(page, 'columbian-exchange')).click();
  const selectedDockNode = page.locator('#timelineMount [data-event-id="columbian-exchange"]');
  assert.equal(await selectedDockNode.getAttribute('aria-current'), 'step',
    `${layout}: marker selection must set the matching Dock node aria-current=step`);
  const currentCue = selectedDockNode.locator('.timeline-current-cue');
  assert.equal(await currentCue.count(), 1, `${layout}: selected Dock node must expose one visible current-state cue`);
  required(await currentCue.isVisible(), `${layout}: selected Dock current-state cue must be visible`);
  assert.equal(await currentCue.getAttribute('aria-hidden'), 'true',
    `${layout}: visual current-state cue must not pollute the button accessible name`);
  assert.match(await currentCue.innerText(), /当前/, `${layout}: visual cue must explicitly identify the current event`);

  const conquest = events.find((event) => event.id === 'conquest-mexica');
  required(conquest, 'dataset must provide the conquest-mexica Dock fixture');
  await page.locator('#timelineMount [data-event-id="conquest-mexica"]').click();
  assert.equal((await stateOf(page)).selectedEventId, 'conquest-mexica',
    `${layout}: Dock selection must update __apushMap selectedEventId`);
  required(await (await firstRenderedMarker(page, 'conquest-mexica')).evaluate((marker) => marker.classList.contains('is-selected')),
    `${layout}: Dock selection must mark the matching map marker as selected`);
  const detail = await page.locator('#detailPanel').innerText();
  required(detail.includes(conquest.titleZh) && detail.includes(conquest.summary),
    `${layout}: Dock selection must update the compact detail panel for conquest-mexica`);
}

async function verifyKeyboardAndDragControls(page, port, events) {
  await loadPrototype(page, port, 'a');
  await assertTimelineDock(page, events);
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
  await (await controlLocator(page, /zoom in|放大/i)).click();
  assert.notDeepEqual((await stateOf(page)).mapTransform, beforeDrag.mapTransform,
    'zoom control must change mapTransform after the Dock is present');
  await page.locator('[data-map-control="reset"]').click();

  await loadPrototype(page, port, 'a');
  await assertTimelineDock(page, events);
  const enterStop = page.locator('#timelineMount [data-event-id="conquest-mexica"]');
  assert.equal(await enterStop.count(), 1, 'Dock must expose the Enter fixture');
  await enterStop.press('Enter');
  assert.equal((await stateOf(page)).selectedEventId, 'conquest-mexica', 'timeline Enter must select its event');
  const spaceStop = page.locator('#timelineMount [data-event-id="conquest-inca"]');
  assert.equal(await spaceStop.count(), 1, 'Dock must expose the Space fixture');
  await spaceStop.press('Space');
  assert.equal((await stateOf(page)).selectedEventId, 'conquest-inca', 'timeline Space must select its event');
  const clickStop = page.locator('#timelineMount [data-event-id="st-augustine-borderlands"]');
  assert.equal(await clickStop.count(), 1, 'Dock must expose the click fixture');
  await clickStop.click();
  assert.equal((await stateOf(page)).selectedEventId, 'st-augustine-borderlands', 'timeline click must select its event');
}

async function verifyReducedMotion(page, port, datasets) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loadPrototype(page, port, 'a');
  await selectPeriod(page, 'p9');
  const transition = await page.locator('.map-geography path').first().evaluate((path) => ({
    duration: getComputedStyle(path).transitionDuration,
    property: getComputedStyle(path).transitionProperty,
  }));
  assert.equal(transition.duration, '0s', `reduced motion must disable geography transitions: ${JSON.stringify(transition)}`);
  await page.evaluate(() => {
    window.__dockScrollBehavior = null;
    const track = document.querySelector('#timelineMount .timeline-track');
    track.scrollLeft = 0;
    track.scrollTo = function scrollTo(options) {
      window.__dockScrollBehavior = options?.behavior;
      this.scrollLeft = options?.left || 0;
    };
  });
  await page.evaluate((eventId) => window.__apushMap.selectEvent(eventId), datasets.p9.events.at(-1).id);
  assert.equal(await page.evaluate(() => window.__dockScrollBehavior), 'auto',
    'reduced motion must make Dock selection scroll without smooth animation');
}

async function verifyDockOwnsSelectionScrolling(page, port) {
  await page.setViewportSize({ width: 1024, height: 600 });
  await loadPrototype(page, port, 'a');
  const before = await page.evaluate(() => {
    window.scrollTo(0, 0);
    const track = document.querySelector('#timelineMount .timeline-track');
    track.scrollLeft = 0;
    return { scrollY: window.scrollY, trackLeft: track.scrollLeft };
  });
  await (await firstRenderedMarker(page, 'st-augustine-borderlands')).evaluate((marker) => {
    marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForFunction(() => document.querySelector('#timelineMount .timeline-track').scrollLeft > 0);
  const after = await page.evaluate(() => ({
    scrollY: window.scrollY,
    trackLeft: document.querySelector('#timelineMount .timeline-track').scrollLeft,
  }));
  assert.equal(after.scrollY, before.scrollY,
    'marker selection must not move the document when the selected Dock node is offscreen');
  required(after.trackLeft > before.trackLeft,
    `marker selection must move only the Timeline Dock track when its node is outside the track viewport: ${JSON.stringify({ before, after })}`);
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

async function assertSelectedDockCue(page, eventId, context) {
  const stop = page.locator(`#timelineMount [data-event-id="${eventId}"]`);
  assert.equal(await stop.getAttribute('aria-current'), 'step', `${context}: selected Dock stop must expose aria-current=step`);
  const cue = stop.locator('.timeline-current-cue');
  required(await cue.isVisible(), `${context}: selected Dock stop must expose a visible current cue`);
  assert.match(await cue.innerText(), /当前/, `${context}: selected Dock cue must say 当前`);
}

async function assertMapInteractionsAfterSwitch(page, dataset, context) {
  const geographic = dataset.events.filter((event) => event.primarySiteId !== null);
  required(geographic.length >= 2, `${context}: fixture must provide two geographic events`);
  await (await firstRenderedMarker(page, geographic[0].id)).press('Enter');
  assert.equal((await stateOf(page)).selectedEventId, geographic[0].id, `${context}: marker Enter must select after switching`);
  await (await firstRenderedMarker(page, geographic[1].id)).press('Space');
  assert.equal((await stateOf(page)).selectedEventId, geographic[1].id, `${context}: marker Space must select after switching`);

  await page.evaluate(() => window.__apushMap.resetMap());
  const before = (await stateOf(page)).mapTransform;
  const mapBox = await page.locator('#historyMap').boundingBox();
  required(mapBox, `${context}: map must expose a drag target`);
  const startX = mapBox.x + mapBox.width * 0.78;
  const startY = mapBox.y + mapBox.height * 0.78;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 45, startY + 24, { steps: 3 });
  await page.mouse.up();
  assert.notDeepEqual((await stateOf(page)).mapTransform, before, `${context}: pointer drag must change mapTransform`);
  await page.locator('[data-map-control="reset"]').click();
  assert.deepEqual((await stateOf(page)).mapTransform, before, `${context}: reset must restore overview after drag`);
  await page.locator('[data-map-control="zoom-in"]').click();
  assert.notDeepEqual((await stateOf(page)).mapTransform, before, `${context}: zoom must change mapTransform`);
  await page.locator('[data-map-control="reset"]').click();
}

async function assertDockKeyboardAfterSwitch(page, dataset, context) {
  const [enterEvent, spaceEvent] = dataset.events;
  const enterStop = page.locator(`#timelineMount [data-event-id="${enterEvent.id}"]`);
  await enterStop.press('Enter');
  assert.equal((await stateOf(page)).selectedEventId, enterEvent.id, `${context}: Dock Enter must select after switching`);
  await assertSelectedDockCue(page, enterEvent.id, context);
  const spaceStop = page.locator(`#timelineMount [data-event-id="${spaceEvent.id}"]`);
  await spaceStop.press('Space');
  assert.equal((await stateOf(page)).selectedEventId, spaceEvent.id, `${context}: Dock Space must select after switching`);
  await assertSelectedDockCue(page, spaceEvent.id, context);

  const lastEvent = dataset.events.at(-1);
  const beforeScroll = await page.evaluate(() => {
    const track = document.querySelector('#timelineMount .timeline-track');
    track.scrollLeft = 0;
    return { windowY: window.scrollY, trackLeft: track.scrollLeft, overflow: track.scrollWidth > track.clientWidth };
  });
  await page.evaluate((eventId) => window.__apushMap.selectEvent(eventId), lastEvent.id);
  if (beforeScroll.overflow) {
    await page.waitForFunction(() => document.querySelector('#timelineMount .timeline-track').scrollLeft > 0);
  }
  const afterScroll = await page.evaluate(() => ({
    windowY: window.scrollY,
    trackLeft: document.querySelector('#timelineMount .timeline-track').scrollLeft,
  }));
  assert.equal(afterScroll.windowY, beforeScroll.windowY, `${context}: Dock selection must not scroll the document`);
  if (beforeScroll.overflow) required(afterScroll.trackLeft > beforeScroll.trackLeft, `${context}: only the Dock track must scroll`);
}

async function verifyFullPeriodViewport(page, port, layout, viewport, registry, datasets, manifests) {
  const errors = [];
  const onPageError = (error) => errors.push(`pageerror: ${error.message}`);
  const onConsole = (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  await page.setViewportSize(viewport);
  await loadPrototype(page, port, layout);
  try {
    for (const periodId of ['p1', 'p5', 'p9']) {
      const period = registry.periods.find(({ id }) => id === periodId);
      if ((await stateOf(page)).periodId !== periodId) await selectPeriod(page, periodId);
      const context = `${layout} ${periodId} ${viewport.width}x${viewport.height}`;
      const dataset = datasets[periodId];
      assert.deepEqual((await stateOf(page)).visibleEventIds, manifests[periodId].eventIds,
        `${context}: visible events must preserve manifest order`);
      assert.equal(await page.locator('#resultCount').innerText(), `${dataset.events.length} / ${dataset.events.length} 事件`);
      assert.equal(await page.locator('#mapPanel').getAttribute('aria-label'), `${period.labelEn} 互动地图`);
      await assertTimelineDock(page, dataset.events, period.labelEn);
      await assertTimelineDockGeometry(page, viewport);
      await assertHitTargets(page);
      await assertDockKeyboardAfterSwitch(page, dataset, context);
      await assertMapInteractionsAfterSwitch(page, dataset, context);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true,
        `${context}: document must not overflow horizontally`);
    }
    await assertNoConsoleOrPageErrors(errors);
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
  }
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
  assert.equal(initial.layout, 'dock', 'legacy layout query values must resolve to the one canonical Dock UI');
  assert.deepEqual(initial.visibleEventIds, manifestIds, 'initial visible events must exactly match manifest order');
  await assertStateCopies(page);
  await assertPublicApi(page, manifestIds, events);
  await assertTimelineDock(page, events);
  assert.equal(await page.locator('#prototypeLabel').innerText(), 'Timeline Dock Preview',
    'the visible prototype label must present the unified Timeline Dock rather than a compatibility layout');
  await assertTimelineDockGeometry(page, viewport);

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
  await assertTimelineDock(page, await visibleEvents(page, events));
  await page.locator('#clearFilters').click();
  assert.deepEqual((await stateOf(page)).visibleEventIds, manifestIds, 'clearing filters must restore all nine events');
  await assertTimelineDock(page, events);

  await page.locator('#searchInput').fill('Columbian Exchange');
  const afterSearch = await stateOf(page);
  required(afterSearch.visibleEventIds.includes('columbian-exchange'), 'search must return Columbian Exchange');
  await assertTimelineDock(page, await visibleEvents(page, events));
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
    required(detail.includes(event.titleZh) && detail.includes(event.summary), `detail panel must show compact Chinese content for ${event.id}`);
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

async function verifyCompactGeographicCard(page, port, datasets) {
  await loadPrototype(page, port, 'a');
  const event = datasets.p1.events.find(({ id }) => id === 'columbian-exchange');
  required(event?.primarySiteId, 'P1 geographic compact-card fixture must have a primary site');
  const primarySite = datasets.p1.sites.find(({ id }) => id === event.primarySiteId);
  required(primarySite, 'P1 geographic compact-card fixture must resolve its primary site');
  const before = (await stateOf(page)).mapTransform;
  await page.locator(`#timelineMount [data-event-id="${event.id}"]`).click();
  await assertCompactCard(page, event);
  assert.match(await page.locator('#detailPanel .detail-kicker').innerText(), new RegExp(escapeRegex(primarySite.nameZh)),
    'geographic compact card must identify the primary place in Chinese');
  assert.notDeepEqual((await stateOf(page)).mapTransform, before,
    'geographic Dock selection must focus the primary marker');
  const primaryMarker = page.locator(`.event-marker[data-event-id="${event.id}"][data-site-x="${primarySite.x}"][data-site-y="${primarySite.y}"]`);
  assert.equal(await primaryMarker.count(), 1, 'geographic event must expose exactly one matching primary marker');
  required(await primaryMarker.evaluate((marker) => marker.classList.contains('is-selected')),
    'geographic Dock selection must select its matching marker');
  await primaryMarker.click();
  assert.equal(await page.locator(`#timelineMount [data-event-id="${event.id}"]`).getAttribute('aria-current'), 'step',
    'geographic marker selection must synchronize back to the Dock');
}

async function verifyDockOnlyEvents(page, port, registry, datasets) {
  await loadPrototype(page, port, 'a');
  for (const period of registry.periods) {
    const event = datasets[period.id].events.find(({ primarySiteId }) => primarySiteId === null);
    if (!event) continue;
    await page.locator('#periodFilter').selectOption(period.id);
    await page.waitForFunction((id) => window.__apushMap?.getState().periodId === id, period.id);
    const before = (await stateOf(page)).mapTransform;
    const stop = page.locator(`#timelineMount [data-event-id="${event.id}"]`);
    await stop.click();
    const after = await stateOf(page);
    assert.equal(after.selectedEventId, event.id, `${period.id}: Dock-only event must become selected`);
    assert.deepEqual(after.mapTransform, before, `${period.id}: Dock-only event must not recenter the map`);
    assert.equal(await page.locator(`.event-marker[data-event-id="${event.id}"]`).count(), 0,
      `${period.id}: Dock-only event must not receive a fabricated marker`);
    assert.equal(await stop.getAttribute('aria-current'), 'step', `${period.id}: Dock-only stop must be current`);
    required(await stop.locator('.timeline-current-cue').isVisible(), `${period.id}: Dock-only stop must show its current cue`);
    await assertCompactCard(page, event, { scopeCue: true });
  }
}

async function verifyAllGeographicEvents(page, port, registry, datasets) {
  await loadPrototype(page, port, 'a');
  for (const period of registry.periods) {
    await page.locator('#periodFilter').selectOption(period.id);
    await page.waitForFunction((id) => window.__apushMap?.getState().periodId === id, period.id);
    const geographicEvents = datasets[period.id].events.filter(({ primarySiteId }) => primarySiteId !== null);
    for (const [eventIndex, event] of geographicEvents.entries()) {
      await page.evaluate(() => window.__apushMap.resetMap());
      const primarySite = datasets[period.id].sites.find(({ id }) => id === event.primarySiteId);
      required(primarySite, `${period.id}: ${event.id} must resolve its primary site fixture`);
      const primaryMarker = page.locator(`.event-marker[data-event-id="${event.id}"][data-site-x="${primarySite.x}"][data-site-y="${primarySite.y}"]`);
      assert.equal(await primaryMarker.count(), 1,
        `${period.id}: ${event.id} must expose exactly one marker at its primary-site coordinates`);
      await primaryMarker.dispatchEvent('click');
      assert.equal((await stateOf(page)).selectedEventId, event.id,
        `${period.id}: clicking the primary marker must select ${event.id}`);
      assert.equal(await page.locator(`#timelineMount [data-event-id="${event.id}"]`).getAttribute('aria-current'), 'step',
        `${period.id}: primary-marker selection must synchronize ${event.id} to the Dock`);
      if (eventIndex === 0) {
        assert.match(await page.locator('#detailPanel .detail-kicker').innerText(), new RegExp(escapeRegex(primarySite.nameZh)),
          `${period.id}: compact card must show the selected event's primary place in Chinese`);
      }
    }
  }
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
  const [registry, playwright] = await Promise.all([
    readJson(REGISTRY_FILE),
    discoverPlaywright(),
  ]);
  const periodFixtures = await Promise.all(registry.periods.map(async (period) => ({
    period,
    data: await readJson(join(PROJECT_ROOT, period.dataPath)),
    manifest: await readJson(join(PROJECT_ROOT, period.manifestPath)),
  })));
  const datasets = Object.fromEntries(periodFixtures.map(({ period, data: periodData }) => [period.id, periodData]));
  const manifests = Object.fromEntries(periodFixtures.map(({ period, manifest: periodManifest }) => [period.id, periodManifest]));
  const data = datasets.p1;
  const manifest = manifests.p1;
  const browserPath = await discoverChromium(playwright.chromium);
  const server = startServer();
  let browser;
  let port;
  try {
    port = await server.listen();
    browser = await playwright.chromium.launch({ executablePath: browserPath, headless: true });
    for (const [label, verify] of [
      ['all-period switching', (page) => verifyAllPeriodSwitching(page, port, registry, datasets, manifests)],
      ['stale period requests', (page) => verifyStalePeriodRequests(page, port, manifests)],
      ['period failure recovery', (page) => verifyPeriodFailureRecovery(page, port, manifests)],
      ['registry failure recovery', (page) => verifyRegistryFailureRecovery(page, port, manifests)],
    ]) {
      const periodPage = await browser.newPage({ viewport: REQUIRED_VIEWPORTS[0] });
      try {
        await verify(periodPage);
      } catch (error) {
        throw new Error(`${label}: ${error.message}`);
      } finally {
        await periodPage.close();
      }
    }
    for (const [index, viewport] of REQUIRED_VIEWPORTS.entries()) {
      const layout = LAYOUTS[index % LAYOUTS.length];
      const page = await browser.newPage({ viewport });
      try {
        await verifyFullPeriodViewport(page, port, layout, viewport, registry, datasets, manifests);
      } finally {
        await page.close();
      }
    }

    const regressionErrors = [];

    for (const layout of LAYOUTS) {
      for (const [label, verify] of [
        ['filter selection flow', (page) => verifyFilterSelectionFlow(page, port, layout, data.events)],
        ['no-results UI', (page) => verifyNoResultsUi(page, port, layout, manifest.eventIds, data.events)],
        ['clear restores overview', (page) => verifyClearRestoresOverview(page, port, layout, manifest.eventIds)],
        ['rendered manifest controls', (page) => verifyRenderedManifestControls(page, port, layout, data.events)],
        ['timeline Dock sync', (page) => verifyTimelineDockSync(page, port, layout, data.events)],
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
      ['keyboard and drag controls', (page) => verifyKeyboardAndDragControls(page, port, data.events)],
      ['reduced motion', (page) => verifyReducedMotion(page, port, datasets)],
      ['Dock-local selection scrolling', (page) => verifyDockOwnsSelectionScrolling(page, port)],
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
      ['compact geographic card', (page, activePort) => verifyCompactGeographicCard(page, activePort, datasets)],
      ['Dock-only events', (page, activePort) => verifyDockOnlyEvents(page, activePort, registry, datasets)],
      ['all geographic events', (page, activePort) => verifyAllGeographicEvents(page, activePort, registry, datasets)],
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

    server.setInvalidDatasetRequests(1, registry.periods[0].dataPath);
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
