import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const VERIFIER_URL = new URL('../scripts/verify-art-history-browser.mjs', import.meta.url);
const RELEASE_VERIFIER_URL = new URL('../scripts/verify-art-history-release.mjs', import.meta.url);
const HOMEPAGE_URL = new URL('../index.html', import.meta.url);
const ART_MAP_URL = new URL('../art-history-map.html', import.meta.url);
const NINE_WORKS_URL = new URL('./fixtures/u2-imported-browser.json', import.meta.url);
const SOURCE_FIXTURE_URL = new URL('./fixtures/u2-corrected-and-imported.json', import.meta.url);
const U1_BROWSER_FIXTURE = new URL('./fixtures/u1-browser.json', import.meta.url);
const U1_CANONICAL_FIXTURE = new URL('./fixtures/u1-canonical.json', import.meta.url);
const U3_BROWSER_FIXTURE = new URL('./fixtures/u3-browser.json', import.meta.url);
const U3_CANONICAL_FIXTURE = new URL('./fixtures/u3-canonical.json', import.meta.url);

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

function projectU3BrowserFixture(canonical) {
  return canonical.artworks.map((work) => ({
    id: work.id,
    apNumber: work.apNumber,
    titleEn: work.titleEn,
    titleZh: work.titleZh,
    unit: work.unit,
    region: work.region,
    siteName: work.siteName,
    images: work.images.map(({
      id,
      label,
      imageUrl,
      imageAlt,
      imageSourceUrl,
    }) => ({
      id,
      label,
      imageUrl,
      imageAlt,
      imageSourceUrl,
    })),
  }));
}

test('U3 browser fixture is the exact 51-work, 103-view canonical projection', async () => {
  const [browserFixture, canonical] = await Promise.all([
    readFile(U3_BROWSER_FIXTURE, 'utf8').then(JSON.parse),
    readFile(U3_CANONICAL_FIXTURE, 'utf8').then(JSON.parse),
  ]);

  assert.deepEqual(browserFixture, projectU3BrowserFixture(canonical));
  assert.deepEqual(
    browserFixture.map(({ apNumber }) => apNumber),
    Array.from({ length: 51 }, (_, index) => index + 48),
  );
  assert.equal(
    browserFixture.reduce((total, work) => total + work.images.length, 0),
    103,
  );
  for (const key of ['id', 'imageUrl', 'imageAlt', 'imageSourceUrl']) {
    const values = browserFixture.flatMap((work) => (
      key === 'id'
        ? [work.id, ...work.images.map((image) => `${work.id}/${image.id}`)]
        : work.images.map((image) => image[key])
    ));
    assert.equal(new Set(values).size, values.length, `distinct U3 ${key} values`);
  }
});

test('U3 browser fixture loader validates the exact schema and freezes every level', async () => {
  const verifier = await import(VERIFIER_URL.href);
  const fixture = JSON.parse(await readFile(U3_BROWSER_FIXTURE, 'utf8'));
  const frozen = verifier.validateAndFreezeU3Works(structuredClone(fixture));

  assert.equal(frozen.length, 51);
  assert.equal(frozen.reduce((total, work) => total + work.images.length, 0), 103);
  assert.ok(Object.isFrozen(frozen));
  assert.ok(frozen.every((work) => Object.isFrozen(work)));
  assert.ok(frozen.every((work) => Object.isFrozen(work.images)));
  assert.ok(frozen.every((work) => work.images.every(Object.isFrozen)));
});

