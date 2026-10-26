import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RELEASE_STEPS } from '../scripts/verify-art-history-release.mjs';
import { COURSES, courseURL } from '../assets/site/modules.mjs';
const ART_HTML_PATH = new URL('../art-history-map.html', import.meta.url);
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


test('Art and World are separate entries and explicit private-media opt-in reaches Art only',()=>{
 const art=COURSES.find(c=>c.id==='art'), world=COURSES.find(c=>c.id==='world');
 assert.equal(art.entry,'art-history-map.html'); assert.equal(world.entry,'apwh.html');
 assert.equal(art.sizing,'content'); assert.equal(world.sizing,'content');
 const base=new URL('https://example.test/index.html?privateMedia=1');
 assert.match(courseURL(art,base),/embed=1&privateMedia=1/);
 assert.doesNotMatch(courseURL(world,base),/privateMedia/);
 assert.doesNotMatch(courseURL(art,new URL('https://example.test/')),/privateMedia/);
});
test('World controls and source-backed caption stay in the independent World workspace',async()=>{
 const html=await readFile(new URL('../apwh.html',import.meta.url),'utf8');
 const map=await readFile(new URL('../world-map.html',import.meta.url),'utf8');
 assert.match(html,/hostApi\?\.getMapCounts\?\.\(\)/);
 assert.match(html,/\$\{counts\.events\} source events/);
 assert.match(html,/data-learning-view="chain"/);
 for(const css of ['map-zone','pin-group','zoom-in','zoom-out','zoom-reset'])assert.ok(map.includes(css));
 assert.doesNotMatch(html,/artMapFrame|styleEmbeddedArt/);
});
