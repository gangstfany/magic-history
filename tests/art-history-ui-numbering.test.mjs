import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const loadHtml = () => readFile(HTML_PATH, 'utf8');

function getFunctionSource(html, functionName) {
  const signature = `function ${functionName}(`;
  const start = html.indexOf(signature);
  assert.notEqual(start, -1, `missing ${functionName}()`);
  const openBrace = html.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let index = openBrace; index < html.length; index += 1) {
    if (html[index] === '{') depth += 1;
    if (html[index] === '}') depth -= 1;
    if (depth === 0) {
      end = index + 1;
      break;
    }
  }
  assert.notEqual(end, -1, `unterminated ${functionName}()`);
  return html.slice(start, end);
}

function getObjectDeclarationSource(html, declaration) {
  const start = html.indexOf(declaration);
  assert.notEqual(start, -1, `missing ${declaration}`);
  const openBrace = html.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let index = openBrace; index < html.length; index += 1) {
    if (html[index] === '{') depth += 1;
    if (html[index] === '}') depth -= 1;
    if (depth === 0) {
      end = html.indexOf(';', index) + 1;
      break;
    }
  }
  assert.notEqual(end, -1, `unterminated ${declaration}`);
  return html.slice(start, end);
}

function loadPureFunctions(html, functionNames, declarations = []) {
  const sources = [
    ...declarations.map((declaration) => getObjectDeclarationSource(html, declaration)),
    ...functionNames.map((name) => getFunctionSource(html, name)),
  ].join('\n');
  const exports = functionNames.join(', ');
  return Function(`"use strict"; ${sources}; return { ${exports} };`)();
}