test('U3 verifier rejects fixture and rendered-view mutations with meaningful assertions', async () => {
  const verifier = await import(VERIFIER_URL.href);
  const fixture = JSON.parse(await readFile(U3_BROWSER_FIXTURE, 'utf8'));
  const clone = () => structuredClone(fixture);

  const missingWork = clone();
  missingWork.splice(10, 1);
  assert.throws(
    () => verifier.validateAndFreezeU3Works(missingWork),
    /51 U3 works|AP 58/,
  );

  const duplicateWork = clone();
  duplicateWork[10] = structuredClone(duplicateWork[9]);
  assert.throws(
    () => verifier.validateAndFreezeU3Works(duplicateWork),
    /AP 58|duplicate U3 work id/,
  );

  const missingChartresView = clone();
  const chartres = missingChartresView.find(({ apNumber }) => apNumber === 60);
  chartres.images.pop();
  assert.throws(
    () => verifier.validateAndFreezeU3Works(missingChartresView),
    /103 U3 views|AP 60/,
  );

  const duplicateView = clone();
  const chartresWithDuplicate = duplicateView.find(({ apNumber }) => apNumber === 60);
  chartresWithDuplicate.images.push(structuredClone(chartresWithDuplicate.images[0]));
  assert.throws(
    () => verifier.validateAndFreezeU3Works(duplicateView),
    /103 U3 views|duplicate U3 view id|duplicate U3 image URL/,
  );

  const expected = fixture[0].images[0];
  assert.throws(
    () => verifier.assertU3ViewMatches(
      { ...expected, imageUrl: 'https://example.invalid/wrong-required-view.jpg' },
      expected,
      'mutated required image',
    ),
    /image URL/,
  );
  assert.throws(
    () => verifier.assertExactImageRequests(
      new Map(fixture[0].images.map((image, index) => [
        image.imageUrl,
        index === 0 ? 2 : 1,
      ])),
      fixture[0],
      'duplicate request mutation',
    ),
    /request count/,
  );
  assert.throws(
    () => verifier.assertNoCollectedIssues(['console warning: mutation'], 'warning mutation'),
    /console warning: mutation/,
  );
  assert.throws(
    () => verifier.assertNoCollectedIssues(['console error: mutation'], 'error mutation'),
    /console error: mutation/,
  );
  assert.throws(
    () => verifier.assertDialogFocusRestored(false, 'focus mutation'),
    /focus mutation/,
  );
});

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
      [1365, 768],
      [375, 812],
      [390, 844],
      [667, 375],
      [665, 700],
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

test('browser verifier locks the three-Unit hierarchy and exact U1/U3 region contracts', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /U1Global Prehistory · 11 pieces/);
  assert.match(source, /U2Ancient Mediterranean · 36 pieces/);
  assert.match(source, /U3Early Europe and Colonial Americas · 51 pieces/);
  assert.match(source, /selectOption\('1'\)/);
  assert.match(source, /cultureFilters.*isHidden/s);
  assert.match(source, /Africa · 2 pieces/);
  assert.match(source, /Europe · 2 pieces/);
  assert.match(source, /Americas · 2 pieces/);
  assert.match(source, /Middle East · 2 pieces/);
  assert.match(source, /East Asia · 1 piece/);
  assert.match(source, /Oceania · 2 pieces/);
  assert.match(source, /selectOption\('2'\)/);
  assert.match(source, /selectOption\('3'\)/);
  assert.match(source, /Italy & Vatican · 18 pieces/);
  assert.match(source, /France · 5 pieces/);
  assert.match(source, /Iberian Peninsula · 5 pieces/);
  assert.match(source, /British Isles · 3 pieces/);
  assert.match(source, /Low Countries · 7 pieces/);
  assert.match(source, /Central Europe · 4 pieces/);
  assert.match(source, /Eastern Mediterranean · 4 pieces/);
  assert.match(source, /Colonial Americas · 5 pieces/);
});

