import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../index.html', import.meta.url);
const ART_HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const WORLD_HTML_PATH = new URL('../world-map.html', import.meta.url);
const STARTING_WORLD_SHA256 = '3ba8c8e3d18daa756b3ed8d9cddc1f7583fe9e74bb42a582feb65c5ed121d949';

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

test('map caption follows the selected subject and hides for coming-soon subjects', async () => {
  const html = await loadHtml();

  assert.match(html, /id="homeMapCaption"/);
  assert.match(html, /homeMapCaption\.textContent = key === 'art'/);
  assert.match(html, /homeMapCaption\.hidden = !s\.live/);
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

test('World History source remains byte-for-byte unchanged from the U2 starting commit', async () => {
  const worldHtml = await readFile(WORLD_HTML_PATH);
  const actualHash = createHash('sha256').update(worldHtml).digest('hex');

  assert.equal(actualHash, STARTING_WORLD_SHA256);
});
