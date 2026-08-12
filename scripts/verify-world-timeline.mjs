import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE_FILE = join(PROJECT_ROOT, 'world-map.html');
const MIME_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
});

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
  const candidates = [process.env.WORLD_PLAYWRIGHT_PATH];
  try { candidates.push(require.resolve('playwright')); } catch {}
  candidates.push(
    join(codexRuntime, 'dependencies/node/node_modules/playwright/index.mjs'),
    join(homedir(), '.codex/plugins/cache/openai-primary-runtime/node_modules/playwright'),
    '/opt/codex/primary-runtime/node_modules/playwright',
    process.env.HOME && join(process.env.HOME, '.cache/ms-playwright/node_modules/playwright'),
    process.env.HOME && join(process.env.HOME, 'Library/Caches/ms-playwright/node_modules/playwright'),
    process.env.HOME && join(process.env.HOME, '.npm/_npx/node_modules/playwright'),
  );
  const module = await importFirst(candidates);
  if (!module.chromium) throw new Error('Discovered Playwright does not export chromium');
  return module;
}

async function discoverChromium(chromium) {
  const candidates = [
    process.env.WORLD_BROWSER_PATH,
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

function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, 'http://127.0.0.1');
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

async function expectVisible(locator, message) {
  assert.ok(await locator.isVisible(), message);
}

async function verifyTimeline(page, port) {
  const response = await page.goto(`http://127.0.0.1:${port}/world-map.html`, { waitUntil: 'networkidle' });
  assert.ok(response?.ok(), `world-map.html is unavailable (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__mapFilter), undefined, { timeout: 8_000 });
  await page.locator('[data-learning-view="map"]').click();
  await page.evaluate(() => window.__mapFilter.setPeriod(''));

  const initialState = await page.evaluate(() => window.getTimelineState());
  assert.equal(initialState.mappingMode, 'explicit', 'Timeline Units must come from a literal reviewed mapping');
  assert.equal(initialState.unmappedEventKeys.length, 0, 'every in-scope event must have an explicit Unit mapping');
  assert.ok(initialState.excludedPre1200Count > 0, 'pre-1200 source records must be explicitly excluded from Timeline');
  assert.equal(initialState.anchorlessRecordCount, 0, 'current AP World source data has no anchorless records');
  assert.equal(initialState.anchorlessSupported, false, 'API must document the current anchorless-data limitation');
  assert.ok(initialState.visibleEvents.every((event) => event.sortYear >= 1200), 'Timeline must exclude every pre-1200 event');
  assert.ok(initialState.visibleEvents.every((event) => /[A-Za-z]/.test(event.titleEn)), 'every explicit English title must contain Latin text');
  assert.ok(initialState.visibleEvents.every((event) => /[\u3400-\u9fff]/.test(event.titleZh)), 'every explicit Chinese title must contain Chinese text');
  const multiRegionEvent = initialState.visibleEvents.find((event) => new Set(event.anchors.map((anchor) => anchor.region)).size > 1);
  assert.ok(multiRegionEvent, 'explicit mapping must consolidate a real multi-region event into one card');
  const scopedRegion = multiRegionEvent.anchors[0].region;
  await page.evaluate(({ key, region }) => {
    window.__mapFilter.setPeriod('');
    document.querySelector(`.region-path[data-region="${region}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    window.selectTimelineEvent(key);
  }, { key: multiRegionEvent.key, region: scopedRegion });
  const selectedRegions = await page.evaluate(() => [...document.querySelectorAll('.pin-group.timeline-selected')].map((group) => group.dataset.region));
  assert.ok(selectedRegions.length > 0, 'scoped multi-anchor selection must reveal an in-scope pin');
  assert.ok(selectedRegions.every((region) => region === scopedRegion), 'scoped multi-anchor selection must not reveal pins from other regions');
  await page.evaluate((region) => document.querySelector(`.region-path[data-region="${region}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })), scopedRegion);

  const middlePassageKey = multiRegionEvent.key;
  for (const expected of [
    { pin: '59', region: 'americas', city: 'Bridgetown' },
    { pin: '99', region: 'africa', city: 'Goree Island' },
  ]) {
    await page.evaluate(({ pin, region }) => window.__mapFilter.openHit(pin, region), expected);
    const anchorSelection = await page.evaluate((key) => {
      const state = window.getTimelineState();
      const card = document.querySelector(`.world-timeline-card[data-event-key="${CSS.escape(key)}"]`);
      return {
        selectedEventKey: state.selectedEventKey,
        selectedAnchor: state.selectedAnchor,
        cardPin: card?.dataset.pin,
        cardRegion: card?.dataset.region,
        detail: document.querySelector('#eventPanel')?.innerText,
      };
    }, middlePassageKey);
    assert.equal(anchorSelection.selectedEventKey, middlePassageKey, `pin ${expected.pin} must select the shared Middle Passage card`);
    assert.deepEqual(anchorSelection.selectedAnchor, { num: expected.pin, region: expected.region }, `pin ${expected.pin} must remain the preferred anchor`);
    assert.equal(anchorSelection.cardPin, expected.pin, 'current card metadata must expose the triggering pin');
    assert.equal(anchorSelection.cardRegion, expected.region, 'current card metadata must expose the triggering region');
    assert.ok(anchorSelection.detail.includes(expected.city), `details must use the ${expected.city} source record`);
  }

  await page.evaluate((key) => {
    document.querySelector('.region-path[data-region="americas"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector(`.world-timeline-card[data-event-key="${CSS.escape(key)}"]`).click();
  }, middlePassageKey);
  const scopedCardSelection = await page.evaluate(() => ({
    anchor: window.getTimelineState().selectedAnchor,
    detail: document.querySelector('#eventPanel').innerText,
  }));
  assert.deepEqual(scopedCardSelection.anchor, { num: '59', region: 'americas' }, 'card activation under a region filter must prefer that scope anchor');
  assert.ok(scopedCardSelection.detail.includes('Bridgetown'), 'scoped card details must use the in-scope anchor content');
  await page.evaluate(() => document.querySelector('.region-path[data-region="americas"]').dispatchEvent(new MouseEvent('click', { bubbles: true })));

  await page.evaluate(() => window.__mapFilter.setQuery('Bridgetown'));
  const filteredAnchorSelection = await page.evaluate((key) => {
    const state = window.getTimelineState();
    const event = state.visibleEvents.find((item) => item.key === key);
    const card = document.querySelector(`.world-timeline-card[data-event-key="${CSS.escape(key)}"]`);
    return {
      selectedAnchor: state.selectedAnchor,
      visibleAnchors: event?.visibleAnchors,
      cardPin: card?.dataset.pin,
      detail: document.querySelector('#eventPanel').innerText,
      revealedPins: [...document.querySelectorAll('.pin-group.revealed')]
        .map((group) => group.querySelector('text')?.textContent.trim()),
    };
  }, middlePassageKey);
  assert.deepEqual(filteredAnchorSelection.visibleAnchors, [{ num: '59', region: 'americas' }], 'query must retain only matching anchors for a shared event');
  assert.deepEqual(filteredAnchorSelection.selectedAnchor, { num: '59', region: 'americas' }, 'query must select the sole visible anchor');
  assert.equal(filteredAnchorSelection.cardPin, '59', 'filtered card metadata must use the matching anchor');
  assert.ok(filteredAnchorSelection.detail.includes('Bridgetown'), 'filtered details must use the matching anchor record');
  assert.ok(filteredAnchorSelection.revealedPins.includes('59'), 'matching anchor must remain revealed');
  assert.ok(!filteredAnchorSelection.revealedPins.includes('39') && !filteredAnchorSelection.revealedPins.includes('99'), 'selection must not restore filtered-out anchors');

  await page.evaluate(() => window.__mapFilter.reset());
  assert.equal(await page.locator('#periodFilter').inputValue(), 'u1', 'reset returns the student experience to Unit 1');
  await page.evaluate(() => window.__mapFilter.setPeriod(''));
  const restoredAnchors = await page.evaluate((key) => window.getTimelineState().visibleEvents
    .find((event) => event.key === key)?.visibleAnchors.map((anchor) => anchor.num).sort(), middlePassageKey);
  assert.deepEqual(restoredAnchors, ['39', '59', '99'], 'reset must restore every anchor for the shared event');

  const dock = page.locator('#worldTimelineDock');
  assert.equal(await dock.count(), 1, 'AP World must expose exactly one #worldTimelineDock');
  await expectVisible(dock, 'AP World card Timeline must be visible');
  const track = dock.locator('.world-timeline-track');
  assert.equal(await track.count(), 1, 'Timeline Dock must expose exactly one track');
  await expectVisible(track, 'AP World Timeline track must be visible');

  const periods = (await page.evaluate(() => window.__mapFilter.getPeriodOptions())).filter(({ value }) => value);
  assert.equal(periods.length, 9, 'AP World Timeline must cover the nine non-empty Unit options');
  assert.deepEqual(periods.map(({ label }) => label.replace(/\s*\(\d+\)$/, '')), [
    'Unit 1 · The Global Tapestry', 'Unit 2 · Networks of Exchange',
    'Unit 3 · Land-Based Empires', 'Unit 4 · Transoceanic Interconnections',
    'Unit 5 · Revolutions', 'Unit 6 · Consequences of Industrialization',
    'Unit 7 · Global Conflict', 'Unit 8 · Cold War and Decolonization', 'Unit 9 · Globalization',
  ], 'Unit options must expose the reviewed College Board Unit names');
  let richestPeriod = null;
  for (const period of periods) {
    await page.evaluate((id) => window.__mapFilter.setPeriod(id), period.value);
    const cards = dock.locator('button.world-timeline-card[data-event-key]');
    const count = await cards.count();
    assert.ok(count > 0, `${period.value} must render Timeline cards`);
    for (let index = 0; index < count; index += 1) {
      const card = cards.nth(index);
      for (const [selector, label] of [
        ['.world-timeline-date', 'date'],
        ['.world-timeline-title-en', 'English title'],
        ['.world-timeline-title-zh', 'Chinese title'],
      ]) {
        const field = card.locator(selector);
        assert.equal(await field.count(), 1, `${period.value} card ${index} must expose exactly one ${label}`);
        assert.ok((await field.innerText()).trim(), `${period.value} card ${index} must expose a non-empty ${label}`);
      }
      assert.ok((await card.getAttribute('aria-label'))?.trim(), `${period.value} card ${index} must have an accessible name`);
      const box = await card.boundingBox();
      assert.ok(box && box.height >= 44,
        `${period.value} card ${index} must be at least 44px high (got ${box?.height})`);
    }
    if (!richestPeriod || count > richestPeriod.count) richestPeriod = { id: period.value, count };
  }

  assert.ok(richestPeriod?.count >= 2, 'at least one Unit must expose two Timeline cards for interaction checks');
  await page.evaluate((id) => window.__mapFilter.setPeriod(id), richestPeriod.id);
  const cards = dock.locator('button.world-timeline-card[data-event-key]');
  await cards.nth(0).click();
  const detailBefore = (await page.locator('#eventPanel').innerText()).trim();
  const selectedCard = {
    eventKey: await cards.nth(1).getAttribute('data-event-key'),
    date: (await cards.nth(1).locator('.world-timeline-date').innerText()).trim(),
    titleEn: (await cards.nth(1).locator('.world-timeline-title-en').innerText()).trim(),
    titleZh: (await cards.nth(1).locator('.world-timeline-title-zh').innerText()).trim(),
  };
  await cards.nth(1).click();
  assert.equal(await cards.nth(1).getAttribute('aria-current'), 'step', 'clicked card must become current');
  assert.equal(await dock.locator('.world-timeline-card[aria-current="step"]').count(), 1, 'exactly one non-empty Timeline card must be current');
  const detailAfter = (await page.locator('#eventPanel').innerText()).trim();
  assert.notEqual(detailAfter, detailBefore,
    `clicking Timeline card ${selectedCard.eventKey} must replace the previous event details`);
  assert.ok(detailAfter.includes(selectedCard.date),
    `details for ${selectedCard.eventKey} must include its visible date "${selectedCard.date}"`);
  assert.ok(detailAfter.includes(selectedCard.titleEn) || detailAfter.includes(selectedCard.titleZh),
    `details for ${selectedCard.eventKey} must include its visible English or Chinese title`);

  const searchable = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.world-timeline-card')];
    const counts = new Map(all.map((card) => [card.dataset.pin, all.filter((item) => item.dataset.pin === card.dataset.pin).length]));
    const card = all.find((item) => counts.get(item.dataset.pin) > 1 && item.querySelector('.world-timeline-title-en')?.textContent.trim().length > 3);
    return card && { key: card.dataset.eventKey, query: card.querySelector('.world-timeline-title-en').textContent.trim() };
  });
  assert.ok(searchable, 'interaction Unit must provide a multi-event pin for exact search-result selection');
  await page.evaluate((query) => window.__mapFilter.setQuery(query), searchable.query);
  const exactResult = page.locator(`.event-card.is-result[data-event-key="${searchable.key}"]`);
  assert.equal(await exactResult.count(), 1, 'search result must carry the exact Timeline event key');
  await exactResult.click();
  assert.equal((await page.evaluate(() => window.getTimelineState())).selectedEventKey, searchable.key,
    'clicking a search result must select that exact event, not the first event at its pin');
  await page.evaluate(() => window.__mapFilter.setQuery(''));

  await cards.nth(0).focus();
  await cards.nth(0).press('ArrowRight');
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.eventKey), await cards.nth(1).getAttribute('data-event-key'));
  await cards.nth(1).press('End');
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.eventKey), await cards.last().getAttribute('data-event-key'));
  await cards.last().press('Home');
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.eventKey), await cards.first().getAttribute('data-event-key'));

  const offscreenTarget = await page.evaluate(() => {
    const track = document.querySelector('.world-timeline-track');
    const allCards = [...document.querySelectorAll('button.world-timeline-card[data-event-key]')];
    track.scrollLeft = 0;
    const pinCounts = new Map(allCards.map((card) => [card.dataset.pin, allCards.filter((item) => item.dataset.pin === card.dataset.pin).length]));
    const trackRect = track.getBoundingClientRect();
    const card = [...allCards].reverse().find((item) => pinCounts.get(item.dataset.pin) === 1
      && item.getBoundingClientRect().right > trackRect.right);
    return card && { eventKey: card.dataset.eventKey, pin: card.dataset.pin, region: card.dataset.region };
  });
  assert.ok(offscreenTarget, 'interaction Unit must provide an off-screen map-linked card with a unique pin');
  const before = await page.evaluate(() => ({ scrollY: window.scrollY, trackLeft: document.querySelector('.world-timeline-track').scrollLeft }));
  await page.evaluate(({ pin, region }) => window.__mapFilter.openHit(pin, region), offscreenTarget);
  await page.waitForFunction((eventKey) => document.querySelector(`[data-event-key="${CSS.escape(eventKey)}"]`)?.getAttribute('aria-current') === 'step', offscreenTarget.eventKey);
  const after = await page.evaluate((eventKey) => {
    const track = document.querySelector('.world-timeline-track');
    const selected = document.querySelector(`[data-event-key="${CSS.escape(eventKey)}"]`);
    const trackRect = track.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    return {
      currentCount: document.querySelectorAll('.world-timeline-card[aria-current="step"]').length,
      revealed: selectedRect.left >= trackRect.left && selectedRect.right <= trackRect.right,
      scrollY: window.scrollY,
      trackLeft: track.scrollLeft,
    };
  }, offscreenTarget.eventKey);
  assert.equal(after.currentCount, 1, 'openHit must leave exactly one current Timeline card');
  assert.equal(after.scrollY, before.scrollY, 'openHit must not scroll the document');
  assert.ok(after.trackLeft > before.trackLeft, 'openHit must scroll the Timeline track');
  assert.ok(after.revealed, 'openHit must reveal the selected off-screen Timeline card');
}

async function verifyLearningShell(page, port) {
  await page.goto(`http://127.0.0.1:${port}/world-map.html`);
  await page.waitForFunction(() => window.__mapFilter);
  assert.equal(await page.locator('.learning-view-tab').count(), 3, 'header must expose exactly three learning entries');
  assert.deepEqual(await page.locator('.learning-view-tab').allTextContents(), ['因果链', '地图', '练习']);
  assert.equal((await page.locator('#mapToolbar .mt-field').first().innerText()).split('\n')[0].trim(), 'Unit / 单元');
  assert.equal(await page.locator('#periodFilter').inputValue(), 'u1', 'APWH must open in Unit 1');
  assert.equal(await page.locator('[data-learning-view="chain"]').getAttribute('aria-pressed'), 'true',
    'APWH must open with the causal-chain view selected');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), 'Unit 因果链',
    'initial event region must identify the causal-chain context');
  await expectVisible(page.locator('#mapStudyView'), 'map must be visible alongside the initial causal chain');
  await expectVisible(page.locator('#worldTimelineDock'), 'Timeline Dock must be visible alongside the initial causal chain');
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'), 'Unit 1 causal chain must be visible immediately');
  const desktopMapBox = await page.locator('#mapStudyView').boundingBox();
  const desktopPanelBox = await page.locator('#eventZone').boundingBox();
  assert.ok(desktopMapBox && desktopPanelBox && desktopMapBox.x + desktopMapBox.width <= desktopPanelBox.x + 1,
    'at 900x700, map study view must sit to the left of the event panel');

  await page.locator('[data-learning-view="map"]').click();
  await expectVisible(page.locator('#mapStudyView'), 'map entry must show the map study view');
  await expectVisible(page.locator('#worldTimelineDock'), 'Timeline remains embedded with the map');
  assert.equal(await page.locator('#eventPanel .rt-stops-chain').count(), 0,
    'map entry must remove the causal-chain renderer from the event panel');
  assert.equal(await page.locator('[data-learning-view="map"]').getAttribute('aria-pressed'), 'true',
    'map entry must be marked pressed');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '地图事件详情',
    'map event region must identify ordinary map details');

  await page.locator('[data-learning-view="chain"]').click();
  await page.locator('#periodFilter').selectOption('u4');
  assert.match(await page.locator('#eventPanel').innerText(), /Unit 4|大西洋|Atlantic/i,
    'Unit 4 selection must render Unit 4 Atlantic causal-chain content');

  await page.locator('[data-learning-view="practice"]').click();
  await expectVisible(page.locator('#practiceDrawer'), 'practice opens as a drawer');
  await expectVisible(page.locator('#practiceDrawer .quiz-panel'), 'practice drawer must contain quiz controls');
  await expectVisible(page.locator('#mapStudyView'), 'practice drawer must leave the map visible');
  assert.equal(await page.locator('#practiceDrawer').getAttribute('role'), 'dialog',
    'practice drawer must expose dialog semantics');
  assert.equal(await page.locator('#practiceDrawer').getAttribute('aria-modal'), null,
    'practice drawer must remain non-modal while the map stays available');
  assert.deepEqual(await page.locator('.learning-view-tab[aria-pressed="true"]').allTextContents(), ['练习'],
    'only Practice may remain pressed while its drawer is open');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'practiceDrawerClose',
    'opening Practice must move focus into the drawer');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '练习',
    'practice event region must identify the practice context');
  await page.locator('#practiceDrawerClose').click();
  assert.equal(await page.locator('#practiceDrawer').isVisible(), false, 'practice drawer closes independently');
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.learningView), 'practice',
    'explicitly closing Practice must restore focus to its launcher');
  assert.equal(await page.locator('#periodFilter').inputValue(), 'u4', 'closing practice must preserve Unit 4');
  assert.equal(await page.locator('[data-learning-view="chain"]').getAttribute('aria-pressed'), 'true',
    'closing practice must preserve the causal-chain selection');
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
    'closing practice must restore the Unit 4 causal chain');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), 'Unit 因果链',
    'closing Practice must restore the causal-chain event-region context');

  await page.locator('[data-learning-view="map"]').click();
  await page.locator('#periodFilter').selectOption('u2');
  await page.evaluate(() => window.__mapFilter.enterRoute(window.__mapFilter.getRoutes()[0].id));
  assert.equal(await page.locator('#periodFilter').inputValue(), '',
    'a non-chain trade route must temporarily suspend the Unit filter');
  await page.locator('[data-learning-view="practice"]').click();
  assert.equal(await page.locator('#periodFilter').inputValue(), 'u2',
    'opening Practice from a trade route must restore the selected Unit before rendering practice');
  await page.locator('#practiceDrawerClose').click();
  assert.equal(await page.locator('#periodFilter').inputValue(), 'u2',
    'closing Practice after a trade route must restore the selected Unit');
  assert.equal(await page.locator('[data-learning-view="map"]').getAttribute('aria-pressed'), 'true',
    'closing Practice after a trade route must preserve Map mode');

  await page.locator('[data-learning-view="practice"]').click();
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'practiceDrawerClose',
    'Practice must focus its close control before Escape handling');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#practiceDrawer').isVisible(), false,
    'Escape must close the Practice drawer');
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.learningView), 'practice',
    'Escape must restore focus to the Practice launcher');
  assert.equal(await page.locator('[data-learning-view="map"]').getAttribute('aria-pressed'), 'true',
    'Escape-closing Practice must preserve Map mode');

  await page.setViewportSize({ width: 700, height: 900 });
  const narrowMapBox = await page.locator('#mapStudyView').boundingBox();
  const narrowPanelBox = await page.locator('#eventZone').boundingBox();
  assert.ok(narrowMapBox && narrowPanelBox && narrowPanelBox.y >= narrowMapBox.y + narrowMapBox.height - 1,
    'at 700x900, event panel must stack below the map study view');
}

export async function verifyBrowser() {
  await stat(PAGE_FILE);
  const playwright = await discoverPlaywright();
  const browserPath = await discoverChromium(playwright.chromium);
  const server = startServer();
  let browser;
  try {
    const port = await server.listen();
    browser = await playwright.chromium.launch({ executablePath: browserPath, headless: true });
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    try {
      await verifyTimeline(page, port);
      await verifyLearningShell(page, port);
    } finally {
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  verifyBrowser().then(() => {
    console.log('AP World Timeline browser verification passed');
  }).catch((error) => {
    console.error(`AP World Timeline browser verification failed: ${error.message}`);
    process.exitCode = 1;
  });
}
