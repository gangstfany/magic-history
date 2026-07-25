import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../index.html', import.meta.url);

async function loadHtml() {
  return readFile(HTML_PATH, 'utf8');
}

test('homepage keeps persistent, independently labelled world and art frames', async () => {
  const html = await loadHtml();

  assert.match(html, /<iframe[^>]+id="worldMapFrame"[^>]+src="world-map\.html"/s);
  assert.match(html, /<iframe[^>]+id="artMapFrame"[^>]+src="art-history-map\.html"/s);
  assert.equal((html.match(/src="world-map\.html"/g) || []).length, 1);
  assert.equal((html.match(/src="art-history-map\.html"/g) || []).length, 1);
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
});

test('initial World subject uses the bounded live-frame loading flow', async () => {
  const html = await loadHtml();

  assert.match(html, /function showLiveFrame\(s\)/);
  assert.match(html, /window\.setTimeout\([\s\S]*?6000\)/);
  assert.match(html, /subjPills\.forEach[\s\S]*?selectSubject\('world'\)/);
  assert.match(html, /mapRetry\.addEventListener\('click'/);
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

test('world-only integrations target worldMapFrame and art mode uses the full map width', async () => {
  const html = await loadHtml();

  assert.match(html, /const worldMapFrame = document\.getElementById\('worldMapFrame'\)/);
  assert.match(html, /\.map-card\[data-subject="art"\] \.home-map-wrap/);
  assert.match(html, /\.map-card\[data-subject="art"\] \.home-events\s*\{\s*display:\s*none/);
  assert.doesNotMatch(html, /const homeMapFrame\s*=/);
});
