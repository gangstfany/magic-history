import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const ORIGINAL_ARTWORK_IDS = [
  'ap13-palette-of-king-narmer',
  'ap15-seated-scribe',
  'ap17-great-pyramids-giza',
  'ap18-king-menkaura-and-queen',
  'ap20-temple-of-amun-re-karnak',
  'ap21-mortuary-temple-hatshepsut',
  'ap22-akhenaten-nefertiti-daughters',
  'ap23-tutankhamun-funerary-mask',
  'ap24-last-judgment-of-hunefer',
  'ap26-athenian-acropolis',
  'ap27-anavysos-kouros',
  'ap28-peplos-kore',
  'ap33-niobides-krater',
  'ap34-doryphoros',
  'ap35-athenian-agora',
  'ap36-grave-stele-hegeso',
  'ap37-winged-victory-samothrace',
  'ap38-great-altar-pergamon',
  'ap39-house-of-the-vettii',
  'ap40-alexander-mosaic',
  'ap41-old-market-woman',
  'ap42-seated-boxer',
  'ap43-head-of-a-roman-patrician',
  'ap44-colosseum',
  'ap45-forum-of-trajan',
  'ap46-pantheon',
  'ap47-ludovisi-battle-sarcophagus',
];
const NEW_ARTWORK_IDS = [
  'ap12-white-temple-ziggurat',
  'ap14-statues-votive-figures',
  'ap16-standard-of-ur',
  'ap19-code-of-hammurabi',
  'ap25-lamassu-sargon-ii',
  'ap29-sarcophagus-of-the-spouses',
  'ap30-apadana-darius-xerxes',
  'ap31-temple-minerva-apollo',
  'ap32-tomb-of-the-triclinium',
];

async function loadHtml() {
  return readFile(HTML_PATH, 'utf8');
}

function parseJsonBlock(html, id) {
  const match = html.match(new RegExp(
    `<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`,
  ));
  assert.ok(match, `missing ${id} JSON block`);
  return JSON.parse(match[1]);
}

