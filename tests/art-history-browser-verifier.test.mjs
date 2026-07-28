import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const VERIFIER_URL = new URL('../scripts/verify-art-history-browser.mjs', import.meta.url);
const RELEASE_VERIFIER_URL = new URL('../scripts/verify-art-history-release.mjs', import.meta.url);
const NINE_WORKS_URL = new URL('./fixtures/u2-imported-browser.json', import.meta.url);
const SOURCE_FIXTURE_URL = new URL('./fixtures/u2-corrected-and-imported.json', import.meta.url);
const U1_BROWSER_FIXTURE = new URL('./fixtures/u1-browser.json', import.meta.url);
const U1_CANONICAL_FIXTURE = new URL('./fixtures/u1-canonical.json', import.meta.url);

function projectBrowserFixture(canonical) {
  return canonical.artworks.map((work) => {
    const media = Array.isArray(work.images)
      ? work.images
      : [{
          label: 'Primary view',
          imageUrl: work.imageUrl,
          imageAlt: work.imageAlt,
          imageSourceName: work.imageSourceName,
          imageSourceUrl: work.imageSourceUrl,
        }];
    const credits = Array.isArray(canonical.credits[work.id])
      ? canonical.credits[work.id]
      : [canonical.credits[work.id]];
    return {
      apNumber: work.apNumber,
      id: work.id,
      titleEn: work.titleEn,
      titleZh: work.titleZh,
      images: media.map((image, index) => ({
        ...image,
        ...credits[index],
      })),
    };
  });
}

test('U1 browser fixture covers AP 1-11 and exactly 12 audited views', async () => {
  const works = JSON.parse(await readFile(U1_BROWSER_FIXTURE, 'utf8'));

  assert.deepEqual(
    works.map(({ apNumber }) => apNumber),
    Array.from({ length: 11 }, (_, index) => index + 1),
  );
  assert.equal(
    works.reduce((total, work) => total + work.images.length, 0),
    12,
  );
  assert.equal(works.find(({ apNumber }) => apNumber === 8).images.length, 2);
  assert.ok(
    works
      .filter(({ apNumber }) => apNumber !== 8)
      .every(({ images }) => images.length === 1),
  );
});

test('U1 browser fixture is projected exactly from the canonical data', async () => {
  const [browserFixture, canonical] = await Promise.all([
    readFile(U1_BROWSER_FIXTURE, 'utf8').then(JSON.parse),
    readFile(U1_CANONICAL_FIXTURE, 'utf8').then(JSON.parse),
  ]);

  assert.deepEqual(browserFixture, projectBrowserFixture(canonical));
});

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
      [519, 519],
      [519, 520],
      [519, 521],
      [520, 519],
      [520, 520],
      [520, 521],
      [521, 519],
      [521, 520],
      [521, 521],
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

test('nine-work browser fixture is canonical and independently matches source fixtures', async () => {
  const [browserFixture, sourceFixture, verifierSource] = await Promise.all([
    readFile(NINE_WORKS_URL, 'utf8').then(JSON.parse),
    readFile(SOURCE_FIXTURE_URL, 'utf8').then(JSON.parse),
    readFile(VERIFIER_URL, 'utf8'),
  ]);
  const apNumbers = [12, 14, 16, 19, 25, 29, 30, 31, 32];
  const expected = sourceFixture.artworks
    .filter(({ apNumber }) => apNumbers.includes(apNumber))
    .map((work) => ({
      id: work.id,
      apNumber: work.apNumber,
      titleEn: work.titleEn,
      titleZh: work.titleZh,
      imageUrl: work.imageUrl,
      imageAlt: work.imageAlt,
      imageSourceName: work.imageSourceName,
      imageSourceUrl: work.imageSourceUrl,
      credit: sourceFixture.credits[work.id],
    }));

  assert.deepEqual(browserFixture, expected);
  assert.deepEqual(browserFixture.map(({ apNumber }) => apNumber), apNumbers);
  assert.match(verifierSource, /u2-imported-browser\.json/);
  assert.match(verifierSource, /verifyNineImportedWorks/);
});

