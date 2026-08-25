import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE_FILE = join(PROJECT_ROOT, 'world-map.html');
const SOURCE_ID_BASELINE_FILE = join(PROJECT_ROOT, 'scripts', 'world-source-id-baseline.json');
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

async function waitForStableAttribute(locator, attribute, {
  consecutiveFrames = 3,
  timeout = 2_000,
  label = `${attribute} attribute`,
} = {}) {
  return locator.evaluate((element, options) => new Promise((resolve, reject) => {
    let previous = element.getAttribute(options.attribute);
    let stableFrames = 0;
    let sampledFrames = 0;
    const recent = [previous];
    const timer = setTimeout(() => {
      reject(new Error(`${options.label} did not stabilize across ${options.consecutiveFrames} consecutive animation frames within ${options.timeout}ms; sampled ${sampledFrames} frames; recent values: ${JSON.stringify(recent)}`));
    }, options.timeout);
    const sample = () => {
      const current = element.getAttribute(options.attribute);
      sampledFrames++;
      if (current === previous) stableFrames++;
      else {
        previous = current;
        stableFrames = 0;
      }
      recent.push(current);
      if (recent.length > 6) recent.shift();
      if (stableFrames >= options.consecutiveFrames) {
        clearTimeout(timer);
        resolve({ value: current, sampledFrames });
        return;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }), { attribute, consecutiveFrames, timeout, label });
}

async function embeddedWorldLayoutSnapshot(page) {
  return page.evaluate(() => {
    const frame = document.querySelector('#worldMapFrame');
    const wrap = frame?.closest('.home-map-wrap');
    const split = frame?.closest('.map-events-split');
    const panel = document.querySelector('#home-events');
    const study = frame?.contentDocument?.querySelector('#mapStudyView');
    const mapZone = frame?.contentDocument?.querySelector('.map-zone');
    const boxHeight = element => element ? element.getBoundingClientRect().height : null;
    const frameBox = frame?.getBoundingClientRect();
    const panelBox = panel?.getBoundingClientRect();
    return {
      innerWidth: window.innerWidth,
      mapZoneHeight: boxHeight(mapZone),
      studyHeight: boxHeight(study),
      wrapHeight: boxHeight(wrap),
      frameHeight: boxHeight(frame),
      panelHeight: boxHeight(panel),
      splitHeight: boxHeight(split),
      adjacency: frameBox && panelBox ? {
        panelAfterFrameX: panelBox.x >= frameBox.right - 1,
        panelAfterFrameY: panelBox.y >= frameBox.bottom - 1,
        frame: { x: frameBox.x, y: frameBox.y, width: frameBox.width, height: frameBox.height },
        panel: { x: panelBox.x, y: panelBox.y, width: panelBox.width, height: panelBox.height },
      } : null,
      wrapInline: wrap?.style.height || '',
      frameInline: frame?.style.height || '',
      panelInline: panel?.style.height || '',
      splitInline: split?.style.height || '',
    };
  });
}

async function waitForEmbeddedWorldLayout(page, {
  viewportWidth,
  mapZoneHeight,
  timeout = 2_000,
}) {
  try {
    await page.locator('#worldMapFrame').evaluate((frame, options) => new Promise((resolve, reject) => {
      let stableFrames = 0;
      let sampledFrames = 0;
      let frameId = null;
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        if (frameId !== null) cancelAnimationFrame(frameId);
        reject(new Error(
          `layout did not settle across ${options.consecutiveFrames} frames after ${sampledFrames} samples`));
      }, options.timeout);
      const sample = () => {
        if (settled) return;
        const wrap = frame.closest('.home-map-wrap');
        const split = frame.closest('.map-events-split');
        const panel = document.querySelector('#home-events');
        const study = frame.contentDocument?.querySelector('#mapStudyView');
        const mapZone = frame.contentDocument?.querySelector('.map-zone');
        sampledFrames++;
        let matches = false;
        if (wrap && split && panel && study && mapZone) {
          const frameBox = frame.getBoundingClientRect();
          const wrapBox = wrap.getBoundingClientRect();
          const splitBox = split.getBoundingClientRect();
          const panelBox = panel.getBoundingClientRect();
          const studyHeight = study.getBoundingClientRect().height;
          const near = (left, right) => Math.abs(left - right) <= 1;
          const synchronizedHeights = [frameBox.height, wrapBox.height, panelBox.height]
            .every(height => near(height, studyHeight));
          const narrow = options.expectedViewportWidth <= 900;
          const adjacent = narrow
            ? panelBox.y >= frameBox.bottom - 1
            : panelBox.x >= frameBox.right - 1;
          const splitFits = narrow
            ? near(splitBox.height, frameBox.height + panelBox.height)
            : near(splitBox.height, studyHeight);
          matches = window.innerWidth === options.expectedViewportWidth
            && near(mapZone.getBoundingClientRect().height, options.expectedMapZoneHeight)
            && synchronizedHeights && adjacent && splitFits;
        }
        stableFrames = matches ? stableFrames + 1 : 0;
        if (stableFrames >= options.consecutiveFrames) {
          settled = true;
          clearTimeout(timer);
          resolve();
          return;
        }
        frameId = requestAnimationFrame(sample);
      };
      frameId = requestAnimationFrame(sample);
    }), {
      expectedViewportWidth: viewportWidth,
      expectedMapZoneHeight: mapZoneHeight,
      consecutiveFrames: 4,
      timeout,
    });
  } catch (error) {
    const snapshot = await embeddedWorldLayoutSnapshot(page);
    throw new Error(`embedded World layout did not synchronize within ${timeout}ms: ${JSON.stringify(snapshot)}`, {
      cause: error,
    });
  }
  return embeddedWorldLayoutSnapshot(page);
}

async function trimmedTexts(locator) {
  return (await locator.allTextContents()).map(text => text.trim());
}

async function buttonSurfaceMetrics(locator) {
  return locator.evaluateAll(buttons => buttons.map(button => {
    const style = getComputedStyle(button);
    const surface = getComputedStyle(button, '::before');
    return {
      hitHeight: button.getBoundingClientRect().height,
      fontSize: style.fontSize,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      surfaceTop: surface.top,
      surfaceBottom: surface.bottom,
    };
  }));
}