test('detail view exposes four accessible study tabs', async () => {
  const html = await loadHtml();

  assert.match(html, /setAttribute\(['"]role['"], ['"]tablist['"]\)/);
  assert.match(html, /setAttribute\(['"]role['"], ['"]tab['"]\)/);
  assert.match(html, /setAttribute\(['"]aria-selected['"]/);
  assert.match(html, /setAttribute\(['"]aria-controls['"], ['"]detail-tabpanel['"]\)/);
  for (const label of ['速览', '形式', '语境', '比较']) {
    assert.ok(html.includes(label), `missing ${label} tab`);
  }
});

test('comparison navigation resolves targets without rewriting artwork data', async () => {
  const html = await loadHtml();
  const selectComparison = html.match(
    /function selectComparison\(comparisonId\) \{([\s\S]*?)\n    \}/,
  )?.[1];

  assert.match(html, /function selectComparison\(/);
  assert.ok(selectComparison, 'missing selectComparison() body');
  assert.match(selectComparison, /expandedSiteToken:\s*null/);
  assert.match(html, /comparisonIds/);
  assert.match(html, /dataset\.comparisonId/);
  assert.match(html, /function createComparisonAngle\(/);
  assert.match(html, /形式：/);
  assert.match(html, /功能：/);
  assert.match(html, /语境：/);
});

test('image dialog supports labelled media, attribution, and focus restoration', async () => {
  const html = await loadHtml();

  assert.match(html, /<dialog id="imageDialog"[^>]*aria-labelledby="dialogTitle"/);
  assert.match(html, /id="dialogTitle"/);
  assert.match(html, /id="dialogImage"/);
  assert.match(html, /id="dialogSource"/);
  assert.match(html, /id="dialogCredit"/);
  assert.match(html, /id="dialogLicense"/);
  assert.match(html, /function openImageDialog\(/);
  assert.match(html, /imageDialogTrigger\?\.focus\(\)/);
});

test('AP 15 uses the Louvre E 3023 Seated Scribe image and matching credit', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const seatedScribe = artworks.find(({ id }) => id === 'ap15-seated-scribe');

  assert.ok(seatedScribe, 'missing AP 15 Seated Scribe');
  assert.equal(
    seatedScribe.imageUrl,
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Le_Scribe_accroupi_-_Mus%C3%A9e_du_Louvre_Antiquit%C3%A9s_%C3%A9gyptiennes_E_3023.jpg',
  );
  assert.equal(
    seatedScribe.imageSourceUrl,
    'https://commons.wikimedia.org/wiki/File:Le_Scribe_accroupi_-_Mus%C3%A9e_du_Louvre_Antiquit%C3%A9s_%C3%A9gyptiennes_E_3023.jpg',
  );
  assert.equal(seatedScribe.imageAlt, '卢浮宫 E 3023 坐姿书记官彩绘石灰岩像');
  assert.deepEqual(credits['ap15-seated-scribe'], {
    creatorOrInstitution: '摄影：Shonagon；来源机构：Wikimedia Commons',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  });
});

test('preserves the original 27 ids and gives all 36 works one credited image', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const artworkIds = artworks.map(({ id }) => id);

  assert.equal(artworks.length, 36);
  for (const id of ORIGINAL_ARTWORK_IDS) {
    assert.ok(artworkIds.includes(id), `missing original artwork ${id}`);
  }
  for (const id of NEW_ARTWORK_IDS) {
    assert.ok(artworkIds.includes(id), `missing imported artwork ${id}`);
  }

  assert.deepEqual(Object.keys(credits).sort(), artworks.map(({ id }) => id).sort());
  for (const artwork of artworks) {
    assert.equal(typeof artwork.imageUrl, 'string', `${artwork.id} needs one image URL`);
    assert.ok(artwork.imageUrl.trim(), `${artwork.id} needs a non-empty image URL`);
    assert.equal(
      Object.hasOwn(artwork, 'images'),
      false,
      `${artwork.id} must not introduce an image gallery`,
    );
    const credit = credits[artwork.id];
    assert.ok(credit.creatorOrInstitution, `${artwork.id} missing creator or institution`);
    assert.ok(credit.licenseName, `${artwork.id} missing license name`);
    assert.match(credit.licenseUrl, /^https:\/\//, `${artwork.id} needs a linked license`);
  }

  assert.match(html, /function createImageCredit\(/);
  assert.match(html, /rel = 'noopener noreferrer'/);
});

test('comparison navigation moves focus to the newly selected title', async () => {
  const html = await loadHtml();

  assert.match(html, /heading\.tabIndex = -1/);
  assert.match(html, /function focusSelectedArtworkHeading\(/);
  assert.match(html, /document\.activeElement !== heading/);
});

test('group marker labels concisely name the site and complete AP range', async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /marker\.setAttribute\('aria-label', `\$\{group\.siteName\}；\$\{group\.apGroupLabel\}`\)/,
  );
  assert.doesNotMatch(html, /marker\.setAttribute\('aria-label',[^\n]*artworkNames/);
  assert.match(html, /marker\.setAttribute\('role', 'button'\)/);
  assert.match(html, /marker\.setAttribute\('tabindex', '0'\)/);
  assert.match(html, /expandSiteGroup\(group, true\)/);
});

test('map panning owns touch gestures only on the interactive pan surface', async () => {
  const html = await loadHtml();

  assert.match(html, /#panSurface\s*\{[^}]*touch-action:\s*none/s);
  assert.doesNotMatch(html, /(?:body|\.art-workspace|\.map-panel)\s*\{[^}]*touch-action:\s*none/s);
  assert.match(html, /if \(event\.cancelable\) event\.preventDefault\(\)/);
  assert.match(html, /addEventListener\('pointercancel', stopPan\)/);
  assert.match(html, /addEventListener\('lostpointercapture', stopPan\)/);
});

test('clearing filters also restores the overview transform', async () => {
  const html = await loadHtml();
  const clearFilters = html.match(/function clearFilters\(\) \{([\s\S]*?)\n    \}/)?.[1];

  assert.ok(clearFilters, 'missing clearFilters()');
  assert.match(clearFilters, /transform:\s*\{\s*x:0,\s*y:0,\s*scale:1\s*\}/);
  assert.match(clearFilters, /applyTransform\(\)/);
});

test('images install a named fallback and never inject dataset HTML', async () => {
  const html = await loadHtml();

  assert.match(html, /function installImageFallback\(/);
  assert.match(html, /className = 'image-fallback'/);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});
