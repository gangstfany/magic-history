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

  const dock = page.locator('#worldTimelineDock');
  assert.equal(await dock.count(), 1, 'AP World must expose exactly one #worldTimelineDock');
  await expectVisible(dock, 'AP World card Timeline must be visible');
  assert.equal(await dock.locator('.world-timeline-track').count(), 1, 'Timeline Dock must expose exactly one track');

  const periods = (await page.evaluate(() => window.__mapFilter.getPeriodOptions())).filter(({ value }) => value);
  assert.equal(periods.length, 9, 'AP World Timeline must cover the nine non-empty Unit options');
  let richestPeriod = null;
  for (const period of periods) {
    await page.evaluate((id) => window.__mapFilter.setPeriod(id), period.value);
    const cards = dock.locator('button.world-timeline-card[data-event-key]');
    const count = await cards.count();
    assert.ok(count > 0, `${period.value} must render Timeline cards`);
    assert.equal(await cards.locator('.world-timeline-date').count(), count, `${period.value} cards must expose dates`);
    assert.equal(await cards.locator('.world-timeline-title-en').count(), count, `${period.value} cards must expose English titles`);
    assert.equal(await cards.locator('.world-timeline-title-zh').count(), count, `${period.value} cards must expose Chinese titles`);
    if (!richestPeriod || count > richestPeriod.count) richestPeriod = { id: period.value, count };
  }

  assert.ok(richestPeriod?.count >= 2, 'at least one Unit must expose two Timeline cards for interaction checks');
  await page.evaluate((id) => window.__mapFilter.setPeriod(id), richestPeriod.id);
  const cards = dock.locator('button.world-timeline-card[data-event-key]');
  await cards.nth(1).click();
  assert.equal(await cards.nth(1).getAttribute('aria-current'), 'step', 'clicked card must become current');
  assert.equal(await cards.locator('[aria-current="step"]').count(), 1, 'exactly one non-empty Timeline card must be current');
  assert.ok((await page.locator('#eventPanel').innerText()).trim().length > 0, 'card selection must render event details');

  for (let index = 0; index < await cards.count(); index += 1) {
    const card = cards.nth(index);
    assert.ok((await card.getAttribute('aria-label'))?.trim(), `Timeline card ${index} must have an accessible name`);
    const box = await card.boundingBox();
    assert.ok(box && box.height >= 44, `Timeline card ${index} must be at least 44px high (got ${box?.height})`);
  }

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