async function verifyTimeline(page, port) {
  const response = await page.goto(`http://127.0.0.1:${port}/world-map.html`, { waitUntil: 'networkidle' });
  assert.ok(response?.ok(), `world-map.html is unavailable (HTTP ${response?.status() || 'no response'})`);
  await page.waitForFunction(() => Boolean(window.__mapFilter), undefined, { timeout: 8_000 });
  await page.locator('[data-learning-view="map"]').click();
  await page.locator('#periodFilter').selectOption('u1');
  await page.evaluate(() => window.__mapFilter.openHit('1', 'asia'));
  await expectVisible(page.locator('#eventPanel .event-list'),
    'Hangzhou must keep its ordinary event cards');
  const hangzhouStudyEntry = page.locator('#eventPanel [data-location-study-open="1"]');
  await expectVisible(hangzhouStudyEntry,
    'Hangzhou must offer the secondary location-study action');
  assert.equal(await hangzhouStudyEntry.innerText(), 'View all 3 study points',
    'the Hangzhou action must use the approved English count label');
  assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 1,
    'an ordinary location panel must expose one study entry action');

  const timelineDetailBeforeStudy = await page.locator('#eventPanel').evaluate(panel => ({
    city: panel.querySelector('.city-name')?.textContent.trim(),
    cityCount: panel.querySelector('.city-count')?.textContent.trim(),
    badge: panel.querySelector('.badge')?.textContent.trim(),
    badgeStyle: panel.querySelector('.badge')?.getAttribute('style'),
    cardCount: panel.querySelectorAll('.event-card').length,
    year: panel.querySelector('.ec-yr')?.textContent.trim(),
    category: panel.querySelector('.ec-cat')?.textContent.trim(),
    body: panel.querySelector('.ec-trig')?.textContent.replace(/\s+/g, ' ').trim(),
  }));
  assert.equal(timelineDetailBeforeStudy.city, 'Hangzhou',
    'the study action must coexist with the canonical Hangzhou location heading');
  assert.ok(timelineDetailBeforeStudy.cardCount >= 1,
    'the study action must preserve at least one ordinary Hangzhou event card');
  assert.ok(timelineDetailBeforeStudy.year && timelineDetailBeforeStudy.category && timelineDetailBeforeStudy.body,
    'the preserved ordinary card must retain its date, category, and historical body');

  await waitForStableAttribute(page.locator('#zoom-layer'), 'transform', {
    label: 'the initial Map camera transform',
  });

  const beforeStudy = await page.evaluate(() => {
    const filter = window.__mapFilter.getState();
    const timeline = window.getTimelineState();
    return {
      filter: { query: filter.query, period: filter.period, cats: [...filter.cats].sort() },
      timeline: {
        selectedEventKey: timeline.selectedEventKey,
        selectedAnchor: timeline.selectedAnchor,
      },
      selectedLocation: document.querySelector('#eventPanel .event-head .badge')?.textContent.trim(),
      selectedMapPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
        .map(group => group.querySelector('text')?.textContent.trim()).filter(Boolean).sort(),
      mapTransform: document.querySelector('#zoom-layer')?.getAttribute('transform'),
    };
  });

  await hangzhouStudyEntry.click();
  const hangzhouStudyView = page.locator('#eventPanel [data-location-study-view="1"]');
  await expectVisible(hangzhouStudyView, 'Hangzhou study view must open in the event panel');
  const studyHeading = hangzhouStudyView.locator('h2');
  assert.equal((await studyHeading.innerText()).trim(), 'Hangzhou · Unit 1',
    'the location-study heading must use the approved English context label');
  assert.equal(await studyHeading.evaluate(element => document.activeElement === element), true,
    'opening the study view must move focus to its heading');
  const studyHeadingFocus = await studyHeading.evaluate(element => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  assert.notEqual(studyHeadingFocus.style, 'none',
    'the programmatically focused study heading must have a visible focus outline');
  assert.ok(studyHeadingFocus.width >= 2,
    'the programmatically focused study heading must have a substantial focus outline');

  const studyRows = hangzhouStudyView.locator('[data-study-event]');
  assert.equal(await studyRows.count(), 3, 'Hangzhou must render three study points');
  assert.deepEqual(await trimmedTexts(hangzhouStudyView.locator('[data-study-date]')),
    ['960–1279', '1000–1279', '1100–1279'],
    'Hangzhou study points must remain in chronological order');
  assert.equal(await hangzhouStudyView.locator('[data-study-main-event]').count(), 3,
    'every compact study row must visibly represent its linked main event');
  for (const linkedEvent of await trimmedTexts(hangzhouStudyView.locator('[data-study-main-event]'))) {
    assert.match(linkedEvent, /Linked main event:/i,
      'compact study rows must label their main-event linkage in English');
    assert.match(linkedEvent, /Song/i,
      'Hangzhou study rows must identify their Song main event');
  }

  const secondStudyButton = studyRows.nth(1);
  await secondStudyButton.click();
  assert.equal(await hangzhouStudyView.locator('[data-study-detail]').count(), 1,
    'expanding a study point must leave exactly one detail section open');
  assert.equal(await secondStudyButton.getAttribute('aria-expanded'), 'true',
    'the newly expanded study point must expose its state');
  assert.equal(await secondStudyButton.getAttribute('aria-current'), 'true',
    'the active study point must expose current-item semantics');
  assert.equal(await secondStudyButton.evaluate(element => document.activeElement === element), true,
    'expanding a study point must restore focus to its toggle after rerendering');
  const studyDetailText = await hangzhouStudyView.locator('[data-study-detail]').innerText();
  for (const heading of ['Significance', 'Key people', 'Key terms', 'Evidence', 'Exam connection', 'Source']) {
    assert.match(studyDetailText, new RegExp(heading, 'i'),
      `expanded study detail must include ${heading}`);
  }

  await hangzhouStudyView.locator('[data-location-study-back="1"]').click();
  await expectVisible(page.locator('#eventPanel .event-list'), 'Back must restore Hangzhou event cards');
  const restoredStudyEntry = page.locator('#eventPanel [data-location-study-open="1"]');
  await expectVisible(restoredStudyEntry, 'Back must restore the Hangzhou study entry action');
  assert.equal(await restoredStudyEntry.evaluate(element => document.activeElement === element), true,
    'returning to location events must restore focus to the study entry action');
  await waitForStableAttribute(page.locator('#zoom-layer'), 'transform', {
    label: 'the restored Map camera transform',
  });
  const timelineDetailAfterStudy = await page.locator('#eventPanel').evaluate(panel => ({
    city: panel.querySelector('.city-name')?.textContent.trim(),
    cityCount: panel.querySelector('.city-count')?.textContent.trim(),
    badge: panel.querySelector('.badge')?.textContent.trim(),
    badgeStyle: panel.querySelector('.badge')?.getAttribute('style'),
    cardCount: panel.querySelectorAll('.event-card').length,
    year: panel.querySelector('.ec-yr')?.textContent.trim(),
    category: panel.querySelector('.ec-cat')?.textContent.trim(),
    body: panel.querySelector('.ec-trig')?.textContent.replace(/\s+/g, ' ').trim(),
  }));
  assert.deepEqual(timelineDetailAfterStudy, timelineDetailBeforeStudy,
    'Back must restore the exact canonical Timeline event detail that opened the study view');

  const afterStudy = await page.evaluate(() => {
    const filter = window.__mapFilter.getState();
    const timeline = window.getTimelineState();
    return {
      filter: { query: filter.query, period: filter.period, cats: [...filter.cats].sort() },
      timeline: {
        selectedEventKey: timeline.selectedEventKey,
        selectedAnchor: timeline.selectedAnchor,
      },
      selectedLocation: document.querySelector('#eventPanel .event-head .badge')?.textContent.trim(),
      selectedMapPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
        .map(group => group.querySelector('text')?.textContent.trim()).filter(Boolean).sort(),
      mapTransform: document.querySelector('#zoom-layer')?.getAttribute('transform'),
    };
  });
  assert.deepEqual(afterStudy, beforeStudy,
    'study-view round trips must preserve filters, Timeline selection, location, and the map transform');

  for (const fixture of [
    { number: '1', region: 'asia', count: 3, name: 'Hangzhou' },
    { number: '3', region: 'mideast', count: 2, name: 'Baghdad' },
    { number: '6', region: 'asia', count: 2, name: 'Delhi' },
    { number: '7', region: 'asia', count: 2, name: 'Angkor' },
    { number: '73', region: 'africa', count: 3, name: 'Timbuktu' },
  ]) {
    await page.evaluate(({ number, region }) => window.__mapFilter.openHit(number, region), fixture);
    const entry = page.locator(`#eventPanel [data-location-study-open="${fixture.number}"]`);
    await expectVisible(entry, `pin ${fixture.number} must expose its study action`);
    assert.equal((await entry.innerText()).trim(), `View all ${fixture.count} study points`,
      `pin ${fixture.number} must expose the exact English study count`);
    await entry.press('Enter');
    const view = page.locator(`#eventPanel [data-location-study-view="${fixture.number}"]`);
    await expectVisible(view, `pin ${fixture.number} study view must open from the keyboard`);
    assert.equal((await view.locator('h2').innerText()).trim(), `${fixture.name} · Unit 1`,
      `pin ${fixture.number} must render its English location heading`);
    assert.equal(await view.locator('[data-study-event]').count(), fixture.count,
      `pin ${fixture.number} must render the exact study-point count`);
    assert.doesNotMatch(await view.innerText(), /[\u3400-\u9fff]/,
      `pin ${fixture.number} study view must render English-only copy`);
    await view.locator(`[data-location-study-back="${fixture.number}"]`).click();
  }

  await page.evaluate(() => window.__mapFilter.setPeriod('u2'));
  await page.evaluate(() => window.__mapFilter.openHit('1', 'asia'));
  assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 0,
    'trial locations must not expose study actions outside Unit 1');
  await page.evaluate(() => window.__mapFilter.setPeriod('u1'));
  await page.evaluate(() => window.__mapFilter.openHit('1', 'asia'));
  await expectVisible(page.locator('#eventPanel [data-location-study-open="1"]'),
    'returning to Unit 1 must restore the trial study action');

  await page.evaluate(() => window.__mapFilter.openHit('23', 'europe'));
  assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 0,
    'a non-trial location must retain the original event-card UI');

  await page.evaluate(() => window.__mapFilter.enterRoute('mansa_musa_hajj'));
  await expectVisible(page.locator('#eventPanel .route-panel'),
    'the Unit 1 Mansa Musa trade route must open at trial pin 73');
  assert.equal((await page.locator('#eventPanel [data-route-step].now .rt-num').innerText()).trim(), '73',
    'the route isolation fixture must begin at trial location Timbuktu');
  assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 0,
    'trade-route stops must never expose a location-study entry action');
  assert.equal(await page.locator('#eventPanel [data-route-action]').count(), 4,
    'the route panel must retain its complete control set at a trial location');
  await page.locator('#eventPanel [data-route-action="next"]').click();
  assert.equal((await page.locator('#eventPanel [data-route-step].now .rt-num').innerText()).trim(), '84',
    'route Next must remain usable after rendering a trial-location stop');
  await page.locator('#eventPanel [data-route-action="prev"]').click();
  assert.equal((await page.locator('#eventPanel [data-route-step].now .rt-num').innerText()).trim(), '73',
    'route Previous must return to the trial location without orphaning the itinerary');
  assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 0,
    'returning to a trial route stop must keep the study action isolated');
  assert.equal(await page.locator('#eventPanel [data-route-action]').count(), 4,
    'route controls must remain intact after navigating back to a trial location');
  await page.evaluate(() => window.__mapFilter.exitRoute());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.__mapFilter.setPeriod('u1'));
  await page.evaluate(() => window.__mapFilter.openHit('73', 'africa'));
  const narrowEntry = page.locator('#eventPanel [data-location-study-open="73"]');
  await narrowEntry.focus();
  await narrowEntry.press(' ');
  const narrowStudyView = page.locator('#eventPanel [data-location-study-view="73"]');
  await expectVisible(narrowStudyView, 'at 390x844, Space must open the Timbuktu study view');
  const narrowRows = narrowStudyView.locator('[data-study-event]');
  assert.equal(await narrowRows.count(), 3, 'at 390x844, all Timbuktu study points must remain available');
  const narrowControls = await narrowRows.evaluateAll(rows => rows.map(row => row.getAttribute('aria-controls')));
  assert.equal(narrowControls.filter(Boolean).length, 1,
    'only the expanded Timbuktu study toggle may expose aria-controls');
  assert.ok(narrowControls.slice(1).every(value => value === null),
    'collapsed Timbuktu study toggles must not expose dangling aria-controls');
  await narrowRows.nth(1).focus();
  await narrowRows.nth(1).press(' ');
  assert.equal(await narrowRows.nth(0).getAttribute('aria-expanded'), 'false',
    'expanding a second narrow study point must collapse the first');
  assert.equal(await narrowRows.nth(1).getAttribute('aria-expanded'), 'true',
    'the second narrow study point must expose its expanded state');
  assert.equal(await narrowRows.nth(1).evaluate(element => document.activeElement === element), true,
    'keyboard expansion must restore focus to the activated study toggle');
  assert.equal(await narrowStudyView.locator('[data-study-detail]').count(), 1,
    'at 390x844, only one study detail may be expanded');
  const expandedDetailId = await narrowStudyView.locator('[data-study-detail]').evaluate(element => element.parentElement.id);
  assert.equal(await narrowRows.nth(1).getAttribute('aria-controls'), expandedDetailId,
    'the expanded toggle aria-controls must resolve to its visible detail container');
  const narrowOverflow = await page.evaluate(() => {
    const panel = document.querySelector('#eventPanel');
    const evidence = [...document.querySelectorAll('[data-study-detail] li')];
    return {
      pageClient: document.documentElement.clientWidth,
      pageScroll: document.documentElement.scrollWidth,
      panelClient: panel.clientWidth,
      panelScroll: panel.scrollWidth,
      evidence: evidence.map(item => ({ client: item.clientWidth, scroll: item.scrollWidth })),
    };
  });
  assert.ok(narrowOverflow.pageScroll <= narrowOverflow.pageClient,
    `390x844 study view must not overflow the page: ${JSON.stringify(narrowOverflow)}`);
  assert.ok(narrowOverflow.panelScroll <= narrowOverflow.panelClient,
    `390x844 study view must not overflow the event panel: ${JSON.stringify(narrowOverflow)}`);
  assert.ok(narrowOverflow.evidence.length >= 2
      && narrowOverflow.evidence.every(item => item.scroll <= item.client),
    `390x844 long evidence must wrap inside the panel: ${JSON.stringify(narrowOverflow)}`);

  await page.evaluate(() => window.__mapFilter.enterRoute('not-a-real-route'));
  await expectVisible(narrowStudyView,
    'an invalid public route id must leave the visible study view intact');
  assert.equal(await narrowRows.nth(1).getAttribute('aria-expanded'), 'true',
    'an invalid public route id must preserve the expanded study point');
  await narrowRows.nth(2).press('Enter');
  assert.equal(await narrowRows.nth(2).getAttribute('aria-expanded'), 'true',
    'study interactions must remain live after an invalid route request');
  assert.equal(await narrowStudyView.locator('[data-study-detail]').count(), 1,
    'an invalid route request must preserve one-at-a-time study expansion');
  await narrowRows.nth(1).press('Enter');

  const openTimbuktuFromTimeline = async () => {
    const selected = await page.evaluate(() => window.__mapFilter.selectTimelineEvent(
      'world-event-73-0', { num: '73', region: 'africa' }));
    assert.equal(selected, true, 'the Unit 1 Timbuktu Timeline event must remain selectable');
    const entry = page.locator('#eventPanel [data-location-study-open="73"]');
    await expectVisible(entry, 'the Timbuktu Timeline detail must expose its study entry');
    await entry.click();
    await expectVisible(page.locator('#eventPanel [data-location-study-view="73"]'),
      'the Timbuktu study view must reopen from Timeline detail');
  };
  const assertDefaultTimbuktuExpansion = async message => {
    const rows = page.locator('#eventPanel [data-location-study-view="73"] [data-study-event]');
    assert.equal(await rows.nth(0).getAttribute('aria-expanded'), 'true', `${message}: first point`);
    assert.equal(await rows.nth(1).getAttribute('aria-expanded'), 'false', `${message}: second point`);
    assert.equal(await page.locator('#eventPanel [data-location-study-view="73"] [data-study-detail]').count(), 1,
      `${message}: detail count`);
  };

  await page.evaluate(() => window.__mapFilter.setPeriod('u2'));
  assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0,
    'changing Unit while studying must exit the active location-study view');
  assert.equal(await page.locator('#eventPanel [data-location-study-open]').count(), 0,
    'Unit 2 must not expose a Unit 1 location-study entry');
  await page.evaluate(() => window.__mapFilter.setPeriod('u1'));
  await openTimbuktuFromTimeline();
  await assertDefaultTimbuktuExpansion('a Unit change must clear the previous expansion');

  await page.locator('#eventPanel [data-study-event]').nth(1).click();

  await page.locator('[data-learning-view="chain"]').click();
  await expectVisible(page.locator('#eventPanel .rt-stops-chain'),
    'Chain must still open after narrow location-study use');
  assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0,
    'Chain must clear stale location-study markup');
  await page.locator('[data-learning-view="map"]').click();
  await openTimbuktuFromTimeline();
  await assertDefaultTimbuktuExpansion('Chain must clear the previous expansion');

  await page.locator('#eventPanel [data-study-event]').nth(1).click();
  await page.evaluate(() => window.__mapFilter.enterRoute('mansa_musa_hajj'));
  await expectVisible(page.locator('#eventPanel .route-panel'),
    'a valid route must still open directly from an active study view');
  assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0,
    'a valid route must clear stale location-study markup');
  await page.evaluate(() => window.__mapFilter.exitRoute());
  await page.evaluate(() => window.__mapFilter.setLearningView('map'));
  await openTimbuktuFromTimeline();
  await assertDefaultTimbuktuExpansion('a valid Route must clear the previous expansion');

  await page.locator('#eventPanel [data-study-event]').nth(1).click();
  await page.locator('[data-map-mode="routes"]').click();
  await expectVisible(page.locator('#eventPanel [data-route-go]').first(),
    'the route picker must still open after location-study use');
  assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0,
    'the route picker must not retain stale location-study markup');
  await page.locator('[data-map-mode="events"]').click();
  await openTimbuktuFromTimeline();
  await assertDefaultTimbuktuExpansion('Routes must clear the previous expansion');

  await page.locator('#eventPanel [data-study-event]').nth(1).click();
  await page.locator('[data-learning-view="practice"]').click();
  await expectVisible(page.locator('#eventPanel [data-quiz-start="all"]'),
    'Practice picker must still open after location-study use');
  await page.locator('#eventPanel [data-quiz-start="all"]').click();
  await expectVisible(page.locator('#eventPanel .quiz-panel'),
    'Practice must still start after location-study use');
  assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0,
    'Practice must clear stale location-study markup');
  await page.locator('[data-learning-view="map"]').click();
  await openTimbuktuFromTimeline();
  await assertDefaultTimbuktuExpansion('Practice must clear the previous expansion');

  await page.locator('#eventPanel [data-study-event]').nth(1).click();
  await page.evaluate(() => window.__mapFilter.openHit('23', 'europe'));
  await expectVisible(page.locator('#eventPanel .event-list'),
    'an ordinary non-trial event panel must still open after study use');
  assert.equal(await page.locator('#eventPanel [data-location-study-view]').count(), 0,
    'ordinary event rendering must clear stale location-study markup');
  await openTimbuktuFromTimeline();
  await assertDefaultTimbuktuExpansion('ordinary event rendering must clear the previous expansion');
  await page.setViewportSize({ width: 900, height: 700 });
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
  // source id 是"标点内第几条"按文档顺序算出来的,它同时进了 Unit 映射表、事件 key 和本文件的断言。
  // 新记录一旦插在同一标点已有记录之前,后面每条的 id 都会静默改指向另一段史实 —— 单元归属跟着错位,
  // 而且没有任何东西会报错。基线文件记下建 Unit 8 之前每个 id 的语义,这里逐条比对。
  const baseline = JSON.parse(await readFile(SOURCE_ID_BASELINE_FILE, 'utf8'));
  const liveSourceIds = await page.evaluate(() => {
    const counts = {};
    const out = {};
    document.querySelectorAll('.panel .entry').forEach((entry) => {
      const num = entry.querySelector('.citynum')?.textContent.trim();
      const yr = entry.querySelector('.yr')?.textContent.trim();
      if (!num || !yr) return;
      const ordinal = counts[num] = (counts[num] ?? -1) + 1;
      const trig = (entry.querySelector('.trig')?.textContent || '').replace(/\s+/g, ' ').trim();
      out[`${num}:${ordinal}`] = `${yr}|${trig.slice(0, 24)}`;
    });
    return out;
  });
  const drifted = Object.entries(baseline.signatures)
    .filter(([id, signature]) => liveSourceIds[id] !== signature)
    .map(([id, signature]) => ({ id, was: signature, now: liveSourceIds[id] ?? '(gone)' }));
  assert.deepEqual(drifted, [],
    `no source id may change what it points at; revise the baseline in the same commit and log it: ${JSON.stringify(drifted)}`);
  for (const entry of baseline.revisionLog) {
    assert.equal(liveSourceIds[entry.id], entry.after,
      `${entry.id} is logged as revised on purpose and must read as the log records it: ${entry.why}`);
  }
  const countByPin = (ids) => ids.reduce((tally, id) => {
    const pin = id.split(':')[0];
    tally[pin] = (tally[pin] || 0) + 1;
    return tally;
  }, {});
  const baselineCounts = countByPin(Object.keys(baseline.signatures));
  const liveCounts = countByPin(Object.keys(liveSourceIds));
  for (const [pin, count] of Object.entries(baselineCounts)) {
    assert.ok((liveCounts[pin] || 0) >= count,
      `pin ${pin} must only ever gain records, never lose them (${liveCounts[pin] || 0} < ${count})`);
  }

  // 注:少数记录在 Timeline 上共用一个事件(WORLD_TIMELINE_EVENT_ALIASES,如 Middle Passage 的三条),
  // 所以这里核对的是"declared 必须是该单元、该标点上的一条记录",不拿它去反推事件 key。
  // 一个标点上常有同一单元的好几条记录。哪一条是这一环讲的那条,必须由链自己写明(stopEvents),
  // 否则步进时只能按年份取第一条 —— Unit 9 最后一环就会点亮 1948 年的人权宣言而不是 2015 年的巴黎协定。
  const ringRecords = await page.evaluate(() => window.__mapFilter.getChains().map((chain) => ({
    id: chain.id, units: chain.units, stopPins: chain.stopPins, stopEvents: chain.stopEvents,
  })));
  const recordsByUnitPin = await page.evaluate(() => {
    const counts = {};
    const byId = {};
    document.querySelectorAll('.panel .entry').forEach((entry) => {
      const num = entry.querySelector('.citynum')?.textContent.trim();
      const yr = entry.querySelector('.yr')?.textContent.trim();
      if (!num || !yr) return;
      const ordinal = counts[num] = (counts[num] ?? -1) + 1;
      byId[`${num}:${ordinal}`] = num;
    });
    return byId;
  });
  const unitMembership = await page.evaluate(() => window.getTimelineState().unitMembers || null);
  for (const chain of ringRecords) {
    const unit = (chain.units || [])[0];
    if (!unit || !unitMembership) continue;
    const members = unitMembership[unit] || [];
    chain.stopPins.forEach((pin, index) => {
      const onPin = members.filter((id) => recordsByUnitPin[id] === String(pin));
      const declared = chain.stopEvents[index];
      if (onPin.length > 1) {
        assert.ok(declared, `${chain.id} ring ${index + 1} sits on pin ${pin}, which carries ${onPin.length} ${unit} records, so it must name the one it means`);
        assert.ok(onPin.includes(declared), `${chain.id} ring ${index + 1} names ${declared}, which is not a ${unit} record on pin ${pin}`);
      } else if (declared) {
        assert.ok(onPin.includes(declared), `${chain.id} ring ${index + 1} names ${declared}, which is not a ${unit} record on pin ${pin}`);
      }
    });
  }

  const reviewedUnitAssignments = await page.evaluate(() => {
    const visibleKeysFor = (unit) => {
      window.__mapFilter.setPeriod(unit);
      return [...window.getTimelineState().visibleEventKeys];
    };
    return {
      u1: visibleKeysFor('u1'),
      u2: visibleKeysFor('u2'),
      u3: visibleKeysFor('u3'),
      u4: visibleKeysFor('u4'),
      u5: visibleKeysFor('u5'),
    };
  });
  assert.ok(reviewedUnitAssignments.u1.includes('world-event-1-0'), 'Song source 1:0 must remain assigned to Unit 1');
  assert.ok(reviewedUnitAssignments.u1.includes('world-event-3-0'), 'Baghdad source 3:0 must remain assigned to Unit 1');
  assert.ok(!reviewedUnitAssignments.u1.includes('world-event-23-4'), 'Black Death source 23:4 must leave Unit 1');
  assert.ok(reviewedUnitAssignments.u2.includes('world-event-23-4'), 'Black Death source 23:4 must be assigned to Unit 2');
  assert.ok(reviewedUnitAssignments.u3.includes('world-event-18-3'),
    'Ottoman devshirme source 18:3 must be assigned to Unit 3');
  for (const key of ['world-event-49-7', 'world-event-100-0', 'world-event-57-1', 'world-event-57-2']) {
    assert.ok(!reviewedUnitAssignments.u3.includes(key), `${key} must leave Unit 3`);
    assert.ok(reviewedUnitAssignments.u4.includes(key), `${key} must be assigned to Unit 4`);
  }
  for (const key of ['world-event-24-4', 'world-event-23-2']) {
    assert.ok(!reviewedUnitAssignments.u3.includes(key), `${key} must leave Unit 3`);
    assert.ok(reviewedUnitAssignments.u5.includes(key), `${key} must be assigned to Unit 5`);
  }
  await page.evaluate(() => window.__mapFilter.setPeriod(''));
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

  const allPeriodOptions = await page.evaluate(() => window.__mapFilter.getPeriodOptions());
  assert.deepEqual(allPeriodOptions.map(({ value }) => value),
    ['', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'],
    'AP World Unit options must place All Units first, followed by Unit 1 through Unit 9');
  const periods = allPeriodOptions.filter(({ value }) => value);
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
    { id: 'u1_main', units: ['u1'], entryUnit: 'u1', from: null, toUnit: 'u2', toChain: 'u2_main', pending: false },
    { id: 'u2_main', units: ['u2'], entryUnit: 'u2', from: 'u1_main', toUnit: 'u3', toChain: 'u3_main', pending: false },
    { id: 'u3_main', units: ['u3'], entryUnit: 'u3', from: 'u2_main', toUnit: 'u4', toChain: 'u4_main', pending: false },
    { id: 'u4_main', units: ['u4'], entryUnit: 'u4', from: 'u3_main', toUnit: 'u5', toChain: 'u5_main', pending: false },
    { id: 'u5_main', units: ['u5'], entryUnit: 'u5', from: 'u4_main', toUnit: 'u6', toChain: 'u6_main', pending: false },
    { id: 'u6_main', units: ['u6'], entryUnit: 'u6', from: 'u5_main', toUnit: 'u7', toChain: 'u7_main', pending: false },
    { id: 'u7_main', units: ['u7'], entryUnit: 'u7', from: 'u6_main', toUnit: 'u8', toChain: 'u8_main', pending: false },
    { id: 'u8_main', units: ['u8'], entryUnit: 'u8', from: 'u7_main', toUnit: 'u9', toChain: 'u9_main', pending: false },
    { id: 'u9_main', units: ['u9'], entryUnit: 'u9', from: 'u8_main', toUnit: null, toChain: null, pending: false },
  ], 'course mainline must expose all nine approved units and no pending tail');
  assert.equal(courseMainline.some(segment => segment.pending), false,
    'every unit now has an approved chain, so the mainline must not render a pending tail');
  assert.ok(courseMainline.every(segment => segment.tier === 'main'),
    'course-mainline segments must all be main-tier chains');
  assert.ok(courseMainline.slice(0, -1).every(segment => segment.to?.summary?.trim()),
    'every segment but the last must own the prose for its outgoing seam');
  assert.equal(courseMainline[courseMainline.length - 1].to, null,
    'the final unit hands off to nobody, so it must carry no outgoing seam');
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

  const chainPanelControls = page.locator('#eventPanel [data-chain-panel-view]');
  assert.equal(await chainPanelControls.count(), 2,
    'causal-chain panels must expose exactly two Unit/course-mainline controls');
  assert.deepEqual(await trimmedTexts(chainPanelControls), ['当前单元', '九单元主线'],
    'causal-chain panel controls must use the approved two-state labels');
  assert.equal(await page.locator('#eventPanel [data-chain-panel-view="unit"]').getAttribute('aria-pressed'), 'true',
    'Current Unit must be pressed by default');
  assert.equal(await page.locator('#eventPanel [data-chain-panel-view="mainline"]').getAttribute('aria-pressed'), 'false',
    'course mainline must be released by default');

  await page.evaluate(() => window.__mapFilter.setPeriod('u4'));
  await page.locator('#eventPanel [data-chain-panel-view="mainline"]').click();
  await expectVisible(page.locator('#eventPanel [data-course-mainline]'),
    'course mainline must render inside the existing event panel');
  assert.equal((await page.evaluate(() => window.__mapFilter.getState())).period, 'u4',
    'opening the course mainline must preserve the active Unit');
  await expectVisible(page.locator('#mapStudyView'), 'opening the course mainline must preserve the map');
  assert.deepEqual(await trimmedTexts(page.locator('#eventPanel [data-chain-panel-view][aria-pressed="true"]')), ['九单元主线'],
    'opening the course mainline must press only its panel control');

  const implementedMainline = page.locator('#eventPanel [data-mainline-chain]');
  assert.deepEqual(await implementedMainline.evaluateAll(nodes => nodes.map(node => node.dataset.mainlineChain)),
    ['u1_main', 'u2_main', 'u3_main', 'u4_main', 'u5_main', 'u6_main', 'u7_main', 'u8_main', 'u9_main'],
    'course mainline must render implemented chains in canonical order');
  const implementedMainlineText = await implementedMainline.allTextContents();
  courseMainline.filter(segment => !segment.pending).forEach((segment, index) => {
    assert.ok(implementedMainlineText[index].includes(segment.chip),
      `${segment.id} mainline card must show its canonical short label`);
    assert.match(implementedMainlineText[index], new RegExp(`${segment.rings}\\s*环`),
      `${segment.id} mainline card must show its canonical ring count`);
  });
  assert.equal(await page.locator('#eventPanel [data-mainline-pending]').count(), 0,
    'with all nine units built the course mainline must render no pending tail');
  assert.deepEqual(await trimmedTexts(page.locator('#eventPanel [data-mainline-bridge]')),
    courseMainline.filter(segment => segment.to?.summary).map(segment => segment.to.summary),
    'each course-mainline bridge must derive from the preceding segment handoff summary');
  assert.equal(await page.locator('#eventPanel [data-mainline-bridge]').count(), courseMainline.length - 1,
    'a bridge is a handoff between two segments, so the last segment must not render one');
  assert.equal(await page.locator('#eventPanel [data-course-mainline] [data-mainline-chain*="_sub_"]').count(), 0,
    'supplementary chain IDs must never appear in the course mainline');

  const clickMainlineSegment = async (id, expectedPeriod, expectedPin, expectedRings) => {
    await page.locator(`#eventPanel [data-mainline-chain="${id}"]`).click();
    const state = await page.evaluate(() => ({
      learning: window.__mapFilter.getLearningState(),
      period: window.__mapFilter.getState().period,
      selectedPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
        .map(group => group.querySelector('text')?.textContent.trim()),
    }));
    assert.equal(state.period, expectedPeriod, `${id} must select its entry Unit`);
    assert.equal(state.learning.chainPanel, 'unit', `${id} must restore the Current Unit panel`);
    assert.equal(state.learning.chainId, id, `${id} must open its canonical chain`);
    assert.equal(state.learning.chainStep, 0, `${id} must open its first ring`);
    assert.ok(state.selectedPins.includes(String(expectedPin)), `${id} must select first anchor ${expectedPin}`);
    assert.equal(await page.locator('#eventPanel [data-route-step]').count(), expectedRings,
      `${id} must preserve its canonical ring count`);
    assert.deepEqual(await trimmedTexts(page.locator('#eventPanel [data-chain-panel-view][aria-pressed="true"]')), ['当前单元'],
      `${id} must restore only the Current Unit control`);
  };

  await clickMainlineSegment('u2_main', 'u2', 73, 8);
  await page.locator('#eventPanel [data-chain-panel-view="mainline"]').click();
  await clickMainlineSegment('u3_main', 'u3', 19, 8);
  await page.locator('#eventPanel [data-chain-panel-view="mainline"]').click();
  await clickMainlineSegment('u1_main', 'u1', 7, 8);
  await page.locator('#eventPanel [data-chain-panel-view="mainline"]').click();
  await clickMainlineSegment('u4_main', 'u4', 42, 8);

  await page.evaluate(() => window.__mapFilter.setPeriod('u2'));
  const unit2Seams = page.locator('#eventPanel [data-chain-seam]');
  assert.equal(await unit2Seams.count(), 2,
    'Unit 2 main chain must render exactly one incoming and one outgoing cross-unit seam');
  assert.match(await page.locator('#eventPanel [data-chain-seam="from"]').innerText(), /承自\s*UNIT\s*1/i,
    'Unit 2 incoming seam must identify Unit 1');
  assert.match(await page.locator('#eventPanel [data-chain-seam="to"]').innerText(), /交棒\s*UNIT\s*3/i,
    'Unit 2 outgoing seam must identify Unit 3');
  assert.equal(await page.locator('#eventPanel [data-route-step]').count(), 8,
    'cross-unit seams must not change the Unit 2 ring count');
  const seamAccessibility = await page.evaluate(() => {
    const rgba = (value) => {
      const parts = value.match(/[\d.]+/g)?.map(Number) || [];
      return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
    };
    const blend = (top, bottom, alpha) => top.map((channel, i) => channel * alpha + bottom[i] * (1 - alpha));
    const backgroundAt = (element) => {
      const ancestors = [];
      for (let node = element; node; node = node.parentElement) ancestors.unshift(node);
      return ancestors.reduce((background, node) => {
        const color = rgba(getComputedStyle(node).backgroundColor);
        return color.rgb.length === 3 && color.alpha > 0 ? blend(color.rgb, background, color.alpha) : background;
      }, [255, 255, 255]);
    };
    const luminance = (rgb) => rgb.map(channel => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
    const contrast = (element) => {
      const foreground = rgba(getComputedStyle(element).color).rgb;
      const values = [luminance(foreground), luminance(backgroundAt(element))].sort((a, b) => b - a);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };
    const seams = [...document.querySelectorAll('#eventPanel [data-chain-seam]')];
    return {
      tags: seams.map(seam => seam.tagName),
      labelRatio: contrast(seams[0].querySelector('.rt-seam-label')),
      actionRatio: contrast(seams[1].querySelector('.rt-seam-action')),
    };
  });
  assert.deepEqual(seamAccessibility.tags, ['DIV', 'DIV'],
    'cross-unit seam containers must not create unlabeled complementary landmarks');
  assert.ok(seamAccessibility.labelRatio >= 4.5,
    `cross-unit seam label contrast must be at least 4.5:1; found ${seamAccessibility.labelRatio.toFixed(2)}:1`);
  assert.ok(seamAccessibility.actionRatio >= 4.5,
    `cross-unit seam action contrast must be at least 4.5:1; found ${seamAccessibility.actionRatio.toFixed(2)}:1`);

  await page.evaluate(() => window.__mapFilter.enterRoute('u1_sub_syncretism'));
  assert.equal(await page.locator('#eventPanel [data-chain-seam]').count(), 0,
    'supplementary chains must not render cross-unit seams');

  await page.evaluate(() => window.__mapFilter.enterRoute('u2_main'));
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
  assert.equal(outgoingBoundaryState.period, 'u3',
    'outgoing seam must select successor Unit 3 through the canonical Unit filter');
  assert.equal(outgoingBoundaryState.learning.chainId, 'u3_main',
    'outgoing seam must open the Unit 3 empires chain');
  assert.equal(outgoingBoundaryState.learning.chainStep, 0,
    'outgoing seam must select the successor first ring');
  assert.ok(outgoingBoundaryState.selectedPins.includes('19'),
    'outgoing seam must synchronize the selected map anchor to pin 19');
  assert.equal(await page.locator('#eventPanel [data-route-step]').count(), 8,
    'outgoing navigation must preserve the Unit 3 chain ring count');
  assert.match(await page.locator('#eventPanel [data-route-step].now').innerText(), /19.*Isfahan/is,
    'outgoing navigation must select Unit 3 first boundary pin 19 at Isfahan');

  await page.locator('#eventPanel [data-chain-seam="to"] [data-chain-boundary]').click();
  const unit3OutgoingBoundaryState = await page.evaluate(() => ({
    learning: window.__mapFilter.getLearningState(),
    period: window.__mapFilter.getState().period,
    selectedPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => group.querySelector('text')?.textContent.trim()),
  }));
  assert.equal(unit3OutgoingBoundaryState.period, 'u4',
    'Unit 3 outgoing seam must select successor Unit 4 through the canonical Unit filter');
  assert.equal(unit3OutgoingBoundaryState.learning.chainId, 'u4_main',
    'Unit 3 outgoing seam must open the Unit 4 Atlantic chain');
  assert.ok(unit3OutgoingBoundaryState.selectedPins.includes('42'),
    'Unit 3 outgoing seam must synchronize the selected map anchor to pin 42');
  assert.match(await page.locator('#eventPanel [data-route-step].now').innerText(), /42.*Lisbon/is,
    'Unit 3 outgoing navigation must select Unit 4 first boundary pin 42 at Lisbon');
  assert.match(await page.locator('#eventPanel [data-chain-seam="to"]').innerText(), /交棒\s*UNIT\s*5/i,
    'Unit 4 outgoing seam must identify the implemented Unit 5 chain');
  await page.evaluate(() => window.__mapFilter.setPeriod('u8'));
  await page.locator('[data-learning-view="chain"]').click();
  const finalSeam = page.locator('#eventPanel [data-chain-seam="to"]');
  assert.match(await finalSeam.innerText(), /交棒\s*UNIT\s*9/i,
    'Unit 8 outgoing seam must identify Unit 9');
  assert.equal(await finalSeam.locator('[data-chain-boundary]').getAttribute('data-chain-boundary'), 'u9_main',
    'Unit 8 outgoing seam must open the implemented Unit 9 chain');
  assert.equal(await finalSeam.locator('.rt-seam-pending').count(), 0,
    'Unit 9 is built, so its incoming seam must not be labelled pending');
  await page.evaluate(() => window.__mapFilter.setPeriod('u9'));
  assert.equal(await page.locator('#eventPanel [data-chain-seam="to"]').count(), 0,
    'the final unit hands off to nobody, so it must render no outgoing seam');
  assert.match(await page.locator('#eventPanel [data-chain-seam="from"]').innerText(), /承自\s*UNIT\s*8/i,
    'the final unit must still carry its incoming seam from Unit 8');

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
  assert.deepEqual(await buttonSurfaceMetrics(page.locator('#mapPanelTabs [data-map-mode]')), [
    { hitHeight: 44, fontSize: '13px', paddingLeft: '14px', paddingRight: '14px', surfaceTop: '3px', surfaceBottom: '3px' },
    { hitHeight: 44, fontSize: '13px', paddingLeft: '14px', paddingRight: '14px', surfaceTop: '3px', surfaceBottom: '3px' },
  ], 'standalone Map secondary modes must pair a 44px hit target with a 38px painted pill');
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
  // 九个单元现在都有链,所以"待建"空态已经无法到达 —— 这里改成正面断言:每个单元都渲染出自己的链。
  for (const unit of ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9']) {
    await page.locator('#periodFilter').selectOption(unit);
    assert.equal(await page.locator('#eventZone').getAttribute('aria-label'), 'Unit 因果链',
      `${unit}: the Unit causal-chain label must survive every Unit switch`);
    await expectVisible(page.locator('#eventPanel .rt-stops-chain'), `${unit}: must render its approved chain`);
    assert.equal(await page.locator('#eventPanel [data-route-go]').count(), 1,
      `${unit}: must expose exactly one main-chain choice`);
    assert.doesNotMatch(await page.locator('#eventPanel').innerText(), /因果链正在整理|因果链待完善/,
      `${unit}: no unit may still advertise a pending chain`);
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
  const narrowToggleBoxes = await page.locator('#eventPanel [data-chain-panel-view]').evaluateAll(nodes =>
    nodes.map(node => {
      const box = node.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }));
  assert.equal(narrowToggleBoxes.length, 2, 'responsive Chain panel must retain both panel controls');
  assert.ok(narrowToggleBoxes[0].right <= narrowToggleBoxes[1].left || narrowToggleBoxes[0].bottom <= narrowToggleBoxes[1].top,
    'at 700x900, causal-chain panel controls must not overlap');
  await page.locator('#eventPanel [data-chain-panel-view="mainline"]').click();
  await expectVisible(page.locator('#eventPanel [data-course-mainline]'),
    'at 700x900, course mainline must render in the stacked right panel');
  const narrowMainlineLayout = await page.evaluate(() => {
    const map = document.querySelector('#mapStudyView').getBoundingClientRect();
    const panel = document.querySelector('#eventZone').getBoundingClientRect();
    return {
      stacked: panel.y >= map.y + map.height - 1,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      label: document.querySelector('#eventZone').getAttribute('aria-label'),
      primaryPressed: [...document.querySelectorAll('.learning-view-tab[aria-pressed="true"]')].map(node => node.textContent.trim()),
    };
  });
  assert.equal(narrowMainlineLayout.stacked, true,
    'at 700x900, course mainline panel must remain stacked below the map');
  assert.ok(narrowMainlineLayout.overflow <= 0,
    `at 700x900, course mainline must not create horizontal overflow; found ${narrowMainlineLayout.overflow}px`);
  assert.equal(narrowMainlineLayout.label, 'Unit 因果链',
    'at 700x900, course mainline must retain the causal-chain contextual label');
  assert.deepEqual(narrowMainlineLayout.primaryPressed, ['因果链'],
    'at 700x900, course mainline must keep only Chain pressed as the primary view');
}

