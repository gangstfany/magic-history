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

function getMediaQuerySource(html, query) {
  const start = html.indexOf(`@media ${query}`);
  assert.notEqual(start, -1, `missing @media ${query}`);
  const end = html.indexOf('@media ', start + query.length + 7);
  return html.slice(start, end === -1 ? html.length : end);
}

test('art map exposes a query-driven embedded presentation mode', async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /<body>\s*<script>\s*const isEmbedded = new URLSearchParams\(window\.location\.search\)\.get\('embed'\) === '1';\s*document\.body\.classList\.toggle\('is-embedded', isEmbedded\);\s*<\/script>/,
  );
  assert.match(
    html,
    /new URLSearchParams\(window\.location\.search\)\.get\('embed'\) === '1'/,
  );
  assert.match(html, /document\.body\.classList\.toggle\('is-embedded', isEmbedded\)/);
  const embeddedBodyCss = getCssDeclarations(html, 'body.is-embedded');
  assert.match(embeddedBodyCss, /display:\s*flex/);
  assert.match(embeddedBodyCss, /flex-direction:\s*column/);
  assert.match(embeddedBodyCss, /height:\s*100vh/);
  assert.match(embeddedBodyCss, /overflow:\s*hidden/);
  assert.match(getCssDeclarations(html, 'body.is-embedded .page-header'), /display:\s*none/);
  const toolbarCss = getCssDeclarations(html, 'body.is-embedded .filter-toolbar');
  assert.match(toolbarCss, /flex:\s*0 0 auto/);
  assert.match(toolbarCss, /width:\s*100%/);
  assert.match(toolbarCss, /max-width:\s*none/);
  assert.match(toolbarCss, /margin:\s*0/);
  assert.match(toolbarCss, /padding:\s*8px 12px/);
  assert.match(toolbarCss, /border-bottom:\s*1px solid var\(--line\)/);
  assert.match(toolbarCss, /background:\s*var\(--card\)/);
  const workspaceCss = getCssDeclarations(html, 'body.is-embedded .art-workspace');
  assert.match(workspaceCss, /flex:\s*1 1 auto/);
  assert.match(workspaceCss, /width:\s*100%/);
  assert.match(workspaceCss, /max-width:\s*none/);
  assert.match(workspaceCss, /height:\s*auto/);
  assert.match(workspaceCss, /min-height:\s*0/);
  assert.match(workspaceCss, /margin:\s*0/);
  assert.match(workspaceCss, /border:\s*0/);
  assert.match(workspaceCss, /border-radius:\s*0/);
  assert.match(workspaceCss, /box-shadow:\s*none/);
  assert.ok(
    html.indexOf('body.is-embedded {') < html.indexOf('@media (max-width:520px)'),
    'embedded rules must precede the responsive media query',
  );
  const narrowEmbeddedCss = getMediaQuerySource(html, '(max-width:520px)');
  const narrowBodyCss = getCssDeclarations(narrowEmbeddedCss, 'body.is-embedded');
  assert.match(narrowBodyCss, /height:\s*auto/);
  assert.match(narrowBodyCss, /min-height:\s*100vh/);
  assert.match(narrowBodyCss, /overflow:\s*auto/);
  const narrowWorkspaceCss = getCssDeclarations(
    narrowEmbeddedCss,
    'body.is-embedded .art-workspace',
  );
  assert.match(narrowWorkspaceCss, /width:\s*100%/);
  assert.match(narrowWorkspaceCss, /max-width:\s*none/);
  assert.match(narrowWorkspaceCss, /height:\s*auto/);
  assert.match(narrowWorkspaceCss, /min-height:\s*0/);
  assert.match(narrowWorkspaceCss, /margin:\s*0/);
  assert.match(narrowWorkspaceCss, /border:\s*0/);
  assert.match(narrowWorkspaceCss, /border-radius:\s*0/);
});

