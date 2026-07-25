import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);

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

test('all artworks have a separate, linked image credit without changing core data', async () => {
  const html = await loadHtml();
  const artworkMatch = html.match(
    /<script id="artwork-data" type="application\/json">([\s\S]*?)<\/script>/,
  );
  assert.ok(artworkMatch, 'missing artwork data');
  assert.equal(
    createHash('sha256').update(artworkMatch[1]).digest('hex'),
    '9f84346761ab9fb8cbb67547dcac83512f20eabf001bb4f45ac6c18cb3566493',
  );

  const artworks = JSON.parse(artworkMatch[1]);
  const credits = parseJsonBlock(html, 'image-credit-data');
  assert.deepEqual(Object.keys(credits).sort(), artworks.map(({ id }) => id).sort());
  for (const artwork of artworks) {
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