function parseArtworkData(html) {
  const match = html.match(
    /<script id="artwork-data" type="application\/json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match, 'missing artwork data');
  return JSON.parse(match[1]);
}

function getCssDeclarations(html, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(
    new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([^}]*)\\}`, 's'),
  );
  assert.ok(match, `missing CSS rule for ${selector}`);
  return match[1];
}

test('art map reuses World History typography and compact detail hierarchy', async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /font-family:\s*"PingFang SC",\s*"Hiragino Sans GB",\s*-apple-system,\s*"Helvetica Neue",\s*sans-serif/,
  );
  assert.match(html, /heading\.className = 'work-title-en'/);
  assert.match(html, /heading\.textContent = work\.titleEn/);
  assert.match(html, /chineseTitle\.className = 'work-title-zh'/);
  assert.match(html, /chineseTitle\.textContent = work\.titleZh/);
  assert.match(
    html,
    /summary\.append\(heading,\s*chineseTitle,\s*meta,\s*imageButton,\s*imageCredit,\s*identity\)/,
    'detail summary must append English heading before the Chinese subtitle and metadata',
  );
  const englishTitleCss = getCssDeclarations(html, '.work-title-en');
  assert.match(englishTitleCss, /font-size:\s*22px/);
  assert.match(englishTitleCss, /font-weight:\s*800/);
  const chineseTitleCss = getCssDeclarations(html, '.work-title-zh');
  assert.match(chineseTitleCss, /font-size:\s*14px/);
  assert.match(chineseTitleCss, /font-weight:\s*600/);
  assert.match(getCssDeclarations(html, '.work-meta'), /font-size:\s*12px/);
  assert.match(
    html,
    /imageButton\.setAttribute\('aria-label',\s*`Open \$\{work\.titleEn\}（\$\{work\.titleZh\}）大图`\)/,
  );
  assert.match(html, /<dialog id="imageDialog"[^>]*aria-labelledby="dialogTitle"/);
  assert.match(
    html,
    /document\.getElementById\('dialogTitle'\)\.textContent = `\$\{work\.titleEn\} · \$\{work\.titleZh\}`/,
  );
});

test('all art map text inherits the World History font stack', async () => {
  const html = await loadHtml();
  assert.equal(
    (html.match(/font-family\s*:/g) || []).length,
    1,
    'only the page-level World History font stack may declare a font family',
  );
  assert.doesNotMatch(
    html,
    /font:\s*[^;}]*(?:ui-sans-serif|system-ui)/,
    'font shorthands must not override the page font family',
  );
  const markerLabelCss = getCssDeclarations(html, '.site-marker .marker-ap-label');
  assert.match(markerLabelCss, /font-weight:\s*700/);
  const imageCreditCss = getCssDeclarations(html, '.image-credit');
  assert.match(imageCreditCss, /font-size:\s*\.78rem/);
  assert.match(imageCreditCss, /line-height:\s*1\.5/);
  assert.match(getCssDeclarations(html, '.legend'), /font-size:\s*\.86rem/);
});

test('compact AP number helpers preserve gaps and merge consecutive ranges', async () => {
  const html = await loadHtml();
  const { compactApNumbers, formatApGroupLabel } = loadPureFunctions(
    html,
    ['compactApNumbers', 'formatApGroupLabel'],
  );

  assert.equal(compactApNumbers([35, 39, 40]), '35, 39–40');
  assert.equal(compactApNumbers([41, 42, 43, 44, 45, 46, 47]), '41–47');
  assert.equal(
    formatApGroupLabel([{ apNumber: 40 }, { apNumber: 39 }, { apNumber: 35 }]),
    'AP 35, 39–40',
  );
});

test('map markers display AP numbers with circles for works and capsules for groups', async () => {
  const html = await loadHtml();

  assert.match(html, /works\.map\(\(work\) => work\.apNumber\)/);
  assert.match(html, /classList\.add\('marker-label-bg'\)/);
  assert.match(html, /classList\.add\('marker-ap-label'\)/);
  assert.match(
    html,
    /createElementNS\([^;]*group\.works\.length === 1 \? 'circle' : 'rect'\s*\)/,
  );
  assert.match(html, /label\.textContent = group\.apLabel/);
  assert.doesNotMatch(html, /count\.textContent = (?:String\()?group\.works\.length/);
  assert.match(getCssDeclarations(html, '.site-marker .marker-label-bg'), /filter:\s*drop-shadow/);
  assert.match(
    getCssDeclarations(html, '.site-marker .marker-ap-label'),
    /dominant-baseline:\s*central/,
  );
  assert.doesNotMatch(
    getCssDeclarations(html, '.site-marker .marker-label-bg'),
    /transition:[^;]*\br\b/,
  );
  assert.match(
    getCssDeclarations(html, '.site-marker .marker-visual'),
    /transition:\s*transform/,
  );
  assert.match(
    getCssDeclarations(html, '.site-marker.is-active .marker-visual'),
    /transform:\s*scale\((?:1\.0[5-9]|1\.1)\)/,
  );
});

test('marker metrics stay readable and touchable on a 390px viewport', async () => {
  const html = await loadHtml();
  const { getMapScreenScale, getMarkerMetrics } = loadPureFunctions(
    html,
    ['getMapScreenScale', 'getMarkerMetrics'],
  );
  const renderedScale = getMapScreenScale(362, 330);
  const metrics = getMarkerMetrics('35, 39–40', false, renderedScale);

  assert.equal(renderedScale, 362 / 1600);
  assert.equal(getMapScreenScale(0, 0), 0.23);
  assert.ok(metrics.fontSize * renderedScale >= 11.5);
  assert.ok(metrics.hitHeight * renderedScale >= 44);
  assert.ok(metrics.hitWidth * renderedScale >= 44);
  assert.ok(metrics.visualWidth < metrics.hitWidth);
});

test('bounds-aware spatial layout prevents all marker overlaps at mobile scale', async () => {
  const html = await loadHtml();
  const artworks = parseArtworkData(html);
  const {
    compactApNumbers,
    formatApGroupLabel,
    createSiteToken,
    groupBySite,
    toWorldCoordinates,
    getMarkerMetrics,
    getMarkerBounds,
    markerBoundsOverlap,
    expandMarkerBounds,
    createSpatialHash,
    findNearestAvailableMarkerSlot,
    layoutSiteMarkers,
  } = loadPureFunctions(
    html,
    [
      'compactApNumbers',
      'formatApGroupLabel',
      'createSiteToken',
      'groupBySite',
      'toWorldCoordinates',
      'getMarkerMetrics',
      'getMarkerBounds',
      'markerBoundsOverlap',
      'expandMarkerBounds',
      'createSpatialHash',
      'findNearestAvailableMarkerSlot',
      'layoutSiteMarkers',
    ],
    ['const SITE_WORLD_COORDINATES ='],
  );
  const renderedScale = 362 / 1600;
  const laidOut = layoutSiteMarkers(groupBySite(artworks), renderedScale);

  for (let index = 0; index < laidOut.length; index += 1) {
    assert.ok(laidOut[index].bounds.left >= 0, `${laidOut[index].siteName} crosses left edge`);
    assert.ok(laidOut[index].bounds.right <= 1600, `${laidOut[index].siteName} crosses right edge`);
    assert.ok(laidOut[index].bounds.top >= 0, `${laidOut[index].siteName} crosses top edge`);
    assert.ok(laidOut[index].bounds.bottom <= 800, `${laidOut[index].siteName} crosses bottom edge`);
    for (let otherIndex = index + 1; otherIndex < laidOut.length; otherIndex += 1) {
      assert.equal(
        markerBoundsOverlap(laidOut[index].bounds, laidOut[otherIndex].bounds),
        false,
        `${laidOut[index].siteName} overlaps ${laidOut[otherIndex].siteName}`,
      );
    }
  }
  const layoutSource = getFunctionSource(html, 'layoutSiteMarkers');
  assert.match(layoutSource, /createSpatialHash\(/);
  assert.match(layoutSource, /findNearestAvailableMarkerSlot\(/);
  assert.doesNotMatch(layoutSource, /positioned\.every\(/);
});

test('site focus tokens are stable, selector-safe, and used after marker rerenders', async () => {
  const html = await loadHtml();
  const { createSiteToken } = loadPureFunctions(html, ['createSiteToken']);
  const token = createSiteToken([{ id: 'rome\u0000forty one' }, { id: 'ap-42' }]);

  assert.doesNotMatch(token, /\u0000/);
  assert.match(token, /^[a-zA-Z0-9_-]+$/);
  assert.equal(
    token,
    createSiteToken([{ id: 'ap-42' }, { id: 'rome\u0000forty one' }]),
  );
  assert.match(html, /marker\.dataset\.siteToken = group\.siteToken/);
  assert.match(html, /function focusSiteMarker\(siteToken\)/);
  assert.match(html, /\[data-site-token="\$\{siteToken\}"\]/);
  assert.doesNotMatch(html, /data-site-key/);
});

test('marker layout recomputes when the rendered map size changes', async () => {
  const html = await loadHtml();

  assert.match(html, /function getRenderedMarkerScale\(/);
  assert.match(
    getFunctionSource(html, 'getRenderedMarkerScale'),
    /getMapScreenScale\(bounds\.width, bounds\.height, state\.transform\.scale\)/,
  );
  assert.match(html, /window\.addEventListener\('resize', scheduleMarkerLayout\)/);
  assert.match(html, /new ResizeObserver\(scheduleMarkerLayout\)/);
  assert.match(html, /requestAnimationFrame\(\(\) => render\(\)\)/);
});

test('render keeps the previous marker layer until a complete layout succeeds', async () => {
  const html = await loadHtml();
  const renderSource = getFunctionSource(html, 'render');
  const layoutIndex = renderSource.indexOf('layoutSiteMarkers(');
  const replaceIndex = renderSource.indexOf('markerLayer.replaceChildren(');

  assert.ok(layoutIndex >= 0, 'render must calculate a marker layout');
  assert.ok(replaceIndex > layoutIndex, 'render must replace markers only after layout succeeds');
});

test('detail images show the complete artwork without cover cropping', async () => {
  const html = await loadHtml();
  const detailImageCss = getCssDeclarations(html, '.artwork-image-button img');
  assert.match(detailImageCss, /object-fit:\s*contain/);
  assert.doesNotMatch(detailImageCss, /object-fit:\s*cover/);
  assert.match(detailImageCss, /(?:^|;)\s*height:\s*100%/);
  assert.match(detailImageCss, /(?:^|;)\s*max-height:\s*100%/);

  const imageButtonCss = getCssDeclarations(html, '.artwork-image-button');
  assert.match(imageButtonCss, /background:\s*var\(--surface-sunken\)/);
  assert.match(imageButtonCss, /box-sizing:\s*border-box/);
  assert.match(imageButtonCss, /(?:^|;)\s*height:\s*300px/);
  assert.match(imageButtonCss, /(?:^|;)\s*max-height:\s*300px/);
  assert.match(imageButtonCss, /(?:^|;)\s*padding:\s*10px/);
});