test('compact desktop controls recover 44px touch targets on narrow screens', async () => {
  const html = await loadHtml();
  const narrowCss = getMediaQuerySource(html, '(max-width:520px)');

  const narrowControls = getCssDeclarations(narrowCss, '.map-controls button');
  assert.match(narrowControls, /width:\s*44px/);
  assert.match(narrowControls, /height:\s*44px/);
  assert.match(narrowControls, /min-width:\s*44px/);
  assert.match(narrowControls, /min-height:\s*44px/);

  const narrowFilters = getCssDeclarations(
    narrowCss,
    '.filter-pill, .clear-button, select, input[type="search"]',
  );
  assert.match(narrowFilters, /min-height:\s*44px/);
  assert.match(getCssDeclarations(narrowCss, '.civilization-filters'), /gap:\s*8px/);

  const narrowEmbeddedBody = getCssDeclarations(narrowCss, 'body.is-embedded');
  assert.match(narrowEmbeddedBody, /height:\s*auto/);
  assert.match(narrowEmbeddedBody, /min-height:\s*100vh/);
  assert.match(narrowEmbeddedBody, /overflow:\s*auto/);
  assert.match(
    getCssDeclarations(narrowCss, 'body.is-embedded .filter-toolbar'),
    /padding:\s*8px 12px/,
  );

  const narrowWorkspace = getCssDeclarations(narrowCss, 'body.is-embedded .art-workspace');
  assert.match(narrowWorkspace, /width:\s*100%/);
  assert.match(narrowWorkspace, /max-width:\s*none/);
  assert.match(narrowWorkspace, /height:\s*auto/);
  assert.match(narrowWorkspace, /min-height:\s*0/);
  assert.match(narrowWorkspace, /margin:\s*0/);
  assert.match(narrowWorkspace, /border:\s*0/);
  assert.match(narrowWorkspace, /border-radius:\s*0/);
});

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
  assert.match(englishTitleCss, /font-size:\s*19px/);
  assert.match(englishTitleCss, /font-weight:\s*800/);
  const chineseTitleCss = getCssDeclarations(html, '.work-title-zh');
  assert.match(chineseTitleCss, /font-size:\s*13px/);
  assert.match(chineseTitleCss, /font-weight:\s*600/);
  assert.match(getCssDeclarations(html, '.work-meta'), /font-size:\s*12px/);
  const detailPanelCss = getCssDeclarations(html, '.detail-panel');
  assert.match(detailPanelCss, /font-size:\s*13\.5px/);
  assert.match(detailPanelCss, /font-weight:\s*600/);
  assert.match(detailPanelCss, /line-height:\s*1\.55/);
  assert.match(detailPanelCss, /padding:\s*18px/);
  const detailTabCss = getCssDeclarations(html, '.detail-tab');
  assert.match(detailTabCss, /font-size:\s*13px/);
  assert.match(detailTabCss, /font-weight:\s*600/);
  const compactFilterCss = getCssDeclarations(html, '.filter-pill, .clear-button');
  assert.match(compactFilterCss, /font-size:\s*13px/);
  assert.match(compactFilterCss, /font-weight:\s*600/);
  assert.match(compactFilterCss, /min-height:\s*34px/);
  assert.match(
    getCssDeclarations(html, '.instruction p, .empty-state p'),
    /line-height:\s*1\.55/,
  );
  assert.match(
    html,
    /meta\.textContent = `AP #\$\{work\.apNumber\} · \$\{civilizations\[work\.civilization\]\} · \$\{work\.period\} · \$\{work\.date\}`/,
  );
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
  assert.match(getCssDeclarations(html, '.legend'), /font-size:\s*12px/);
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

test('official AP unit helpers use every published unit boundary', async () => {
  const html = await loadHtml();
  const configSource = [
    getObjectDeclarationSource(html, 'const AP_UNITS ='),
    getObjectDeclarationSource(html, 'const CULTURES_BY_UNIT ='),
    getObjectDeclarationSource(html, 'const MAP_REGIONS ='),
  ].join('\n');
  const { AP_UNITS, CULTURES_BY_UNIT, MAP_REGIONS } = Function(
    `"use strict"; ${configSource}; return { AP_UNITS, CULTURES_BY_UNIT, MAP_REGIONS };`,
  )();
  const { getUnitById, getApUnitNumber } = loadPureFunctions(
    html,
    ['getUnitById', 'getApUnitNumber'],
    ['const AP_UNITS ='],
  );
  const boundaries = [
    [1, 1], [11, 1], [12, 2], [47, 2], [48, 3], [98, 3], [99, 4], [152, 4],
    [153, 5], [166, 5], [167, 6], [180, 6], [181, 7], [191, 7], [192, 8],
    [212, 8], [213, 9], [223, 9], [224, 10], [250, 10],
  ];

  assert.deepEqual(AP_UNITS, [
    { id: 1, nameEn: 'Global Prehistory', start: 1, end: 11, requiredCount: 11 },
    { id: 2, nameEn: 'Ancient Mediterranean', start: 12, end: 47, requiredCount: 36 },
    { id: 3, nameEn: 'Early Europe and Colonial Americas', start: 48, end: 98, requiredCount: 51 },
    { id: 4, nameEn: 'Later Europe and Americas', start: 99, end: 152, requiredCount: 54 },
    { id: 5, nameEn: 'Indigenous Americas', start: 153, end: 166, requiredCount: 14 },
    { id: 6, nameEn: 'Africa', start: 167, end: 180, requiredCount: 14 },
    { id: 7, nameEn: 'West and Central Asia', start: 181, end: 191, requiredCount: 11 },
    { id: 8, nameEn: 'South, East, and Southeast Asia', start: 192, end: 212, requiredCount: 21 },
    { id: 9, nameEn: 'The Pacific', start: 213, end: 223, requiredCount: 11 },
    { id: 10, nameEn: 'Global Contemporary', start: 224, end: 250, requiredCount: 27 },
  ]);
  assert.equal(Object.isFrozen(AP_UNITS), true);
  assert.ok(AP_UNITS.every(Object.isFrozen));
  assert.equal(Object.isFrozen(CULTURES_BY_UNIT), true);
  assert.equal(Object.isFrozen(CULTURES_BY_UNIT[2]), true);
  assert.ok(CULTURES_BY_UNIT[2].every(Object.isFrozen));
  assert.equal(Object.isFrozen(MAP_REGIONS), true);
  assert.ok(Object.values(MAP_REGIONS).every(Object.isFrozen));

  for (const [apNumber, unitId] of boundaries) {
    assert.equal(getApUnitNumber(apNumber), unitId, `AP #${apNumber}`);
  }
  assert.equal(getApUnitNumber(0), null);
  assert.equal(getApUnitNumber(251), null);
  assert.equal(getUnitById(2).nameEn, 'Ancient Mediterranean');
  assert.equal(getUnitById(2).requiredCount, 36);
  assert.equal(getUnitById(12), null);
  assert.equal(getUnitById('2'), null);
});

