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

async function trimmedTexts(locator) {
  return (await locator.allTextContents()).map(text => text.trim());
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
  assert.deepEqual(initialState.duplicateEventKeys, ['6:6'],
    'a record duplicating another must be logged as a duplicate rather than silently dropped');
  const casteCards = initialState.visibleEvents.filter((event) => /caste/i.test(event.titleEn) || /caste/i.test(event.titleZh));
  assert.equal(casteCards.length, 1, 'the duplicated caste-continuity record must yield exactly one Timeline card');
  assert.ok(initialState.excludedPre1200Count > 0, 'pre-1200 source records must be explicitly excluded from Timeline');
  assert.equal(initialState.anchorlessRecordCount, 0, 'current AP World source data has no anchorless records');
  assert.equal(initialState.anchorlessSupported, false, 'API must document the current anchorless-data limitation');
  // Unit 归属按与 1200-1450 的实质重叠判断,不按起始年份:一个始于 1185 的幕府、始于 960 的宋朝,
  // 主体都延续在课程窗口里。所以这里查的是事件的结束年,而不是 sortYear。
  assert.ok(initialState.visibleEvents.every((event) => event.endYear >= 1200), 'Timeline must exclude every event that ends before 1200');
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
  const courseMainline = await page.evaluate(() => window.__mapFilter.getCourseMainline());
  assert.deepEqual(courseMainline.map(segment => ({
    id: segment.id,
    units: segment.units,
    entryUnit: segment.entryUnit,
    from: segment.from,
    toUnit: segment.to?.unit ?? null,
    toChain: segment.to?.chain ?? null,
    pending: segment.pending,
  })), [
    { id: 'u1_main', units: ['u1'], entryUnit: 'u1', from: null, toUnit: 'u2', toChain: 'u23_empires', pending: false },
    { id: 'u23_empires', units: ['u2', 'u3'], entryUnit: 'u2', from: 'u1_main', toUnit: 'u4', toChain: 'u4_atlantic', pending: false },
    { id: 'u4_atlantic', units: ['u4'], entryUnit: 'u4', from: 'u23_empires', toUnit: 'u5', toChain: null, pending: false },
    { id: null, units: ['u5'], entryUnit: 'u5', from: 'u4_atlantic', toUnit: null, toChain: null, pending: true },
  ], 'course mainline must expose the approved handoffs and pending Unit 5 tail');
  assert.ok(courseMainline.filter(segment => !segment.pending)
    .every(segment => segment.tier === 'main' && segment.to?.summary?.trim()),
  'implemented course-mainline segments must be main-tier chains with handoff prose');
  assert.equal(courseMainline.some(segment => segment.id?.includes('_sub_')), false,
    'supplementary chains must not join the course mainline');
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

  await page.evaluate(() => window.__mapFilter.setPeriod('u2'));
  const unit23Seams = page.locator('#eventPanel [data-chain-seam]');
  assert.equal(await unit23Seams.count(), 2,
    'Unit 2→3 main chain must render exactly one incoming and one outgoing cross-unit seam');
  assert.match(await page.locator('#eventPanel [data-chain-seam="from"]').innerText(), /承自\s*UNIT\s*1/i,
    'Unit 2→3 incoming seam must identify Unit 1');
  assert.match(await page.locator('#eventPanel [data-chain-seam="to"]').innerText(), /交棒\s*UNIT\s*4/i,
    'Unit 2→3 outgoing seam must identify Unit 4');
  assert.equal(await page.locator('#eventPanel [data-route-step]').count(), 10,
    'cross-unit seams must not change the Unit 2→3 ring count');

  await page.evaluate(() => window.__mapFilter.enterRoute('u1_sub_syncretism'));
  assert.equal(await page.locator('#eventPanel [data-chain-seam]').count(), 0,
    'supplementary chains must not render cross-unit seams');

  await page.evaluate(() => window.__mapFilter.enterRoute('u23_empires'));
  await page.locator('#eventPanel [data-chain-seam="from"] [data-chain-boundary]').click();
  const incomingBoundaryState = await page.evaluate(() => ({
    learning: window.__mapFilter.getLearningState(),
    period: window.__mapFilter.getState().period,
    selectedPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => group.querySelector('text')?.textContent.trim()),
  }));
  assert.equal(incomingBoundaryState.period, 'u1',
    'incoming seam must select predecessor Unit 1 through the canonical Unit filter');
  assert.equal(incomingBoundaryState.learning.view, 'chain',
    'incoming seam must keep the Chain learning view active');
  assert.equal(incomingBoundaryState.learning.chainId, 'u1_main',
    'incoming seam must open the Unit 1 main chain');
  assert.equal(incomingBoundaryState.learning.chainStep, 7,
    'incoming seam must select the predecessor final ring');
  assert.ok(incomingBoundaryState.selectedPins.includes('8'),
    'incoming seam must synchronize the selected map anchor to pin 8');
  assert.equal(await page.locator('#eventPanel [data-route-step]').count(), 8,
    'incoming navigation must preserve the Unit 1 chain ring count');
  assert.equal((await page.locator('#eventPanel [data-route-step].now .rt-num').innerText()).trim(), '8',
    'incoming navigation must select boundary pin 8');
  assert.match(await page.locator('#eventPanel [data-route-step].now').innerText(), /Karakorum/i,
    'incoming navigation must select the Karakorum boundary ring');

  await page.evaluate(() => window.__mapFilter.setPeriod('u2'));
  await page.locator('#eventPanel [data-chain-seam="to"] [data-chain-boundary]').click();
  const outgoingBoundaryState = await page.evaluate(() => ({
    learning: window.__mapFilter.getLearningState(),
    period: window.__mapFilter.getState().period,
    selectedPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => group.querySelector('text')?.textContent.trim()),
  }));
  assert.equal(outgoingBoundaryState.period, 'u4',
    'outgoing seam must select successor Unit 4 through the canonical Unit filter');
  assert.equal(outgoingBoundaryState.learning.chainId, 'u4_atlantic',
    'outgoing seam must open the Unit 4 Atlantic chain');
  assert.equal(outgoingBoundaryState.learning.chainStep, 0,
    'outgoing seam must select the successor first ring');
  assert.ok(outgoingBoundaryState.selectedPins.includes('42'),
    'outgoing seam must synchronize the selected map anchor to pin 42');
  assert.equal(await page.locator('#eventPanel [data-route-step]').count(), 7,
    'outgoing navigation must preserve the Unit 4 chain ring count');
  assert.match(await page.locator('#eventPanel [data-route-step].now').innerText(), /42.*Lisbon/is,
    'outgoing navigation must select Unit 4 first boundary pin 42 at Lisbon');
  const pendingSeam = page.locator('#eventPanel [data-chain-seam="to"]');
  assert.match(await pendingSeam.innerText(), /交棒\s*UNIT\s*5/i,
    'Unit 4 outgoing seam must visibly identify pending Unit 5');
  assert.equal(await pendingSeam.locator('[data-chain-boundary]').count(), 0,
    'pending Unit 5 seam must not expose an enabled boundary action');

  await page.evaluate(() => window.__mapFilter.setPeriod('u1'));
  const initialChainPin = await page.locator('#eventPanel [data-route-step].now .rt-num').innerText();
  await page.evaluate((pin) => {
    const group = [...document.querySelectorAll('.pin-group')]
      .find(candidate => candidate.querySelector('text')?.textContent.trim() === pin.trim());
    group?.querySelector('.pin-dot')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, initialChainPin);
  await page.waitForTimeout(1_450);
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), false,
    'a linked pin activation in initial Chain mode must not show the first-click map hint');
  const desktopMapBox = await page.locator('#mapStudyView').boundingBox();
  const desktopPanelBox = await page.locator('#eventZone').boundingBox();
  assert.ok(desktopMapBox && desktopPanelBox && desktopMapBox.x + desktopMapBox.width <= desktopPanelBox.x + 1,
    'at 900x700, map study view must sit to the left of the event panel');

  await page.locator('[data-learning-view="map"]').click();
  await page.waitForTimeout(1_450);
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), true,
    'a Chain pin activation must not consume the first future Map Event Details hint');
  await page.locator('[data-learning-view="chain"]').click();
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), false,
    'switching from Map Event Details to Chain must dismiss the first-click hint immediately');
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('#eventPanel')).opacity) > 0);
  const mapToChainPresentation = await page.evaluate(() => ({
    panelShow: document.querySelector('#eventPanel').classList.contains('show'),
    panelOpacity: Number(getComputedStyle(document.querySelector('#eventPanel')).opacity),
    emptyDisplay: getComputedStyle(document.querySelector('#eventEmpty')).display,
  }));
  assert.equal(mapToChainPresentation.panelShow, true, 'Map → Chain must mark the chain panel as shown');
  assert.ok(mapToChainPresentation.panelOpacity > 0, 'Map → Chain must leave the chain panel visibly opaque');
  assert.equal(mapToChainPresentation.emptyDisplay, 'none', 'Map → Chain must hide the event empty state');
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'), 'Map → Chain must visibly restore the causal chain');

  await page.locator('[data-learning-view="map"]').click();
  await page.waitForTimeout(1_450);
  await page.locator('[data-map-mode="routes"]').click();
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), false,
    'switching from Map Event Details to Routes must dismiss the first-click hint immediately');

  await page.locator('[data-map-mode="events"]').click();
  await page.waitForTimeout(1_450);
  await page.locator('[data-learning-view="practice"]').click();
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), false,
    'switching from Map Event Details to Practice must dismiss the first-click hint immediately');
  assert.equal(await page.locator('.split > #eventZone').count(), 1,
    'Practice must keep the shared event panel inside the combined layout');
  await expectVisible(page.locator('#eventZone .quiz-panel'), 'Practice must render quiz controls in the shared event panel');
  assert.equal(await page.locator('#practiceDrawer').count(), 0, 'the obsolete Practice drawer must be removed');
  await expectVisible(page.locator('#mapStudyView'), 'Practice must leave the map visible');
  await expectVisible(page.locator('#worldTimelineDock'), 'Practice must leave the Timeline Dock visible');
  assert.deepEqual(await page.locator('.learning-view-tab[aria-pressed="true"]').allTextContents(), ['练习'],
    'only Practice may be pressed while the shared panel shows quiz controls');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '练习',
    'practice event region must identify the practice context');

  await page.locator('[data-learning-view="map"]').click();
  await page.waitForTimeout(1_450);
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), true,
    'an unconsumed Map Event Details session must continue to offer the first-click hint');
  await page.locator('.region-path[data-region="asia"]').first().click();
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), false,
    'a real map-region interaction must dismiss the first-click hint');
  await page.locator('[data-learning-view="chain"]').click();
  await page.locator('[data-learning-view="map"]').click();
  await page.waitForTimeout(1_450);
  assert.equal(await page.locator('#firstClickHint').evaluate(element => element.classList.contains('show')), false,
    'a consumed first-click hint must not reappear after leaving and returning to Map Event Details');

  await page.locator('[data-learning-view="chain"]').click();
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('#eventPanel')).opacity) > 0);
  const practiceToChainPresentation = await page.evaluate(() => ({
    panelShow: document.querySelector('#eventPanel').classList.contains('show'),
    panelOpacity: Number(getComputedStyle(document.querySelector('#eventPanel')).opacity),
    emptyDisplay: getComputedStyle(document.querySelector('#eventEmpty')).display,
  }));
  assert.equal(practiceToChainPresentation.panelShow, true, 'Practice → Chain must mark the chain panel as shown');
  assert.ok(practiceToChainPresentation.panelOpacity > 0, 'Practice → Chain must leave the chain panel visibly opaque');
  assert.equal(practiceToChainPresentation.emptyDisplay, 'none', 'Practice → Chain must hide the event empty state');
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'), 'Practice → Chain must visibly restore the causal chain');
  const chainSteps = page.locator('#eventPanel [data-route-step]');
  assert.ok(await chainSteps.count() >= 3, 'Unit 1 causal chain must expose at least three interactive steps');
  // Unit membership follows overlap with 1200-1450, not the opening year, so the Song
  // record that begins in 960 is now on the Timeline alongside Angkor and Kamakura.
  // Check the first three links - Angkor, Hangzhou, Baghdad - all of which are mapped.
  for (const stepIndex of [0, 1, 2]) {
    await chainSteps.nth(stepIndex).click();
    const chainState = await page.evaluate(() => {
      const currentStep = document.querySelector('#eventPanel [data-route-step].now');
      const pin = currentStep?.querySelector('.rt-num')?.textContent.trim() || '';
      return {
        pin,
        selectedAnchor: window.getTimelineState().selectedAnchor,
        currentTimelinePin: document.querySelector('.world-timeline-card[aria-current="step"]')?.dataset.pin || '',
        selectedMapPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
          .map(group => group.querySelector('text')?.textContent.trim()),
      };
    });
    await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
      `Unit 1 chain step ${stepIndex + 1} must keep the causal chain visible`);
    assert.equal(await page.locator('#eventPanel .event-head').count(), 0,
      `Unit 1 chain step ${stepIndex + 1} must not render an ordinary event heading`);
    assert.equal(await page.locator('#eventPanel .event-list').count(), 0,
      `Unit 1 chain step ${stepIndex + 1} must not render an ordinary event list`);
    assert.equal(chainState.selectedAnchor?.num, chainState.pin,
      `Unit 1 chain step ${stepIndex + 1} must synchronize its Timeline anchor`);
    assert.equal(chainState.currentTimelinePin, chainState.pin,
      `Unit 1 chain step ${stepIndex + 1} must synchronize the current Timeline card`);
    assert.ok(chainState.selectedMapPins.includes(chainState.pin),
      `Unit 1 chain step ${stepIndex + 1} must highlight its linked map pin`);
  }

  const chainTimelineTarget = page.locator('.world-timeline-card[data-event-key]').last();
  await chainTimelineTarget.click();
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
    'Timeline activation in Chain must preserve the causal-chain panel');
  assert.equal(await page.locator('#eventPanel .event-head, #eventPanel .event-list').count(), 0,
    'Timeline activation in Chain must not render ordinary event content');
  const activeChainPin = await page.locator('#eventPanel [data-route-step].now .rt-num').innerText();
  await page.evaluate((pin) => {
    const group = [...document.querySelectorAll('.pin-group')]
      .find(candidate => candidate.querySelector('text')?.textContent.trim() === pin.trim());
    group?.querySelector('.pin-dot')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, activeChainPin);
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
    'map-pin activation in Chain must preserve the causal-chain panel');
  assert.equal(await page.locator('#eventPanel .event-head, #eventPanel .event-list').count(), 0,
    'map-pin activation in Chain must not render ordinary event content');

  const chainDisabledCategory = await page.locator('#mtCats [data-cat]').first().getAttribute('data-cat');
  await page.locator(`#mtCats [data-cat="${chainDisabledCategory}"]`).click();
  const chainSearchFixture = await page.evaluate(() => {
    const event = window.getTimelineState().visibleEvents.find(item => item.titleEn.length > 4);
    return event && { key: event.key, query: event.titleEn };
  });
  assert.ok(chainSearchFixture, 'Chain filtering fixture must retain a searchable event after disabling one category');
  await page.locator('#mapSearch').fill(chainSearchFixture.query);
  await page.waitForFunction((query) => window.__mapFilter.getState().query === query, chainSearchFixture.query);
  assert.equal(await page.evaluate(() => window.__mapFilter.getLearningState().view), 'chain',
    'query and category changes in Chain must not change the primary learning view');
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
    'query and category changes in Chain must preserve the causal-chain panel');
  assert.equal(await page.locator('#eventPanel .event-head, #eventPanel .event-list').count(), 0,
    'query and category changes in Chain must not render ordinary event content');

  await page.locator('[data-learning-view="map"]').click();
  await expectVisible(page.locator('#mapStudyView'), 'Map must show the map study view');
  await expectVisible(page.locator('#worldTimelineDock'), 'Timeline remains embedded with Map');
  assert.equal(await page.locator('#eventPanel .rt-stops-chain').count(), 0,
    'Map must remove the causal-chain renderer from the event panel');
  assert.deepEqual(await page.locator('.learning-view-tab[aria-pressed="true"]').allTextContents(), ['地图'],
    'only Map may be pressed while its contextual tools are shown');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '地图事件详情',
    'Map must open in its event-details context');
  const mapModes = page.locator('[data-map-mode]');
  assert.deepEqual(await trimmedTexts(mapModes), ['事件详情', '商路'],
    'Map must expose exactly the Event Details and Routes secondary modes');
  assert.equal(await page.locator('[data-map-mode="events"]').getAttribute('aria-pressed'), 'true',
    'Event Details must be the initially pressed Map secondary mode');
  assert.deepEqual(await trimmedTexts(page.locator('[data-map-mode][aria-pressed="true"]')), ['事件详情'],
    'only Event Details may be pressed when Map opens');
  assert.doesNotMatch(await page.locator('#eventZone').innerText(), /Practice|随堂练习/,
    'Map event details must not contain legacy Practice launchers');
  await expectVisible(page.locator(`#eventPanel .event-card.is-result[data-event-key="${chainSearchFixture.key}"]`),
    'entering Map Event Details must render results for filters changed while Chain was active');
  await page.evaluate(() => window.__mapFilter.reset());
  await page.locator('.world-timeline-card[data-event-key]').first().click();
  await expectVisible(page.locator('#eventPanel .event-head'),
    'Timeline activation in Map Event Details must render an ordinary event heading');
  await expectVisible(page.locator('#eventPanel .event-list'),
    'Timeline activation in Map Event Details must render an ordinary event list');

  await page.locator('[data-map-mode="routes"]').click();
  await page.locator('#eventZone [data-route-picker-action="events"]').click();
  assert.equal(await page.locator('[data-map-mode="events"]').getAttribute('aria-pressed'), 'true',
    'returning from the Routes picker must select Event Details');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '地图事件详情',
    'returning from the Routes picker must identify Event Details');

  await page.locator('[data-map-mode="routes"]').click();
  const exitFixtureRoute = await page.evaluate(() => window.__mapFilter.getRoutes()[0]);
  await page.locator(`#eventZone [data-route-go="${exitFixtureRoute.id}"]`).click();
  await page.locator('#eventZone [data-route-action="exit"]').click();
  assert.equal(await page.locator('[data-map-mode="routes"]').getAttribute('aria-pressed'), 'true',
    'exiting an active route journey must keep Routes selected');
  await expectVisible(page.locator(`#eventZone [data-route-go="${exitFixtureRoute.id}"]`),
    'exiting an active route journey must return to the Routes picker');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '地图商路',
    'the restored Routes picker must retain its contextual label');
  await page.locator('[data-map-mode="events"]').click();

  await page.evaluate(() => window.__mapFilter.setPeriod('u4'));
  const disabledCategory = await page.evaluate(() => window.__mapFilter.getCats()[0].abbr);
  await page.evaluate((category) => window.__mapFilter.toggleCat(category), disabledCategory);
  const searchableEvent = await page.evaluate(() => {
    const event = window.getTimelineState().visibleEvents.find(item => item.titleEn.length > 4);
    return event && { key: event.key, query: event.titleEn, anchor: event.visibleAnchors[0] };
  });
  assert.ok(searchableEvent, 'Unit 4 with a non-default category filter must retain a searchable Timeline event');
  await page.evaluate((query) => window.__mapFilter.setQuery(query), searchableEvent.query);
  await page.evaluate(({ key, anchor }) => window.selectTimelineEvent(key, anchor), searchableEvent);
  const contextBeforeRoute = await page.evaluate(() => ({
    filter: {
      period: window.__mapFilter.getState().period,
      query: window.__mapFilter.getState().query,
      cats: [...window.__mapFilter.getState().cats].sort(),
    },
    timeline: {
      selectedEventKey: window.getTimelineState().selectedEventKey,
      selectedAnchor: window.getTimelineState().selectedAnchor,
      visibleEventKeys: [...window.getTimelineState().visibleEventKeys],
    },
    selectedMapPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => ({ pin: group.querySelector('text')?.textContent.trim(), region: group.dataset.region }))
      .sort((a, b) => `${a.pin}:${a.region}`.localeCompare(`${b.pin}:${b.region}`)),
  }));
  assert.equal(contextBeforeRoute.filter.period, 'u4', 'route restoration fixture must use Unit 4');
  assert.equal(contextBeforeRoute.filter.query, searchableEvent.query, 'route restoration fixture must use a non-default query');
  assert.ok(!contextBeforeRoute.filter.cats.includes(disabledCategory), 'route restoration fixture must use a non-default category set');
  assert.equal(contextBeforeRoute.timeline.selectedEventKey, searchableEvent.key, 'route restoration fixture must select a Timeline event');
  assert.ok(contextBeforeRoute.selectedMapPins.length > 0, 'route restoration fixture must expose the Timeline selection on the map');
  const restoredDetailBeforeRoute = await page.locator('#eventPanel').innerText();
  assert.ok(restoredDetailBeforeRoute.trim(), 'route restoration fixture must expose visible Event Details content');

  await page.locator('[data-map-mode="routes"]').click();
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '地图商路',
    'Routes must identify the Map routes context');
  assert.equal(await page.locator('[data-map-mode="routes"]').getAttribute('aria-pressed'), 'true',
    'Routes must be the pressed Map secondary mode');
  assert.deepEqual(await trimmedTexts(page.locator('[data-map-mode][aria-pressed="true"]')), ['商路'],
    'only Routes may be pressed in the Map routes context');
  const firstRoute = await page.evaluate(() => window.__mapFilter.getRoutes()[0]);
  assert.ok(firstRoute, 'the existing non-chain route catalog must provide a route');
  const routeChoice = page.locator(`#eventZone [data-route-go="${firstRoute.id}"]`);
  await expectVisible(routeChoice, 'Routes must show an existing non-chain route choice');
  await routeChoice.click();
  assert.equal(await page.evaluate(() => window.__mapFilter.inRoute()), true,
    'selecting a visible route choice must enter route mode');
  await expectVisible(page.locator(`#route-line-${firstRoute.id}.on`), 'the selected route line must be visible on the map');
  await expectVisible(page.locator(`#route-vehicle-${firstRoute.id}.on`), 'the selected route vehicle must be visible on the map');
  assert.equal(await page.locator('#periodFilter').inputValue(), '',
    'an active non-chain route must temporarily suspend the Unit filter');
  await expectVisible(page.locator('#eventPanel .event-head'),
    'a Commercial Routes stop must retain its ordinary event heading');
  await expectVisible(page.locator('#eventPanel .event-list'),
    'a Commercial Routes stop must retain its ordinary event list');
  await page.locator('[data-map-mode="events"]').click();
  const contextAfterEvents = await page.evaluate(() => ({
    filter: {
      period: window.__mapFilter.getState().period,
      query: window.__mapFilter.getState().query,
      cats: [...window.__mapFilter.getState().cats].sort(),
    },
    timeline: {
      selectedEventKey: window.getTimelineState().selectedEventKey,
      selectedAnchor: window.getTimelineState().selectedAnchor,
      visibleEventKeys: [...window.getTimelineState().visibleEventKeys],
    },
    selectedMapPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => ({ pin: group.querySelector('text')?.textContent.trim(), region: group.dataset.region }))
      .sort((a, b) => `${a.pin}:${a.region}`.localeCompare(`${b.pin}:${b.region}`)),
  }));
  assert.deepEqual(contextAfterEvents, contextBeforeRoute,
    'Routes → Event Details must exactly restore Unit, query, categories, Timeline selection, and selected map pins');
  const restoredDetailAfterRoute = await page.locator('#eventPanel').innerText();
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '地图事件详情',
    'Routes → Event Details must restore the Event Details accessible label');
  assert.ok(restoredDetailAfterRoute.trim() && restoredDetailAfterRoute.includes(searchableEvent.query),
    'Routes → Event Details must preserve visible restored search/detail content instead of a generic prompt');
  await expectVisible(page.locator('#eventPanel .event-card').first(),
    'Routes → Event Details must leave a restored result/detail card visible');
  assert.equal(await page.evaluate(() => window.__mapFilter.inRoute()), false,
    'returning to Event Details must leave route mode');
  assert.equal(await page.locator('.route-line.on, .route-vehicle.on').count(), 0,
    'returning to Event Details must clear route visualization');
  assert.equal(await page.locator('[data-map-mode="events"]').getAttribute('aria-pressed'), 'true',
    'Event Details must become pressed after leaving Routes');
  assert.deepEqual(await trimmedTexts(page.locator('[data-map-mode][aria-pressed="true"]')), ['事件详情'],
    'only Event Details may remain pressed after leaving Routes');

  await page.locator('[data-map-mode="routes"]').click();
  await page.locator(`#eventZone [data-route-go="${firstRoute.id}"]`).click();
  await page.locator('[data-learning-view="chain"]').click();
  const contextAfterChain = await page.evaluate(() => ({
    filter: {
      period: window.__mapFilter.getState().period,
      query: window.__mapFilter.getState().query,
      cats: [...window.__mapFilter.getState().cats].sort(),
    },
    timeline: {
      selectedEventKey: window.getTimelineState().selectedEventKey,
      selectedAnchor: window.getTimelineState().selectedAnchor,
      visibleEventKeys: [...window.getTimelineState().visibleEventKeys],
    },
    selectedMapPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => ({ pin: group.querySelector('text')?.textContent.trim(), region: group.dataset.region }))
      .sort((a, b) => `${a.pin}:${a.region}`.localeCompare(`${b.pin}:${b.region}`)),
  }));
  assert.deepEqual(contextAfterChain, contextBeforeRoute,
    'Routes → Chain must exactly restore Unit, query, categories, Timeline selection, and selected map pins');
  assert.equal(await page.evaluate(() => window.__mapFilter.inRoute()), false,
    'Routes → Chain must leave route mode');
  assert.equal(await page.locator('.route-line.on, .route-vehicle.on').count(), 0,
    'Routes → Chain must clear route visualization');
  assert.equal(await page.locator('[data-map-mode]:visible').count(), 0,
    'Map secondary controls must be absent or hidden in Chain');

  await page.locator('[data-learning-view="map"]').click();
  await page.locator('[data-map-mode="routes"]').click();
  await page.locator(`#eventZone [data-route-go="${firstRoute.id}"]`).click();
  await page.evaluate(() => window.__mapFilter.openPicker('chain'));
  const publicChainChoice = page.locator('#eventZone [data-route-go]').first();
  await expectVisible(publicChainChoice, 'the public picker API must expose a chain choice after replacing a trade route');
  await publicChainChoice.click();
  await page.locator('[data-learning-view="map"]').click();
  const contextAfterPublicChain = await page.evaluate(() => ({
    filter: {
      period: window.__mapFilter.getState().period,
      query: window.__mapFilter.getState().query,
      cats: [...window.__mapFilter.getState().cats].sort(),
    },
    timeline: {
      selectedEventKey: window.getTimelineState().selectedEventKey,
      selectedAnchor: window.getTimelineState().selectedAnchor,
      visibleEventKeys: [...window.getTimelineState().visibleEventKeys],
    },
    selectedMapPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => ({ pin: group.querySelector('text')?.textContent.trim(), region: group.dataset.region }))
      .sort((a, b) => `${a.pin}:${a.region}`.localeCompare(`${b.pin}:${b.region}`)),
  }));
  assert.deepEqual(contextAfterPublicChain, contextBeforeRoute,
    'trade route → public chain picker → Map must exactly restore the suspended learning context');

  await page.locator('[data-learning-view="chain"]').click();
  await page.locator('#periodFilter').selectOption('u4');
  assert.match(await page.locator('#eventPanel').innerText(), /Unit 4|大西洋|Atlantic/i,
    'Unit 4 selection must render Unit 4 Atlantic causal-chain content');
  for (const unit of ['u5', 'u6', 'u7', 'u8', 'u9']) {
    await page.locator('#periodFilter').selectOption(unit);
    const pendingChainText = await page.locator('#eventPanel').innerText();
    assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), 'Unit 因果链',
      `${unit}: missing approved chain must retain the Unit causal-chain label`);
    assert.match(pendingChainText, new RegExp(`Unit\\s*${unit.slice(1)}`, 'i'),
      `${unit}: pending chain state must identify the selected Unit`);
    assert.match(pendingChainText, /因果链正在整理|因果链待完善/,
      `${unit}: pending chain state must explain that its causal chain is being completed`);
    assert.equal(await page.locator('#eventPanel .rt-stops-chain').count(), 0,
      `${unit}: missing approved chain must not fabricate a chain`);
    assert.equal(await page.locator('#eventPanel [data-route-go]').count(), 0,
      `${unit}: missing approved chain must not show unrelated chain choices`);
  }
  await page.locator('#periodFilter').selectOption('u4');
  await page.locator('[data-learning-view="practice"]').click();
  assert.equal(await page.locator('[data-map-mode]:visible').count(), 0,
    'Map secondary controls must be absent or hidden in Practice');
  await page.locator('#eventZone [data-quiz-start="all"]').click();
  assert.equal(await page.evaluate(() => window.__mapFilter.inQuiz()), true,
    'activating the visible Practice choice must start quiz state');
  await expectVisible(page.locator('#eventZone .quiz-panel'), 'the existing quiz flow must start inside Practice');
  assert.match(await page.locator('#eventZone .quiz-panel').innerText(), /随堂练习/,
    'starting Practice must render an active quiz');
  await page.locator('[data-learning-view="chain"]').click();
  assert.equal(await page.evaluate(() => window.__mapFilter.inQuiz()), false,
    'switching from Practice to Chain must exit quiz state');
  assert.equal(await page.locator('#periodFilter').inputValue(), 'u4',
    'switching from an active quiz to Chain must preserve Unit 4');
  assert.deepEqual(await page.locator('.learning-view-tab[aria-pressed="true"]').allTextContents(), ['因果链'],
    'exactly Chain must be pressed after leaving an active quiz');
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
    'switching from Practice must restore the Unit 4 causal chain');
  assert.match(await page.locator('#eventPanel').innerText(), /Unit 4|大西洋|Atlantic/i,
    'the restored causal chain must still show Unit 4 content');

  await page.locator('[data-learning-view="practice"]').click();
  await page.locator('#eventZone [data-quiz-start="all"]').click();
  assert.equal(await page.evaluate(() => window.__mapFilter.inQuiz()), true,
    'the repeated visible Practice choice must start quiz state');
  await page.locator('[data-learning-view="map"]').click();
  assert.equal(await page.evaluate(() => window.__mapFilter.inQuiz()), false,
    'switching from Practice to Map must exit quiz state');
  assert.equal(await page.locator('#periodFilter').inputValue(), 'u4',
    'switching from an active quiz to Map must preserve Unit 4');
  assert.deepEqual(await page.locator('.learning-view-tab[aria-pressed="true"]').allTextContents(), ['地图'],
    'exactly Map must be pressed after leaving an active quiz');
  assert.deepEqual(await trimmedTexts(page.locator('[data-map-mode]')), ['事件详情', '商路'],
    'Map secondary controls must return after leaving an active quiz');
  assert.equal(await page.locator('[data-map-mode="events"]').getAttribute('aria-pressed'), 'true',
    'Map must return to Event Details after leaving an active quiz');
  assert.deepEqual(await trimmedTexts(page.locator('[data-map-mode][aria-pressed="true"]')), ['事件详情'],
    'only Event Details may be pressed after returning from Practice');
  const restoredQuizFilterPins = await page.evaluate(() => ({
    expected: [...new Set(window.getTimelineState().visibleEvents
      .flatMap((event) => event.visibleAnchors.map((anchor) => anchor.num)))].sort(),
    revealed: [...document.querySelectorAll('.pin-group.revealed')]
      .map((group) => group.querySelector('text')?.textContent.trim())
      .filter(Boolean)
      .sort(),
  }));
  assert.ok(restoredQuizFilterPins.expected.length > 0,
    'the restored Unit 4 filter must contain map anchors');
  assert.deepEqual(restoredQuizFilterPins.revealed, restoredQuizFilterPins.expected,
    'leaving Practice for Map must restore every pin selected by the preserved Unit filter');

  await page.locator('[data-learning-view="practice"]').click();
  await page.locator('#eventZone [data-quiz-start="all"]').click();
  await page.locator('#eventZone [data-quiz-action="exit"]').click();
  const directlyRestoredQuizFilterPins = await page.evaluate(() => ({
    period: window.__mapFilter.getState().period,
    expected: [...new Set(window.getTimelineState().visibleEvents
      .flatMap((event) => event.visibleAnchors.map((anchor) => anchor.num)))].sort(),
    revealed: [...document.querySelectorAll('.pin-group.revealed')]
      .map((group) => group.querySelector('text')?.textContent.trim())
      .filter(Boolean)
      .sort(),
  }));
  assert.equal(directlyRestoredQuizFilterPins.period, 'u4',
    'the direct Exit Practice action must restore the preserved Unit filter');
  assert.ok(directlyRestoredQuizFilterPins.expected.length > 0,
    'the directly restored Unit 4 filter must contain map anchors');
  assert.deepEqual(directlyRestoredQuizFilterPins.revealed, directlyRestoredQuizFilterPins.expected,
    'the direct Exit Practice action must not erase pins restored by the preserved Unit filter');

  const practiceResultFixture = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.world-timeline-card[data-event-key]')];
    const counts = new Map(cards.map(card => [card.dataset.pin, cards.filter(item => item.dataset.pin === card.dataset.pin).length]));
    const card = cards.find(item => counts.get(item.dataset.pin) === 1);
    const entry = card && [...document.querySelectorAll('.entry')].find(item => item.querySelector('.citynum')?.textContent.trim() === card.dataset.pin);
    if (!card || !entry) return null;
    const year = entry.querySelector('.yr')?.textContent.trim() || '';
    const trigger = entry.querySelector('.trig')?.textContent.trim().slice(0, 24) || '';
    const key = `${card.dataset.pin}|${year}|${trigger}`;
    localStorage.setItem('mh.quiz.v1', JSON.stringify({ [key]: { hit: 0, miss: 1, streak: 0, last: Date.now(), num: card.dataset.pin } }));
    return { eventKey: card.dataset.eventKey, pin: card.dataset.pin };
  });
  assert.ok(practiceResultFixture, 'direct Practice-result fixture must seed a unique-pin mistake');
  await page.evaluate(() => { window.__mapFilter.setLearningView('practice'); window.__mapFilter.quizBook(); });
  const directPracticeResult = page.locator('#eventPanel .event-card.is-result').first();
  await expectVisible(directPracticeResult, 'direct mistake book must expose a result card');
  await directPracticeResult.click();
  assert.deepEqual(await trimmedTexts(page.locator('.learning-view-tab[aria-pressed="true"]')), ['地图'],
    'opening a direct Practice result must switch the primary view to Map');
  assert.equal(await page.locator('[data-map-mode="events"]').getAttribute('aria-pressed'), 'true',
    'opening a direct Practice result must switch to Event Details');
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), '地图事件详情',
    'opening a direct Practice result must expose the Event Details label');
  assert.equal(await page.evaluate(() => window.__mapFilter.inQuiz()), false,
    'opening a direct Practice result must exit quiz state');
  assert.equal((await page.evaluate(() => window.getTimelineState())).selectedEventKey, practiceResultFixture.eventKey,
    'opening a direct Practice result must select its exact event');

  await page.setViewportSize({ width: 700, height: 900 });
  for (const mode of [
    { id: 'chain', label: '因果链', ariaLabel: 'Unit 因果链', content: '#eventPanel .rt-stops-chain' },
    { id: 'map', label: '地图', ariaLabel: '地图事件详情', content: '[data-map-mode="events"]' },
    { id: 'practice', label: '练习', ariaLabel: '练习', content: '#eventZone .quiz-panel' },
  ]) {
    await page.locator(`[data-learning-view="${mode.id}"]`).click();
    const narrowMapBox = await page.locator('#mapStudyView').boundingBox();
    const narrowPanelBox = await page.locator('#eventZone').boundingBox();
    assert.ok(narrowMapBox && narrowPanelBox && narrowPanelBox.y >= narrowMapBox.y + narrowMapBox.height - 1,
      `at 700x900, ${mode.label} event panel must stack below the map study view`);
    assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), mode.ariaLabel,
      `at 700x900, ${mode.label} must expose its contextual label`);
    assert.deepEqual(await trimmedTexts(page.locator('.learning-view-tab[aria-pressed="true"]')), [mode.label],
      `at 700x900, exactly ${mode.label} must be pressed`);
    await expectVisible(page.locator(mode.content), `at 700x900, ${mode.label} must render its mode content`);
  }
  await page.locator('[data-learning-view="chain"]').click();
  assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), 'Unit 因果链',
    'responsive verification must finish in deterministic Chain mode');
  assert.deepEqual(await trimmedTexts(page.locator('.learning-view-tab[aria-pressed="true"]')), ['因果链'],
    'responsive verification must finish with only Chain pressed');
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
    'responsive verification must finish with Chain content visible');
}

