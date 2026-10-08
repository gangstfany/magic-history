import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RELEASE_STEPS } from '../scripts/verify-art-history-release.mjs';

const HTML_PATH = new URL('../index.html', import.meta.url);
const ART_HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const WORLD_HTML_PATH = new URL('../world-map.html', import.meta.url);

async function loadHtml() {
  return readFile(HTML_PATH, 'utf8');
}

test('homepage keeps persistent, independently labelled world and art frames', async () => {
  const html = await loadHtml();

  assert.match(html, /<iframe[^>]+id="worldMapFrame"[^>]+src="world-map\.html"/s);
  assert.match(html, /<iframe[^>]+id="artMapFrame"[^>]+src="art-history-map\.html\?embed=1"/s);
  assert.equal((html.match(/src="world-map\.html"/g) || []).length, 1);
  assert.equal((html.match(/src="art-history-map\.html\?embed=1"/g) || []).length, 1);
});

test('Art History is live in both subject controls', async () => {
  const html = await loadHtml();

  const pill = html.match(/<span class="subj-pill" data-subj="art"[\s\S]*?<\/span>/)?.[0] || '';
  assert.ok(pill, 'missing Art History subject pill');
  assert.doesNotMatch(pill, /soon/i);
  assert.match(html, /data-subject="art"[\s\S]*?<span class="tag"[^>]*>Live<\/span>/);
  assert.match(html, /art:\s*\{\s*label:\s*'Art History',\s*live:\s*true,\s*frame:\s*artMapFrame/);
});

test('subject switching exposes one live frame accessibly and preserves both frame nodes', async () => {
  const html = await loadHtml();

  assert.match(html, /\.classList\.toggle\('active',\s*isSelected\)/);
  assert.match(html, /\.toggleAttribute\('hidden',\s*!isSelected\)/);
  assert.match(html, /\.setAttribute\('aria-hidden',\s*String\(!isSelected\)\)/);
  assert.match(html, /mapCard\.dataset\.subject\s*=\s*key/);
  assert.doesNotMatch(html, /\.src\s*=\s*['"](?:world-map|art-history-map)\.html/);
  assert.match(
    html,
    /subjPills\.forEach\(p => p\.addEventListener\('click', \(\) => selectSubject\(p\.dataset\.subj\)\)\)/,
  );
  assert.match(
    html,
    /querySelectorAll\('\.navlinks li, \.subject-item, \.today-pick, \.feature-clickable, \.back-link, \.subj-pill'\)[\s\S]*e\.key === 'Enter' \|\| e\.key === ' '/,
  );
});

test('initial World subject uses the bounded live-frame loading flow', async () => {
  const html = await loadHtml();

  assert.match(html, /function showLiveFrame\(s\)/);
  assert.match(html, /window\.setTimeout\([\s\S]*?6000\)/);
  assert.match(html, /subjPills\.forEach[\s\S]*?selectSubject\('world'\)/);
  assert.match(html, /mapRetry\.addEventListener\('click'/);
});

test('frame load success requires the expected same-origin document and page landmark', async () => {
  const html = await loadHtml();

  assert.match(html, /function isExpectedFrameReady\(frame\)/);
  assert.match(html, /frame\.contentDocument/);
  assert.match(html, /frame\.contentWindow\.location\.href/);
  assert.match(html, /new URL\(frame\.getAttribute\('src'\), window\.location\.href\)/);
  assert.match(html, /doc\.querySelector\('\.map-zone'\)/);
  assert.match(html, /doc\.querySelector\('#markerLayer'\)/);
  assert.match(html, /catch \(err\) \{\s*return false;\s*\}/);
  assert.match(html, /addEventListener\('load', \(\) => \{\s*if \(isExpectedFrameReady\(frame\)\) finishFrameLoad\(frame\);/);
  assert.match(html, /if \(isExpectedFrameReady\(frame\)\) finishFrameLoad\(frame\);/);
});

test("Today's Pick cannot reappear after switching away from World", async () => {
  const html = await loadHtml();

  assert.match(html, /todayPick\.style\.display\s*=\s*selectedSubject === 'world' \? 'block' : 'none'/);
});

test('coming-soon subjects hide stale World event details', async () => {
  const html = await loadHtml();

  assert.match(html, /if \(homeEvents\) \{\s*homeEvents\.innerHTML = HOME_EVENTS_EMPTY;\s*homeEvents\.hidden = true;/);
  assert.match(html, /if \(key === 'world'\) syncHomeEvents\(\)/);
});

test('responsive rules preserve useful Art height without collapsing other subject placeholders', async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /@media \(max-width: 900px\)[\s\S]*?\.map-card\[data-subject="art"\] \.home-map-wrap\s*\{\s*flex:\s*0 0 auto;\s*height:\s*min\(720px, 78vh\)/,
    'Art mobile wrapper must reset the desktop 100% flex-basis before preserving useful embedded height',
  );
  for (const subject of ['euro', 'us', 'geo']) {
    assert.match(
      html,
      new RegExp(`@media \\(max-width: 900px\\)[\\s\\S]*?\\.map-card\\[data-subject="${subject}"\\] \\.map-events-split[\\s\\S]*?height:\\s*300px`),
      `${subject} placeholder must retain its 300px narrow-screen height`,
    );
  }
});

test('Art-only host sizing gives stacked and two-column short maps separate heights', async () => {
  const html = await loadHtml();
  const stackedShortRule = html.match(
    /@media \(max-width: 666px\) and \(max-height: 520px\)\s*\{([\s\S]*?)\n\}/,
  )?.[1] || '';
  const twoColumnShortRule = html.match(
    /@media \(min-width: 667px\) and \(max-width: 900px\) and \(max-height: 520px\)\s*\{([\s\S]*?)\n\}/,
  )?.[1] || '';

  assert.match(
    stackedShortRule,
    /\.map-card\[data-subject="art"\] \.home-map-wrap\s*\{\s*height:\s*960px/,
  );
  assert.match(
    twoColumnShortRule,
    /\.map-card\[data-subject="art"\] \.home-map-wrap\s*\{\s*height:\s*520px/,
  );
  for (const rule of [stackedShortRule, twoColumnShortRule]) {
    assert.doesNotMatch(rule, /data-subject="(?:world|euro|us|geo)"/);
    assert.doesNotMatch(rule, /(?:^|\n)\s*\.home-map-wrap\s*\{/);
  }
  assert.doesNotMatch(
    html,
    /@media \(max-width: 900px\) and \(max-height: 520px\)/,
  );
});

test('homepage subject pills expose keyboard button semantics', async () => {
  const html = await loadHtml();
  const artPill = html.match(/<span class="subj-pill"[^>]*data-subj="art"[^>]*>/)?.[0] || '';

  assert.match(artPill, /role="button"/);
  assert.match(artPill, /tabindex="0"/);
  assert.match(artPill, /aria-pressed="false"/);
  assert.match(
    html,
    /querySelectorAll\([^)]*\.subj-pill[^)]*\)[\s\S]*el\.addEventListener\('keydown',[\s\S]*e\.key === 'Enter'[\s\S]*e\.key === ' '/,
  );
});

test('map caption describes all 180 Units 1-6 works and preserves the World History caption', async () => {
  const html = await loadHtml();

  assert.match(html, /id="homeMapCaption"/);
  assert.match(html, /homeMapCaption\.textContent = key === 'art'/);
  assert.match(
    html,
    /\? '180 AP works · Units 1-6 · filter, compare and study'/,
  );
  assert.match(html, /: '5 regions · 233 events · 104 pins · 6 trade routes'/);
  assert.match(html, /homeMapCaption\.hidden = !s\.live/);
});

test('Art map copy identifies the complete Units 1-6 scope', async () => {
  const artHtml = await readFile(ART_HTML_PATH, 'utf8');

  assert.match(artHtml, /<title>AP 艺术史互动地图 · Units 1-6<\/title>/);
  assert.match(artHtml, /<h1>AP 艺术史互动地图 · Units 1-6<\/h1>/);
  assert.match(artHtml, /count\.textContent = `当前显示 \$\{visibleWorks\.length\} 件作品`/);
  assert.doesNotMatch(artHtml, /Units 1-4/);
  assert.doesNotMatch(artHtml, /Units 1-5/);
});

test('Art hierarchy instructions invite exploration of all 180 Units 1-6 works', async () => {
  const artHtml = await readFile(ART_HTML_PATH, 'utf8');

  assert.match(artHtml, /Explore the Units 1-6 map hierarchy/);
  assert.match(artHtml, /Explore all 180 AP works across Units 1-6/);
});

for (const [name, element] of [
  ['map panel', /<section id="mapPanel"[^>]*aria-label="([^"]+)"/],
  ['map image', /<svg class="map-svg"[^>]*aria-label="([^"]+)"/],
]) {
  test(`Art ${name} accessible description includes the full scope and global distribution`, async () => {
    const artHtml = await readFile(ART_HTML_PATH, 'utf8');
    const label = artHtml.match(element)?.[1] || '';

    assert.match(label, /Units 1-6/);
    assert.match(label, /全部 180 件作品/);
    assert.match(label, /U6 Africa（非洲）/);
    assert.match(label, /完整世界地图/);
    assert.match(label, /在非洲、欧洲、亚洲、大洋洲与美洲的全球分布/);
  });
}

test('release validator label describes the strict 180-work Units 1-6 scope', () => {
  const validator = RELEASE_STEPS[1];

  assert.equal(validator.label, 'strict 180-work Units 1-6 validator');
  assert.deepEqual(validator.args, [
    'scripts/validate-art-history-data.mjs',
    'art-history-map.html',
  ]);
});

test('private media mode propagates to the Art iframe only when explicitly requested', async () => {
  const html = await loadHtml();

  assert.equal((html.match(/src="art-history-map\.html\?embed=1"/g) || []).length, 1);
  assert.doesNotMatch(html, /src="art-history-map\.html\?embed=1&privateMedia=1"/);
  assert.match(html, /function buildArtHistoryUrl\(search\)/);
  assert.match(html, /const hostParams = new URLSearchParams\(search\)/);
  assert.match(html, /new URL\('art-history-map\.html\?embed=1', window\.location\.href\)/);
  assert.match(html, /if \(hostParams\.get\('privateMedia'\) === '1'\)/);
  assert.match(html, /artUrl\.searchParams\.set\('privateMedia', '1'\)/);
  assert.match(html, /const artHistoryUrl = buildArtHistoryUrl\(window\.location\.search\)/);
  assert.match(html, /if \(artHistoryUrl !== artMapFrame\.getAttribute\('src'\)\) artMapFrame\.src = artHistoryUrl/);
  assert.doesNotMatch(html, /artUrl\.searchParams\.set\((?!'privateMedia')/);

  const functionSource = html.match(
    /function buildArtHistoryUrl\(search\) \{[\s\S]*?^  \}/m,
  )?.[0];
  assert.ok(functionSource, 'missing buildArtHistoryUrl implementation');
  const buildArtHistoryUrl = Function(
    'window',
    `${functionSource}; return buildArtHistoryUrl;`,
  )({ location: { href: 'https://example.test/index.html' } });
  assert.equal(buildArtHistoryUrl(''), 'art-history-map.html?embed=1');
  assert.equal(
    buildArtHistoryUrl('?privateMedia=1'),
    'art-history-map.html?embed=1&privateMedia=1',
  );
  assert.equal(buildArtHistoryUrl('?privateMedia=0'), 'art-history-map.html?embed=1');
  assert.equal(buildArtHistoryUrl('?privateMedia=1&debug=1'), 'art-history-map.html?embed=1&privateMedia=1');
  assert.equal(buildArtHistoryUrl('?debug=1'), 'art-history-map.html?embed=1');
});

test('homepage preserves the World History typography and navigation labels', async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /font-family: "PingFang SC", "Hiragino Sans GB", -apple-system, "Helvetica Neue", sans-serif/,
  );
  assert.match(
    html,
    /\.serif \{ font-family: "Big Caslon", "Iowan Old Style", Georgia, "Palatino Linotype", "Songti SC", serif; \}/,
  );
  assert.match(
    html,
    /<ul class="navlinks">[\s\S]*?>Home<\/[\s\S]*?>Maps<\/[\s\S]*?>Subjects<\/[\s\S]*?>Teacher&rsquo;s pack<\/[\s\S]*?>About us<\//,
  );
  assert.match(html, /<div class="map-card-head">History World Map<\/div>/);
});

test('homepage preserves the established iframe dimensions for Art and World maps', async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /\.subject-map-frame\s*\{\s*display:\s*none;\s*width:\s*100%;\s*height:\s*100%;\s*border:\s*0;\s*\}/,
  );
  assert.match(html, /\.map-events-split\s*\{[^}]*height:\s*min\(540px,\s*62vh\)/);
  assert.match(
    html,
    /\.map-card\[data-subject="art"\] \.map-events-split\s*\{\s*height:\s*min\(760px,\s*78vh\)/,
  );
});

test('world-only integrations target worldMapFrame and art mode uses the full map width', async () => {
  const html = await loadHtml();

  assert.match(html, /const worldMapFrame = document\.getElementById\('worldMapFrame'\)/);
  assert.match(html, /\.map-card\[data-subject="art"\] \.home-map-wrap/);
  assert.match(html, /\.map-card\[data-subject="art"\] \.home-events\s*\{\s*display:\s*none/);
  assert.doesNotMatch(html, /const homeMapFrame\s*=/);
});

test('embedded Art hides its internal header while standalone Art retains it', async () => {
  const artHtml = await readFile(ART_HTML_PATH, 'utf8');

  assert.match(artHtml, /<header class="page-header">/);
  assert.match(
    artHtml,
    /new URLSearchParams\(window\.location\.search\)\.get\('embed'\) === '1'/,
  );
  assert.match(
    artHtml,
    /document\.body\.classList\.toggle\('is-embedded', isEmbedded\)/,
  );
  assert.match(
    artHtml,
    /body\.is-embedded \.page-header\s*\{\s*display:\s*none/,
  );
  assert.doesNotMatch(artHtml, /(?:^|\n)\s*\.page-header\s*\{[^}]*display:\s*none/s);
});

test('World History retains semantic map controls and homepage switching behavior', async () => {
  const [html, worldHtml] = await Promise.all([
    loadHtml(),
    readFile(WORLD_HTML_PATH, 'utf8'),
  ]);

  assert.match(worldHtml, /class="map-zone"/);
  assert.match(worldHtml, /class="pin-group"/);
  assert.match(worldHtml, /class="zoom-btn zoom-in"/);
  assert.match(worldHtml, /class="zoom-btn zoom-out"/);
  assert.match(worldHtml, /class="zoom-btn reset zoom-reset"/);
  assert.match(html, /world:\s*\{\s*label:\s*'World History',\s*live:\s*true,\s*frame:\s*worldMapFrame/);
  assert.match(html, /if \(key === 'world'\) syncHomeEvents\(\)/);
});