test('Unit 2 culture labels and map regions expose the migration interfaces', async () => {
  const html = await loadHtml();
  const configSource = [
    getObjectDeclarationSource(html, 'const CULTURES_BY_UNIT ='),
    getObjectDeclarationSource(html, 'const MAP_REGIONS ='),
  ].join('\n');
  const { CULTURES_BY_UNIT, MAP_REGIONS } = Function(
    `"use strict"; ${configSource}; return { CULTURES_BY_UNIT, MAP_REGIONS };`,
  )();

  assert.deepEqual(
    CULTURES_BY_UNIT[2].map(({ id, labelEn }) => [id, labelEn]),
    [
      ['all', 'All cultures'],
      ['ancientNearEast', 'Ancient Near East'],
      ['egypt', 'Egypt'],
      ['greece', 'Greece'],
      ['etruscan', 'Etruscan'],
      ['rome', 'Rome'],
    ],
  );
  assert.equal(MAP_REGIONS.middleEast?.nameEn, 'Middle East');
  assert.equal(MAP_REGIONS.northAfrica?.nameEn, 'North Africa');
  assert.equal(MAP_REGIONS.southernEurope?.nameEn, 'Southern Europe');
});

test('site works sort by numeric AP number before id', async () => {
  const html = await loadHtml();
  const { compactApNumbers, formatApGroupLabel, createSiteToken, groupBySite } =
    loadPureFunctions(
      html,
      ['compactApNumbers', 'formatApGroupLabel', 'createSiteToken', 'groupBySite'],
    );
  const shared = {
    siteName: 'Synthetic Shared Site',
    coordinates: { x: 10, y: 20 },
    civilization: 'greece',
  };
  const group = groupBySite([
    { ...shared, id: 'alphabetically-first', apNumber: 10 },
    { ...shared, id: 'alphabetically-last', apNumber: 2 },
  ])[0];

  assert.deepEqual(group.works.map((work) => work.apNumber), [2, 10]);
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

test('marker visuals match World pins while hit targets stay touchable', async () => {
  const html = await loadHtml();
  const { getMarkerMetrics, getExpandedPinMetrics } = loadPureFunctions(
    html,
    ['getMarkerMetrics', 'getExpandedPinMetrics'],
  );
  const single = getMarkerMetrics('1', true, 1);
  const child = getExpandedPinMetrics(1);

  assert.equal(single.fontSize, 10);
  assert.equal(single.visualWidth, 22);
  assert.equal(single.visualHeight, 22);
  assert.equal(single.hitWidth, 44);
  assert.equal(single.hitHeight, 44);
  assert.equal(child.fontSize, 10);
  assert.equal(child.visualDiameter, 22);
  assert.equal(child.hitWidth, 44);
  assert.equal(child.hitHeight, 44);
  assert.match(getCssDeclarations(html, '.site-marker .marker-label-bg'), /stroke-width:\s*2/);
  assert.match(getCssDeclarations(html, '.expanded-work-pin .expanded-pin-bg'), /stroke-width:\s*2/);
});

test('desktop map controls use the World History 30px vertical stack', async () => {
  const html = await loadHtml();
  const controls = getCssDeclarations(html, '.map-controls');
  const buttons = getCssDeclarations(html, '.map-controls button');

  assert.match(controls, /flex-direction:\s*column/);
  assert.match(buttons, /width:\s*30px/);
  assert.match(buttons, /height:\s*30px/);
  assert.match(buttons, /border-radius:\s*6px/);
  assert.match(
    html,
    /<button id="resetView" class="overview-button" type="button" aria-label="还原地图">1:1<\/button>/,
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
  assert.ok(metrics.fontSize * renderedScale >= 9.5);
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

test('250-work map falls back to a collision-safe hierarchy at every mobile zoom', async () => {
  const html = await loadHtml();
  const {
    compactApNumbers,
    formatApGroupLabel,
    createSiteToken,
    getApUnitNumber,
    toWorldCoordinates,
    groupBySite,
    getMapHierarchyLevel,
    groupByRegionGrid,
    buildMapGroups,
    buildMapGroupCandidates,
    getMarkerMetrics,
    getMarkerBounds,
    markerBoundsOverlap,
    expandMarkerBounds,
    createSpatialHash,
    findNearestAvailableMarkerSlot,
    layoutSiteMarkers,
    layoutMapGroups,
  } = loadPureFunctions(
    html,
    [
      'compactApNumbers',
      'formatApGroupLabel',
      'createSiteToken',
      'getApUnitNumber',
      'toWorldCoordinates',
      'groupBySite',
      'getMapHierarchyLevel',
      'groupByRegionGrid',
      'buildMapGroups',
      'buildMapGroupCandidates',
      'getMarkerMetrics',
      'getMarkerBounds',
      'markerBoundsOverlap',
      'expandMarkerBounds',
      'createSpatialHash',
      'findNearestAvailableMarkerSlot',
      'layoutSiteMarkers',
      'layoutMapGroups',
    ],
    ['const AP_UNITS =', 'const SITE_WORLD_COORDINATES ='],
  );
  const artworks = Array.from({ length: 250 }, (_, index) => {
    const apNumber = index + 1;
    return {
      id: `synthetic-ap-${apNumber}`,
      apNumber,
      siteName: `Synthetic Site ${apNumber}`,
      coordinates: {
        x: -1200 + (index % 25) * 100,
        y: -500 + Math.floor(index / 25) * 100,
      },
      civilization: ['egypt', 'greece', 'rome'][index % 3],
      titleEn: `Synthetic Work ${apNumber}`,
    };
  });

  for (const zoomScale of [1, 1.5, 1.75, 2.5, 3]) {
    const screenScale = (362 / 1600) * zoomScale;
    const laidOut = layoutMapGroups(artworks, zoomScale, screenScale, {});
    assert.ok(laidOut.length <= 40, `${zoomScale}x rendered too many top-level groups`);
    assert.doesNotThrow(
      () => layoutSiteMarkers(laidOut, screenScale),
      `${zoomScale}x hierarchy result must remain layout-safe`,
    );
    assert.deepEqual(
      layoutMapGroups(artworks, zoomScale, screenScale, {}).map((group) => group.key),
      laidOut.map((group) => group.key),
      `${zoomScale}x fallback must be deterministic`,
    );
  }

  const candidates = buildMapGroupCandidates(artworks, 3, {});
  assert.deepEqual(
    candidates.map((groups) => groups[0].kind),
    ['site', 'region', 'unit'],
  );
  assert.equal(buildMapGroups(artworks, 3).length, 250);
  assert.equal(getMapHierarchyLevel(250, 3), 'site');
});

test('unit to region to site branch refinement stays stable and layout-safe on mobile', async () => {
  const html = await loadHtml();
  const helpers = loadPureFunctions(
    html,
    [
      'compactApNumbers',
      'formatApGroupLabel',
      'createSiteToken',
      'getApUnitNumber',
      'toWorldCoordinates',
      'groupBySite',
      'getMapHierarchyLevel',
      'groupByRegionGrid',
      'buildMapGroups',
      'buildMapGroupCandidates',
      'getMarkerMetrics',
      'getMarkerBounds',
      'markerBoundsOverlap',
      'expandMarkerBounds',
      'createSpatialHash',
      'findNearestAvailableMarkerSlot',
      'layoutSiteMarkers',
      'layoutMapGroups',
    ],
    ['const AP_UNITS =', 'const SITE_WORLD_COORDINATES ='],
  );
  const artworks = Array.from({ length: 250 }, (_, index) => {
    const apNumber = index + 1;
    return {
      id: `synthetic-ap-${apNumber}`,
      apNumber,
      siteName: `Synthetic Site ${apNumber}`,
      coordinates: {
        x: -1200 + (index % 25) * 100,
        y: -500 + Math.floor(index / 25) * 100,
      },
      civilization: ['egypt', 'greece', 'rome'][index % 3],
      titleEn: `Synthetic Work ${apNumber}`,
    };
  });
  const mobileScale = (zoomScale) => (362 / 1600) * zoomScale;
  const approvedWorks = parseArtworkData(html);
  for (const zoomScale of [1, 1.5, 1.75, 2.5, 3]) {
    const approvedLayout = helpers.layoutMapGroups(
      approvedWorks,
      zoomScale,
      mobileScale(zoomScale),
      {},
    );
    assert.equal(approvedLayout.length, 15);
    assert.ok(approvedLayout.every((group) => group.kind === 'site'));
  }
  const overview = helpers.layoutMapGroups(artworks, 1, mobileScale(1), {});
  assert.ok(overview.every((group) => group.kind === 'unit'));
  for (const unit of overview) {
    const unitBranch = { activeUnit: unit.apUnits[0], activeRegion: null };
    const regions = helpers.layoutMapGroups(
      artworks,
      1.5,
      mobileScale(1.5),
      unitBranch,
    );
    assert.ok(regions.every((group) => group.kind === 'region'));
    assert.ok(regions.every((group) => group.parentKey === unit.key));
    assert.doesNotThrow(() => helpers.layoutSiteMarkers(regions, mobileScale(1.5)));
    assert.deepEqual(
      helpers.layoutMapGroups(artworks, 1.5, mobileScale(1.5), unitBranch)
        .map((group) => group.key),
      regions.map((group) => group.key),
    );
    for (const region of regions) {
      const regionBranch = {
        activeUnit: unit.apUnits[0],
        activeRegion: region.key,
      };
      const sites = helpers.layoutMapGroups(
        artworks,
        2.5,
        mobileScale(2.5),
        regionBranch,
      );
      assert.ok(sites.every((group) => group.kind === 'site'));
      assert.ok(sites.every((group) => group.parentKey === region.key));
      assert.ok(sites.every((group) => group.works.length === 1));
      assert.doesNotThrow(() => helpers.layoutSiteMarkers(sites, mobileScale(2.5)));
      assert.deepEqual(
        helpers.layoutMapGroups(artworks, 2.5, mobileScale(2.5), regionBranch)
          .map((group) => group.key),
        sites.map((group) => group.key),
      );
    }
  }
});

test('hierarchy keyboard activation focuses a stable child after rerender', async () => {
  const html = await loadHtml();
  const stateSource = getObjectDeclarationSource(html, 'const state =');
  const expandSource = getFunctionSource(html, 'expandSiteGroup');
  const renderSource = getFunctionSource(html, 'render');
  const focusSource = getFunctionSource(html, 'focusHierarchyChild');
  const zoomSyncSource = getFunctionSource(html, 'syncHierarchyBranchForZoom');
  const { getHierarchyChildFocusToken } = loadPureFunctions(
    html,
    ['getHierarchyChildFocusToken'],
  );
  const groups = [
    { key: 'region-b', parentKey: 'unit-4', siteToken: 'region-b-token' },
    { key: 'region-a', parentKey: 'unit-4', siteToken: 'region-a-token' },
    { key: 'region-c', parentKey: 'unit-5', siteToken: 'region-c-token' },
  ];

  assert.equal(
    getHierarchyChildFocusToken(groups, 'unit-4'),
    'region-b-token',
  );
  assert.equal(getHierarchyChildFocusToken(groups, 'unit-9'), null);
  assert.match(stateSource, /activeUnit:\s*null/);
  assert.match(stateSource, /activeRegion:\s*null/);
  assert.match(stateSource, /pendingFocusParentKey:\s*null/);
  assert.match(expandSource, /group\.kind === 'unit'/);
  assert.match(expandSource, /state\.activeUnit = group\.apUnits\[0\]/);
  assert.match(expandSource, /group\.kind === 'region'/);
  assert.match(expandSource, /state\.activeRegion = group\.key/);
  assert.match(
    expandSource,
    /restoreFocus[\s\S]*state\.pendingFocusParentKey = group\.key/,
  );
  assert.match(focusSource, /focusSiteMarker\(childToken\)/);
  assert.match(
    renderSource,
    /markerLayer\.replaceChildren\([\s\S]*state\.pendingFocusParentKey[\s\S]*focusHierarchyChild\([\s\S]*state\.pendingFocusParentKey = null/,
  );
  assert.match(
    getFunctionSource(html, 'clearFilters'),
    /activeUnit:\s*null[\s\S]*activeRegion:\s*null[\s\S]*pendingFocusParentKey:\s*null/,
  );
  assert.match(zoomSyncSource, /state\.transform\.scale < 2\.5[\s\S]*state\.activeRegion = null/);
  assert.match(zoomSyncSource, /state\.transform\.scale < 1\.5[\s\S]*state\.activeUnit = null/);
  assert.match(html, /filter-pill[\s\S]*clearHierarchyBranch\(\)/);
  assert.match(
    html,
    /getElementById\('resetView'\)[\s\S]*clearHierarchyBranch\(\)[\s\S]*transform = \{ x:0, y:0, scale:1 \}/,
  );
});

test('expanded AP pins use deterministic, bounded, non-overlapping spider positions', async () => {
  const html = await loadHtml();
  const {
    getMarkerBounds,
    markerBoundsOverlap,
    getExpandedPinMetrics,
    expandedPinPositions,
  } = loadPureFunctions(
    html,
    [
      'getMarkerBounds',
      'markerBoundsOverlap',
      'getExpandedPinMetrics',
      'expandedPinPositions',
    ],
  );
  const screenScale = 362 / 1600;
  const group = {
    works: Array.from({ length: 7 }, (_, index) => ({
      id: `ap-${index + 41}`,
      apNumber: index + 41,
    })),
  };
  const center = { x: 875, y: 296 };
  const first = expandedPinPositions(group, center, screenScale);
  const second = expandedPinPositions(group, center, screenScale);
  const metrics = getExpandedPinMetrics(screenScale);

  assert.deepEqual(first, second, 'spider positions must not change across renders');
  assert.equal(first.length, group.works.length);
  assert.ok(metrics.hitWidth * screenScale >= 44);
  assert.ok(metrics.hitHeight * screenScale >= 44);
  first.forEach((pin, index) => {
    assert.equal(pin.work.id, group.works[index].id);
    assert.ok(pin.bounds.left >= 0, `${pin.work.id} crosses left edge`);
    assert.ok(pin.bounds.right <= 1600, `${pin.work.id} crosses right edge`);
    assert.ok(pin.bounds.top >= 0, `${pin.work.id} crosses top edge`);
    assert.ok(pin.bounds.bottom <= 800, `${pin.work.id} crosses bottom edge`);
    first.slice(index + 1).forEach((other) => {
      assert.equal(
        markerBoundsOverlap(pin.bounds, other.bounds),
        false,
        `${pin.work.id} overlaps ${other.work.id}`,
      );
    });
  });
});

test('zoomed spider positions stay inside the currently visible world bounds', async () => {
  const html = await loadHtml();
  const {
    getMarkerBounds,
    markerBoundsOverlap,
    getExpandedPinMetrics,
    getVisibleWorldBounds,
    expandedPinPositions,
    shouldUseCompactExpandedList,
  } = loadPureFunctions(
    html,
    [
      'getMarkerBounds',
      'markerBoundsOverlap',
      'getExpandedPinMetrics',
      'getVisibleWorldBounds',
      'expandedPinPositions',
      'shouldUseCompactExpandedList',
    ],
  );
  const visibleBounds = getVisibleWorldBounds({ x: -1600, y: -800, scale: 2 });
  assert.deepEqual(visibleBounds, {
    left: 800,
    right: 1600,
    top: 400,
    bottom: 800,
  });
  const screenScale = 1;
  const center = { x: 850, y: 450 };
  const group = {
    works: Array.from({ length: 7 }, (_, index) => ({
      id: `edge-ap-${index + 41}`,
      apNumber: index + 41,
    })),
  };
  const parentBounds = getMarkerBounds(center, getExpandedPinMetrics(screenScale));
  const pins = expandedPinPositions(
    group,
    center,
    screenScale,
    [parentBounds],
    visibleBounds,
  );

  pins.forEach((pin) => {
    assert.ok(pin.bounds.left >= visibleBounds.left);
    assert.ok(pin.bounds.right <= visibleBounds.right);
    assert.ok(pin.bounds.top >= visibleBounds.top);
    assert.ok(pin.bounds.bottom <= visibleBounds.bottom);
  });
  assert.equal(
    shouldUseCompactExpandedList(
      group,
      center,
      screenScale,
      [parentBounds],
      { left: 800, right: 900, top: 400, bottom: 500 },
    ),
    true,
  );
});

test('expanded pins fit every collision-safe site center at mobile scale', async () => {
  const html = await loadHtml();
  const artworks = parseArtworkData(html);
  const {
    compactApNumbers,
    formatApGroupLabel,
    createSiteToken,
    groupBySite,
    toWorldCoordinates,
    getMarkerMetrics,
    getExpandedPinMetrics,
    getMarkerBounds,
    markerBoundsOverlap,
    expandMarkerBounds,
    createSpatialHash,
    findNearestAvailableMarkerSlot,
    layoutSiteMarkers,
    expandedPinPositions,
  } = loadPureFunctions(
    html,
    [
      'compactApNumbers',
      'formatApGroupLabel',
      'createSiteToken',
      'groupBySite',
      'toWorldCoordinates',
      'getMarkerMetrics',
      'getExpandedPinMetrics',
      'getMarkerBounds',
      'markerBoundsOverlap',
      'expandMarkerBounds',
      'createSpatialHash',
      'findNearestAvailableMarkerSlot',
      'layoutSiteMarkers',
      'expandedPinPositions',
    ],
    ['const SITE_WORLD_COORDINATES ='],
  );
  const screenScale = 362 / 1600;
  const groups = layoutSiteMarkers(groupBySite(artworks), screenScale);

  groups.filter((group) => group.works.length > 1).forEach((group) => {
    assert.doesNotThrow(
      () => expandedPinPositions(
        group,
        { x: group.displayX, y: group.displayY },
        screenScale,
      ),
      `${group.siteName} must expand around its collision-safe display center`,
    );
  });
});

test('desktop expanded pins avoid their parent target and every other site marker', async () => {
  const html = await loadHtml();
  const artworks = parseArtworkData(html);
  const {
    compactApNumbers,
    formatApGroupLabel,
    createSiteToken,
    groupBySite,
    toWorldCoordinates,
    getMarkerMetrics,
    getExpandedPinMetrics,
    getMarkerBounds,
    markerBoundsOverlap,
    expandMarkerBounds,
    createSpatialHash,
    findNearestAvailableMarkerSlot,
    layoutSiteMarkers,
    expandedPinPositions,
  } = loadPureFunctions(
    html,
    [
      'compactApNumbers',
      'formatApGroupLabel',
      'createSiteToken',
      'groupBySite',
      'toWorldCoordinates',
      'getMarkerMetrics',
      'getExpandedPinMetrics',
      'getMarkerBounds',
      'markerBoundsOverlap',
      'expandMarkerBounds',
      'createSpatialHash',
      'findNearestAvailableMarkerSlot',
      'layoutSiteMarkers',
      'expandedPinPositions',
    ],
    ['const SITE_WORLD_COORDINATES ='],
  );
  const screenScale = 0.5;
  const groups = layoutSiteMarkers(groupBySite(artworks), screenScale);
  const obstacles = groups.map((group) => group.bounds);

  groups.filter((group) => group.works.length > 1).forEach((group) => {
    const pins = expandedPinPositions(
      group,
      { x: group.displayX, y: group.displayY },
      screenScale,
      obstacles,
    );
    pins.forEach((pin) => {
      obstacles.forEach((bounds) => {
        assert.equal(
          markerBoundsOverlap(pin.bounds, bounds),
          false,
          `${group.siteName} ${pin.work.id} overlaps a site marker`,
        );
      });
    });
  });
});

test('compact mode follows actual spider capacity at embedded map scales', async () => {
  const html = await loadHtml();
  const artworks = parseArtworkData(html);
  const functionNames = [
    'compactApNumbers',
    'formatApGroupLabel',
    'createSiteToken',
    'groupBySite',
    'toWorldCoordinates',
    'getMarkerMetrics',
    'getExpandedPinMetrics',
    'getMarkerBounds',
    'markerBoundsOverlap',
    'expandMarkerBounds',
    'createSpatialHash',
    'findNearestAvailableMarkerSlot',
    'layoutSiteMarkers',
    'expandedPinPositions',
    'shouldUseCompactExpandedList',
  ];
  const helpers = loadPureFunctions(
    html,
    functionNames,
    ['const SITE_WORLD_COORDINATES ='],
  );

  for (const screenScale of [0.22625, 0.253, 0.27, 0.5]) {
    const groups = helpers.layoutSiteMarkers(helpers.groupBySite(artworks), screenScale);
    const obstacles = groups.map((group) => group.bounds);
    groups.filter((group) => group.works.length > 1).forEach((group) => {
      assert.equal(
        helpers.shouldUseCompactExpandedList(
          group,
          { x: group.displayX, y: group.displayY },
          screenScale,
          obstacles,
        ),
        screenScale <= 0.27,
        `${group.siteName} should use ${screenScale <= 0.27 ? 'compact' : 'spider'} mode`,
      );
    });
  }
});

test('mobile expansion uses a bounded compact list with exact AP work buttons', async () => {
  const html = await loadHtml();
  const compactSource = getFunctionSource(html, 'renderCompactExpandedList');
  const renderSource = getFunctionSource(html, 'render');

  assert.match(html, /<div id="expandedPinList" class="expanded-pin-list" hidden>/);
  assert.match(
    renderSource,
    /shouldUseCompactExpandedList\(\s*expandedGroup,\s*expandedCenter,\s*renderedMarkerScale,\s*obstacleBounds/,
  );
  assert.match(compactSource, /button\.dataset\.workId = work\.id/);
  assert.match(compactSource, /expandedPinList\.classList\.add\('is-visible'\)/);
  assert.match(compactSource, /mapPanel\.classList\.add\('has-compact-list'\)/);
  assert.match(renderSource, /expandedPinList\.classList\.remove\('is-visible'\)/);
  assert.match(renderSource, /mapPanel\.classList\.remove\('has-compact-list'\)/);
  assert.match(compactSource, /button\.setAttribute\('role',\s*'button'\)/);
  assert.match(compactSource, /button\.setAttribute\('tabindex',\s*'0'\)/);
  assert.match(
    compactSource,
    /button\.setAttribute\('aria-pressed',\s*String\(state\.selectedId === work\.id\)\)/,
  );
  assert.match(
    compactSource,
    /`AP \$\{work\.apNumber\} · \$\{work\.titleEn\} · \$\{group\.siteName\}`/,
  );
  assert.match(compactSource, /selectArtwork\(work\.id,\s*group\.siteToken/);
  assert.match(getCssDeclarations(html, '.expanded-pin-list'), /width:\s*100%/);
  assert.match(
    getCssDeclarations(html, '.expanded-pin-list.is-visible'),
    /display:\s*grid/,
  );
  assert.ok(
    html.indexOf('.expanded-pin-list.is-visible') < html.indexOf('@media (max-width:520px)'),
    'compact visibility must not depend on the 520px media query',
  );
  assert.match(
    getCssDeclarations(html, '.map-panel.has-compact-list'),
    /display:\s*grid/,
  );
  assert.match(
    getCssDeclarations(html, '.map-panel.has-compact-list'),
    /overflow:\s*(?:auto|visible)/,
  );
  assert.match(
    getCssDeclarations(html, '.expanded-pin-list-button'),
    /min-height:\s*44px/,
  );
  assert.match(
    getCssDeclarations(html, '.expanded-pin-list-button'),
    /overflow-wrap:\s*anywhere/,
  );
});

test('site expansion identity remains stable for compatible filtered subsets', async () => {
  const html = await loadHtml();
  const artworks = parseArtworkData(html);
  const { compactApNumbers, formatApGroupLabel, createSiteToken, groupBySite } =
    loadPureFunctions(
      html,
      ['compactApNumbers', 'formatApGroupLabel', 'createSiteToken', 'groupBySite'],
    );
  const rome = artworks.filter((work) => work.siteName === 'Rome');
  const fullToken = groupBySite(rome)[0].siteToken;
  const subsetToken = groupBySite(rome.slice(0, 2))[0].siteToken;

  assert.equal(fullToken, subsetToken);
  assert.match(
    getFunctionSource(html, 'render'),
    /group\.siteToken === state\.expandedSiteToken && group\.works\.length > 1/,
  );
});

test('multi-work groups expand while single groups and child pins select exact works', async () => {
  const html = await loadHtml();
  const stateSource = getObjectDeclarationSource(html, 'const state =');
  const expandSource = getFunctionSource(html, 'expandSiteGroup');
  const selectSource = getFunctionSource(html, 'selectArtwork');
  const expandedRenderSource = getFunctionSource(html, 'renderExpandedWorkPins');
  const renderSource = getFunctionSource(html, 'render');

  assert.match(stateSource, /expandedSiteToken:\s*null/);
  assert.match(expandSource, /group\.works\.length === 1/);
  assert.match(expandSource, /selectArtwork\(group\.works\[0\]\.id,\s*group\.siteToken/);
  assert.match(
    expandSource,
    /state\.expandedSiteToken === group\.siteToken \? null : group\.siteToken/,
  );
  assert.match(selectSource, /state\.selectedId = workId/);
  assert.match(selectSource, /state\.expandedSiteToken = siteToken/);
  assert.match(selectSource, /state\.activeDetailTab = 'quick'/);
  assert.match(renderSource, /expandSiteGroup\(group/);
  assert.doesNotMatch(renderSource, /selectSite\(group/);

  assert.match(expandedRenderSource, /expandedPinPositions\(\s*group,\s*center/);
  assert.match(expandedRenderSource, /classList\.add\('expanded-work-pin'\)/);
  assert.match(expandedRenderSource, /pin\.setAttribute\('role',\s*'button'\)/);
  assert.match(expandedRenderSource, /pin\.setAttribute\('tabindex',\s*'0'\)/);
  assert.match(
    expandedRenderSource,
    /`AP \$\{work\.apNumber\} · \$\{work\.titleEn\} · \$\{group\.siteName\}`/,
  );
  assert.match(expandedRenderSource, /label\.textContent = String\(work\.apNumber\)/);
  assert.match(expandedRenderSource, /selectArtwork\(work\.id,\s*group\.siteToken/);
  assert.match(expandedRenderSource, /event\.key !== 'Enter' && event\.key !== ' '/);
});

test('expansion closes only when incompatible and focus survives marker rerenders', async () => {
  const html = await loadHtml();
  const renderSource = getFunctionSource(html, 'render');
  const clearSource = getFunctionSource(html, 'clearFilters');

  assert.match(
    renderSource,
    /visibleGroups\.some\(\(group\) => \(\s*group\.siteToken === state\.expandedSiteToken && group\.works\.length > 1/,
  );
  assert.match(renderSource, /state\.expandedSiteToken = null/);
  assert.match(clearSource, /expandedSiteToken:\s*null/);
  assert.match(html, /function focusExpandedWorkPin\(workId\)/);
  assert.match(html, /\[data-work-id="\$\{workId\}"\]/);
  assert.match(renderSource, /focusedWorkId/);
  assert.match(renderSource, /focusExpandedWorkPin\(focusedWorkId\)/);
  assert.doesNotMatch(
    renderSource,
    /state\.transform\.scale\s*>=\s*2[\s\S]*expandedSiteToken/,
    'zoom level must not automatically expand all groups',
  );
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
  const layoutIndex = renderSource.indexOf('layoutMapGroups(');
  const replaceIndex = renderSource.indexOf('markerLayer.replaceChildren(');

  assert.ok(layoutIndex >= 0, 'render must calculate a marker layout');
  assert.ok(replaceIndex > layoutIndex, 'render must replace markers only after layout succeeds');
});

test('detail images show the complete artwork without cover cropping', async () => {
  const html = await loadHtml();
  const detailImageCss = getCssDeclarations(html, '.artwork-image-button img');
  assert.match(detailImageCss, /object-fit:\s*contain/);
  assert.doesNotMatch(detailImageCss, /object-fit:\s*cover/);
  assert.match(
    detailImageCss,
    /(?:^|;)\s*height:\s*278px/,
    'image box height must equal the 300px border-box button minus 20px padding and 2px border',
  );
  assert.match(detailImageCss, /(?:^|;)\s*max-height:\s*278px/);
  assert.match(detailImageCss, /(?:^|;)\s*width:\s*100%/);
  assert.match(detailImageCss, /(?:^|;)\s*max-width:\s*100%/);
  assert.doesNotMatch(detailImageCss, /(?:^|;)\s*(?:height|max-height):\s*100%/);

  const imageButtonCss = getCssDeclarations(html, '.artwork-image-button');
  assert.match(imageButtonCss, /background:\s*var\(--surface-sunken\)/);
  assert.match(imageButtonCss, /box-sizing:\s*border-box/);
  assert.match(imageButtonCss, /(?:^|;)\s*height:\s*300px/);
  assert.match(imageButtonCss, /(?:^|;)\s*max-height:\s*300px/);
  assert.match(imageButtonCss, /(?:^|;)\s*padding:\s*10px/);
  assert.match(imageButtonCss, /(?:^|;)\s*border:\s*1px\s+solid/);
});