async function verifyHomeLearningShell(page, port) {
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  const frame = page.frameLocator('#worldMapFrame');
  await frame.locator('body').waitFor();
  await page.waitForFunction(() => document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter);
  await page.waitForFunction(() => document.querySelector('#hostPeriod')?.options.length > 1);

  await page.setViewportSize({ width: 1440, height: 900 });
  await waitForEmbeddedWorldLayout(page, { viewportWidth: 1440, mapZoneHeight: 500 });
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

  // The shipped experience is index.html, where the contextual panel is cloned out of the
  // iframe. Prove that the clone remains a real control surface for the Unit 1 study layer.
  await page.locator('.map-card-head [data-learning-view="map"]').click();
  await page.waitForFunction(() =>
    document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getLearningState().view === 'map');
  await page.locator('#hostPeriod').selectOption('u1');
  await page.waitForFunction(() =>
    document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getState().period === 'u1');
  const homeHangzhouTitle = await frame.locator('body').evaluate(() =>
    window.getTimelineState().visibleEvents.find(event => event.key === 'world-event-1-0')?.titleEn);
  assert.ok(homeHangzhouTitle, 'the homepage search fixture must resolve Hangzhou in Unit 1');
  await page.locator('#hostSearch').fill(homeHangzhouTitle);
  const homeHangzhouResult = page.locator('#home-events [data-event-key="world-event-1-0"]');
  await homeHangzhouResult.waitFor();
  await homeHangzhouResult.click();
  const homeStudyEntry = page.locator('#home-events [data-location-study-open="1"]');
  await homeStudyEntry.waitFor();
  await expectVisible(homeStudyEntry,
    'the primary homepage must mirror Hangzhou ordinary cards and its location-study action');
  assert.ok(await page.locator('#home-events .event-card').count() >= 1,
    'the primary homepage must retain cloned ordinary Hangzhou cards');
  assert.equal((await homeStudyEntry.innerText()).trim(), 'View all 3 study points',
    'the primary homepage must clone the exact English Hangzhou study label');
  await page.locator('body').evaluate(() => document.activeElement?.blur());
  for (let tabs = 0; tabs < 60
      && !await homeStudyEntry.evaluate(element => document.activeElement === element); tabs++) {
    await page.keyboard.press('Tab');
  }
  assert.equal(await homeStudyEntry.evaluate(element => document.activeElement === element), true,
    'keyboard navigation must reach the cloned study entry');
  const homeEntryPresentation = await homeStudyEntry.evaluate(element => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      height: box.height,
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth),
      whiteSpace: style.whiteSpace,
    };
  });
  assert.notEqual(homeEntryPresentation.outlineStyle, 'none',
    `the focused cloned study entry must show a visible outline: ${JSON.stringify(homeEntryPresentation)}`);
  assert.ok(homeEntryPresentation.outlineWidth >= 2,
    `the focused cloned study entry outline must be substantial: ${JSON.stringify(homeEntryPresentation)}`);
  assert.equal(homeEntryPresentation.whiteSpace, 'normal',
    `the cloned study entry label must be allowed to wrap: ${JSON.stringify(homeEntryPresentation)}`);

  const originalHomeLocation = await page.locator('#home-events').evaluate(panel => ({
    city: panel.querySelector('.city-name')?.textContent.trim(),
    badge: panel.querySelector('.badge')?.textContent.trim(),
    cards: [...panel.querySelectorAll('.event-card')].map(card => card.textContent.replace(/\s+/g, ' ').trim()),
  }));
  await homeStudyEntry.click();
  const homeStudyView = page.locator('#home-events [data-location-study-view="1"]');
  await expectVisible(homeStudyView,
    'activating the cloned homepage study action must open the Hangzhou study view');
  const homeStudyHeading = homeStudyView.locator('.location-study-title');
  assert.equal((await homeStudyHeading.innerText()).trim(), 'Hangzhou · Unit 1',
    'the cloned homepage study view must retain its English heading');
  assert.equal(await homeStudyHeading.evaluate(element => document.activeElement === element), true,
    'opening study from the clone must focus the cloned heading');
  const homeStudyRows = homeStudyView.locator('[data-study-event]');
  assert.equal(await homeStudyRows.count(), 3,
    'the cloned homepage study view must expose all three Hangzhou study points');
  const rejectedHomeStudyActions = await frame.locator('body').evaluate(() => ({
    open: window.__mapFilter.openLocationStudy('73'),
    toggle: window.__mapFilter.toggleLocationStudy('not-a-study-point'),
    adversarialToggle: window.__mapFilter.toggleLocationStudy(`not-a-study'][data-study-event="x"]`),
  }));
  assert.deepEqual(rejectedHomeStudyActions, { open: false, toggle: false, adversarialToggle: false },
    'the public homepage study bridge must reject unrelated locations and arbitrary or selector-like study ids');
  assert.equal(await homeStudyView.locator('[data-study-event][aria-expanded="true"]').count(), 1,
    'rejected public study actions must preserve the one-open-detail state');

  const homeStudyDesktopPresentation = await homeStudyView.evaluate(view => {
    const row = view.querySelector('[data-study-event]');
    const viewBox = view.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    return {
      viewWidth: viewBox.width,
      viewScrollWidth: view.scrollWidth,
      rowHeight: rowBox.height,
      rowDisplay: getComputedStyle(row).display,
      rowWhiteSpace: getComputedStyle(row).whiteSpace,
    };
  });
  assert.ok(homeStudyDesktopPresentation.rowHeight >= 44,
    `the desktop cloned study toggle must retain a 44px target: ${JSON.stringify(homeStudyDesktopPresentation)}`);
  assert.ok(homeStudyDesktopPresentation.viewScrollWidth <= homeStudyDesktopPresentation.viewWidth + 1,
    `the desktop cloned study view must not overflow: ${JSON.stringify(homeStudyDesktopPresentation)}`);
  assert.equal(homeStudyDesktopPresentation.rowDisplay, 'grid',
    `the cloned study row must retain its two-column desktop layout: ${JSON.stringify(homeStudyDesktopPresentation)}`);
  assert.equal(homeStudyDesktopPresentation.rowWhiteSpace, 'normal',
    `the cloned study row copy must wrap normally: ${JSON.stringify(homeStudyDesktopPresentation)}`);

  await page.setViewportSize({ width: 700, height: 900 });
  const secondHomeStudyRow = homeStudyView.locator('[data-study-event]').nth(1);
  await secondHomeStudyRow.click();
  assert.equal(await homeStudyView.locator('[data-study-detail]').count(), 1,
    'expanding from cloned controls must leave exactly one study detail visible');
  assert.equal(await secondHomeStudyRow.getAttribute('aria-expanded'), 'true',
    'the cloned non-default study toggle must expose expanded state');
  assert.equal(await secondHomeStudyRow.evaluate(element => document.activeElement === element), true,
    'expanding from cloned controls must return focus to the cloned toggle');
  const expandedHomeDetailId = await homeStudyView.locator('[data-study-detail]').evaluate(
    detail => detail.parentElement.id);
  assert.equal(await secondHomeStudyRow.getAttribute('aria-controls'), expandedHomeDetailId,
    'the cloned expanded toggle must control its one visible detail');
  assert.ok((await homeStudyView.locator('[data-study-event][aria-controls]').count()) === 1,
    'collapsed cloned study toggles must not expose dangling aria-controls references');
  const homeStudyNarrowOverflow = await page.evaluate(() => ({
    pageClient: document.documentElement.clientWidth,
    pageScroll: document.documentElement.scrollWidth,
    panelClient: document.querySelector('#home-events').clientWidth,
    panelScroll: document.querySelector('#home-events').scrollWidth,
  }));
  assert.ok(homeStudyNarrowOverflow.pageScroll <= homeStudyNarrowOverflow.pageClient + 1,
    `the narrow homepage study view must not overflow the page: ${JSON.stringify(homeStudyNarrowOverflow)}`);
  assert.ok(homeStudyNarrowOverflow.panelScroll <= homeStudyNarrowOverflow.panelClient + 1,
    `the narrow homepage study view must not overflow its panel: ${JSON.stringify(homeStudyNarrowOverflow)}`);

  await homeStudyView.locator('[data-location-study-back="1"]').click();
  const restoredHomeStudyEntry = page.locator('#home-events [data-location-study-open="1"]');
  await expectVisible(restoredHomeStudyEntry,
    'Back from cloned study controls must restore the ordinary Hangzhou panel');
  assert.equal(await restoredHomeStudyEntry.evaluate(element => document.activeElement === element), true,
    'Back from the clone must focus the restored cloned study entry');
  assert.ok(homeEntryPresentation.height >= 44,
    `the cloned study entry must retain a 44px target: ${JSON.stringify(homeEntryPresentation)}`);
  const restoredHomeLocation = await page.locator('#home-events').evaluate(panel => ({
    city: panel.querySelector('.city-name')?.textContent.trim(),
    badge: panel.querySelector('.badge')?.textContent.trim(),
    cards: [...panel.querySelectorAll('.event-card')].map(card => card.textContent.replace(/\s+/g, ' ').trim()),
  }));
  assert.deepEqual(restoredHomeLocation, originalHomeLocation,
    'Back from the clone must restore the exact ordinary panel identity');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#hostSearch').fill('');
  await page.locator('#hostPeriod').selectOption('');
  await page.locator('.map-card-head [data-learning-view="chain"]').click();
  await page.waitForFunction(() =>
    document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getLearningState().view === 'chain');

  for (const viewport of [{ width: 1100, height: 850 }, { width: 700, height: 900 }]) {
    await page.setViewportSize(viewport);
    await waitForEmbeddedWorldLayout(page, {
      viewportWidth: viewport.width,
      mapZoneHeight: viewport.width <= 900 ? 300 : 500,
      timeout: 4_000,
    });
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

  const homeChainPanelControls = page.locator('#home-events [data-chain-panel-view]');
  assert.equal(await homeChainPanelControls.count(), 2,
    'the homepage Chain panel must mirror both chain-scope controls');
  assert.deepEqual(await trimmedTexts(homeChainPanelControls), ['当前单元', '九单元主线'],
    'the homepage Chain panel must mirror the approved chain-scope labels');
  await homeChainPanelControls.first().scrollIntoViewIfNeeded();
  const homeControlUsability = await page.locator('#home-events').evaluate(panel => {
    const buttons = [...panel.querySelectorAll('[data-chain-panel-view]')];
    const boxes = buttons.map(button => button.getBoundingClientRect());
    const topmost = buttons.map((button, index) => {
      const box = boxes[index];
      return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('[data-chain-panel-view]') === button;
    });
    const rtTop = panel.querySelector('.rt-top')?.getBoundingClientRect();
    return {
      visible: buttons.map(button => {
        const style = getComputedStyle(button);
        return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0;
      }),
      controlsOverlap: boxes.length === 2
        && boxes[0].left < boxes[1].right && boxes[0].right > boxes[1].left
        && boxes[0].top < boxes[1].bottom && boxes[0].bottom > boxes[1].top,
      coveredByHeader: Boolean(rtTop && boxes.some(box =>
        box.left < rtTop.right && box.right > rtTop.left && box.top < rtTop.bottom && box.bottom > rtTop.top)),
      topmost,
    };
  });
  assert.deepEqual(homeControlUsability.visible, [true, true],
    'homepage chain-scope controls must be visible');
  assert.equal(homeControlUsability.controlsOverlap, false,
    'homepage chain-scope controls must not overlap each other');
  assert.equal(homeControlUsability.coveredByHeader, false,
    'homepage sticky chain header must not cover the chain-scope controls');
  assert.deepEqual(homeControlUsability.topmost, [true, true],
    'homepage chain-scope controls must be the clickable topmost elements at their centers');

  const embeddedCourseMainline = await frame.locator('body').evaluate(() => window.__mapFilter.getCourseMainline());
  await page.locator('#home-events [data-chain-panel-view="mainline"]').click();
  await page.waitForFunction(() =>
    document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter?.getLearningState().chainPanel === 'mainline');
  await expectVisible(page.locator('#home-events [data-course-mainline]'),
    'clicking the homepage course-mainline control must refresh the mirrored panel');
  const mirroredMainlineSegments = page.locator('#home-events [data-mainline-chain]');
  assert.deepEqual(await mirroredMainlineSegments.evaluateAll(nodes => nodes.map(node => node.dataset.mainlineChain)),
    ['u1_main', 'u2_main', 'u3_main', 'u4_main', 'u5_main', 'u6_main', 'u7_main', 'u8_main', 'u9_main'],
    'the homepage must mirror canonical implemented mainline segments');
  const mirroredMainlineText = await mirroredMainlineSegments.allTextContents();
  embeddedCourseMainline.filter(segment => !segment.pending).forEach((segment, index) => {
    assert.ok(mirroredMainlineText[index].includes(segment.chip),
      `homepage ${segment.id} card must show its canonical short label`);
    assert.match(mirroredMainlineText[index], new RegExp(`${segment.rings}\\s*环`),
      `homepage ${segment.id} card must show its canonical ring count`);
  });
  assert.deepEqual(await trimmedTexts(page.locator('#home-events [data-mainline-bridge]')),
    embeddedCourseMainline.filter(segment => segment.to?.summary).map(segment => segment.to.summary),
    'the homepage must mirror canonical mainline bridges');
  assert.equal(await page.locator('#home-events [data-mainline-pending]').count(), 0,
    'the homepage must mirror a course mainline with no pending tail');

  await page.locator('#home-events [data-mainline-chain="u2_main"]').click();
  await page.waitForFunction(() => {
    const api = document.querySelector('#worldMapFrame')?.contentWindow?.__mapFilter;
    const state = api?.getLearningState?.();
    return api?.getState?.().period === 'u2' && state?.chainPanel === 'unit'
      && state?.chainId === 'u2_main' && state?.chainStep === 0;
  });
  const mirroredSegmentState = await frame.locator('body').evaluate(() => ({
    state: window.__mapFilter.getLearningState(),
    period: window.__mapFilter.getState().period,
    selectedPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => group.querySelector('text')?.textContent.trim()),
  }));
  assert.equal(mirroredSegmentState.period, 'u2', 'homepage Unit 2 segment must select Unit 2');
  assert.equal(mirroredSegmentState.state.chainPanel, 'unit', 'homepage Unit 2 segment must restore Current Unit');
  assert.equal(mirroredSegmentState.state.chainId, 'u2_main', 'homepage Unit 2 segment must open its chain');
  assert.equal(mirroredSegmentState.state.chainStep, 0, 'homepage Unit 2 segment must open its first ring');
  assert.ok(mirroredSegmentState.selectedPins.includes('73'), 'homepage Unit 2 segment must select boundary pin 73');
  await expectVisible(page.locator('#home-events .rt-stops-chain'),
    'homepage Unit 2 segment must return the mirrored panel to Current Unit content');
  assert.deepEqual(await trimmedTexts(page.locator('#home-events [data-chain-panel-view][aria-pressed="true"]')), ['当前单元'],
    'homepage Unit 2 segment must restore only the Current Unit panel control');

  const readSeamStyles = (seam) => {
    const action = seam.querySelector('.rt-seam-action');
    const copy = seam.querySelector('.rt-seam-copy');
    const seamStyle = getComputedStyle(seam);
    const actionStyle = getComputedStyle(action);
    const copyStyle = getComputedStyle(copy);
    return {
      seamBackground: seamStyle.backgroundColor,
      seamBorderLeftWidth: seamStyle.borderLeftWidth,
      seamBorderRadius: seamStyle.borderRadius,
      seamPadding: seamStyle.padding,
      actionBorderRadius: actionStyle.borderRadius,
      actionFontFamily: actionStyle.fontFamily,
      actionFontSize: actionStyle.fontSize,
      actionFontWeight: actionStyle.fontWeight,
      actionMinHeight: actionStyle.minHeight,
      copyFontSize: copyStyle.fontSize,
      copyLineHeight: copyStyle.lineHeight,
    };
  };
  const mirroredSeamStyles = await page.locator('#home-events [data-chain-seam="to"]').evaluate(readSeamStyles);
  const independentSeamStyles = await frame.locator('#eventPanel [data-chain-seam="to"]').evaluate(readSeamStyles);
  assert.deepEqual(mirroredSeamStyles, independentSeamStyles,
    'homepage cross-Unit seam must preserve the independent APWH panel typography and card styling');

  await page.locator('#home-events [data-chain-seam="to"] [data-chain-boundary]').click();
  await page.waitForTimeout(180);
  const mirroredOutgoingSeamState = await frame.locator('body').evaluate(() => ({
    state: window.__mapFilter.getLearningState(),
    period: window.__mapFilter.getState().period,
    selectedPins: [...document.querySelectorAll('.pin-group.timeline-selected')]
      .map(group => group.querySelector('text')?.textContent.trim()),
  }));
  assert.equal(mirroredOutgoingSeamState.period, 'u3', 'homepage Unit 2 seam must select Unit 3');
  assert.equal(mirroredOutgoingSeamState.state.chainId, 'u3_main',
    'homepage Unit 2 seam must open the Unit 3 empires chain');
  assert.equal(mirroredOutgoingSeamState.state.chainStep, 0,
    'homepage Unit 2 seam must select the Unit 3 first ring');
  assert.ok(mirroredOutgoingSeamState.selectedPins.includes('19'),
    'homepage Unit 2 seam must synchronize the Unit 3 boundary anchor');
  assert.match(await page.locator('#home-events [data-route-step].now').innerText(), /19.*Isfahan/is,
    'homepage must refresh its mirrored panel after cross-Unit seam navigation');

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
  assert.deepEqual(await buttonSurfaceMetrics(page.locator('#home-events [data-map-mode]')), [
    { hitHeight: 44, fontSize: '13px', paddingLeft: '14px', paddingRight: '14px', surfaceTop: '3px', surfaceBottom: '3px' },
    { hitHeight: 44, fontSize: '13px', paddingLeft: '14px', paddingRight: '14px', surfaceTop: '3px', surfaceBottom: '3px' },
  ], 'homepage Map secondary modes must pair a 44px hit target with a 38px painted pill');
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