async function verifyHomeLearningShell(page, port) {
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  const frame = page.frameLocator('#worldMapFrame');
  await frame.locator('body').waitFor();
  await page.waitForFunction(() => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter);
  await page.waitForFunction(() => document.querySelector('#hostPeriod')?.options.length > 1);

  await page.setViewportSize({ width: 1440, height: 900 });
  const desktopWorkspace = await page.locator('.map-card[data-subject="world"]').evaluate(card => {
    const shell = card.closest('.card').getBoundingClientRect();
    const module = card.getBoundingClientRect();
    const canvas = card.querySelector('.home-map-wrap').getBoundingClientRect();
    const panel = card.querySelector('#home-events').getBoundingClientRect();
    const panelStyle = getComputedStyle(card.querySelector('#home-events'));
    return {
      moduleShare: module.width / shell.width,
      canvasShare: canvas.width / (canvas.width + panel.width),
      equalHeight: Math.abs(canvas.height - panel.height) <= 1,
      panelOverflowY: panelStyle.overflowY,
    };
  });
  assert.ok(desktopWorkspace.moduleShare >= 0.94,
    `desktop APWH module must use the available Main width: ${JSON.stringify(desktopWorkspace)}`);
  assert.ok(desktopWorkspace.canvasShare >= 0.64 && desktopWorkspace.canvasShare <= 0.74,
    `desktop APWH workspace must reserve about 70/30 for map and context: ${JSON.stringify(desktopWorkspace)}`);
  assert.equal(desktopWorkspace.equalHeight, true, 'desktop APWH map and contextual panel must share a bounded height');
  assert.equal(desktopWorkspace.panelOverflowY, 'auto', 'desktop APWH contextual panel must scroll independently');

  const themeToggle = page.locator('#hostThemeToggle');
  const themePanel = page.locator('#hostThemePanel');
  assert.equal(await themeToggle.getAttribute('aria-expanded'), 'false', 'Main theme filters must start collapsed');
  assert.ok((await themeToggle.boundingBox())?.height >= 44, 'theme disclosure must provide a 44px touch target');
  assert.equal(await themePanel.isVisible(), false, 'collapsed Main theme filters must not consume workspace height');
  const canvasHeightBeforeTheme = (await page.locator('.home-map-wrap').boundingBox()).height;
  await themeToggle.click();
  assert.equal(await themeToggle.getAttribute('aria-expanded'), 'true', 'theme disclosure must report its expanded state');
  await expectVisible(themePanel, 'expanded Main theme filters must be visible');
  const sourceThemeCountBefore = await frame.locator('body').evaluate(() => window.__mapFilter.getState().cats.size);
  await page.locator('#hostCats [data-cat]').first().click();
  const sourceThemeCountAfter = await frame.locator('body').evaluate(() => window.__mapFilter.getState().cats.size);
  assert.equal(sourceThemeCountAfter, sourceThemeCountBefore - 1,
    'collapsed Main theme presentation must continue driving the source filter state');
  await page.locator('#hostCats [data-cat]').first().click();
  await themeToggle.click();
  assert.equal(await themePanel.isVisible(), false, 'theme disclosure must collapse without leaving the chip row visible');
  const canvasHeightAfterTheme = (await page.locator('.home-map-wrap').boundingBox()).height;
  assert.ok(Math.abs(canvasHeightAfterTheme - canvasHeightBeforeTheme) <= 2,
    'opening and closing theme filters must not permanently reduce the map canvas');

  for (const viewport of [{ width: 1100, height: 850 }, { width: 700, height: 900 }]) {
    await page.setViewportSize(viewport);
    const sourceLayout = await frame.locator('body').evaluate(() => {
      const map = document.querySelector('.map-zone').getBoundingClientRect();
      const dock = document.querySelector('#worldTimelineDock').getBoundingClientRect();
      return { mapBottom: map.bottom, dockTop: dock.top, dockBottom: dock.bottom, viewportHeight: document.documentElement.clientHeight };
    });
    assert.ok(sourceLayout.dockTop >= sourceLayout.mapBottom - 1,
      `${viewport.width}px host: source visual order must place Timeline Dock after Map`);
    assert.ok(sourceLayout.dockBottom <= sourceLayout.viewportHeight + 1,
      `${viewport.width}px host: Timeline Dock must fit within the visible iframe viewport: ${JSON.stringify(sourceLayout)}`);
    const iframeBox = await page.locator('#worldMapFrame').boundingBox();
    const panelBox = await page.locator('#home-events').boundingBox();
    assert.ok(iframeBox && panelBox && (viewport.width > 900
      ? panelBox.x >= iframeBox.x + iframeBox.width - 1
      : panelBox.y >= iframeBox.y + iframeBox.height - 1),
    `${viewport.width}px host: contextual panel must follow the Map and Timeline region`);
  }
  for (const viewport of [{ width: 1100, height: 850 }, { width: 700, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.locator('[data-subj="art"]').click();
    assert.equal(await themeToggle.getAttribute('aria-expanded'), 'false',
      `${viewport.width}px host: leaving World must collapse World-only theme controls`);
    assert.equal(await themePanel.isVisible(), false,
      `${viewport.width}px host: other subjects must not display World-only theme controls`);
    const artSizing = await page.locator('.map-card').evaluate(card => ({
      subject: card.dataset.subject,
      splitInline: card.querySelector('.map-events-split').style.height,
      wrapInline: card.querySelector('.home-map-wrap').style.height,
      panelInline: card.querySelector('.home-events').style.height,
    }));
    assert.deepEqual(artSizing, { subject: 'art', splitInline: '', wrapInline: '', panelInline: '' },
      `${viewport.width}px host: Art must not inherit World-only inline sizing`);
    await page.locator('[data-subj="us"]').click();
    const compactSizing = await page.locator('.map-card').evaluate(card => ({
      subject: card.dataset.subject,
      splitInline: card.querySelector('.map-events-split').style.height,
      wrapInline: card.querySelector('.home-map-wrap').style.height,
      panelInline: card.querySelector('.home-events').style.height,
    }));
    assert.deepEqual(compactSizing, { subject: 'us', splitInline: '', wrapInline: '', panelInline: '' },
      `${viewport.width}px host: compact subjects must not inherit World-only inline sizing`);
    await page.locator('[data-subj="world"]').click();
    assert.equal(await themeToggle.getAttribute('aria-expanded'), 'false',
      `${viewport.width}px host: returning to World must start with compact theme controls`);
    const worldDock = await frame.locator('#worldTimelineDock').evaluate(node => ({
      bottom: node.getBoundingClientRect().bottom,
      viewportHeight: document.documentElement.clientHeight,
    }));
    assert.ok(worldDock.bottom <= worldDock.viewportHeight + 1,
      `${viewport.width}px host: returning to World must recalculate a visible Timeline Dock`);
  }
  await page.setViewportSize({ width: 700, height: 900 });
  const narrowHostGeometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(narrowHostGeometry.scrollWidth <= narrowHostGeometry.clientWidth + 1,
    `narrow Main APWH layout must not scroll horizontally: ${JSON.stringify(narrowHostGeometry)}`);
  await page.setViewportSize({ width: 900, height: 700 });
  const hostPrimary = page.locator('.map-card-head [data-learning-view]');
  assert.deepEqual(await trimmedTexts(hostPrimary), ['因果链', '地图', '练习'],
    'the homepage must expose the unified three APWH learning modes');
  assert.deepEqual(await trimmedTexts(page.locator('.map-card-head [data-learning-view][aria-pressed="true"]')), ['因果链'],
    'the homepage must initially mirror Chain as the sole pressed mode');
  await expectVisible(page.locator('#home-events .rt-stops-chain'), 'the homepage must initially mirror the visible causal chain');

  await page.locator('.map-card-head [data-learning-view="map"]').click();
  await page.locator('.map-card-head [data-learning-view="chain"]').click();
  await page.waitForFunction(() => {
    const panel = document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('#eventPanel');
    return panel && Number(getComputedStyle(panel).opacity) > 0;
  });
  const hostMapToChainPresentation = await frame.locator('body').evaluate(() => ({
    panelShow: document.querySelector('#eventPanel').classList.contains('show'),
    panelOpacity: Number(getComputedStyle(document.querySelector('#eventPanel')).opacity),
    emptyDisplay: getComputedStyle(document.querySelector('#eventEmpty')).display,
  }));
  assert.equal(hostMapToChainPresentation.panelShow, true, 'homepage Map → Chain must mark the source chain panel as shown');
  assert.ok(hostMapToChainPresentation.panelOpacity > 0, 'homepage Map → Chain must leave the source chain panel visibly opaque');
  assert.equal(hostMapToChainPresentation.emptyDisplay, 'none', 'homepage Map → Chain must hide the source event empty state');
  await expectVisible(page.locator('#home-events .rt-stops-chain'), 'homepage Map → Chain must mirror the causal chain');

  await page.locator('.map-card-head [data-learning-view="practice"]').click();
  await page.locator('.map-card-head [data-learning-view="chain"]').click();
  await page.waitForFunction(() => {
    const panel = document.querySelector('#worldMapFrame')?.contentDocument?.querySelector('#eventPanel');
    return panel && Number(getComputedStyle(panel).opacity) > 0;
  });
  const hostPracticeToChainPresentation = await frame.locator('body').evaluate(() => ({
    panelShow: document.querySelector('#eventPanel').classList.contains('show'),
    panelOpacity: Number(getComputedStyle(document.querySelector('#eventPanel')).opacity),
    emptyDisplay: getComputedStyle(document.querySelector('#eventEmpty')).display,
  }));
  assert.equal(hostPracticeToChainPresentation.panelShow, true, 'homepage Practice → Chain must mark the source chain panel as shown');
  assert.ok(hostPracticeToChainPresentation.panelOpacity > 0, 'homepage Practice → Chain must leave the source chain panel visibly opaque');
  assert.equal(hostPracticeToChainPresentation.emptyDisplay, 'none', 'homepage Practice → Chain must hide the source event empty state');
  await expectVisible(page.locator('#home-events .rt-stops-chain'), 'homepage Practice → Chain must mirror the causal chain');

  await themeToggle.click();
  const hostCategory = page.locator('#hostCats [data-cat]').first();
  await hostCategory.click();
  const hostChainSearchFixture = await frame.locator('body').evaluate(() => {
    const event = window.getTimelineState().visibleEvents.find(item => item.titleEn.length > 4);
    return event && { key: event.key, query: event.titleEn };
  });
  assert.ok(hostChainSearchFixture, 'homepage Chain filtering fixture must retain a searchable event');
  await page.locator('#hostSearch').fill(hostChainSearchFixture.query);
  await page.waitForFunction((query) => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getState().query === query,
    hostChainSearchFixture.query);
  assert.equal(await frame.locator('body').evaluate(() => window.__mapFilter.getLearningState().view), 'chain',
    'homepage query and category changes in Chain must preserve the source primary mode');
  assert.equal(await frame.locator('#eventPanel .rt-stops-chain').count(), 1,
    'homepage query and category changes in Chain must preserve the source causal-chain DOM');
  assert.equal(await frame.locator('#eventPanel .event-head, #eventPanel .event-list').count(), 0,
    'homepage query and category changes in Chain must not overwrite the source panel with event content');
  await expectVisible(page.locator('#home-events .rt-stops-chain'),
    'homepage query and category changes in Chain must preserve the mirrored causal-chain panel');
  assert.equal(await page.locator('#home-events .event-head, #home-events .event-list').count(), 0,
    'homepage query and category changes in Chain must not overwrite the mirror with event content');

  await page.locator('.map-card-head [data-learning-view="map"]').click();
  await expectVisible(page.locator(`#home-events .event-card.is-result[data-event-key="${hostChainSearchFixture.key}"]`),
    'homepage Map Event Details must mirror filters changed while Chain was active');
  await page.locator('#hostSearch').fill('');
  await page.waitForFunction(() => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getState().query === '');
  await hostCategory.click();
  await themeToggle.click();

  await page.locator('.map-card-head [data-learning-view="map"]').click();
  await page.waitForFunction(() => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getLearningState().view === 'map');
  assert.deepEqual(await trimmedTexts(page.locator('.map-card-head [data-learning-view][aria-pressed="true"]')), ['地图'],
    'the homepage must mirror Map as the sole pressed primary mode');
  assert.equal(await page.locator('#home-events').getAttribute('aria-label'), '地图事件详情',
    'the homepage event mirror must copy the source Event Details label');
  assert.deepEqual(await trimmedTexts(page.locator('#home-events [data-map-mode]')), ['事件详情', '商路'],
    'the homepage Map mirror must expose Event Details and Routes secondary modes');
  assert.deepEqual(await trimmedTexts(page.locator('#home-events [data-map-mode][aria-pressed="true"]')), ['事件详情'],
    'the homepage Map mirror must initially press only Event Details');
  assert.doesNotMatch(await page.locator('#home-events').innerText(), /Practice|随堂练习/,
    'the homepage Map event empty state must not inject Practice launchers');

  await page.locator('#hostPeriod').selectOption('');
  const hostExactEvent = await frame.locator('body').evaluate(() => {
    const cards = [...document.querySelectorAll('.world-timeline-card[data-event-key]')];
    const counts = new Map(cards.map(card => [card.dataset.pin, cards.filter(item => item.dataset.pin === card.dataset.pin).length]));
    const first = cards.find(item => counts.get(item.dataset.pin) > 1);
    const card = first && cards.find(item => item.dataset.pin === first.dataset.pin && item.dataset.eventKey !== first.dataset.eventKey
      && item.querySelector('.world-timeline-title-en')?.textContent.trim().length > 3);
    return card && { key: card.dataset.eventKey, query: card.querySelector('.world-timeline-title-en').textContent.trim() };
  });
  assert.ok(hostExactEvent, 'homepage exact-selection fixture must provide two events sharing a pin');
  await page.locator('#hostSearch').fill(hostExactEvent.query);
  const mirroredExactResult = page.locator(`#home-events .event-card.is-result[data-event-key="${hostExactEvent.key}"]`);
  await mirroredExactResult.waitFor();
  await expectVisible(mirroredExactResult, 'homepage must mirror the exact keyed search result');
  const staleMirroredCardHTML = await mirroredExactResult.evaluate(element => element.outerHTML);
  await frame.locator('body').evaluate(() => window.__mapFilter.setQuery(''));
  await page.locator('#home-events').evaluate((element, cardHTML) => element.insertAdjacentHTML('beforeend', cardHTML), staleMirroredCardHTML);
  await mirroredExactResult.click();
  assert.equal((await frame.locator('body').evaluate(() => window.getTimelineState())).selectedEventKey, hostExactEvent.key,
    'clicking a mirrored result must select its exact event key instead of the first event at that pin');

  await page.locator('#home-events [data-map-mode="routes"]').click();
  await page.waitForFunction(() => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getLearningState().mapMode === 'routes');
  const mirroredReturn = page.locator('#home-events [data-route-picker-action="events"]');
  await expectVisible(mirroredReturn, 'the homepage must mirror the APWH Routes picker Return action');
  assert.equal(await page.locator('#home-events').getAttribute('aria-label'), '地图商路',
    'the homepage Routes mirror must copy the source Routes label');
  await mirroredReturn.click();
  assert.equal(await frame.locator('#eventZone').getAttribute('aria-label'), '地图事件详情',
    'the mirrored Routes Return action must switch the source panel to Event Details');
  assert.equal(await frame.locator('[data-map-mode="events"]').getAttribute('aria-pressed'), 'true',
    'the mirrored Routes Return action must press Event Details in the source panel');
  assert.equal(await frame.locator('[data-map-mode="routes"]').getAttribute('aria-pressed'), 'false',
    'the mirrored Routes Return action must release Routes in the source panel');
  await page.waitForFunction(() => !document.querySelector('#home-events [data-route-picker-action]'));
  assert.equal(await page.locator('#home-events [data-route-picker-action]').count(), 0,
    'the homepage mirror must refresh after returning to Event Details');

  await page.locator('.map-card-head [data-learning-view="practice"]').click();
  await page.waitForFunction(() => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getLearningState().view === 'practice');
  assert.deepEqual(await trimmedTexts(page.locator('.map-card-head [data-learning-view][aria-pressed="true"]')), ['练习'],
    'the homepage must mirror Practice as the sole pressed primary mode');
  assert.equal(await page.locator('#home-events').getAttribute('aria-label'), '练习',
    'the homepage Practice mirror must copy the source label');
  await expectVisible(page.locator('#home-events .quiz-panel'),
    'Practice must render inside the shared homepage event mirror');
  assert.equal(await page.locator('#practiceDrawer').count(), 0,
    'the homepage unified model must not introduce a Practice drawer');
  await frame.locator('body').evaluate(() => window.__mapFilter.quizBook());
  const mirroredPracticeResult = page.locator('#home-events .event-card.is-result').first();
  await mirroredPracticeResult.waitFor();
  const mirroredPracticeKey = await mirroredPracticeResult.getAttribute('data-event-key');
  assert.ok(mirroredPracticeKey, 'mirrored Practice result must carry its exact event key');
  await mirroredPracticeResult.click();
  await page.waitForFunction(() => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getLearningState().view === 'map');
  await page.waitForFunction(() => document.querySelector('.map-card-head [data-learning-view="map"]')?.getAttribute('aria-pressed') === 'true');
  assert.deepEqual(await trimmedTexts(page.locator('.map-card-head [data-learning-view][aria-pressed="true"]')), ['地图'],
    'opening a mirrored Practice result must switch the host primary mode to Map');
  assert.equal(await page.locator('#home-events').getAttribute('aria-label'), '地图事件详情',
    'opening a mirrored Practice result must refresh the Event Details label');
  assert.equal((await frame.locator('body').evaluate(() => window.getTimelineState())).selectedEventKey, mirroredPracticeKey,
    'opening a mirrored Practice result must select its exact event');
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
      await verifyHomeLearningShell(page, port);
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