test('browser verifier loads the frozen U1 projection and traverses all eleven works', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /const U1_WORKS = Object\.freeze\(JSON\.parse\(/);
  assert.match(source, /u1-browser\.json/);
  assert.match(source, /async function resetAndActivateWork\(/);
  assert.match(source, /async function verifyU1Works\(/);
  assert.match(source, /for \(const work of U1_WORKS\)/);
  assert.doesNotMatch(source, /resetAndActivateImportedWork/);
  assert.match(source, /kind:\s*'u1-eleven-works'/);
  assert.match(source, /verifyU1Standalone/);
  assert.match(source, /verifyU1Embedded/);
});

test('browser verifier locks the two-Unit hierarchy and exact U1 region contract', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /U1Global Prehistory · 11 pieces/);
  assert.match(source, /U2Ancient Mediterranean · 36 pieces/);
  assert.match(source, /selectOption\('1'\)/);
  assert.match(source, /cultureFilters.*isHidden/s);
  assert.match(source, /Africa · 2 pieces/);
  assert.match(source, /Europe · 2 pieces/);
  assert.match(source, /Americas · 2 pieces/);
  assert.match(source, /Middle East · 2 pieces/);
  assert.match(source, /East Asia · 1 piece/);
  assert.match(source, /Oceania · 2 pieces/);
  assert.match(source, /selectOption\('2'\)/);
});

test('U1 traversal verifies both Stonehenge views, request exactness, and focus restoration', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /const imageRequests = new Map\(\)/);
  assert.match(source, /imageRequests\.clear\(\)/);
  assert.match(source, /work\.images\.length === 2 \? 2 : 0/);
  assert.match(source, /viewButtons\.nth\(imageIndex\)\.click\(\)/);
  assert.match(source, /imageRequests\.get\(expected\.imageUrl\),\s*1/);
  assert.match(source, /#dialogSource/);
  assert.match(source, /document\.activeElement\?\.classList\.contains\('artwork-image-button'\)/);
});

test('browser copy and release labels target the complete 47-work Units 1-2 map', async () => {
  const [browserSource, releaseSource] = await Promise.all([
    readFile(VERIFIER_URL, 'utf8'),
    readFile(RELEASE_VERIFIER_URL, 'utf8'),
  ]);

  assert.match(browserSource, /AP 艺术史互动地图/);
  assert.match(browserSource, /47 AP works · Units 1-2 · filter, compare and study/);
  assert.match(browserSource, /当前显示 47 件作品/);
  assert.match(releaseSource, /strict 47-work Units 1-2 validator/);
});

test('responsive browser modes reject console warnings by default', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /function installErrorCollection\(page, label\)/);
  assert.match(
    source,
    /message\.type\(\) === 'error'\s*\|\|\s*message\.type\(\) === 'warning'/,
  );
  assert.doesNotMatch(source, /includeWarnings/);
  assert.match(source, /verifyResponsiveWarningRegression/);
  assert.match(source, /console\.warn\('responsive warning regression'\)/);
  assert.match(source, /assert\.rejects/);
});

test('nine-work traversal rejects duplicate requests and forces a real trigger-replacing rerender', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /assert\.equal\(imageRequests\.length,\s*1/);
  assert.match(source, /assert\.equal\(imageRequests\[0\],\s*work\.imageUrl/);
  assert.doesNotMatch(source, /new Set\(imageRequests\)/);
  assert.match(source, /const originalImageButton = await imageButton\.elementHandle\(\)/);
  assert.match(source, /page\.setViewportSize\(/);
  assert.match(source, /!element\.isConnected/);
  assert.match(source, /document\.querySelector\('\.artwork-image-button'\) !== element/);
});

test('nine-work traversal verifies the inline media source added by the view-aware UI', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');
  const traversal = source.slice(
    source.indexOf('async function verifyNineImportedWorks'),
    source.indexOf('async function verifyU1Works'),
  );

  assert.match(traversal, /inlineSource/);
  assert.match(traversal, /work\.imageSourceUrl/);
  assert.match(traversal, /work\.imageSourceName/);
  assert.doesNotMatch(traversal, /`许可：\$\{work\.credit\.licenseName\}`/);
  assert.doesNotMatch(traversal, /`来源页：\$\{work\.imageSourceName\}/);
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