test('browser verifier loads and traverses every frozen U3 work in standalone and embedded modes', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /u3-browser\.json/);
  assert.match(source, /const U3_WORKS = validateAndFreezeU3Works/);
  assert.match(source, /async function verifyU3Works\(/);
  assert.match(source, /for \(const work of U3_WORKS\)/);
  assert.match(source, /async function verifyU3Standalone\(/);
  assert.match(source, /async function verifyU3Embedded\(/);
  assert.equal(
    source.match(/await verifyU3Works\(page,\s*(?:page|frame),\s*imageRequests,\s*'[^']+'\)/g)?.length,
    2,
  );
  assert.match(source, /kind:\s*'u3-fifty-one-works'/);
});

test('U3 traversal covers all study tabs and AP 89 comparison navigation to AP 46', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /async function verifyU3StudyTabsAndComparison\(/);
  assert.equal(
    source.match(/await verifyU3StudyTabsAndComparison\(page,\s*(?:page|frame),\s*'[^']+'\)/g)?.length,
    2,
  );
  assert.match(source, /ap52-hagia-sophia|ap60-chartres-cathedral/);
  assert.match(source, /ap89-ecstasy-saint-teresa/);
  assert.match(source, /ap46-pantheon/);
  assert.match(source, /当前显示 36 件作品/);
  assert.match(source, /Pantheon/);
});

test('Unit changes apply the fitted SVG transform before scheduling one render frame', async () => {
  const artMap = await readFile(ART_MAP_URL, 'utf8');
  const handler = artMap.slice(
    artMap.indexOf("document.getElementById('unitFilter').addEventListener"),
    artMap.indexOf("document.getElementById('periodFilter').addEventListener"),
  );
  const fitIndex = handler.indexOf('fitMapToWorks(getWorksForUnit())');
  const applyIndex = handler.indexOf('applyTransform()');
  const scheduleIndex = handler.indexOf('scheduleMarkerLayout()');

  assert.ok(fitIndex >= 0, 'Unit change should fit the selected Unit');
  assert.ok(applyIndex > fitIndex, 'Unit change should apply the fitted transform');
  assert.ok(
    scheduleIndex > applyIndex,
    'Unit change should schedule rendering after the transform reaches the next frame',
  );
  assert.equal(handler.match(/\brender\(\)/g)?.length || 0, 0, 'Unit change should not render early');
});

test('mobile standalone filter labels and selects may shrink around the complete U3 Unit option', async () => {
  const artMap = await readFile(ART_MAP_URL, 'utf8');
  const mobileCss = artMap.slice(
    artMap.indexOf('@media (max-width:520px)'),
    artMap.indexOf('@media (max-width:664px)'),
  );

  assert.match(
    mobileCss,
    /\.filter-toolbar\s*>\s*\.filter-label\s*\{[^}]*min-width:\s*0/,
  );
  assert.match(
    mobileCss,
    /\.filter-toolbar\s+select\s*\{[^}]*min-width:\s*0/,
  );
});

test('U3 responsive control hit testing first restores the embedded map controls to the viewport', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');
  const responsive = source.slice(
    source.indexOf('async function assertU3ResponsiveLayout'),
    source.indexOf('async function selectBoundaryFilters'),
  );
  const scrollIndex = responsive.indexOf("locator('.map-controls').scrollIntoViewIfNeeded()");
  const hitIndex = responsive.indexOf('document.elementFromPoint');

  assert.ok(scrollIndex >= 0, 'responsive verification should restore scrolled controls');
  assert.ok(hitIndex > scrollIndex, 'controls should be visible before pointer hit testing');
});

test('U3 request accounting begins immediately before final work activation', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');
  const traversal = source.slice(
    source.indexOf('async function verifyU3Works'),
    source.indexOf('async function verifyU3StudyTabsAndComparison'),
  );

  assert.match(
    traversal,
    /resetAndActivateWork\(page,\s*frame,\s*work,\s*\(\)\s*=>\s*imageRequests\.clear\(\)\)/,
  );
  assert.doesNotMatch(
    traversal,
    /imageRequests\.clear\(\);\s*await resetAndActivateWork/,
  );
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

test('U1 traversal verifies exact inline, dialog, metadata, and view-button semantics', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');
  const traversal = source.slice(
    source.indexOf('async function verifyU1Works'),
    source.indexOf('async function verifyU1Standalone'),
  );

  assert.match(traversal, /\.work-meta/);
  assert.match(traversal, /`AP #\$\{work\.apNumber\}`/);
  assert.match(traversal, /work\.images\.map\(\(\{ label \}\) => label\)/);
  assert.match(traversal, /getAttribute\('aria-pressed'\)/);
  assert.match(traversal, /expected\.creatorOrInstitution/);
  assert.match(traversal, /expected\.licenseName/);
  assert.match(traversal, /expected\.licenseUrl/);
  assert.match(traversal, /expected\.imageSourceName/);
  assert.match(traversal, /expected\.imageSourceUrl/);
  assert.match(traversal, /#dialogTitle/);
  assert.match(traversal, /#dialogCaption/);
  assert.match(traversal, /#dialogCredit/);
});

test('U1 standalone and embedded traversals exercise all study tabs and cross-Unit comparison', async () => {
  const source = await readFile(VERIFIER_URL, 'utf8');

  assert.match(source, /async function verifyU1StudyTabsAndComparison\(/);
  assert.equal(
    source.match(/await verifyU1StudyTabsAndComparison\(page,\s*(?:page|frame),\s*'[^']+'\)/g)?.length,
    2,
  );
  assert.match(source, /\{ id: 'quick', label: '速览'/);
  assert.match(source, /\{ id: 'form', label: '形式'/);
  assert.match(source, /\{ id: 'context', label: '语境'/);
  assert.match(source, /\{ id: 'compare', label: '比较'/);
  assert.match(source, /ap2-great-hall-bulls/);
  assert.match(source, /ap24-last-judgment-of-hunefer/);
  assert.match(source, /当前显示 36 件作品/);
  assert.match(source, /Last judgment of Hunefer, from his tomb/);
  assert.match(
    source,
    /document\.activeElement === document\.querySelector\('\[data-selected-artwork-title\]'\)/,
  );
});

test('integration copy and release labels target the complete 98-work Units 1-3 map', async () => {
  const [homepage, artMap, releaseSource] = await Promise.all([
    readFile(HOMEPAGE_URL, 'utf8'),
    readFile(ART_MAP_URL, 'utf8'),
    readFile(RELEASE_VERIFIER_URL, 'utf8'),
  ]);

  assert.match(homepage, /98 AP works · Units 1-3 · filter, compare and study/);
  assert.match(artMap, /AP 艺术史互动地图 · Units 1-3/);
  assert.match(
    artMap,
    /aria-label="完整世界地图；展示 AP 艺术史 Units 1-3 全部 98 件作品在非洲、欧洲、亚洲、大洋洲与美洲的全球分布"/,
  );
  assert.match(
    artMap,
    /aria-label="AP 艺术史 Units 1-3 完整世界地图，标记全部 98 件作品在非洲、欧洲、亚洲、大洋洲与美洲的全球分布"/,
  );
  assert.match(artMap, /count\.textContent = `当前显示 \$\{visibleWorks\.length\} 件作品`/);
  assert.match(releaseSource, /strict 98-work Units 1-3 validator/);
});

test('copy integration preserves World History text and iframe dimensions', async () => {
  const homepage = await readFile(HOMEPAGE_URL, 'utf8');

  assert.match(homepage, /History World Map/);
  assert.match(homepage, /5 regions · 233 events · 104 pins · 6 trade routes/);
  assert.match(
    homepage,
    /<iframe id="worldMapFrame" class="subject-map-frame active" src="world-map\.html" title="Interactive world history map" loading="lazy" aria-hidden="false"><\/iframe>/,
  );
  assert.match(
    homepage,
    /<iframe id="artMapFrame" class="subject-map-frame" src="art-history-map\.html\?embed=1" title="Interactive AP art history map" loading="lazy" hidden aria-hidden="true"><\/iframe>/,
  );
  assert.match(homepage, /\.subject-map-frame\s*\{[^}]*width:\s*100%;\s*height:\s*100%;/);
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
